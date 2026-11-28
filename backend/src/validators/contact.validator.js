import { z } from "zod";

export const submitContactSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address").max(254),
    company: z.string().trim().max(120).optional().default(""),
    subject: z.string().trim().min(2, "Enter a subject").max(160),
    message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000)
  })
});
