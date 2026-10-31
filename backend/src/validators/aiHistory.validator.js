import { z } from "zod";

const id = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");
const isoDate = z.string().datetime({ offset: true }).optional();
const TOOLS = ["chat", "code-generator", "code-review", "documentation", "bug-fixer", "backend-generator", "sql-generator"];
const STATUSES = ["pending", "processing", "completed", "failed", "cancelled"];

export const listHistorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(200).optional(),
    tool: z.enum(TOOLS).optional(),
    provider: z.string().trim().max(50).optional(),
    model: z.string().trim().max(100).optional(),
    status: z.enum(STATUSES).optional(),
    projectId: id.optional(),
    from: isoDate,
    to: isoDate,
    sort: z.enum(["asc", "desc"]).default("desc")
  })
});

export const historyIdSchema = z.object({ params: z.object({ id }) });

export const usageSummarySchema = z.object({
  query: z.object({
    from: isoDate,
    to: isoDate,
    projectId: id.optional()
  })
});

export const usageTimeseriesSchema = z.object({
  query: z.object({
    from: isoDate,
    to: isoDate,
    interval: z.enum(["day", "week", "month"]).default("day"),
    projectId: id.optional()
  })
});

export const usageByToolSchema = z.object({
  query: z.object({ from: isoDate, to: isoDate, projectId: id.optional() })
});

export const usageByModelSchema = z.object({
  query: z.object({ from: isoDate, to: isoDate })
});

export const usageByProjectSchema = z.object({
  query: z.object({ from: isoDate, to: isoDate })
});
