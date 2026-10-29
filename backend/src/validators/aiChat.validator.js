import { z } from "zod";

const id = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid conversation id");
export const listConversationsSchema = z.object({ query: z.object({ search: z.string().trim().max(120).optional() }) });
export const conversationParamsSchema = z.object({ params: z.object({ conversationId: id }) });
export const createConversationSchema = z.object({ body: z.object({ model: z.string().trim().min(1).max(100).optional() }).strict() });
export const updateConversationSchema = z.object({
  params: z.object({ conversationId: id }),
  body: z.object({ title: z.string().trim().min(1).max(120).optional(), pinned: z.boolean().optional() }).strict()
    .refine((body) => Object.keys(body).length > 0, "At least one supported field is required")
});
export const listMessagesSchema = z.object({
  params: z.object({ conversationId: id }),
  query: z.object({ limit: z.coerce.number().int().min(1).max(100).default(50), before: z.string().datetime().optional() })
});
export const sendMessageSchema = z.object({
  body: z.object({ conversationId: id, content: z.string().trim().min(1).max(20000), model: z.string().trim().min(1).max(100), requestId: z.string().uuid() }).strict()
});
export const regenerateSchema = z.object({
  params: z.object({ conversationId: id, messageId: id }),
  body: z.object({ model: z.string().trim().min(1).max(100) }).strict()
});
