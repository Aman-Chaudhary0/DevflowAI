import { z } from "zod";

export const checkoutValidator = z.object({
  body: z.object({
    planId: z.enum(["free", "pro", "team"])
  })
});

export const verifyPaymentValidator = z.object({
  body: z.object({
    orderId: z.string().min(1),
    paymentId: z.string().min(1),
    signature: z.string().min(1)
  })
});

export const changePlanValidator = z.object({
  body: z.object({
    planId: z.enum(["free", "pro", "team"])
  })
});

export const invoiceFiltersValidator = z.object({
  query: z.object({
    status: z.enum(["draft", "open", "paid", "failed", "void", "refunded"]).optional(),
    limit: z.string().transform(Number).optional(),
    skip: z.string().transform(Number).optional()
  }).optional()
});
