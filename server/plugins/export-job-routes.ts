import { randomUUID } from 'node:crypto';
import { rename, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ViteDevServer } from 'vite';
import { resolveH264TargetBitrate } from '../media-acceleration.ts';
import { uploadDir } from '../media-dir.ts';
import {
  createExportFailure,
  exportFailureFrom,
  isExportFailure,
} from '../../src/export/exportFailure.ts';
import type { ExportPlan, ExportRequest } from './export-plan.ts';
import { acceptExportSubmission, type AcceptedExportSubmission } from './export-submission.ts';
import {
  cancelActiveExportJob,
  cleanupRetainedExportOutputs,
  exportOutputSize,
  promoteExportResult,
  retimeFps,
  withExportPermit,
} from './export-runtime.ts';
import { startExportJob } from './export-job-submission.ts';
import {
  deleteGenerationJob,
  getGenerationJobSnapshot,
} from './generation-jobs.ts';
import {
  bindRequestAbort,
  readJsonBody,
  sendError,
  sendExportFailure,
  sendJson,
  sendSequenceGraphFailure,
  streamExportFile,
} from './export-http.ts';
import {
  cleanupExportOutputs,
  exportCapabilities,
  h264RenderOptions,
  renderTimeline,
} from './export-rendering.ts';

function isExportCapabilitiesPath(url: string | undefined): boolean {
  const path = (url ?? '').split('?')[0].replace(/\/+$/, '');
  return path === '/capabilities' || path === '/export/capabilities';
}

export function registerExportJobRoute(server: ViteDevServer): void {
  server.middlewares.use('/export/job', async (req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    const id = segments[0] ?? '';
    const action = segments[1] ?? '';

    if (req.method === 'POST' && action === 'promote' && segments.length === 2) {
      const snapshot = getGenerationJobSnapshot(id);
      if (!snapshot) { sendError(res, 404, `render job ${id} not found`); return; }
      if (snapshot.status !== 'succeeded' || !snapshot.result) {
        sendError(res, 409, `render job ${id} is not complete`); return;
      }
      try {
        sendJson(res, 200, await promoteExportResult(snapshot.result, uploadDir()));
      } catch (error) {
        sendError(res, 500, error instanceof Error ? error.message : String(error));
      }
      return;
    }

    if (req.method === 'DELETE') {
      if (!id || segments.length !== 1) { sendError(res, 400, 'render id is required'); return; }
      const snapshot = getGenerationJobSnapshot(id);
      if (!snapshot) { sendError(res, 404, `render job ${id} not found`); return; }
      if (snapshot.status === 'queued' || snapshot.status === 'running') {
        if (!await cancelActiveExportJob(id)) {
          sendError(res, 409, 'render job cancellation timed out'); return;
        }
      } else {
        await deleteGenerationJob(id);
      }
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method === 'GET') {
      if (!id || segments.length !== 1) { sendError(res, 400, 'render id is required'); return; }
      const snapshot = getGenerationJobSnapshot(id);
      if (!snapshot) { sendError(res, 404, `render job ${id} not found`); return; }
      const failure = isExportFailure(snapshot.params.exportFailure)
        ? snapshot.params.exportFailure
        : undefined;
      sendJson(res, 200, failure ? { ...snapshot, failure } : snapshot);
      return;
    }
    if (req.method !== 'POST') { sendError(res, 405, 'method not allowed — POST to enqueue, GET to inspect, DELETE to clean up'); return; }
    if (id) { sendError(res, 404, 'unknown export job route'); return; }
    const requestAbort = bindRequestAbort(req, res);
    const controller = requestAbort.controller;

    try {
      const body = (await readJsonBody(req)) as ExportRequest | null;
      controller.signal.throwIfAborted();
      const jobId = await startExportJob(body, {
        controller,
        onRenderFailure: (failure) => {
          server.config.logger.error(
            `[export] render failed (${failure.stage}/${failure.code}): ${failure.message}`,
          );
        },
        onMediaCleanupError: (error) => {
          server.config.logger.warn(
            `[export] failed to clean materialized media: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      });
      controller.signal.throwIfAborted();
      requestAbort.dispose();
      sendJson(res, 200, { renderId: jobId });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (sendSequenceGraphFailure(res, error)) return;
      const failure = exportFailureFrom(error);
      if (failure) sendExportFailure(res, failure.stage === 'preflight' ? 422 : 500, failure);
      else sendError(res, 400, error instanceof Error ? error.message : String(error));
    } finally {
      requestAbort.dispose();
    }
  });
}

export function registerExportRoute(server: ViteDevServer): void {
  // Outputs retained from a failed download (see the catch below) are addressed
  // by nobody, so bound how long they can sit in tmpdir.
  void cleanupRetainedExportOutputs().then((removed) => {
    if (removed > 0) server.config.logger.warn(`[export] removed ${removed} retained export output(s) from a previous run`);
  }).catch(() => undefined);
  server.middlewares.use('/export', async (req, res) => {
    if (req.method === 'GET' && isExportCapabilitiesPath(req.url)) {
      try {
        sendJson(res, 200, await exportCapabilities());
      } catch (error) {
        sendError(res, 500, error instanceof Error ? error.message : String(error));
      }
      return;
    }
    if (req.method !== 'POST') {
      sendError(res, 405, 'method not allowed — use POST');
      return;
    }
    const requestAbort = bindRequestAbort(req, res);

    let outputLocation: string | null = null;
    let retimedOutput: string | null = null;
    let acceptedSubmission: AcceptedExportSubmission | undefined;
    let rendered = false;
    let keepRenderedOutput = false;
    try {
      const body = await readJsonBody(req) as ExportRequest | null;
      requestAbort.controller.signal.throwIfAborted();
      let plan: ExportPlan;
      try {
        acceptedSubmission = await acceptExportSubmission(
          body,
          { signal: requestAbort.controller.signal },
        );
        plan = acceptedSubmission.plan;
      } catch (error) {
        if (requestAbort.controller.signal.aborted) throw error;
        if (sendSequenceGraphFailure(res, error)) return;
        const failure = exportFailureFrom(error);
        if (failure) sendExportFailure(res, failure.stage === 'preflight' ? 422 : 500, failure);
        else sendError(res, 400, error instanceof Error ? error.message : String(error));
        return;
      }
      const { state, format, media, frameRange, filename, scale } = plan;
      const finalOutput = join(tmpdir(), `openchatcut-export-${randomUUID()}.${media.ext}`);
      outputLocation = finalOutput;
      await withExportPermit(async () => {
        await renderTimeline({
          state,
          project: plan.project,
          timelineId: plan.timelineId,
          outputLocation: finalOutput,
          codec: media.codec,
          frameRange,
          scale,
          videoBitrate: plan.videoBitrate,
          ...await h264RenderOptions(media.codec),
          signal: requestAbort.controller.signal,
        });
        requestAbort.controller.signal.throwIfAborted();
        if (format === 'video' && plan.retimeFps !== undefined) {
          retimedOutput = `${finalOutput}.retimed.${media.ext}`;
          const outputSize = exportOutputSize(state, scale);
          await retimeFps(
            finalOutput,
            retimedOutput,
            plan.retimeFps,
            media.codec as 'h264' | 'vp8',
            plan.videoBitrate ?? resolveH264TargetBitrate({ ...outputSize, fps: plan.retimeFps }),
            outputSize,
            requestAbort.controller.signal,
          );
          requestAbort.controller.signal.throwIfAborted();
          await unlink(finalOutput).catch(() => {});
          requestAbort.controller.signal.throwIfAborted();
          await rename(retimedOutput, finalOutput);
          requestAbort.controller.signal.throwIfAborted();
          retimedOutput = null;
        }
      }, requestAbort.controller.signal);
      requestAbort.controller.signal.throwIfAborted();

      rendered = true;
      // Stream, never buffer: `readFile` refuses files ≥2 GiB after the render
      // has already finished, which cost the user the whole export.
      await streamExportFile(res, finalOutput, {
        mime: media.mime,
        filename,
        signal: requestAbort.controller.signal,
      });
    } catch (error) {
      const aborted = requestAbort.controller.signal.aborted;
      // A render that completed is worth keeping when only the download failed:
      // the render is the expensive part, the transfer is repeatable. A client
      // abort is the user's own doing, so that output is discarded as before.
      keepRenderedOutput = rendered && !aborted;
      const cleanupStatus = keepRenderedOutput
        ? 'not-required' as const
        : await cleanupExportOutputs([outputLocation, retimedOutput]);
      if (keepRenderedOutput && outputLocation) {
        server.config.logger.warn(
          `[export] render completed but the download failed; kept ${outputLocation} for recovery`,
        );
      } else {
        outputLocation = null;
        retimedOutput = null;
      }
      if (aborted) return;
      const existing = exportFailureFrom(error);
      const failure = existing ?? createExportFailure({
        stage: keepRenderedOutput ? 'destination' : 'render',
        code: keepRenderedOutput ? 'export_download_failed' : 'export_render_failed',
        retryable: true,
        cleanupStatus,
        targetPath: null,
        message: error instanceof Error ? error.message : String(error),
      });
      if (!res.headersSent) sendExportFailure(res, error instanceof RangeError ? 400 : 500, failure);
      else res.end();
    } finally {
      if (!keepRenderedOutput) {
        if (outputLocation) await unlink(outputLocation).catch(() => {});
        if (retimedOutput) await unlink(retimedOutput).catch(() => {});
      }
      await acceptedSubmission?.cleanup();
      requestAbort.dispose();
    }
  });
}
