import { z } from "zod";

// Password validation schema using Zod. It enforces a minimum length of 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character.
const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

  // registerSchema defines the validation rules for user registration. It checks that the name is between 2 and 80 characters, the email is valid and lowercase, and that the password and confirmPassword fields match.
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

// loginSchema defines the validation rules for user login. It checks that the email is valid and lowercase, and that the password field is not empty.
export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1, "Password is required")
  })
});

// forgotPasswordSchema defines the validation rules for the forgot password request. It checks that the email is valid and lowercase.
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase()
  })
});

// resetPasswordSchema defines the validation rules for the reset password request. It checks that the token is valid, and that the new password and confirmPassword fields match.
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

// verifyEmailSchema defines the validation rules for email verification. It checks that the token is valid.
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(20)
  })
});

// resendVerificationSchema defines the validation rules for resending email verification. It checks that the email is valid and lowercase.
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase()
  })
});
