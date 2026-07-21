import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().toLowerCase(),
      password: passwordSchema,
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match"
    })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1, "Password is required")
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase()
  })
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(20),
      password: passwordSchema,
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match"
    })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20)
  })
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase()
  })
});
