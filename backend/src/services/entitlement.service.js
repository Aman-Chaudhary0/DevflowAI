import Subscription from "../models/Subscription.js";
import { planService } from "./plan.service.js";
import { ApiError } from "../utils/ApiError.js";

export const entitlementService = {
  async getWorkspaceSubscription(workspaceId) {
    const subscription = await Subscription.findOne({
      workspace: workspaceId,
      status: { $in: ["active", "trialing", "past_due"] }
    });

    return subscription || null;
  },

  async getActivePlan(workspaceId) {
    const subscription = await this.getWorkspaceSubscription(workspaceId);

    if (!subscription) {
      return planService.getPlan("free");
    }

    return planService.getPlan(subscription.plan);
  },

  async getUsageLimits(workspaceId) {
    const plan = await this.getActivePlan(workspaceId);
    return plan ? plan.limits : null;
  },

  async checkFeatureAccess(workspaceId, feature) {
    const plan = await this.getActivePlan(workspaceId);

    if (!plan) {
      throw new ApiError(403, "No active subscription found");
    }

    const limits = plan.limits;

    if (!limits || limits[feature] === undefined) {
      throw new ApiError(400, `Unknown feature: ${feature}`);
    }

    return limits[feature] > 0;
  },

  async checkResourceLimit(workspaceId, resource, currentUsage) {
    const limits = await this.getUsageLimits(workspaceId);

    if (!limits || limits[resource] === undefined) {
      throw new ApiError(400, `Unknown resource: ${resource}`);
    }

    const limit = limits[resource];

    if (limit === Infinity) {
      return { allowed: true, remaining: Infinity };
    }

    if (currentUsage >= limit) {
      throw new ApiError(403, "PLAN_LIMIT_EXCEEDED", [
        {
          path: resource,
          message: `Limit exceeded for ${resource}`,
          current: currentUsage,
          maximum: limit,
          plan: (await this.getActivePlan(workspaceId)).id
        }
      ]);
    }

    return {
      allowed: true,
      remaining: limit - currentUsage,
      current: currentUsage,
      maximum: limit
    };
  },

  async getSubscriptionStatus(workspaceId) {
    const subscription = await Subscription.findOne({
      workspace: workspaceId
    });

    if (!subscription) {
      return {
        plan: "free",
        status: "none",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt
    };
  }
};
