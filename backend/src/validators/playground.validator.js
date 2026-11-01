import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const src = z.string().max(102400).optional();

export const createPlaygroundSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
    html: src,
    css: src,
    javascript: src
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updatePlaygroundSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    html: src,
    css: src,
    javascript: src
  }).refine((b) => Object.keys(b).length > 0, "At least one field required"),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const playgroundParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const listPlaygroundsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(200).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  }).optional()
});
