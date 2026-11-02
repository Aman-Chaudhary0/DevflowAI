export const WORKFLOW_TRIGGER_TYPES = ["manual", "internal", "github"];
export const INTERNAL_WORKFLOW_EVENTS = ["task.created", "task.completed", "project.created", "project.updated", "workflow.manual_triggered"];
export const GITHUB_WORKFLOW_EVENTS = ["pull_request.opened", "pull_request.merged", "push", "issue.created"];
export const ALLOWED_CONDITION_FIELDS = ["branch", "status", "project", "environment", "event", "type", "priority", "source", "result", "taskStatus", "title", "description"];
export const SUPPORTED_CONDITION_OPERATORS = {
  equals: "equals",
  not_equals: "not_equals",
  contains: "contains",
  does_not_contain: "does_not_contain",
  greater_than: "greater_than",
  less_than: "less_than",
  exists: "exists",
  does_not_exist: "does_not_exist"
};
export const ALLOWED_ACTION_TYPES = [
  "create_notification",
  "create_activity",
  "slack_notification",
  "github_issue",
  "ai_review",
  "ai_documentation"
];

export function isValidTriggerType(type) {
  return WORKFLOW_TRIGGER_TYPES.includes(type);
}

export function isValidWorkflowEvent(type, event) {
  if (!event) return false;
  if (type === "internal") return INTERNAL_WORKFLOW_EVENTS.includes(event);
  if (type === "github") return GITHUB_WORKFLOW_EVENTS.includes(event);
  return event === "workflow.manual_triggered" || type === "manual";
}

export function isAllowedConditionField(field) {
  return ALLOWED_CONDITION_FIELDS.includes(field);
}

export function isAllowedActionType(type) {
  return ALLOWED_ACTION_TYPES.includes(type);
}
