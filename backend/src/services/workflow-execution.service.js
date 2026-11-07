import Workflow from "../models/Workflow.js";
import WorkflowRun from "../models/WorkflowRun.js";
import Notification from "../models/Notification.js";
import Activity from "../models/Activity.js";
import { ApiError } from "../utils/ApiError.js";

export function evaluateConditions(conditions, payload) {
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

export function compareCondition(actual, operator, expected) {
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
      return { passed: actual !== undefined && actual !== null && actual !== "", reason: "Field is missing" };
    case "does_not_exist":
      return { passed: actual === undefined || actual === null || actual === "", reason: "Field should not exist" };
    default:
      return { passed: false, reason: "Unsupported operator" };
  }
}

export async function executeWorkflowAction({ user, workflow, action, payload }) {
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

      return {
        status: "success",
        startedAt,
        completedAt: new Date(),
        result: { notificationId: notification._id.toString() },
        error: ""
      };
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

      return {
        status: "success",
        startedAt,
        completedAt: new Date(),
        result: { activityId: activity._id.toString() },
        error: ""
      };
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

export async function executeWorkflowRun({ workflow, user, run, payload, manualTest, triggerType }) {
  const workflowDocument = await Workflow.findById(workflow._id || workflow.id || workflow._id);
  if (!workflowDocument) {
    throw new ApiError(404, "Workflow not found");
  }

  const conditionResult = evaluateConditions(workflowDocument.conditions || [], payload || {});
  const logs = [{ timestamp: new Date(), step: "workflow.started", message: `Workflow ${workflowDocument.name} started`, status: "info" }];

  let runStatus = "success";
  let runError = "";
  let actionResults = [];

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
        logs.push({
          timestamp: new Date(),
          step: `action.${action.type}`,
          message: `${action.name} ${actionResult.status}`,
          status: actionResult.status === "success" ? "success" : "failed"
        });

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
  const duration = Math.max(0, endTime - new Date(run.startedAt || Date.now()));

  const nextRun = await WorkflowRun.findById(run._id);
  if (!nextRun) {
    throw new ApiError(404, "Workflow run not found");
  }

  nextRun.set({
    status: runStatus,
    completedAt: endTime,
    duration,
    conditionResults: conditionResult.results,
    actionResults,
    logs,
    error: runError,
    startedAt: nextRun.startedAt || new Date()
  });

  await nextRun.save();

  const currentWorkflow = await Workflow.findById(workflowDocument._id);
  if (!currentWorkflow) {
    throw new ApiError(404, "Workflow not found");
  }

  const statsUpdate = {
    $set: {
      lastRunAt: endTime,
      updatedBy: user._id
    },
    $inc: { totalRuns: 1 }
  };

  if (runStatus === "success") {
    statsUpdate.$inc.successfulRuns = 1;
  }
  if (runStatus === "failed") {
    statsUpdate.$inc.failedRuns = 1;
  }

  await Workflow.findByIdAndUpdate(workflowDocument._id, statsUpdate);

  return {
    run: {
      id: nextRun._id.toString(),
      status: runStatus,
      triggerType,
      startedAt: nextRun.startedAt,
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

export async function executeWorkflowJob(job) {
  const { workflowId, runId, userId, triggerType, payload } = job.data || {};
  if (!workflowId || !runId) {
    throw new Error("Workflow job payload is missing workflowId or runId");
  }

  const run = await WorkflowRun.findById(runId);
  if (!run) {
    throw new Error(`Workflow run ${runId} not found`);
  }

  if (["success", "failed"].includes(run.status)) {
    return { runId, status: run.status, skipped: true };
  }

  const workflow = await Workflow.findById(workflowId);
  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  const effectiveUserId = userId || run.triggeredBy || workflow.createdBy;
  const executionUser = effectiveUserId ? { _id: effectiveUserId } : { _id: run.triggeredBy || workflow.createdBy };

  run.status = "running";
  run.startedAt = run.startedAt || new Date();
  run.logs = [...(run.logs || []), { timestamp: new Date(), step: "workflow.started", message: `Workflow ${workflow.name} started`, status: "info" }];
  await run.save();

  const result = await executeWorkflowRun({
    workflow,
    user: executionUser,
    run,
    payload: payload || run.triggerPayload || {},
    triggerType: triggerType || run.triggerType || "manual",
    manualTest: false
  });

  return result;
}
