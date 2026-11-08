import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { connectRedis, closeRedis, getRedisHealth } from "./config/redis.js";
import { configureSocketAuth } from "./realtime/socketAuth.js";
import { closeWorkflowQueue } from "./queues/workflow.queue.js";
import { closeDeploymentQueue } from "./queues/deployment.queue.js";

const requiredEnvVars = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "FRONTEND_URL"];

function validateEnv() {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
}

async function bootstrap() {
  validateEnv();
  await connectDB();

  let redisStatus = "disconnected";
  try {
    await connectRedis({ failOnError: false });
    redisStatus = getRedisHealth().status;
  } catch (error) {
    console.warn(`Redis unavailable during startup: ${error.message}`);
  }

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    allowRequest: (request, callback) => {
      const origin = request.headers.origin;
      callback(null, !origin || origin === process.env.FRONTEND_URL);
    }
  });

  app.set("io", io);
  app.set("redisStatus", redisStatus);
  configureSocketAuth(io);

  const port = process.env.PORT || 5000;

  const shutdown = async () => {
    if (shutdown._closing) return;
    shutdown._closing = true;
    io.close();
    server.close();
    await closeWorkflowQueue();
    await closeDeploymentQueue();
    await closeRedis();
    await disconnectDB();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.listen(port, () => {
    console.log(`Devflow AI backend running on port ${port}`);
    console.log(`Redis status: ${redisStatus}`);
  });
}

bootstrap().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
