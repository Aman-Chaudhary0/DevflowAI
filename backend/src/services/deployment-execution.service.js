import { UnrecoverableError } from "bullmq";
import Deployment from "../models/Deployment.js";
import { getDeploymentProvider, ProviderConfigurationError, ProviderRequestError } from "./deployment-provider.service.js";
import { emitDeploymentRealtimeEvent, mapProviderStatus } from "./deployment.service.js";

const POLL_INTERVAL_MS = Number(process.env.DEPLOYMENT_POLL_INTERVAL_MS || 5000);
const MAX_POLLS = Number(process.env.DEPLOYMENT_MAX_POLLS || 120);

function redactLogLine(line) {
  const message = String(line || "");
  return message
    .replace(/([A-Z0-9_]*(SECRET|TOKEN|PASSWORD|KEY)[A-Z0-9_]*)=([^\s]+)/gi, "$1=[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
}

function appendLogs(deployment, lines = []) {
  if (!Array.isArray(lines) || lines.length === 0) return;
  const sanitized = lines
    .map((line) => ({
      timestamp: line.timestamp ? new Date(line.timestamp) : new Date(),
      level: line.level || "info",
      source: line.source || "provider",
      message: redactLogLine(line.message || "")
    }))
    .filter((line) => line.message);

  if (!sanitized.length) return;

  const next = [...(deployment.logs || []), ...sanitized];
  deployment.logs = next.slice(-2000);
}

function toBuildStatus(status) {
  if (["ready"].includes(status)) return "success";
  if (["failed"].includes(status)) return "failed";
  if (["cancelled"].includes(status)) return "cancelled";
  if (["queued"].includes(status)) return "pending";
  return "running";
}

function isTerminal(status) {
  return ["ready", "failed", "cancelled"].includes(status);
}

export async function executeDeploymentJob(job) {
  const { deploymentId, mode, targetProviderDeploymentId } = job.data || {};
  const deployment = await Deployment.findById(deploymentId);
  if (!deployment) {
    throw new UnrecoverableError(`Deployment ${deploymentId} not found`);
  }

  if (isTerminal(deployment.status)) {
    return { deploymentId, status: deployment.status, skipped: true };
  }

  let provider;
  try {
    provider = getDeploymentProvider();
  } catch (error) {
    deployment.status = "failed";
    deployment.buildStatus = "failed";
    deployment.error = error.message || "Deployment provider is not configured";
    await deployment.save();
    throw new UnrecoverableError(error.message || "Deployment provider is not configured");
  }

  deployment.status = "initializing";
  deployment.buildStatus = "running";
  deployment.buildStartedAt = deployment.buildStartedAt || new Date();
  await deployment.save();
  await emitDeploymentRealtimeEvent(job.data?.io, "deployment:started", deployment);

  try {
    let created;
    if (mode === "rollback") {
      if (!targetProviderDeploymentId) {
        throw new UnrecoverableError("Rollback target provider deployment id is missing");
      }
      created = await provider.promoteDeployment(targetProviderDeploymentId);
    } else {
      created = await provider.createDeployment({
        projectName: deployment.projectName || deployment.repository?.name?.split("/").pop() || "devflow-project",
        repository: deployment.repository?.name,
        branch: deployment.branch,
        environment: deployment.environment,
        commitSha: deployment.commitSha || undefined,
        projectSettings: deployment.deploymentConfiguration?.providerOptions || {}
      });
    }

    deployment.providerDeploymentId = created.providerDeploymentId || deployment.providerDeploymentId;
    if (created.url) deployment.deploymentUrl = created.url;
    deployment.status = mapProviderStatus(created.status);
    deployment.buildStatus = toBuildStatus(deployment.status);
    appendLogs(deployment, [{ message: `Provider deployment accepted (${deployment.providerDeploymentId || "unknown"})`, level: "info", source: "worker", timestamp: new Date() }]);
    await deployment.save();
    await emitDeploymentRealtimeEvent(job.data?.io, "deployment:building", deployment);

    let pollCount = 0;
    while (pollCount < MAX_POLLS) {
      pollCount += 1;

      if (!deployment.providerDeploymentId) {
        throw new UnrecoverableError("Provider deployment id is missing");
      }

      const [current, logs] = await Promise.all([
        provider.getDeployment(deployment.providerDeploymentId),
        provider.getDeploymentLogs({ providerDeploymentId: deployment.providerDeploymentId, cursor: deployment.lastLogCursor || "" }).catch(() => ({ lines: [], cursor: deployment.lastLogCursor || "" }))
      ]);

      const nextStatus = mapProviderStatus(current.status);
      deployment.status = nextStatus;
      deployment.buildStatus = toBuildStatus(nextStatus);
      if (current.url) deployment.deploymentUrl = current.url;
      if (logs.cursor) deployment.lastLogCursor = logs.cursor;
      appendLogs(deployment, logs.lines || []);

      if (isTerminal(nextStatus)) {
        deployment.buildCompletedAt = new Date();
        deployment.duration = deployment.buildStartedAt ? Math.max(0, deployment.buildCompletedAt.getTime() - deployment.buildStartedAt.getTime()) : 0;
      }

      await deployment.save();

      for (const line of logs.lines || []) {
        await emitDeploymentRealtimeEvent(job.data?.io, "deployment:log", deployment, { line });
      }

      if (nextStatus === "ready") {
        await emitDeploymentRealtimeEvent(job.data?.io, "deployment:ready", deployment);
        return { deploymentId: deployment._id.toString(), status: deployment.status };
      }

      if (nextStatus === "failed") {
        await emitDeploymentRealtimeEvent(job.data?.io, "deployment:failed", deployment);
        return { deploymentId: deployment._id.toString(), status: deployment.status };
      }

      if (nextStatus === "cancelled") {
        await emitDeploymentRealtimeEvent(job.data?.io, "deployment:cancelled", deployment);
        return { deploymentId: deployment._id.toString(), status: deployment.status };
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      await deployment.reload?.();
    }

    deployment.status = "failed";
    deployment.buildStatus = "failed";
    deployment.error = "Deployment status polling timed out";
    deployment.buildCompletedAt = new Date();
    deployment.duration = deployment.buildStartedAt ? Math.max(0, deployment.buildCompletedAt.getTime() - deployment.buildStartedAt.getTime()) : 0;
    await deployment.save();
    await emitDeploymentRealtimeEvent(job.data?.io, "deployment:failed", deployment);

    throw new Error("Deployment status polling timed out");
  } catch (error) {
    const permanent = error instanceof ProviderConfigurationError || error?.permanent === true;

    deployment.status = deployment.status === "cancelled" ? "cancelled" : "failed";
    deployment.buildStatus = deployment.status === "cancelled" ? "cancelled" : "failed";
    deployment.error = error?.message || "Deployment failed";
    deployment.buildCompletedAt = new Date();
    deployment.duration = deployment.buildStartedAt ? Math.max(0, deployment.buildCompletedAt.getTime() - deployment.buildStartedAt.getTime()) : 0;
    appendLogs(deployment, [{ message: `Deployment failed: ${deployment.error}`, level: "error", source: "worker", timestamp: new Date() }]);
    await deployment.save();
    await emitDeploymentRealtimeEvent(job.data?.io, "deployment:failed", deployment);

    if (permanent) {
      throw new UnrecoverableError(error.message || "Permanent deployment configuration error");
    }

    if (error instanceof ProviderRequestError && error.retryable === false) {
      throw new UnrecoverableError(error.message || "Provider request rejected");
    }

    throw error;
  }
}
