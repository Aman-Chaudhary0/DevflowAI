import { z } from "zod";

export const projectStatusEnum = ["active", "planning", "archived", "completed"];
export const projectVisibilityEnum = ["private", "internal", "public"];

const repositorySchema = z.object({
  provider: z.enum(["none", "github", "gitlab", "bitbucket"]).default("none"),
  name: z.string().trim().max(120).default(""),
  url: z.string().trim().max(500).default(""),
  defaultBranch: z.string().trim().min(1).max(80).default("main")
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    status: z.enum([...projectStatusEnum, ""]).optional().transform((value) => value || undefined),
    visibility: z.enum([...projectVisibilityEnum, ""]).optional().transform((value) => value || undefined),
    sortBy: z.enum(["name", "updatedAt", "createdAt"]).default("updatedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc")
  })
});

export const projectParamsSchema = z.object({
  params: z.object({
    projectId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid project id")
  })
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: z.string().trim().max(2000).default(""),
    status: z.enum(projectStatusEnum).default("active"),
    visibility: z.enum(projectVisibilityEnum).default("private"),
    repository: repositorySchema.optional(),
    settings: z.record(z.any()).default({}),
    workspace: z.string().trim().optional()
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(projectStatusEnum).optional(),
    visibility: z.enum(projectVisibilityEnum).optional(),
    repository: repositorySchema.optional(),
    settings: z.record(z.any()).optional()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one valid field is required",
    path: []
  })
});
