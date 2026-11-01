import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createFileSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255),
    path: z.string().trim().min(1).max(500),
    language: z.string().trim().max(50).optional(),
    content: z.string().max(102400).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateFileSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(255).optional(),
    path: z.string().trim().min(1).max(500).optional(),
    language: z.string().trim().max(50).optional(),
    content: z.string().max(102400).optional()
  }).refine((b) => Object.keys(b).length > 0, "At least one field required"),
  params: z.object({ fileId: objectId }),
  query: z.object({}).optional()
});

export const fileParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ fileId: objectId }),
  query: z.object({}).optional()
});

export const listFilesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().max(200).optional(),
    language: z.string().max(50).optional()
  }).optional()
});
