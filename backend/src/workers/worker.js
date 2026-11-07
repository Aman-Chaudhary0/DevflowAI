import "dotenv/config";
import { startWorkflowWorker } from "./workflow.worker.js";
import { closeRedis } from "../config/redis.js";
import { disconnectDB } from "../config/db.js";

let worker = null;
let shutdownInProgress = false;

async function shutdown() {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  try {
    if (worker) {
      await worker.close();
    }
    await closeRedis();
    await disconnectDB();
    console.log("Workflow worker shut down gracefully");
    process.exit(0);
  } catch (error) {
    console.error("Workflow worker shutdown failed:", error.message || error);
    process.exit(1);
  }
}

async function boot() {
  worker = await startWorkflowWorker();
  console.log("Workflow worker started");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

boot().catch((error) => {
  console.error("Workflow worker startup failed:", error.message || error);
  process.exit(1);
});
