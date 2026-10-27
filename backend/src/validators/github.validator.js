import { z } from "zod";

export const githubRepositoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(1000).optional(),
    perPage: z.coerce.number().int().min(1).max(100).optional()
  }),
  params: z.object({}),
  body: z.object({}).optional()
});

export const githubResourceSchema = z.object({
  query: z.object({ page: z.coerce.number().int().min(1).max(10000).optional(), perPage: z.coerce.number().int().min(1).max(100).optional() }),
  body: z.object({}).optional(),
  params: z.object({ owner: z.string().min(1).max(100).regex(/^[A-Za-z0-9-]+$/), repo: z.string().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/), resource: z.enum(["detail", "branches", "commits", "pulls", "issues", "releases", "contributors", "languages"]) })
});
