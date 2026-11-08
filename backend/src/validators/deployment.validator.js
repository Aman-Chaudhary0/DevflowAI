import { z } from "zod";

const objectId = /^[a-f\d]{24}$/i;

export const deploymentEnvironmentEnum = ["production", "preview", "development"];
export const deploymentStatusEnum = ["queued", "initializing", "building", "deploying", "ready", "failed", "cancelled"];

export const createDeploymentSchema = z.object({
  body: z.object({
    projectId: z.string().regex(objectId, "Invalid project id"),
    environment: z.enum(deploymentEnvironmentEnum).default("preview"),
    branch: z.string().trim().min(1).max(200),
    repository: z.string().trim().min(1).max(200).optional(),
    commitSha: z.string().trim().max(100).optional(),
    commitMessage: z.string().trim().max(1000).optional(),
    deploymentConfiguration: z.record(z.any()).optional()
  })
});

export const deploymentParamsSchema = z.object({
  params: z.object({
    deploymentId: z.string().regex(objectId, "Invalid deployment id")
  })
});

export const deploymentListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(10000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    projectId: z.string().regex(objectId, "Invalid project id").optional(),
    environment: z.enum(deploymentEnvironmentEnum).optional(),
    status: z.enum(deploymentStatusEnum).optional()
  })
});

export const deploymentLogsSchema = z.object({
  params: z.object({
    deploymentId: z.string().regex(objectId, "Invalid deployment id")
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(500).optional(),
    cursor: z.string().trim().max(200).optional()
  })
});

export const rollbackSchema = z.object({
  params: z.object({ deploymentId: z.string().regex(objectId, "Invalid deployment id") }),
  body: z.object({
    targetDeploymentId: z.string().regex(objectId, "Invalid target deployment id").optional()
  }).optional()
});
