import { Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { connectQueueRedis, getWorkerRedisClient } from "../config/redis.js";
import { WORKFLOW_QUEUE_NAME, WORKFLOW_JOB_TIMEOUT_MS, WORKFLOW_WORKER_CONCURRENCY } from "../queues/workflow.queue.js";
import { executeWorkflowJob } from "../services/workflow-execution.service.js";

export async function startWorkflowWorker() {
  await connectDB();
  await connectQueueRedis({ failOnError: true });

  const worker = new Worker(
    WORKFLOW_QUEUE_NAME,
    async (job) => executeWorkflowJob(job),
    {
      connection: getWorkerRedisClient(),
      concurrency: WORKFLOW_WORKER_CONCURRENCY,
      lockDuration: Math.max(WORKFLOW_JOB_TIMEOUT_MS, 30000)
    }
  );

  worker.on("completed", (job) => {
    console.log(`[worker] completed workflow run ${job.data?.runId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] workflow run ${job?.data?.runId || "unknown"} failed: ${err?.message || "unknown error"}`);
  });

  worker.on("error", (err) => {
    console.error(`[worker] worker error: ${err?.message || "unknown error"}`);
  });

  return worker;
}
