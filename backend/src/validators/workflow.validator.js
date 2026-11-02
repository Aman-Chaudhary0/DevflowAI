import { z } from "zod";

export const workflowStatusEnum = ["draft", "active", "paused", "archived"];
export const workflowTriggerTypeEnum = ["manual", "internal", "github"];
export const workflowConditionOperatorEnum = ["equals", "not_equals", "contains", "does_not_contain", "greater_than", "less_than", "exists", "does_not_exist"];
export const workflowActionTypeEnum = ["create_notification", "create_activity", "slack_notification", "github_issue", "ai_review", "ai_documentation"];

export const workflowConditionSchema = z.object({
  field: z.string().trim().min(1).max(80),
  operator: z.enum(workflowConditionOperatorEnum),
  value: z.any().optional(),
  logic: z.enum(["AND", "OR"]).default("AND")
});

export const workflowActionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(workflowActionTypeEnum),
  configuration: z.record(z.any()).default({}),
  enabled: z.boolean().default(true),
  timeout: z.number().int().min(1000).max(300000).default(60000)
});

export const workflowTriggerSchema = z.object({
  type: z.enum(workflowTriggerTypeEnum).default("manual"),
  event: z.string().trim().min(1).max(120).default("workflow.manual_triggered"),
  configuration: z.record(z.any()).default({}),
  enabled: z.boolean().default(true)
});

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).default(""),
    project: z.string().trim().regex(/^[a-fA-F0-9]{24}$/).optional(),
    workspace: z.string().trim().regex(/^[a-fA-F0-9]{24}$/).optional(),
    status: z.enum(workflowStatusEnum).default("draft"),
    trigger: workflowTriggerSchema.default({ type: "manual", event: "workflow.manual_triggered", configuration: {}, enabled: true }),
    conditions: z.array(workflowConditionSchema).default([]),
    actions: z.array(workflowActionSchema).default([]),
    executionSettings: z.record(z.any()).default({ timeoutMs: 60000, maxActions: 10, stopOnFailure: true })
  })
});

export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(workflowStatusEnum).optional(),
    trigger: workflowTriggerSchema.optional(),
    conditions: z.array(workflowConditionSchema).optional(),
    actions: z.array(workflowActionSchema).optional(),
    executionSettings: z.record(z.any()).optional()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one workflow field is required",
    path: []
  })
});

export const workflowStatusSchema = z.object({
  body: z.object({
    status: z.enum(workflowStatusEnum)
  })
});

export const workflowParamsSchema = z.object({
  params: z.object({
    workflowId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid workflow id")
  })
});

export const workflowRunParamsSchema = z.object({
  params: z.object({
    workflowId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid workflow id"),
    runId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid run id")
  })
});
