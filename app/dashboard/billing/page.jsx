"use client";
import { useState } from "react";
import { CreditCard, TrendingUp } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  ProgressBar,
  StatCard,
  toast,
} from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
export default function Billing() {
  const [upgrade, setUpgrade] = useState(false);
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
            Pro · ₹1,499 <small className="muted">/ month</small>
          </h2>
          <p className="muted">
            Active · Next billing date: September 23, 2026
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
          ["AI Credits", "7,420 / 10,000", 74],
          ["Projects", "8 / 20", 40],
          ["Team Members", "12 / 20", 60],
          ["Deployments", "84 / 200", 42],
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
          {[
            ["Free", "₹0", "3 projects"],
            ["Pro", "₹1,499", "10,000 AI credits"],
            ["Team", "₹3,999", "Unlimited collaborators"],
          ].map((x) => (
            <div
              className="flex justify-between border-b border-(--border) py-3"
              key={x[0]}
            >
              <b>{x[0]}</b>
              <span>
                {x[1]} · <small className="muted">{x[2]}</small>
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
                Expires 08/29 · Dummy payment method
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
        title="Upgrade to Team"
        description="This frontend-only simulation will update your current plan."
        confirmLabel="Upgrade to Team"
        onConfirm={() => {
          setUpgrade(false);
          toast("Plan updated successfully.");
        }}
        onCancel={() => setUpgrade(false)}
      />
    </div>
  );
}
