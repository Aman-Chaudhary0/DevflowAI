import { z } from "zod";

export const createFeedbackSchema = z.object({
  body: z.object({
    type: z.enum(["Bug Report", "Feature Request", "Improvement", "General Feedback"]),
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(10).max(5000),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    feature: z.string().trim().max(80).default("Other"),
    satisfaction: z.number().int().min(0).max(4).nullable().optional()
  })
});
