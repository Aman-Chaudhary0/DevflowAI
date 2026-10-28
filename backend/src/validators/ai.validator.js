import { z } from "zod";

export const aiGenerationSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().min(1).max(200_000)
  }).strict()).min(1).max(100).superRefine((messages, context) => {
    if (!messages.some((message) => message.role === "user")) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "At least one user message is required" });
    }
  }).optional(),
  prompt: z.string().min(1).max(200_000).optional(),
  maxOutputTokens: z.number().int().positive().max(16_384).optional()
}).strict().refine((value) => Boolean(value.prompt || value.messages), {
  message: "Provide a prompt or messages"
}).refine((value) => !(value.prompt && value.messages), {
  message: "Provide either a prompt or messages, not both"
});
