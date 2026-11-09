import { z } from "zod";

export const createIntegrationValidator = z.object({
  body: z.object({
    credentials: z.record(z.any()).optional(),
    scopes: z.array(z.string()).optional(),
    externalAccountId: z.string().optional(),
    externalAccountName: z.string().optional(),
    settings: z.record(z.any()).optional()
  })
});

export const updateIntegrationValidator = z.object({
  body: z.object({
    credentials: z.record(z.any()).optional(),
    scopes: z.array(z.string()).optional(),
    settings: z.record(z.any()).optional()
  }).optional()
});
