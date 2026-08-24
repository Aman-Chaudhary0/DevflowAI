"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { invoices } from "@/lib/mock/workspace";
export default function BillingHistory() {
  const [filter, setFilter] = useState("all"),
    [selected, setSelected] = useState(null),
    rows = invoices.filter((x) => filter === "all" || x.status === filter);
  return (
    <div>
      <Crumb items={["Dashboard", "Billing", "History"]} />
      <PageHeader
        title="Billing History"
        subtitle="View previous invoices and billing transactions."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Billing history exported")}
          type="button"
        >
          <Download size={15} />
          Export
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Spent" value="₹18,492" />
        <StatCard label="Invoices" value="12" />
        <StatCard label="Paid" value="11" />
        <StatCard label="Pending" value="1" />
      </div>
      <section className="card p-5 mt-6">
        <div className="flex gap-2 mb-4">
          {["all", "paid", "pending", "failed"].map((x) => (
            <button
              className={`btn ${filter === x ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(x)}
              key={x}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.date}</td>
                <td>{i.plan}</td>
                <td>{i.amount}</td>
                <td>
                  <StatusBadge status={i.status} />
                </td>
                <td>Visa •••• 4242</td>
                <td>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSelected(i)}
                    type="button"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <Drawer
        open={!!selected}
        title="Invoice details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <p>
            <b>{selected.id}</b>
            <br />
            Billing period: August 2026
            <br />
            Plan: {selected.plan}
            <br />
            Subtotal: {selected.amount}
            <br />
            Tax: ₹0
            <br />
            <b>Total: {selected.amount}</b>
            <br />
            <button
              className="btn btn-primary mt-4"
              onClick={() => toast("Invoice prepared for download.")}
              type="button"
            >
              Download invoice
            </button>
          </p>
        )}
      </Drawer>
    </div>
  );
}
