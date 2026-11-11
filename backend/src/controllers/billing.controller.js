import { billingService } from "../services/billing.service.js";
import { entitlementService } from "../services/entitlement.service.js";
import { planService } from "../services/plan.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSubscription = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const subscription = await billingService.getSubscription(workspaceId);

  res.status(200).json(
    new ApiResponse(200, subscription, "Subscription retrieved successfully")
  );
});

export const getPlans = asyncHandler(async (_req, res) => {
  const plans = planService.getAllPlans();

  res.status(200).json(
    new ApiResponse(200, plans, "Plans retrieved successfully")
  );
});

export const createCheckout = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { planId } = req.body;

  const checkout = await billingService.createCheckout(workspaceId, planId);

  res.status(200).json(
    new ApiResponse(200, checkout, "Checkout created successfully")
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { orderId, paymentId, signature } = req.body;

  const result = await billingService.verifyPayment(
    workspaceId,
    orderId,
    paymentId,
    signature
  );

  res.status(200).json(
    new ApiResponse(200, result, "Payment verified successfully")
  );
});

export const changePlan = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { planId } = req.body;

  const result = await billingService.changePlan(workspaceId, planId);

  res.status(200).json(
    new ApiResponse(200, result, "Plan changed successfully")
  );
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { atPeriodEnd } = req.body;

  const result = await billingService.cancelSubscription(
    workspaceId,
    atPeriodEnd !== false
  );

  res.status(200).json(
    new ApiResponse(200, result, "Subscription canceled successfully")
  );
});

export const resumeSubscription = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const result = await billingService.resumeSubscription(workspaceId);

  res.status(200).json(
    new ApiResponse(200, result, "Subscription resumed successfully")
  );
});

export const getUsage = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const limits = await entitlementService.getUsageLimits(workspaceId);
  const status = await entitlementService.getSubscriptionStatus(workspaceId);

  res.status(200).json(
    new ApiResponse(
      200,
      { limits, status },
      "Usage limits retrieved successfully"
    )
  );
});

export const getInvoices = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { status, limit, skip } = req.query;

  const result = await billingService.getInvoices(workspaceId, {
    status,
    limit: limit ? parseInt(limit) : 50,
    skip: skip ? parseInt(skip) : 0
  });

  res.status(200).json(
    new ApiResponse(200, result, "Invoices retrieved successfully")
  );
});

export const getInvoice = asyncHandler(async (req, res) => {
  const { workspaceId, invoiceId } = req.params;

  const invoice = await billingService.getInvoice(workspaceId, invoiceId);

  res.status(200).json(
    new ApiResponse(200, invoice, "Invoice retrieved successfully")
  );
});

export const webhookHandler = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    return res.status(400).json(
      new ApiResponse(400, null, "Missing webhook signature")
    );
  }

  const result = await billingService.processWebhookEvent(req.body);

  res.status(200).json(
    new ApiResponse(200, result, "Webhook processed successfully")
  );
});
