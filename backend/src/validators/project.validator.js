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

export const projectFileParamsSchema = z.object({
  params: z.object({
    projectId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid project id"),
    fileId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid file id").optional()
  })
});

export const listFilesSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    folder: z.string().trim().max(500).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50)
  })
});

export const uploadFileSchema = z.object({
  body: z.object({
    name: z.string().trim().max(200).optional(),
    folder: z.string().trim().max(500).optional(),
    projectId: z.string().trim().regex(/^[a-fA-F0-9]{24}$/, "Invalid project id").optional()
  }).passthrough()
});

export const renameFileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(200).optional(),
    folder: z.string().trim().max(500).optional()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one valid file field is required",
    path: []
  })
});

export const documentParamsSchema = z.object({
  params: z.object({
    projectId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid project id"),
    documentId: z.string().trim().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid document id").optional()
  })
});

export const listDocumentsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50)
  })
});

export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    content: z.string().trim().max(500000).default(""),
    contentFormat: z.enum(["markdown", "plaintext"]).default("markdown"),
    visibility: z.enum(["private", "workspace", "public"]).default("workspace")
  })
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    content: z.string().trim().max(500000).optional(),
    contentFormat: z.enum(["markdown", "plaintext"]).optional(),
    visibility: z.enum(["private", "workspace", "public"]).optional()
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one valid document field is required",
    path: []
  })
});
