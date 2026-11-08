import { z } from "zod";

const objectId = /^[a-f\d]{24}$/i;
const domainPattern = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;

export const createDomainSchema = z.object({
  body: z.object({
    projectId: z.string().regex(objectId, "Invalid project id"),
    deploymentId: z.string().regex(objectId, "Invalid deployment id").optional(),
    domain: z.string().trim().toLowerCase().regex(domainPattern, "Invalid domain format"),
    environment: z.enum(["production", "preview", "development"]).default("production")
  })
});

export const domainParamsSchema = z.object({
  params: z.object({
    domainId: z.string().regex(objectId, "Invalid domain id")
  })
});

export const domainListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(10000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    projectId: z.string().regex(objectId, "Invalid project id").optional(),
    environment: z.enum(["production", "preview", "development"]).optional(),
    status: z.enum(["active", "removed"]).optional()
  })
});
