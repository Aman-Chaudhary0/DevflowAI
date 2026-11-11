export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
    billingInterval: "monthly",
    description: "Perfect for getting started",
    features: [
      "3 projects",
      "1 workspace owner",
      "Limited AI credits",
      "Limited storage",
      "Basic developer features"
    ],
    limits: {
      projects: 3,
      teamMembers: 1,
      aiCredits: 1000,
      storage: 1024 * 1024 * 100, // 100 MB
      deployments: 10
    }
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 1499,
    currency: "INR",
    billingInterval: "monthly",
    description: "For growing teams",
    features: [
      "20 projects",
      "10 team members",
      "10,000 AI credits",
      "100 GB storage",
      "Extended developer features"
    ],
    limits: {
      projects: 20,
      teamMembers: 10,
      aiCredits: 10000,
      storage: 1024 * 1024 * 1024 * 100, // 100 GB
      deployments: 200
    }
  },
  team: {
    id: "team",
    name: "Team",
    price: 3999,
    currency: "INR",
    billingInterval: "monthly",
    description: "For large teams",
    features: [
      "Unlimited projects",
      "Unlimited team members",
      "Unlimited AI credits",
      "Unlimited storage",
      "Priority support"
    ],
    limits: {
      projects: Infinity,
      teamMembers: Infinity,
      aiCredits: Infinity,
      storage: Infinity,
      deployments: Infinity
    }
  }
};

export const planService = {
  getPlan(planId) {
    return PLANS[planId] || null;
  },

  getAllPlans() {
    return Object.values(PLANS);
  },

  getPlanPrice(planId) {
    const plan = PLANS[planId];
    return plan ? plan.price : null;
  },

  getPlanLimits(planId) {
    const plan = PLANS[planId];
    return plan ? plan.limits : null;
  },

  isValidPlan(planId) {
    return planId in PLANS;
  }
};
