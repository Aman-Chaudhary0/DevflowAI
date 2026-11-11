"use client";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

export default function BillingHistory() {
  const params = useParams();
  const workspaceId = params.workspaceId;
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0
  });

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const response = await api.billing.getInvoices(workspaceId, {
          status: filter === "all" ? undefined : filter
        });
        const invoiceList = response.data.invoices || [];
        setInvoices(invoiceList);

        const totalSpent = invoiceList
          .filter(i => i.status === "paid")
          .reduce((sum, i) => sum + (i.total || 0), 0);
        const paidCount = invoiceList.filter(i => i.status === "paid").length;
        const pendingCount = invoiceList.filter(i => i.status === "pending").length;

        setStats({
          totalSpent,
          totalInvoices: invoiceList.length,
          paidInvoices: paidCount,
          pendingInvoices: pendingCount
        });
      } catch (error) {
        toast(error.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadInvoices();
    }
  }, [workspaceId, filter]);

  const handleExport = async () => {
    try {
      const response = await api.billing.getInvoices(workspaceId);
      const invoiceList = response.data.invoices || [];
      const csv = [
        ["Invoice", "Date", "Plan", "Amount", "Status", "Payment Method"],
        ...invoiceList.map(i => [
          i.invoiceNumber,
          new Date(i.createdAt).toLocaleDateString(),
          "Pro",
          `₹${i.total}`,
          i.status,
          "Visa •••• 4242"
        ])
      ]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billing-history-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast("Billing history exported");
    } catch (error) {
      toast(error.message || "Failed to export");
    }
  };

  if (loading) {
    return (
      <div>
        <Crumb items={["Dashboard", "Billing", "History"]} />
        <PageHeader title="Billing History" subtitle="View previous invoices and billing transactions." />
        <div className="card p-5 mt-6">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Crumb items={["Dashboard", "Billing", "History"]} />
      <PageHeader
        title="Billing History"
        subtitle="View previous invoices and billing transactions."
      >
        <button
          className="btn btn-outline"
          onClick={handleExport}
          type="button"
        >
          <Download size={15} />
          Export
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Spent" value={`₹${stats.totalSpent}`} />
        <StatCard label="Invoices" value={stats.totalInvoices} />
        <StatCard label="Paid" value={stats.paidInvoices} />
        <StatCard label="Pending" value={stats.pendingInvoices} />
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
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted">No invoices found</div>
        ) : (
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
              {invoices.map((i) => (
                <tr key={i._id}>
                  <td>{i.invoiceNumber}</td>
                  <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td>Pro</td>
                  <td>₹{i.total}</td>
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
        )}
      </section>
      <Drawer
        open={!!selected}
        title="Invoice details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <p>
            <b>{selected.invoiceNumber}</b>
            <br />
            Billing period: {new Date(selected.billingPeriodStart).toLocaleDateString()} - {new Date(selected.billingPeriodEnd).toLocaleDateString()}
            <br />
            Plan: Pro
            <br />
            Subtotal: ₹{selected.subtotal}
            <br />
            Tax: ₹{selected.tax || 0}
            <br />
            <b>Total: ₹{selected.total}</b>
            <br />
            <button
              className="btn btn-primary mt-4"
              onClick={() => {
                if (selected.invoiceUrl) {
                  window.open(selected.invoiceUrl, "_blank");
                } else {
                  toast("Invoice URL not available");
                }
              }}
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
