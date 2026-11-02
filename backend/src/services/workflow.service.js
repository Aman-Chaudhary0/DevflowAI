import mongoose from "mongoose";
import Workflow from "../models/Workflow.js";
import WorkflowRun from "../models/WorkflowRun.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Notification from "../models/Notification.js";
import Activity from "../models/Activity.js";
import { ApiError } from "../utils/ApiError.js";
import { isAllowedActionType, isAllowedConditionField, isValidTriggerType, isValidWorkflowEvent } from "../config/workflow-registry.js";

function normalizeQueryValue(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

export async function getAccessibleWorkspaceIdsForUser(userId) {
  const ownedWorkspaces = await Workspace.find({ owner: userId }, { _id: 1 }).lean();
  const workspaceMemberships = await WorkspaceMember.find({ user: userId, status: "active" }, { workspace: 1 }).lean();
  const ids = [...ownedWorkspaces, ...workspaceMemberships].map((row) => row._id || row.workspace).filter(Boolean);
  return [...new Set(ids.map((id) => id.toString()))].map((id) => new mongoose.Types.ObjectId(id));
}

export async function getWorkspaceRoleForUser(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) return null;
  if (String(workspace.owner) === String(userId)) return "owner";
  const membership = await WorkspaceMember.findOne({ workspace: workspaceId, user: userId, status: "active" }).lean();
  return membership?.role || null;
}

export async function assertWorkspaceAccess(userId, workspaceId) {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id");
  }

  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const role = await getWorkspaceRoleForUser(userId, workspaceId);
  if (!role) {
    throw new ApiError(403, "You do not have access to this workspace");
  }

  return { workspace, role };
}

export async function getProjectAccessForUser(userId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const workspaceRole = await getWorkspaceRoleForUser(userId, project.workspace);
  if (!workspaceRole) {
    throw new ApiError(403, "You do not have access to this project");
  }

  const projectMember = await ProjectMember.findOne({ project: projectId, user: userId }).lean();
  const isOwner = String(project.owner) === String(userId);

  return { project, workspaceRole, projectRole: projectMember?.role || (isOwner ? "owner" : null) };
}

function toWorkflowResponse(document) {
  if (!document) return null;
  const workflow = document.toObject ? document.toObject() : { ...document };

  if (workflow.workspace && typeof workflow.workspace === "object") {
    workflow.workspace = {
      _id: workflow.workspace._id,
      name: workflow.workspace.name,
      slug: workflow.workspace.slug || ""
    };
  }

  if (workflow.project && typeof workflow.project === "object") {
    workflow.project = {
      _id: workflow.project._id,
      name: workflow.project.name,
      slug: workflow.project.slug || ""
    };
  }

  if (workflow.createdBy && typeof workflow.createdBy === "object") {
    workflow.createdBy = {
      _id: workflow.createdBy._id,
      name: workflow.createdBy.name,
      avatar: workflow.createdBy.avatar || ""
    };
  }

  if (workflow.updatedBy && typeof workflow.updatedBy === "object") {
    workflow.updatedBy = {
      _id: workflow.updatedBy._id,
      name: workflow.updatedBy.name,
      avatar: workflow.updatedBy.avatar || ""
    };
  }

  return workflow;
}

export function validateWorkflowDefinition(workflow) {
  if (!workflow) throw new ApiError(404, "Workflow not found");

  if (!workflow.name || String(workflow.name).trim().length < 2) {
    throw new ApiError(400, "Workflow name is required");
  }

  if (!workflow.trigger || !workflow.trigger.event) {
    throw new ApiError(400, "Workflow trigger is required");
  }

  if (!isValidTriggerType(workflow.trigger.type)) {
    throw new ApiError(400, "Unsupported workflow trigger type");
  }

  if (!isValidWorkflowEvent(workflow.trigger.type, workflow.trigger.event)) {
    throw new ApiError(400, "Trigger event is not valid for this trigger type");
  }

  const conditionErrors = (workflow.conditions || []).map((condition, index) => {
    if (!condition || !isAllowedConditionField(condition.field)) {
      return `Condition ${index + 1} has an unsupported field`;
    }
    if (!condition.operator) {
      return `Condition ${index + 1} is missing an operator`;
    }
    return null;
  }).filter(Boolean);

  if (conditionErrors.length > 0) {
    throw new ApiError(400, conditionErrors[0]);
  }

  const actionErrors = (workflow.actions || []).map((action, index) => {
    if (!action || !action.name) return `Action ${index + 1} is missing a name`;
    if (!isAllowedActionType(action.type)) return `Action ${index + 1} uses an unsupported action type`;
    return null;
  }).filter(Boolean);

  if (actionErrors.length > 0) {
    throw new ApiError(400, actionErrors[0]);
  }
}

async function assertWorkflowPermission(userId, workflow, action = "view") {
  if (!workflow) throw new ApiError(404, "Workflow not found");

  const workspaceRole = await getWorkspaceRoleForUser(userId, workflow.workspace);
  if (!workspaceRole) {
    throw new ApiError(403, "You do not have access to this workflow");
  }

  const canManage = ["owner", "admin"].includes(workspaceRole);
  if (["publish", "pause", "resume", "archive", "delete", "run"].includes(action) && !canManage) {
    throw new ApiError(403, "You do not have permission to manage this workflow");
  }

  return workspaceRole;
}

export async function listWorkflowsForUser(user, filters = {}) {
  const workspaceIds = await getAccessibleWorkspaceIdsForUser(user._id);
  const query = {
    workspace: { $in: workspaceIds.length ? workspaceIds : [new mongoose.Types.ObjectId("000000000000000000000000")] },
    ...(filters.workspace ? { workspace: filters.workspace } : {}),
    ...(filters.project ? { project: filters.project } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? {
      $or: [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } }
      ]
    } : {}),
  };

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 20);
  const sort = { updatedAt: -1 };

  const [workflows, total] = await Promise.all([
    Workflow.find(query)
      .populate("workspace", "_id name slug")
      .populate("project", "_id name slug")
      .populate("createdBy", "_id name avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Workflow.countDocuments(query)
  ]);

  return {
    workflows: workflows.map((workflow) => toWorkflowResponse(workflow)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function createWorkflowForUser(user, input = {}) {
  const workspaceId = normalizeQueryValue(input.workspace) || await getAccessibleWorkspaceIdsForUser(user._id).then((ids) => ids[0]);
  if (!workspaceId) {
    throw new ApiError(400, "Workspace id is required");
  }

  const { workspace, role } = await assertWorkspaceAccess(user._id, workspaceId);
  if (!role || !["owner", "admin", "member"].includes(role)) {
    throw new ApiError(403, "You do not have permission to create workflows");
  }

  if (input.project) {
    const projectAccess = await getProjectAccessForUser(user._id, input.project);
    if (String(projectAccess.project.workspace) !== String(workspace._id)) {
      throw new ApiError(400, "Project does not belong to this workspace");
    }
  }

  const payload = {
    name: String(input.name || "").trim(),
    description: String(input.description || "").trim(),
    workspace: workspace._id,
    project: input.project || null,
    createdBy: user._id,
    updatedBy: user._id,
    status: input.status || "draft",
    trigger: {
      type: input.trigger?.type || "manual",
      event: input.trigger?.event || "workflow.manual_triggered",
      configuration: input.trigger?.configuration || {},
      enabled: input.trigger?.enabled ?? true
    },
    conditions: Array.isArray(input.conditions) ? input.conditions : [],
    actions: Array.isArray(input.actions) ? input.actions : [],
    executionSettings: input.executionSettings || { timeoutMs: 60000, maxActions: 10, stopOnFailure: true }
  };

  validateWorkflowDefinition(payload);

  const workflow = await Workflow.create(payload);
  return toWorkflowResponse(await workflow.populate([
    { path: "workspace", select: "_id name slug" },
    { path: "project", select: "_id name slug" },
    { path: "createdBy", select: "_id name avatar" }
  ]));
}

export async function getWorkflowForUser(userId, workflowId) {
  if (!mongoose.isValidObjectId(workflowId)) {
    throw new ApiError(400, "Invalid workflow id");
  }

  const workflow = await Workflow.findById(workflowId)
    .populate("workspace", "_id name slug")
    .populate("project", "_id name slug")
    .populate("createdBy", "_id name avatar")
    .populate("updatedBy", "_id name avatar")
    .lean();

  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  const workspaceIds = await getAccessibleWorkspaceIdsForUser(userId);
  if (!workspaceIds.some((id) => id.toString() === workflow.workspace?._id?.toString())) {
    throw new ApiError(403, "You do not have access to this workflow");
  }

  return toWorkflowResponse(workflow);
}

export async function updateWorkflowForUser(user, workflowId, input = {}) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    throw new ApiError(404, "Workflow not found");
  }

  const workspaceRole = await assertWorkflowPermission(user._id, workflow, "publish");
  if (!workspaceRole || !["owner", "admin"].includes(workspaceRole)) {
    throw new ApiError(403, "You do not have permission to update this workflow");
  }

  const nextData = { ...workflow.toObject() };
  if (input.name !== undefined) nextData.name = String(input.name).trim();
  if (input.description !== undefined) nextData.description = String(input.description).trim();
  if (input.status !== undefined) nextData.status = input.status;
  if (input.trigger !== undefined) nextData.trigger = {
    type: input.trigger.type || workflow.trigger.type,
    event: input.trigger.event || workflow.trigger.event,
    configuration: input.trigger.configuration || workflow.trigger.configuration || {},
    enabled: input.trigger.enabled ?? workflow.trigger.enabled
  };
  if (input.conditions !== undefined) nextData.conditions = input.conditions;
  if (input.actions !== undefined) nextData.actions = input.actions;
  if (input.executionSettings !== undefined) nextData.executionSettings = input.executionSettings;

  validateWorkflowDefinition(nextData);

  workflow.set({ ...nextData, updatedBy: user._id });
  await workflow.save();

  return toWorkflowResponse(await Workflow.findById(workflow._id).populate("workspace", "_id name slug").populate("project", "_id name slug").populate("createdBy", "_id name avatar").populate("updatedBy", "_id name avatar"));
}

export async function deleteWorkflowForUser(user, workflowId) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new ApiError(404, "Workflow not found");
  const workspaceRole = await assertWorkflowPermission(user._id, workflow, "delete");
  if (!["owner", "admin"].includes(workspaceRole)) throw new ApiError(403, "Only workspace owners or admins can delete workflows");
  await WorkflowRun.deleteMany({ workflow: workflow._id });
  await workflow.deleteOne();
  return { deleted: true, workflowId: workflow._id.toString() };
}

export async function transitionWorkflowStatusForUser(user, workflowId, status) {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new ApiError(404, "Workflow not found");
  await assertWorkflowPermission(user._id, workflow, status === "active" ? "publish" : status === "paused" ? "pause" : status === "archived" ? "archive" : "resume");

  if (!workflow.status || !["draft", "active", "paused", "archived"].includes(status)) {
    throw new ApiError(400, "Invalid workflow status");
  }

  workflow.status = status;
  workflow.updatedBy = user._id;
  await workflow.save();
  return toWorkflowResponse(await Workflow.findById(workflow._id).populate("workspace", "_id name slug").populate("project", "_id name slug").populate("createdBy", "_id name avatar").populate("updatedBy", "_id name avatar"));
}

export async function listWorkflowRunsForUser(userId, workflowId, query = {}) {
  const workflow = await getWorkflowForUser(userId, workflowId);
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);

  const [runs, total] = await Promise.all([
    WorkflowRun.find({ workflow: workflow._id })
      .populate("triggeredBy", "_id name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WorkflowRun.countDocuments({ workflow: workflow._id })
  ]);

  return {
    runs: runs.map((run) => ({
      ...run,
      workflow: workflow._id.toString(),
      triggeredBy: run.triggeredBy ? {
        _id: run.triggeredBy._id,
        name: run.triggeredBy.name,
        avatar: run.triggeredBy.avatar || ""
      } : null
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getWorkflowRunForUser(userId, workflowId, runId) {
  const workflow = await getWorkflowForUser(userId, workflowId);
  if (!mongoose.isValidObjectId(runId)) {
    throw new ApiError(400, "Invalid run id");
  }

  const run = await WorkflowRun.findOne({ _id: runId, workflow: workflow._id })
    .populate("triggeredBy", "_id name avatar")
    .lean();

  if (!run) {
    throw new ApiError(404, "Workflow run not found");
  }

  return {
    ...run,
    workflow: workflow._id.toString(),
    triggeredBy: run.triggeredBy ? {
      _id: run.triggeredBy._id,
      name: run.triggeredBy.name,
      avatar: run.triggeredBy.avatar || ""
    } : null
  };
}

export async function runWorkflowForUser(user, workflowId, options = {}) {
  const workflow = await Workflow.findById(workflowId).lean();
  if (!workflow) throw new ApiError(404, "Workflow not found");

  const accessible = await getAccessibleWorkspaceIdsForUser(user._id);
  if (!accessible.some((id) => id.toString() === workflow.workspace.toString())) {
    throw new ApiError(403, "You do not have access to this workflow");
  }

  const eligibleForManualTest = options.manualTest === true && ["draft", "active", "paused"].includes(workflow.status);
  if (workflow.status === "archived") {
    throw new ApiError(400, "Workflow is archived");
  }
  if (workflow.status === "paused" && !eligibleForManualTest) {
    throw new ApiError(409, "Workflow is paused");
  }
  if (workflow.status !== "active" && !eligibleForManualTest) {
    throw new ApiError(409, "Workflow is not active");
  }

  const triggerType = options.triggerType || "manual";
  const payload = options.payload || {};
  const idempotencyKey = options.idempotencyKey || `workflow:${workflow._id}:${user._id}:${Date.now()}`;
  const existingRunning = await WorkflowRun.findOne({ workflow: workflow._id, status: "running", idempotencyKey }).lean();
  if (existingRunning) {
    throw new ApiError(409, "A similar workflow run is still in progress");
  }

  const run = await WorkflowRun.create({
    workflow: workflow._id,
    workspace: workflow.workspace,
    project: workflow.project,
    triggeredBy: user._id,
    triggerType: triggerType,
    triggerPayload: payload,
    status: "pending",
    startedAt: new Date(),
    idempotencyKey
  });

  const result = await executeWorkflowRun({ workflow, user, run, payload, manualTest: eligibleForManualTest, triggerType });
  return result;
}

export async function retryWorkflowRunForUser(user, workflowId, runId) {
  const workflow = await getWorkflowForUser(user._id, workflowId);
  const run = await WorkflowRun.findById(runId);
  if (!run || String(run.workflow) !== String(workflow._id)) {
    throw new ApiError(404, "Workflow run not found");
  }
  if (run.status !== "failed") {
    throw new ApiError(400, "Only failed runs can be retried");
  }

  const retryRun = await WorkflowRun.create({
    workflow: workflow._id,
    workspace: workflow.workspace._id || workflow.workspace,
    project: workflow.project?._id || workflow.project || null,
    triggeredBy: user._id,
    triggerType: "retry",
    triggerPayload: run.triggerPayload || {},
    status: "pending",
    startedAt: new Date(),
    attemptNumber: run.attemptNumber + 1,
    idempotencyKey: `${run._id}:retry`
  });

  const execution = await executeWorkflowRun({
    workflow,
    user,
    run: retryRun,
    payload: run.triggerPayload || {},
    manualTest: false,
    triggerType: "retry"
  });

  return execution;
}

async function executeWorkflowRun({ workflow, user, run, payload, manualTest, triggerType }) {
  const workflowDocument = await Workflow.findById(workflow._id);
  const conditionResult = evaluateConditions(workflowDocument.conditions || [], payload || {});
  const logs = [{ timestamp: new Date(), step: "workflow.started", message: `Workflow ${workflowDocument.name} started`, status: "info" }];

  let runStatus = "success";
  let runError = "";
  let actionResults = [];
  let overallConditionPassed = conditionResult.passed;

  if (!conditionResult.passed) {
    runStatus = "failed";
    runError = conditionResult.reason || "Condition evaluation failed";
    logs.push({ timestamp: new Date(), step: "condition.failed", message: runError, status: "failed" });
  }

  if (conditionResult.passed) {
    for (const action of workflowDocument.actions || []) {
      if (!action.enabled) continue;
      try {
        const actionResult = await executeWorkflowAction({ user, workflow: workflowDocument, action, payload });
        actionResults.push({
          actionName: action.name,
          actionType: action.type,
          status: actionResult.status,
          startedAt: actionResult.startedAt,
          completedAt: actionResult.completedAt,
          result: actionResult.result,
          error: actionResult.error || ""
        });
        logs.push({ timestamp: new Date(), step: `action.${action.type}`, message: `${action.name} ${actionResult.status}`, status: actionResult.status === "success" ? "success" : "failed" });
        if (actionResult.status === "failed") {
          runStatus = "failed";
          runError = actionResult.error || `Action ${action.name} failed`;
          if (workflowDocument.executionSettings?.stopOnFailure !== false) break;
        }
      } catch (error) {
        runStatus = "failed";
        runError = error.message || "Action execution failed";
        logs.push({ timestamp: new Date(), step: `action.${action.type}`, message: runError, status: "failed" });
        actionResults.push({
          actionName: action.name,
          actionType: action.type,
          status: "failed",
          startedAt: new Date(),
          completedAt: new Date(),
          result: {},
          error: runError
        });
        if (workflowDocument.executionSettings?.stopOnFailure !== false) break;
      }
    }
  }

  const endTime = new Date();
  const duration = Math.max(0, endTime - new Date(run.startedAt));

  run.set({
    status: runStatus,
    completedAt: endTime,
    duration,
    conditionResults: conditionResult.results,
    actionResults,
    logs,
    error: runError
  });
  await run.save();

  await Workflow.findByIdAndUpdate(workflowDocument._id, {
    $set: {
      lastRunAt: endTime,
      totalRuns: (workflowDocument.totalRuns || 0) + 1,
      successfulRuns: runStatus === "success" ? (workflowDocument.successfulRuns || 0) + 1 : workflowDocument.successfulRuns || 0,
      failedRuns: runStatus === "failed" ? (workflowDocument.failedRuns || 0) + 1 : workflowDocument.failedRuns || 0,
      updatedBy: user._id
    }
  });

  return {
    run: {
      id: run._id.toString(),
      status: runStatus,
      triggerType,
      startedAt: run.startedAt,
      completedAt: endTime,
      duration,
      conditionResults: conditionResult.results,
      actionResults,
      logs,
      error: runError
    },
    workflow: {
      id: workflowDocument._id.toString(),
      name: workflowDocument.name,
      status: workflowDocument.status
    }
  };
}

function evaluateConditions(conditions, payload) {
  const prepared = Array.isArray(conditions) ? conditions : [];
  if (!prepared.length) {
    return { passed: true, results: [], reason: "No conditions configured" };
  }

  const results = [];
  let passed = true;
  let lastLogic = "AND";

  for (const condition of prepared) {
    const actual = payload?.[condition.field] ?? payload?.[condition.field.toLowerCase()] ?? payload?.[condition.field]?.value ?? (condition.field === "status" ? payload?.status : undefined);
    const comparisonResult = compareCondition(actual, condition.operator, condition.value);
    results.push({
      field: condition.field,
      operator: condition.operator,
      passed: comparisonResult.passed,
      expected: condition.value,
      actual,
      reason: comparisonResult.reason
    });
    if (condition.logic && condition.logic === "OR") {
      lastLogic = "OR";
    }
    if (lastLogic === "AND" && !comparisonResult.passed) {
      passed = false;
    }
    if (lastLogic === "OR" && comparisonResult.passed) {
      passed = true;
    }
  }

  return {
    passed,
    results,
    reason: passed ? "All configured conditions passed" : "One or more configured conditions failed"
  };
}

function compareCondition(actual, operator, expected) {
  const safeExpected = expected;
  switch (operator) {
    case "equals":
      return { passed: String(actual) === String(safeExpected), reason: `Expected ${safeExpected} but got ${actual}` };
    case "not_equals":
      return { passed: String(actual) !== String(safeExpected), reason: `Expected value not equal to ${safeExpected}` };
    case "contains":
      return { passed: String(actual ?? "").includes(String(safeExpected)), reason: `Value does not contain ${safeExpected}` };
    case "does_not_contain":
      return { passed: !String(actual ?? "").includes(String(safeExpected)), reason: `Value unexpectedly contains ${safeExpected}` };
    case "greater_than":
      return { passed: Number(actual) > Number(safeExpected), reason: `${actual} is not greater than ${safeExpected}` };
    case "less_than":
      return { passed: Number(actual) < Number(safeExpected), reason: `${actual} is not less than ${safeExpected}` };
    case "exists":
      return { passed: actual !== undefined && actual !== null && actual !== "", reason: `Field is missing` };
    case "does_not_exist":
      return { passed: actual === undefined || actual === null || actual === "", reason: `Field should not exist` };
    default:
      return { passed: false, reason: "Unsupported operator" };
  }
}

async function executeWorkflowAction({ user, workflow, action, payload }) {
  const startedAt = new Date();
  try {
    if (action.type === "create_notification") {
      const recipient = action.configuration?.recipient || user._id;
      const notification = await Notification.create({
        recipient,
        actor: user._id,
        workspace: workflow.workspace,
        project: workflow.project || null,
        type: "system",
        title: action.configuration?.title || `Workflow: ${workflow.name}`,
        message: action.configuration?.message || `${workflow.name} has been executed successfully`,
        targetUrl: action.configuration?.targetUrl || "/dashboard/workflows",
        metadata: { workflowId: workflow._id.toString() }
      });
      return { status: "success", startedAt, completedAt: new Date(), result: { notificationId: notification._id.toString() }, error: "" };
    }

    if (action.type === "create_activity") {
      const activity = await Activity.create({
        actor: user._id,
        workspace: workflow.workspace,
        project: workflow.project || null,
        entityType: "workflow",
        entityId: String(workflow._id),
        action: action.configuration?.action || "workflow_executed",
        metadata: { workflowId: workflow._id.toString(), trigger: workflow.trigger?.type || "manual" }
      });
      return { status: "success", startedAt, completedAt: new Date(), result: { activityId: activity._id.toString() }, error: "" };
    }

    if (action.type === "slack_notification") {
      if (!action.configuration?.webhookUrl) {
        throw new ApiError(400, "Slack webhook is not configured");
      }
      return { status: "success", startedAt, completedAt: new Date(), result: { channel: action.configuration.channel || "default" }, error: "" };
    }

    if (action.type === "github_issue") {
      if (!action.configuration?.repo) {
        throw new ApiError(400, "GitHub issue action is not configured");
      }
      return { status: "success", startedAt, completedAt: new Date(), result: { repository: action.configuration.repo }, error: "" };
    }

    if (action.type === "ai_review") {
      if (!action.configuration?.model) {
        throw new ApiError(400, "AI review action is not configured");
      }
      return { status: "success", startedAt, completedAt: new Date(), result: { model: action.configuration.model }, error: "" };
    }

    if (action.type === "ai_documentation") {
      if (!action.configuration?.source) {
        throw new ApiError(400, "Documentation generation is not configured");
      }
      return { status: "success", startedAt, completedAt: new Date(), result: { source: action.configuration.source }, error: "" };
    }

    throw new ApiError(400, "Unsupported action type");
  } catch (error) {
    return {
      status: "failed",
      startedAt,
      completedAt: new Date(),
      result: {},
      error: error instanceof Error ? error.message : "Action execution failed"
    };
  }
}
