import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import WebhookEvent from "../models/WebhookEvent.js";
import Workspace from "../models/Workspace.js";
import { User } from "../models/index.js";
import { billingService } from "../services/billing.service.js";
import { entitlementService } from "../services/entitlement.service.js";
import { planService } from "../services/plan.service.js";

let mongoServer;
let testWorkspaceId;
let testWorkspace2Id;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "hashed_password",
    isVerified: true
  });
  testUserId = user._id;

  const workspace = await Workspace.create({
    name: "Test Workspace",
    slug: "test-workspace",
    owner: testUserId
  });
  testWorkspaceId = workspace._id;

  const workspace2 = await Workspace.create({
    name: "Test Workspace 2",
    slug: "test-workspace-2",
    owner: testUserId
  });
  testWorkspace2Id = workspace2._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Plan Service", () => {
  it("should return all plans", () => {
    const plans = planService.getAllPlans();
    expect(plans.length).toBe(3);
    expect(plans.map(p => p.id)).toEqual(["free", "pro", "team"]);
  });

  it("should get plan by ID", () => {
    const plan = planService.getPlan("pro");
    expect(plan.name).toBe("Pro");
    expect(plan.price).toBe(1499);
    expect(plan.limits.projects).toBe(20);
  });

  it("should validate plan IDs", () => {
    expect(planService.isValidPlan("pro")).toBe(true);
    expect(planService.isValidPlan("invalid")).toBe(false);
  });

  it("should get plan limits", () => {
    const limits = planService.getPlanLimits("team");
    expect(limits.projects).toBe(Infinity);
    expect(limits.aiCredits).toBe(Infinity);
  });
});

describe("Subscription Model", () => {
  it("should create a subscription", async () => {
    const subscription = await Subscription.create({
      workspace: testWorkspaceId,
      plan: "pro",
      provider: "razorpay",
      providerCustomerId: "cust_123",
      status: "active",
      currency: "INR",
      amount: 1499,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    expect(subscription.plan).toBe("pro");
    expect(subscription.status).toBe("active");
    expect(subscription.workspace.toString()).toBe(testWorkspaceId.toString());
  });

  it("should prevent duplicate active subscriptions", async () => {
    await Subscription.create({
      workspace: testWorkspace2Id,
      plan: "pro",
      provider: "razorpay",
      providerCustomerId: "cust_456",
      status: "active",
      currency: "INR",
      amount: 1499
    });

    try {
      await Subscription.create({
        workspace: testWorkspace2Id,
        plan: "team",
        provider: "razorpay",
        providerCustomerId: "cust_789",
        status: "active",
        currency: "INR",
        amount: 3999
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.code).toBe(11000);
    }
  });
});

describe("Invoice Model", () => {
  it("should create an invoice", async () => {
    const subscription = await Subscription.findOne({
      workspace: testWorkspaceId
    });

    const invoice = await Invoice.create({
      workspace: testWorkspaceId,
      subscription: subscription._id,
      provider: "razorpay",
      providerInvoiceId: "inv_123",
      invoiceNumber: "INV-2026-0001",
      amount: 1499,
      currency: "INR",
      subtotal: 1499,
      tax: 0,
      total: 1499,
      status: "paid",
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date()
    });

    expect(invoice.invoiceNumber).toBe("INV-2026-0001");
    expect(invoice.status).toBe("paid");
    expect(invoice.total).toBe(1499);
  });

  it("should prevent duplicate provider invoices", async () => {
    const subscription = await Subscription.findOne({
      workspace: testWorkspaceId
    });

    await Invoice.create({
      workspace: testWorkspaceId,
      subscription: subscription._id,
      provider: "razorpay",
      providerInvoiceId: "inv_unique_456",
      invoiceNumber: "INV-2026-0002",
      amount: 1499,
      currency: "INR",
      subtotal: 1499,
      tax: 0,
      total: 1499,
      status: "open",
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date()
    });

    try {
      await Invoice.create({
        workspace: testWorkspaceId,
        subscription: subscription._id,
        provider: "razorpay",
        providerInvoiceId: "inv_unique_456",
        invoiceNumber: "INV-2026-0003",
        amount: 1499,
        currency: "INR",
        subtotal: 1499,
        tax: 0,
        total: 1499,
        status: "open",
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date()
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.code).toBe(11000);
    }
  });
});

describe("Payment Model", () => {
  it("should create a payment record", async () => {
    const subscription = await Subscription.findOne({
      workspace: testWorkspaceId
    });

    const payment = await Payment.create({
      workspace: testWorkspaceId,
      subscription: subscription._id,
      provider: "razorpay",
      providerPaymentId: "pay_123",
      providerOrderId: "order_123",
      amount: 1499,
      currency: "INR",
      status: "captured",
      methodType: "card",
      paidAt: new Date()
    });

    expect(payment.status).toBe("captured");
    expect(payment.amount).toBe(1499);
  });
});

describe("WebhookEvent Model", () => {
  it("should create webhook event", async () => {
    const event = await WebhookEvent.create({
      provider: "razorpay",
      eventId: "evt_123",
      eventType: "payment.captured",
      processingStatus: "pending"
    });

    expect(event.eventType).toBe("payment.captured");
    expect(event.processingStatus).toBe("pending");
  });

  it("should prevent duplicate webhook events", async () => {
    await WebhookEvent.create({
      provider: "razorpay",
      eventId: "evt_456",
      eventType: "payment.failed",
      processingStatus: "pending"
    });

    try {
      await WebhookEvent.create({
        provider: "razorpay",
        eventId: "evt_456",
        eventType: "payment.failed",
        processingStatus: "pending"
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.code).toBe(11000);
    }
  });
});

describe("Entitlement Service", () => {
  it("should get active plan for workspace", async () => {
    const plan = await entitlementService.getActivePlan(testWorkspaceId);
    expect(plan.id).toBe("pro");
  });

  it("should get usage limits", async () => {
    const limits = await entitlementService.getUsageLimits(testWorkspaceId);
    expect(limits.projects).toBe(20);
    expect(limits.aiCredits).toBe(10000);
  });

  it("should check resource limits", async () => {
    const result = await entitlementService.checkResourceLimit(
      testWorkspaceId,
      "projects",
      5
    );
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(15);
  });

  it("should get subscription status", async () => {
    const status = await entitlementService.getSubscriptionStatus(testWorkspaceId);
    expect(status.plan).toBe("pro");
    expect(status.status).toBe("active");
  });
});

describe("Billing Service", () => {
  it("should get subscription", async () => {
    const subscription = await billingService.getSubscription(testWorkspaceId);
    expect(subscription.plan).toBe("pro");
    expect(subscription.status).toBe("active");
  });

  it("should change plan", async () => {
    const result = await billingService.changePlan(testWorkspaceId, "team");
    expect(result.plan).toBe("team");
    expect(result.status).toBe("active");

    const updated = await billingService.getSubscription(testWorkspaceId);
    expect(updated.plan).toBe("team");
  });

  it("should cancel subscription", async () => {
    const result = await billingService.cancelSubscription(testWorkspaceId, true);
    expect(result.cancelAtPeriodEnd).toBe(true);
  });

  it("should resume subscription", async () => {
    const result = await billingService.resumeSubscription(testWorkspaceId);
    expect(result.status).toBe("active");
    expect(result.cancelAtPeriodEnd).toBe(false);
  });

  it("should get invoices", async () => {
    const result = await billingService.getInvoices(testWorkspaceId);
    expect(Array.isArray(result.invoices)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should process webhook event", async () => {
    const result = await billingService.processWebhookEvent({
      id: "evt_789",
      event: "payment.captured",
      payload: {
        payment: {
          id: "pay_789",
          order_id: "order_789",
          notes: { workspace_id: testWorkspaceId.toString() }
        }
      }
    });

    expect(result.status).toBe("processed");

    const event = await WebhookEvent.findOne({
      eventId: "evt_789"
    });
    expect(event.processingStatus).toBe("processed");
  });
});
