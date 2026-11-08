import { Worker } from "bullmq";
import { connectDB } from "../config/db.js";
import { connectQueueRedis, getWorkerRedisClient } from "../config/redis.js";
import { DEPLOYMENT_JOB_TIMEOUT_MS, DEPLOYMENT_QUEUE_NAME, DEPLOYMENT_WORKER_CONCURRENCY } from "../queues/deployment.queue.js";
import { executeDeploymentJob } from "../services/deployment-execution.service.js";

export async function startDeploymentWorker() {
  await connectDB();
  await connectQueueRedis({ failOnError: true });

  const worker = new Worker(
    DEPLOYMENT_QUEUE_NAME,
    async (job) => executeDeploymentJob(job),
    {
      connection: getWorkerRedisClient(),
      concurrency: DEPLOYMENT_WORKER_CONCURRENCY,
      lockDuration: Math.max(DEPLOYMENT_JOB_TIMEOUT_MS, 30000)
    }
  );

  worker.on("completed", (job) => {
    console.log(`[worker] completed deployment ${job.data?.deploymentId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] deployment ${job?.data?.deploymentId || "unknown"} failed: ${err?.message || "unknown error"}`);
  });

  worker.on("error", (err) => {
    console.error(`[worker] deployment worker error: ${err?.message || "unknown error"}`);
  });

  return worker;
}
