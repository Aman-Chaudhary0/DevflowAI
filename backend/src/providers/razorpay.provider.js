import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay credentials not configured");
}

function getAuthHeader() {
  const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${credentials}`;
}

async function razorpayRequest(method, path, body = null) {
  const url = `https://api.razorpay.com/v1${path}`;
  const options = {
    method,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.description || "Razorpay API error"
    );
  }

  return data;
}

export const razorpayProvider = {
  async createOrder(customerId, planAmount, planId, workspaceId) {
    const orderData = {
      amount: planAmount * 100, // Convert to paise
      currency: "INR",
      customer_notify: 1,
      description: `DevFlow AI - ${planId} plan`,
      notes: {
        workspace_id: workspaceId,
        plan_id: planId
      }
    };

    const order = await razorpayRequest("POST", "/orders", orderData);
    return order;
  },

  async verifyPaymentSignature(orderId, paymentId, signature) {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(401, "Invalid payment signature");
    }

    return true;
  },

  async getPayment(paymentId) {
    return razorpayRequest("GET", `/payments/${paymentId}`);
  },

  async capturePayment(paymentId, amount) {
    return razorpayRequest("POST", `/payments/${paymentId}/capture`, {
      amount: amount * 100
    });
  },

  async createSubscription(customerId, planAmount, planId, workspaceId) {
    const subscriptionData = {
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 0, // Infinite
      notes: {
        workspace_id: workspaceId
      }
    };

    const subscription = await razorpayRequest(
      "POST",
      "/subscriptions",
      subscriptionData
    );
    return subscription;
  },

  async getSubscription(subscriptionId) {
    return razorpayRequest("GET", `/subscriptions/${subscriptionId}`);
  },

  async cancelSubscription(subscriptionId, atPeriodEnd = true) {
    const cancelData = atPeriodEnd ? { expire_at: "period_end" } : {};
    return razorpayRequest("POST", `/subscriptions/${subscriptionId}/cancel`, cancelData);
  },

  async updateSubscription(subscriptionId, updates) {
    return razorpayRequest("PATCH", `/subscriptions/${subscriptionId}`, updates);
  },

  verifyWebhookSignature(body, signature) {
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new ApiError(401, "Invalid webhook signature");
    }

    return true;
  },

  parseWebhookEvent(body) {
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new ApiError(400, "Invalid webhook payload");
    }
  }
};
