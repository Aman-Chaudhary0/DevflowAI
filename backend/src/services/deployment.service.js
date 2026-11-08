import mongoose from "mongoose";
import Deployment from "../models/Deployment.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { getAuthorizedProjectIdsForUser, getProjectForUser } from "./project.service.js";
import { addDeploymentJob } from "../queues/deployment.queue.js";
import { getDeploymentProvider, getProviderName, ProviderConfigurationError } from "./deployment-provider.service.js";
import { projectRoom, workspaceRoom } from "../realtime/events.js";

const IN_PROGRESS_STATUSES = ["queued", "initializing", "building", "deploying"];

function parsePaging(input = {}) {
  const page = Math.max(1, Number(input.page || 1));
  const limit = Math.max(1, Math.min(100, Number(input.limit || 20)));
  return { page, limit };
}

export function mapProviderStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["queued", "pending"].includes(value)) return "queued";
  if (value === "initializing") return "initializing";
  if (value === "building") return "building";
  if (value === "deploying") return "deploying";
  if (["ready", "success", "live"].includes(value)) return "ready";
  if (["cancelled", "canceled"].includes(value)) return "cancelled";
  if (["failed", "error"].includes(value)) return "failed";
  return "initializing";
}

function toBuildStatus(status) {
  if (status === "ready") return "success";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";
  if (status === "queued") return "pending";
  return "running";
}

export async function emitDeploymentRealtimeEvent(io, eventName, deployment, extra = {}) {
  if (!io || !deployment) return;

  const payload = {
    event: eventName,
    deploymentId: String(deployment._id),
    workspaceId: String(deployment.workspace),
    projectId: String(deployment.project),
    status: deployment.status,
    buildStatus: deployment.buildStatus,
    deploymentUrl: deployment.deploymentUrl || "",
    occurredAt: new Date().toISOString(),
    ...extra
  };

  io.to(workspaceRoom(deployment.workspace)).to(projectRoom(deployment.project)).emit(eventName, payload);
}

async function deploymentByIdForUser(userId, deploymentId) {
  if (!mongoose.isValidObjectId(deploymentId)) {
    throw new ApiError(400, "Invalid deployment id");
  }

  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const deployment = await Deployment.findOne({
    _id: deploymentId,
    project: {
      $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")]
    }
  })
    .populate("project", "_id name slug workspace repository")
    .populate("createdBy", "_id name avatar")
    .populate("sourceDeployment", "_id providerDeploymentId status")
    .populate("rollbackFrom", "_id providerDeploymentId status");

  if (!deployment) {
    throw new ApiError(404, "Deployment not found or access denied");
  }

  return deployment;
}

async function ensureProviderConfigured() {
  try {
    return getDeploymentProvider();
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      throw new ApiError(503, error.message);
    }
    throw error;
  }
}

function deploymentResponse(document) {
  const deployment = document.toObject ? document.toObject() : { ...document };
  return {
    ...deployment,
    id: String(deployment._id),
    projectName: deployment.project?.name || "",
    createdByName: deployment.createdBy?.name || ""
  };
}

export async function createDeploymentForUser(user, input = {}, io = null) {
  await ensureProviderConfigured();

  const project = await getProjectForUser(user._id, input.projectId);
  const provider = getProviderName();
  const repositoryName = String(input.repository || project.repository?.name || "").trim();

  if (!repositoryName) {
    throw new ApiError(400, "Project repository is required before deployment");
  }

  const branch = String(input.branch || project.repository?.defaultBranch || "main").trim();
  if (!branch) {
    throw new ApiError(400, "Deployment branch is required");
  }

  const duplicate = await Deployment.findOne({
    project: project._id,
    environment: input.environment || "preview",
    branch,
    status: { $in: IN_PROGRESS_STATUSES },
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  }).lean();

  if (duplicate) {
    throw new ApiError(409, "A deployment for this project, branch, and environment is already in progress");
  }

  const deployment = await Deployment.create({
    workspace: project.workspace,
    project: project._id,
    repository: {
      provider: project.repository?.provider || "github",
      name: repositoryName,
      url: project.repository?.url || ""
    },
    provider,
    providerProjectId: String(process.env.VERCEL_PROJECT_ID || "").trim(),
    environment: input.environment || "preview",
    branch,
    commitSha: String(input.commitSha || "").trim(),
    commitMessage: String(input.commitMessage || "").trim(),
    status: "queued",
    buildStatus: "pending",
    createdBy: user._id,
    deploymentConfiguration: {
      ...(input.deploymentConfiguration || {}),
      projectId: project._id.toString(),
      projectName: project.name
    },
    metadata: {
      trigger: "manual"
    }
  });

  await addDeploymentJob(deployment._id, {
    triggeredBy: user._id,
    mode: "deploy"
  });

  const populated = await deploymentByIdForUser(user._id, deployment._id);
  await emitDeploymentRealtimeEvent(io, "deployment:queued", populated);

  return {
    deployment: deploymentResponse(populated)
  };
}

export async function listDeploymentsForUser(userId, query = {}) {
  const { page, limit } = parsePaging(query);
  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const filter = {
    project: {
      $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")]
    },
    ...(query.projectId ? { project: query.projectId } : {}),
    ...(query.environment ? { environment: query.environment } : {}),
    ...(query.status ? { status: query.status } : {})
  };

  const [items, total] = await Promise.all([
    Deployment.find(filter)
      .populate("project", "_id name slug")
      .populate("createdBy", "_id name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Deployment.countDocuments(filter)
  ]);

  return {
    deployments: items.map((item) => deploymentResponse(item)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getDeploymentForUser(userId, deploymentId, options = {}) {
  const deployment = await deploymentByIdForUser(userId, deploymentId);

  if (options.refresh === true && deployment.providerDeploymentId) {
    try {
      const provider = getDeploymentProvider();
      const latest = await provider.getDeployment(deployment.providerDeploymentId);
      const nextStatus = mapProviderStatus(latest.status);
      deployment.status = nextStatus;
      deployment.buildStatus = toBuildStatus(nextStatus);
      if (latest.url) deployment.deploymentUrl = latest.url;
      if (["ready", "failed", "cancelled"].includes(nextStatus)) {
        deployment.buildCompletedAt = deployment.buildCompletedAt || new Date();
        deployment.duration = deployment.buildStartedAt
          ? Math.max(0, deployment.buildCompletedAt.getTime() - deployment.buildStartedAt.getTime())
          : deployment.duration || 0;
      }
      await deployment.save();
    } catch {
      // Avoid hard-failing detail views if provider refresh is temporarily unavailable.
    }
  }

  return { deployment: deploymentResponse(deployment) };
}

export async function getDeploymentStatsForUser(userId) {
  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const projectFilter = {
    project: {
      $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")]
    }
  };

  const [production, preview, successful, failed] = await Promise.all([
    Deployment.countDocuments({ ...projectFilter, environment: "production", status: { $in: IN_PROGRESS_STATUSES.concat(["ready"]) } }),
    Deployment.countDocuments({ ...projectFilter, environment: "preview", status: { $in: IN_PROGRESS_STATUSES.concat(["ready"]) } }),
    Deployment.countDocuments({ ...projectFilter, status: "ready", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    Deployment.countDocuments({ ...projectFilter, status: "failed", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
  ]);

  return {
    production,
    preview,
    successful,
    failed
  };
}

export async function redeployForUser(user, deploymentId, io = null) {
  const deployment = await deploymentByIdForUser(user._id, deploymentId);

  const duplicate = await Deployment.findOne({
    sourceDeployment: deployment._id,
    status: { $in: IN_PROGRESS_STATUSES },
    createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
  }).lean();

  if (duplicate) {
    throw new ApiError(409, "A redeployment from this source is already in progress");
  }

  const created = await Deployment.create({
    workspace: deployment.workspace,
    project: deployment.project?._id || deployment.project,
    repository: deployment.repository,
    provider: deployment.provider,
    providerProjectId: deployment.providerProjectId || "",
    environment: deployment.environment,
    branch: deployment.branch,
    commitSha: deployment.commitSha,
    commitMessage: deployment.commitMessage,
    status: "queued",
    buildStatus: "pending",
    sourceDeployment: deployment._id,
    createdBy: user._id,
    deploymentConfiguration: deployment.deploymentConfiguration || {},
    metadata: {
      trigger: "redeploy"
    }
  });

  await addDeploymentJob(created._id, {
    triggeredBy: user._id,
    mode: "deploy"
  });

  const hydrated = await deploymentByIdForUser(user._id, created._id);
  await emitDeploymentRealtimeEvent(io, "deployment:queued", hydrated);

  return { deployment: deploymentResponse(hydrated) };
}

export async function rollbackForUser(user, deploymentId, input = {}, io = null) {
  const deployment = await deploymentByIdForUser(user._id, deploymentId);
  const projectId = deployment.project?._id || deployment.project;
  const provider = getDeploymentProvider();
  if (typeof provider.promoteDeployment !== "function") {
    throw new ApiError(400, "The configured deployment provider does not support promotion rollback");
  }

  let target = null;
  if (input?.targetDeploymentId) {
    target = await deploymentByIdForUser(user._id, input.targetDeploymentId);
  } else {
    target = await Deployment.findOne({
      project: projectId,
      environment: deployment.environment,
      status: "ready",
      _id: { $ne: deployment._id }
    }).sort({ createdAt: -1 });
  }

  if (!target || !target.providerDeploymentId) {
    throw new ApiError(400, "No previous successful deployment is available for rollback");
  }

  const rollbackDeployment = await Deployment.create({
    workspace: deployment.workspace,
    project: projectId,
    repository: deployment.repository,
    provider: deployment.provider,
    providerProjectId: deployment.providerProjectId || "",
    environment: deployment.environment,
    branch: target.branch || deployment.branch,
    commitSha: target.commitSha || "",
    commitMessage: target.commitMessage || "",
    status: "queued",
    buildStatus: "pending",
    rollbackFrom: target._id,
    createdBy: user._id,
    deploymentConfiguration: deployment.deploymentConfiguration || {},
    metadata: {
      trigger: "rollback"
    }
  });

  await addDeploymentJob(rollbackDeployment._id, {
    triggeredBy: user._id,
    mode: "rollback",
    targetProviderDeploymentId: target.providerDeploymentId
  });

  const hydrated = await deploymentByIdForUser(user._id, rollbackDeployment._id);
  await emitDeploymentRealtimeEvent(io, "deployment:queued", hydrated);

  return {
    deployment: deploymentResponse(hydrated),
    targetDeploymentId: String(target._id)
  };
}

export async function cancelDeploymentForUser(user, deploymentId, io = null) {
  const deployment = await deploymentByIdForUser(user._id, deploymentId);

  if (!["queued", "initializing", "building", "deploying"].includes(deployment.status)) {
    throw new ApiError(400, "Only in-progress deployments can be cancelled");
  }

  if (deployment.providerDeploymentId) {
    try {
      const provider = getDeploymentProvider();
      await provider.cancelDeployment(deployment.providerDeploymentId);
    } catch {
      // The provider may already have finalized this deployment; fallback to local cancellation state.
    }
  }

  deployment.status = "cancelled";
  deployment.buildStatus = "cancelled";
  deployment.buildCompletedAt = new Date();
  deployment.duration = deployment.buildStartedAt
    ? Math.max(0, deployment.buildCompletedAt.getTime() - deployment.buildStartedAt.getTime())
    : deployment.duration || 0;
  await deployment.save();

  await emitDeploymentRealtimeEvent(io, "deployment:cancelled", deployment);

  return { deployment: deploymentResponse(deployment) };
}

export async function getDeploymentLogsForUser(userId, deploymentId, query = {}) {
  const deployment = await deploymentByIdForUser(userId, deploymentId);

  if (deployment.providerDeploymentId) {
    try {
      const provider = getDeploymentProvider();
      const response = await provider.getDeploymentLogs({
        providerDeploymentId: deployment.providerDeploymentId,
        cursor: query.cursor || deployment.lastLogCursor || ""
      });

      if (response.cursor) deployment.lastLogCursor = response.cursor;
      if (Array.isArray(response.lines) && response.lines.length) {
        deployment.logs = [...(deployment.logs || []), ...response.lines].slice(-2000);
      }
      await deployment.save();
    } catch {
      // Keep persisted logs if live provider fetch fails.
    }
  }

  const limit = Math.max(1, Math.min(500, Number(query.limit || 200)));
  const lines = (deployment.logs || []).slice(-limit);

  return {
    deploymentId: String(deployment._id),
    logs: lines,
    cursor: deployment.lastLogCursor || ""
  };
}
