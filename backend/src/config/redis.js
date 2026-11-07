import Redis from "ioredis";

const DEFAULT_REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const createRedisConnection = (label, url = DEFAULT_REDIS_URL) => {
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 10) {
        return null;
      }
      return Math.min(times * 250, 2000);
    }
  });

  client.on("error", (error) => {
    console.error(`[redis:${label}] ${error?.message || "Redis connection error"}`);
  });

  client.on("connect", () => {
    console.log(`[redis:${label}] connecting`);
  });

  client.on("ready", () => {
    console.log(`[redis:${label}] ready`);
  });

  client.on("end", () => {
    console.log(`[redis:${label}] connection closed`);
  });

  return client;
};

let primaryRedisClient = null;
let queueRedisClient = null;
let workerRedisClient = null;

export function getRedisUrl() {
  return DEFAULT_REDIS_URL;
}

export function getRedisHealth() {
  const clients = [
    { name: "primary", client: primaryRedisClient },
    { name: "queue", client: queueRedisClient },
    { name: "worker", client: workerRedisClient }
  ];

  return {
    status: clients.some(({ client }) => client?.status === "ready") ? "connected" : "disconnected",
    url: getRedisUrl().replace(/:[^@/]+@/, ":***@"),
    primary: primaryRedisClient?.status === "ready" ? "connected" : "disconnected",
    queue: queueRedisClient?.status === "ready" ? "connected" : "disconnected",
    worker: workerRedisClient?.status === "ready" ? "connected" : "disconnected"
  };
}

export function getRedisClient() {
  if (!primaryRedisClient) {
    primaryRedisClient = createRedisConnection("primary");
  }
  return primaryRedisClient;
}

export function getQueueRedisClient() {
  if (!queueRedisClient) {
    queueRedisClient = createRedisConnection("queue");
  }
  return queueRedisClient;
}

export function getWorkerRedisClient() {
  if (!workerRedisClient) {
    workerRedisClient = createRedisConnection("worker");
  }
  return workerRedisClient;
}

export async function connectRedis(options = {}) {
  const client = getRedisClient();
  if (client.status === "ready") return client;

  try {
    await client.connect();
    return client;
  } catch (error) {
    if (options.failOnError !== false) {
      throw new Error(`Redis is unavailable: ${error.message}`);
    }
    console.warn("Redis unavailable; continuing without queue connectivity.");
    return client;
  }
}

export async function connectQueueRedis(options = {}) {
  const client = getQueueRedisClient();
  if (client.status === "ready") return client;

  try {
    await client.connect();
    return client;
  } catch (error) {
    if (options.failOnError !== false) {
      throw new Error(`BullMQ queue Redis connection failed: ${error.message}`);
    }
    console.warn("Queue Redis unavailable; continuing without queued execution.");
    return client;
  }
}

export async function connectWorkerRedis(options = {}) {
  const client = getWorkerRedisClient();
  if (client.status === "ready") return client;

  try {
    await client.connect();
    return client;
  } catch (error) {
    if (options.failOnError !== false) {
      throw new Error(`Worker Redis connection failed: ${error.message}`);
    }
    console.warn("Worker Redis unavailable; background job worker is disabled.");
    return client;
  }
}

export async function closeRedisClient(client) {
  if (!client || client.status === "end") return;
  await client.quit();
}

export async function closeRedis() {
  await Promise.all([
    closeRedisClient(primaryRedisClient),
    closeRedisClient(queueRedisClient),
    closeRedisClient(workerRedisClient)
  ]);
}

export const redisClient = getRedisClient();
