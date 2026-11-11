import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import WebhookEvent from "../models/WebhookEvent.js";
import { razorpayProvider } from "../providers/razorpay.provider.js";
import { planService } from "./plan.service.js";
import { ApiError } from "../utils/ApiError.js";

export const billingService = {
  async createCheckout(workspaceId, planId) {
    if (!planService.isValidPlan(planId)) {
      throw new ApiError(400, "Invalid plan");
    }

    const plan = planService.getPlan(planId);
    const existingSubscription = await Subscription.findOne({
      workspace: workspaceId
    });

    if (existingSubscription && existingSubscription.status === "active") {
      throw new ApiError(400, "Workspace already has an active subscription");
    }

    const order = await razorpayProvider.createOrder(
      workspaceId,
      plan.price,
      planId,
      workspaceId
    );

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      planName: plan.name
    };
  },

  async verifyPayment(workspaceId, orderId, paymentId, signature) {
    await razorpayProvider.verifyPaymentSignature(orderId, paymentId, signature);

    const payment = await razorpayProvider.getPayment(paymentId);

    if (payment.status !== "captured") {
      throw new ApiError(400, "Payment not captured");
    }

    const planId = payment.notes?.plan_id;
    if (!planId || !planService.isValidPlan(planId)) {
      throw new ApiError(400, "Invalid plan in payment");
    }

    const plan = planService.getPlan(planId);

    let subscription = await Subscription.findOne({
      workspace: workspaceId
    });

    if (!subscription) {
      subscription = new Subscription({
        workspace: workspaceId,
        plan: planId,
        provider: "razorpay",
        providerCustomerId: workspaceId,
        status: "active",
        currency: "INR",
        amount: plan.price,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } else {
      subscription.plan = planId;
      subscription.status = "active";
      subscription.amount = plan.price;
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await subscription.save();

    const paymentRecord = new Payment({
      workspace: workspaceId,
      subscription: subscription._id,
      provider: "razorpay",
      providerPaymentId: paymentId,
      providerOrderId: orderId,
      amount: payment.amount / 100,
      currency: payment.currency,
      status: "captured",
      methodType: payment.method,
      paidAt: new Date()
    });

    await paymentRecord.save();

    return {
      subscriptionId: subscription._id,
      plan: planId,
      status: "active"
    };
  },

  async getSubscription(workspaceId) {
    const subscription = await Subscription.findOne({
      workspace: workspaceId
    });

    if (!subscription) {
      return {
        plan: "free",
        status: "none"
      };
    }

    return {
      _id: subscription._id,
      plan: subscription.plan,
      status: subscription.status,
      amount: subscription.amount,
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt
    };
  },

  async changePlan(workspaceId, newPlanId) {
    if (!planService.isValidPlan(newPlanId)) {
      throw new ApiError(400, "Invalid plan");
    }

    const subscription = await Subscription.findOne({
      workspace: workspaceId,
      status: "active"
    });

    if (!subscription) {
      throw new ApiError(404, "No active subscription found");
    }

    const newPlan = planService.getPlan(newPlanId);

    subscription.plan = newPlanId;
    subscription.amount = newPlan.price;
    await subscription.save();

    return {
      plan: newPlanId,
      status: "active"
    };
  },

  async cancelSubscription(workspaceId, atPeriodEnd = true) {
    const subscription = await Subscription.findOne({
      workspace: workspaceId,
      status: "active"
    });

    if (!subscription) {
      throw new ApiError(404, "No active subscription found");
    }

    if (atPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = "canceled";
      subscription.canceledAt = new Date();
    }

    await subscription.save();

    return {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    };
  },

  async resumeSubscription(workspaceId) {
    const subscription = await Subscription.findOne({
      workspace: workspaceId,
      cancelAtPeriodEnd: true
    });

    if (!subscription) {
      throw new ApiError(404, "No subscription to resume");
    }

    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    return {
      status: "active",
      cancelAtPeriodEnd: false
    };
  },

  async getInvoices(workspaceId, filters = {}) {
    const query = { workspace: workspaceId };

    if (filters.status) {
      query.status = filters.status;
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .lean();

    const total = await Invoice.countDocuments(query);

    return {
      invoices,
      total,
      limit: filters.limit || 50,
      skip: filters.skip || 0
    };
  },

  async getInvoice(workspaceId, invoiceId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      workspace: workspaceId
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    return invoice;
  },

  async processWebhookEvent(eventData) {
    const { id: eventId, event: eventType, payload } = eventData;

    const existingEvent = await WebhookEvent.findOne({
      provider: "razorpay",
      eventId
    });

    if (existingEvent) {
      if (existingEvent.processingStatus === "processed") {
        return { status: "already_processed" };
      }

      if (existingEvent.processingStatus === "failed") {
        existingEvent.processingStatus = "pending";
        existingEvent.errorMessage = null;
      }
    } else {
      const webhookEvent = new WebhookEvent({
        provider: "razorpay",
        eventId,
        eventType,
        processingStatus: "pending"
      });
      await webhookEvent.save();
    }

    try {
      await this.handleWebhookEvent(eventType, payload);

      const webhookEvent = await WebhookEvent.findOne({
        provider: "razorpay",
        eventId
      });

      if (webhookEvent) {
        webhookEvent.processingStatus = "processed";
        webhookEvent.processedAt = new Date();
        await webhookEvent.save();
      }

      return { status: "processed" };
    } catch (error) {
      const webhookEvent = await WebhookEvent.findOne({
        provider: "razorpay",
        eventId
      });

      if (webhookEvent) {
        webhookEvent.processingStatus = "failed";
        webhookEvent.errorMessage = error.message;
        await webhookEvent.save();
      }

      throw error;
    }
  },

  async handleWebhookEvent(eventType, payload) {
    switch (eventType) {
      case "payment.captured":
        await this.handlePaymentCaptured(payload);
        break;
      case "payment.failed":
        await this.handlePaymentFailed(payload);
        break;
      case "invoice.paid":
        await this.handleInvoicePaid(payload);
        break;
      case "invoice.failed":
        await this.handleInvoiceFailed(payload);
        break;
      default:
        // Ignore unknown events
        break;
    }
  },

  async handlePaymentCaptured(payload) {
    const { id: paymentId, order_id: orderId, notes } = payload.payment;
    const workspaceId = notes?.workspace_id;

    if (!workspaceId) {
      return;
    }

    const payment = await Payment.findOne({
      providerPaymentId: paymentId
    });

    if (payment) {
      payment.status = "captured";
      payment.paidAt = new Date();
      await payment.save();
    }
  },

  async handlePaymentFailed(payload) {
    const { id: paymentId } = payload.payment;

    const payment = await Payment.findOne({
      providerPaymentId: paymentId
    });

    if (payment) {
      payment.status = "failed";
      payment.failureCode = payload.payment.error_code;
      payment.failureMessage = payload.payment.error_description;
      await payment.save();
    }
  },

  async handleInvoicePaid(payload) {
    const { id: invoiceId } = payload.invoice;

    const invoice = await Invoice.findOne({
      providerInvoiceId: invoiceId
    });

    if (invoice) {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await invoice.save();
    }
  },

  async handleInvoiceFailed(payload) {
    const { id: invoiceId } = payload.invoice;

    const invoice = await Invoice.findOne({
      providerInvoiceId: invoiceId
    });

    if (invoice) {
      invoice.status = "failed";
      await invoice.save();
    }
  }
};
