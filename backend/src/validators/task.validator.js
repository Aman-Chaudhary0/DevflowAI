import { z } from "zod";

export const taskStatuses = ["todo", "in_progress", "review", "blocked", "done"];
export const taskPriorities = ["low", "medium", "high", "urgent"];

export const taskParamsSchema = z.object({
  params: z.object({
    taskId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid task id")
  })
});

const dateLikeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
  }

  return trimmed;
}, z.union([
  z.literal(""),
  z.string().datetime({ offset: true })
]).transform((value) => (value === "" ? undefined : value)));

export const taskQuerySchema = z.object({
  query: z.object({
    projectId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional(),
    workspaceId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id").optional(),
    status: z.enum([...taskStatuses, ""]).optional().transform((value) => value || undefined),
    priority: z.enum([...taskPriorities, ""]).optional().transform((value) => value || undefined),
    assignee: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid assignee id").optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(["updatedAt", "createdAt", "dueDate", "priority", "status"]).default("updatedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).default(""),
    projectId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional(),
    project: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional(),
    workspaceId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id").optional(),
    workspace: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id").optional(),
    assigneeId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid assignee id").optional(),
    assignee: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid assignee id").optional(),
    status: z.enum(taskStatuses).default("todo"),
    priority: z.enum(taskPriorities).default("medium"),
    dueDate: dateLikeSchema.optional(),
    labels: z.array(z.string().trim().min(1).max(40)).max(20).optional()
  }).refine((body) => body.projectId || body.project, {
    message: "Project id is required",
    path: ["projectId"]
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    projectId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional(),
    project: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional(),
    workspaceId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id").optional(),
    workspace: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id").optional(),
    assigneeId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid assignee id").optional(),
    assignee: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid assignee id").optional(),
    status: z.enum(taskStatuses).optional(),
    priority: z.enum(taskPriorities).optional(),
    dueDate: dateLikeSchema.optional(),
    labels: z.array(z.string().trim().min(1).max(40)).max(20).optional()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one valid task field is required",
    path: []
  })
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(4000)
  })
});

export const workspaceMembersSchema = z.object({
  params: z.object({
    workspaceId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid workspace id")
  })
});

export const projectMembersSchema = z.object({
  params: z.object({
    projectId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id")
  })
});
