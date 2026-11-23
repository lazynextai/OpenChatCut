import type { ExportJobStore, StartBackgroundExport } from './backgroundExportStore';

/**
 * Sequential batch export queue over the existing background export job store.
 *
 * The store already models multiple concurrent jobs with per-job progress,
 * cancel, and terminal phases. This controller layers a strict FIFO run-order
 * on top: it never starts a job while any job in the store is still active, so
 * queued sequences export one at a time. A failed/cancelled job still reaches a
 * terminal phase, which drops the active count and lets the next spec start —
 * one failure never kills the rest of the queue.
 *
 * Pure controller, no React; keep it trivially reusable and verifiable.
 */
export interface BatchExportQueue {
  /** Append specs to the queue (starts the first one when idle). */
  enqueue(specs: readonly StartBackgroundExport[]): void;
  /** True while a batch is either in flight or has not drained yet. */
  isRunning(): boolean;
  /** Number of specs that have not started yet. */
  pendingCount(): number;
  /** Fires whenever running/pending state may have changed. */
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

export function createBatchExportQueue(store: ExportJobStore): BatchExportQueue {
  let pending: StartBackgroundExport[] = [];
  let running = false;
  let disposed = false;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };
  const unsubscribeActive = store.subscribeActive(pump);

  function pump(): void {
    if (disposed || !running) return;
    // Another job (this batch's previous item, or an unrelated standalone
    // export) is still in flight — wait for the active count to drop.
    if (store.getActiveCount() > 0) return;
    const next = pending.shift();
    if (!next) {
      running = false;
      notify();
      return;
    }
    // store.start may return an existing job id when the same target path is
    // already active (dedupe). Either way the job counts as started here and
    // the active-count subscription will drive the next pump.
    store.start(next);
    notify();
  }

  return {
    enqueue(specs) {
      if (disposed || specs.length === 0) return;
      pending = pending.concat(specs);
      if (!running) {
        running = true;
        notify();
      }
      pump();
    },
    isRunning: () => running,
    pendingCount: () => pending.length,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      disposed = true;
      unsubscribeActive();
      listeners.clear();
    },
  };
}