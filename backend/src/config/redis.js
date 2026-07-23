import { createClient } from "redis";

// The redisClient is created using the createClient function from the redis package, with the URL specified in the REDIS_URL environment variable or defaulting to localhost. It handles connection errors and provides a connectRedis function to establish a connection if not already open.
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
}
