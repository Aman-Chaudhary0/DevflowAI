"use client";
import { useState, useEffect } from "react";
import { CreditCard, TrendingUp } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  ProgressBar,
  StatCard,
  toast,
} from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function Billing() {
  const params = useParams();
  const workspaceId = params.workspaceId;
  const [upgrade, setUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [subData, plansData, usageData] = await Promise.all([
          api.billing.getSubscription(workspaceId),
          api.billing.getPlans(),
          api.billing.getUsage(workspaceId)
        ]);
        setSubscription(subData.data);
        setPlans(plansData.data);
        setUsage(usageData.data);
      } catch (error) {
        toast(error.message || "Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      await api.billing.changePlan(workspaceId, { planId: selectedPlan });
      toast("Plan updated successfully");
      setUpgrade(false);
      setSelectedPlan(null);
      const subData = await api.billing.getSubscription(workspaceId);
      setSubscription(subData.data);
    } catch (error) {
      toast(error.message || "Failed to update plan");
    }
  };

  if (loading) {
    return (
      <div>
        <Crumb items={["Dashboard", "Billing"]} />
        <PageHeader
          title="Billing & Subscription"
          subtitle="Manage your DevFlow AI plan, AI credits, and workspace billing."
        />
        <div className="card p-6 mt-6">Loading...</div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || "free";
  const planData = plans.find(p => p.id === currentPlan);
  const limits = usage?.limits || {};

  return (
    <div>
      <Crumb items={["Dashboard", "Billing"]} />
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your DevFlow AI plan, AI credits, and workspace billing."
      />
      <section className="card p-6 mt-6 plan-hero">
        <div>
          <span className="badge">Current plan</span>
          <h2 className="text-2xl mb-1">
            {planData?.name} · ₹{planData?.price} <small className="muted">/ month</small>
          </h2>
          <p className="muted">
            {subscription?.status === "active" ? "Active" : "Inactive"} · Next billing date: {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() => toast("Subscription manager opened")}
            type="button"
          >
            Manage Subscription
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setUpgrade(true)}
            type="button"
          >
            Change Plan
          </button>
        </div>
      </section>
      <div className="dash-grid-4 mt-6">
        {[
          ["AI Credits", `${limits.aiCredits ? Math.min(7420, limits.aiCredits) : 0} / ${limits.aiCredits || 0}`, Math.min(74, limits.aiCredits ? (7420 / limits.aiCredits) * 100 : 0)],
          ["Projects", `${Math.min(8, limits.projects || 0)} / ${limits.projects === Infinity ? "∞" : limits.projects || 0}`, limits.projects === Infinity ? 40 : Math.min(40, (8 / limits.projects) * 100)],
          ["Team Members", `${Math.min(12, limits.teamMembers || 0)} / ${limits.teamMembers === Infinity ? "∞" : limits.teamMembers || 0}`, limits.teamMembers === Infinity ? 60 : Math.min(60, (12 / limits.teamMembers) * 100)],
          ["Deployments", `${Math.min(84, limits.deployments || 0)} / ${limits.deployments === Infinity ? "∞" : limits.deployments || 0}`, limits.deployments === Infinity ? 42 : Math.min(42, (84 / limits.deployments) * 100)],
        ].map(([l, v, p]) => (
          <div className="stat-card" key={l}>
            <span className="stat-label">{l}</span>
            <b className="text-lg">{v}</b>
            <ProgressBar value={p} />
          </div>
        ))}
      </div>
      <section className="dash-grid-2 mt-6">
        <div className="card p-5">
          <h3>Plans for every stage</h3>
          {plans.map((plan) => (
            <div
              className="flex justify-between border-b border-(--border) py-3"
              key={plan.id}
            >
              <b>{plan.name}</b>
              <span>
                ₹{plan.price} · <small className="muted">{plan.features[0]}</small>
              </span>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h3>Payment method</h3>
          <div className="flex gap-3 items-center">
            <CreditCard color="var(--primary)" />
            <span>
              <b>Visa ending in 4242</b>
              <br />
              <small className="muted">
                Expires 08/29 · Test payment method
              </small>
            </span>
          </div>
          <button
            className="btn btn-outline mt-4"
            onClick={() => toast("Billing details opened")}
            type="button"
          >
            Edit Billing Details
          </button>
          <h3 className="mt-6">AI usage</h3>
          <div className="usage-bars">
            {[65, 48, 72, 31, 56, 39].map((x, i) => (
              <i key={i} style={{ height: `${x}%` }} />
            ))}
          </div>
          <small className="muted">Daily AI credit consumption</small>
        </div>
      </section>
      <ConfirmDialog
        open={upgrade}
        title={`Upgrade to ${selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : "Plan"}`}
        description="This will update your current plan."
        confirmLabel={`Upgrade to ${selectedPlan ? plans.find(p => p.id === selectedPlan)?.name : "Plan"}`}
        onConfirm={handleUpgrade}
        onCancel={() => {
          setUpgrade(false);
          setSelectedPlan(null);
        }}
      >
        <div className="space-y-3">
          {plans.filter(p => p.id !== currentPlan).map(plan => (
            <button
              key={plan.id}
              className={`w-full p-3 border rounded text-left ${
                selectedPlan === plan.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
              type="button"
            >
              <div className="font-semibold">{plan.name}</div>
              <div className="text-sm text-muted">₹{plan.price}/month</div>
            </button>
          ))}
        </div>
      </ConfirmDialog>
    </div>
  );
}
