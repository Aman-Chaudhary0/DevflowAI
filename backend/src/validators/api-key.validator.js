import { z } from "zod";

export const createApiKeyValidator = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    environment: z.enum(["test", "live"]),
    permissions: z.array(z.enum([
      "projects:read",
      "projects:write",
      "files:read",
      "files:write",
      "tasks:read",
      "tasks:write",
      "ai:read",
      "ai:execute"
    ])).optional(),
    expiresAt: z.string().datetime().optional().nullable()
  })
});

export const updateApiKeyValidator = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    expiresAt: z.string().datetime().optional().nullable()
  }).optional()
});
