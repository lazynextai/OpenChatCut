import assert from 'node:assert';
import { createExportJobStore } from './backgroundExportStore';
import { createBatchExportQueue, type BatchExportQueue } from './batchExportQueue';

function specCompletion(label: string, record: string[], fail = false) {
  return {
    label,
    targetPath: `/out/${label}.mp4`,
    async execute({ setters }: { setters: Setters }) {
      record.push(`start:${label}`);
      setters.setProgress({ phase: 'rendering', percent: 50, startedAt: Date.now() });
      if (fail) {
        setters.setProgress({ phase: 'failed', percent: 100, startedAt: Date.now(), finishedAt: Date.now() });
      } else {
        setters.setProgress({ phase: 'completed', percent: 100, startedAt: Date.now(), finishedAt: Date.now() });
      }
    },
  };
}
// Type helper to keep the verify lean.
type Setters = { setProgress(value: { phase: 'rendering' | 'failed' | 'completed'; percent: number; startedAt: number; finishedAt?: number }): void };

async function flush(ms = 10): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  // 1) FIFO order: a job only starts after the previous one reached terminal.
  {
    const store = createExportJobStore();
    const record: string[] = [];
    let singleActive = true;
    const checker = store.subscribeActive(() => {
      // The pump starts the next spec only when active count is 0, so at most
      // one job is ever active at a time.
      if (store.getActiveCount() > 1) singleActive = false;
    });
    const queue: BatchExportQueue = createBatchExportQueue(store);
    queue.enqueue([
      specCompletion('a', record),
      specCompletion('b', record),
      specCompletion('c', record),
    ]);
    assert.equal(queue.isRunning(), true, 'queue runs after enqueue');
    await flush();
    assert.equal(store.getActiveCount(), 0, 'all specs drained');
    assert.deepEqual(record, ['start:a', 'start:b', 'start:c'], 'strict FIFO order');
    assert.equal(singleActive, true, 'never more than one active export');
    assert.equal(queue.isRunning(), false, 'queue idle after drain');
    checker();
    queue.dispose();
  }

  // 2) A failed job must not kill the queue.
  {
    const store = createExportJobStore();
    const record: string[] = [];
    const queue = createBatchExportQueue(store);
    queue.enqueue([
      specCompletion('bad', record, true),
      specCompletion('good', record),
    ]);
    await flush();
    assert.equal(store.getActiveCount(), 0, 'failed + completed drained');
    assert.deepEqual(record, ['start:bad', 'start:good'], 'failure does not halt queue');
    const phases = store.getSnapshot().jobs.map((job) => job.progress.phase);
    assert.deepEqual(phases, ['failed', 'completed'], 'per-job terminal phases recorded');
    queue.dispose();
  }

  // 3) enqueue while a batch is running appends, and empty enqueue is a no-op.
  {
    const store = createExportJobStore();
    const record: string[] = [];
    const queue = createBatchExportQueue(store);
    queue.enqueue([specCompletion('first', record)]);
    queue.enqueue([specCompletion('later', record)]);
    queue.enqueue([]);
    await flush();
    assert.equal(store.getActiveCount(), 0, 'appended specs drained');
    assert.deepEqual(record, ['start:first', 'start:later'], 'appends run after the running batch');
    queue.dispose();
  }

  console.log('batchExportQueue.verify: FIFO serialization, failure survival, and append semantics passed');
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});