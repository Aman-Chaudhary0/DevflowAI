import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { requireWorkspaceBillingAccess } from "../middlewares/billingAuth.js";
import {
  getSubscription,
  getPlans,
  createCheckout,
  verifyPayment,
  changePlan,
  cancelSubscription,
  resumeSubscription,
  getUsage,
  getInvoices,
  getInvoice,
  webhookHandler
} from "../controllers/billing.controller.js";
import {
  checkoutValidator,
  verifyPaymentValidator,
  changePlanValidator,
  invoiceFiltersValidator
} from "../validators/billing.validator.js";

const router = express.Router();

// Public routes
router.get("/plans", getPlans);

// Webhook route (no auth required, signature verified in handler)
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Protected routes
router.use(requireAuth);

// Workspace-specific routes
router.get("/:workspaceId/subscription", requireWorkspaceBillingAccess, getSubscription);
router.post("/:workspaceId/checkout", requireWorkspaceBillingAccess, validate(checkoutValidator), createCheckout);
router.post("/:workspaceId/verify-payment", requireWorkspaceBillingAccess, validate(verifyPaymentValidator), verifyPayment);
router.post("/:workspaceId/change-plan", requireWorkspaceBillingAccess, validate(changePlanValidator), changePlan);
router.post("/:workspaceId/cancel", requireWorkspaceBillingAccess, cancelSubscription);
router.post("/:workspaceId/resume", requireWorkspaceBillingAccess, resumeSubscription);
router.get("/:workspaceId/usage", requireWorkspaceBillingAccess, getUsage);
router.get("/:workspaceId/invoices", requireWorkspaceBillingAccess, validate(invoiceFiltersValidator), getInvoices);
router.get("/:workspaceId/invoices/:invoiceId", requireWorkspaceBillingAccess, getInvoice);

export default router;
