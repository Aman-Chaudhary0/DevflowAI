import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const tag = z.string().trim().min(1).max(50);

export const createSnippetSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
    code: z.string().min(1).max(51200),
    language: z.string().trim().max(50).optional(),
    framework: z.string().trim().max(80).optional(),
    tags: z.array(tag).max(20).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateSnippetSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    code: z.string().min(1).max(51200).optional(),
    language: z.string().trim().max(50).optional(),
    framework: z.string().trim().max(80).optional(),
    tags: z.array(tag).max(20).optional()
  }).refine((b) => Object.keys(b).length > 0, "At least one field required"),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const snippetParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const favoriteSnippetSchema = z.object({
  body: z.object({
    isFavorite: z.boolean()
  }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const listSnippetsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(200).optional(),
    language: z.string().max(50).optional(),
    tag: z.string().max(50).optional(),
    favorites: z.enum(["true", "false"]).optional(),
    sort: z.enum(["createdAt", "updatedAt", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  }).optional()
});
