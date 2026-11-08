import "dotenv/config";
import { startWorkflowWorker } from "./workflow.worker.js";
import { startDeploymentWorker } from "./deployment.worker.js";
import { closeRedis } from "../config/redis.js";
import { disconnectDB } from "../config/db.js";

let workflowWorker = null;
let deploymentWorker = null;
let shutdownInProgress = false;

async function shutdown() {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  try {
    if (workflowWorker) {
      await workflowWorker.close();
    }
    if (deploymentWorker) {
      await deploymentWorker.close();
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
  workflowWorker = await startWorkflowWorker();
  deploymentWorker = await startDeploymentWorker();
  console.log("Workflow and deployment workers started");
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

boot().catch((error) => {
  console.error("Workflow worker startup failed:", error.message || error);
  process.exit(1);
});
