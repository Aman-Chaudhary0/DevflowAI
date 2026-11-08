import { Queue, QueueEvents } from "bullmq";
import { connectQueueRedis, getQueueRedisClient } from "../config/redis.js";

export const DEPLOYMENT_QUEUE_NAME = "deployment-execution";
export const DEPLOYMENT_JOB_ATTEMPTS = Number(process.env.DEPLOYMENT_JOB_ATTEMPTS || 3);
export const DEPLOYMENT_JOB_BACKOFF_MS = Number(process.env.DEPLOYMENT_JOB_BACKOFF_MS || 3000);
export const DEPLOYMENT_JOB_TIMEOUT_MS = Number(process.env.DEPLOYMENT_JOB_TIMEOUT_MS || 900000);
export const DEPLOYMENT_WORKER_CONCURRENCY = Number(process.env.DEPLOYMENT_WORKER_CONCURRENCY || 2);

let deploymentQueue = null;
let deploymentQueueEvents = null;

export function getDeploymentQueue() {
  if (!deploymentQueue) {
    deploymentQueue = new Queue(DEPLOYMENT_QUEUE_NAME, {
      connection: getQueueRedisClient(),
      defaultJobOptions: {
        attempts: DEPLOYMENT_JOB_ATTEMPTS,
        backoff: { type: "exponential", delay: DEPLOYMENT_JOB_BACKOFF_MS },
        timeout: DEPLOYMENT_JOB_TIMEOUT_MS,
        removeOnComplete: { age: 60 * 60 * 24 * 2, count: 100 },
        removeOnFail: { age: 60 * 60 * 24 * 14, count: 200 }
      }
    });
  }

  return deploymentQueue;
}

export function getDeploymentQueueEvents() {
  if (!deploymentQueueEvents) {
    deploymentQueueEvents = new QueueEvents(DEPLOYMENT_QUEUE_NAME, {
      connection: getQueueRedisClient()
    });
  }
  return deploymentQueueEvents;
}

export async function addDeploymentJob(deploymentId, payload = {}) {
  const queue = getDeploymentQueue();
  await connectQueueRedis({ failOnError: true });

  const sanitizedId = String(deploymentId).replace(/[^a-zA-Z0-9_-]/g, "-");
  const jobId = `deployment-${sanitizedId}`;
  const existing = await queue.getJob(jobId);
  if (existing) {
    return existing;
  }

  return queue.add(
    "deployment-execution",
    {
      deploymentId: String(deploymentId),
      triggeredBy: payload.triggeredBy ? String(payload.triggeredBy) : null,
      mode: payload.mode || "deploy",
      targetProviderDeploymentId: payload.targetProviderDeploymentId || null
    },
    {
      jobId,
      attempts: DEPLOYMENT_JOB_ATTEMPTS,
      backoff: { type: "exponential", delay: DEPLOYMENT_JOB_BACKOFF_MS },
      timeout: DEPLOYMENT_JOB_TIMEOUT_MS
    }
  );
}

export async function closeDeploymentQueue() {
  if (deploymentQueue) {
    await deploymentQueue.close();
    deploymentQueue = null;
  }
  if (deploymentQueueEvents) {
    await deploymentQueueEvents.close();
    deploymentQueueEvents = null;
  }
}
