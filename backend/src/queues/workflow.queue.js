import { Queue, QueueEvents } from "bullmq";
import { connectQueueRedis, getQueueRedisClient } from "../config/redis.js";

export const WORKFLOW_QUEUE_NAME = "workflow-execution";
export const WORKFLOW_JOB_ATTEMPTS = Number(process.env.WORKFLOW_JOB_ATTEMPTS || 3);
export const WORKFLOW_JOB_BACKOFF_MS = Number(process.env.WORKFLOW_JOB_BACKOFF_MS || 2000);
export const WORKFLOW_JOB_TIMEOUT_MS = Number(process.env.WORKFLOW_JOB_TIMEOUT_MS || 600000);
export const WORKFLOW_WORKER_CONCURRENCY = Number(process.env.WORKFLOW_WORKER_CONCURRENCY || 2);

let workflowQueue = null;
let workflowQueueEvents = null;

export function getWorkflowQueue() {
  if (!workflowQueue) {
    workflowQueue = new Queue(WORKFLOW_QUEUE_NAME, {
      connection: getQueueRedisClient(),
      defaultJobOptions: {
        attempts: WORKFLOW_JOB_ATTEMPTS,
        backoff: { type: "exponential", delay: WORKFLOW_JOB_BACKOFF_MS },
        timeout: WORKFLOW_JOB_TIMEOUT_MS,
        removeOnComplete: { age: 60 * 60 * 24 * 2, count: 50 },
        removeOnFail: { age: 60 * 60 * 24 * 7, count: 100 }
      }
    });
  }
  return workflowQueue;
}

export function getWorkflowQueueEvents() {
  if (!workflowQueueEvents) {
    workflowQueueEvents = new QueueEvents(WORKFLOW_QUEUE_NAME, {
      connection: getQueueRedisClient()
    });
  }
  return workflowQueueEvents;
}

export async function addWorkflowJob(runId, payload = {}) {
  const queue = getWorkflowQueue();
  await connectQueueRedis({ failOnError: true });

  const jobName = "workflow-execution";
  const sanitizedRunId = String(runId).replace(/[^a-zA-Z0-9_-]/g, "-");
  const jobId = `workflow-run-${sanitizedRunId}`;
  const existing = await queue.getJob(jobId);
  if (existing) {
    return existing;
  }

  const job = await queue.add(
    jobName,
    {
      workflowId: payload.workflowId ? String(payload.workflowId) : null,
      runId: String(runId),
      workspaceId: payload.workspaceId ? String(payload.workspaceId) : null,
      userId: payload.userId ? String(payload.userId) : null,
      triggeredBy: payload.triggeredBy ? String(payload.triggeredBy) : null,
      triggerType: payload.triggerType || "manual",
      payload: payload.payload || {}
    },
    {
      jobId,
      attempts: WORKFLOW_JOB_ATTEMPTS,
      backoff: { type: "exponential", delay: WORKFLOW_JOB_BACKOFF_MS },
      timeout: WORKFLOW_JOB_TIMEOUT_MS
    }
  );

  return job;
}

export async function closeWorkflowQueue() {
  if (workflowQueue) {
    await workflowQueue.close();
    workflowQueue = null;
  }
  if (workflowQueueEvents) {
    await workflowQueueEvents.close();
    workflowQueueEvents = null;
  }
}
