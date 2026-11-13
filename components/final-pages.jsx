"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Activity,
  BookOpen,
  Box,
  CheckCircle2,
  Copy,
  FileText,
  HelpCircle,
  Plus,
  Search,
  Send,
  Webhook,
} from "lucide-react";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";
export function WorkspacePage({ kind }) {
  const [rows, setRows] = useState([]),
    [q, setQ] = useState(""),
    [sel, setSel] = useState(null),
    [modal, setModal] = useState(false);
  if (kind === "Help") return <Help />;
  const filtered = rows.filter((x) =>
    JSON.stringify(x).toLowerCase().includes(q.toLowerCase()),
  );
  function add() {
    setRows((p) => [
      {
        id: Date.now(),
        name: `New ${kind.slice(0, -1)}`,
        title: `New ${kind.slice(0, -1)}`,
        status: "active",
        description: "Newly configured workspace item",
        created: "Today",
      },
      ...p,
    ]);
    setModal(false);
    toast(`${kind.slice(0, -1)} created successfully.`);
  }
  return (
    <div>
      <Crumb items={["Dashboard", kind]} />
      <PageHeader
        title={kind}
        subtitle={
          kind === "Search"
            ? "Find anything across your DevFlow workspace."
            : kind === "Feedback"
              ? "Help us improve DevFlow AI by sharing ideas, issues, and suggestions."
              : kind === "Integrations"
                ? "Connect DevFlow AI with the tools your team already uses."
                : "Connect DevFlow AI events to your external applications and automation systems."
        }
      >
        {kind !== "Search" && (
          <button
            className="btn btn-primary"
            onClick={() => setModal(true)}
            type="button"
          >
            <Plus size={16} />
            {kind === "Feedback"
              ? "Submit Feedback"
              : kind === "Webhooks"
                ? "Create Webhook"
                : "Connect Integration"}
          </button>
        )}
      </PageHeader>
      {kind === "Webhooks" && (
        <div className="dash-grid-4 mt-6">
          <StatCard label="Active Webhooks" value="8" />
          <StatCard label="Deliveries Today" value="2,481" />
          <StatCard label="Successful" value="2,436" />
          <StatCard label="Success rate" value="98.1%" />
        </div>
      )}
      <section className="card p-5 mt-6">
        <label className="dash-search mb-4">
          <Search size={16} />
          <input
            autoFocus={kind === "Search"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              kind === "Search"
                ? "Search projects, tasks, files, AI sessions…"
                : `Search ${kind.toLowerCase()}…`
            }
          />
        </label>
        {!filtered.length ? (
          <EmptyState
            icon={Search}
            title={`No ${kind.toLowerCase()} found`}
            description="Try another search or create a new item."
          />
        ) : (
          <div
            className={kind === "Integrations" ? "dash-grid-3" : "grid gap-3"}
          >
            {filtered.map((x) => (
              <article
                className="rounded-xl border border-(--border) p-4 bg-(--bg)"
                key={x.id || x.name || x.title}
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <span className="badge">
                      {x.category || x.type || "Workspace"}
                    </span>
                    <h3 className="mb-1">{x.name || x.title}</h3>
                    <p className="muted text-sm m-0">
                      {x.description || x.endpoint || x.resource}
                    </p>
                  </div>
                  {x.status && <StatusBadge status={x.status} />}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSel(x)}
                    type="button"
                  >
                    View
                  </button>
                  {kind === "Webhooks" && (
                    <button
                      className="btn btn-outline"
                      onClick={() => toast("Webhook delivered successfully.")}
                      type="button"
                    >
                      Retry
                    </button>
                  )}
                  {kind === "Feedback" && (
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setRows((p) =>
                          p.map((y) =>
                            y === x ? { ...y, votes: y.votes + 1 } : y,
                          ),
                        );
                        toast("Vote recorded");
                      }}
                      type="button"
                    >
                      ▲ {x.votes}
                    </button>
                  )}
                  {kind === "Integrations" && (
                    <button
                      className="btn btn-outline"
                      onClick={() => toast(`${x.name} connected successfully.`)}
                      type="button"
                    >
                      {x.status === "Connected" ? "Manage" : "Connect"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <ConfirmDialog
        open={modal}
        title={`Create ${kind.slice(0, -1)}`}
        description="This is a local frontend-only simulation using fictional data."
        confirmLabel="Create"
        onConfirm={add}
        onCancel={() => setModal(false)}
      />
      <Drawer
        open={!!sel}
        title={`${kind.slice(0, -1)} details`}
        onClose={() => setSel(null)}
      >
        {sel && (
          <>
            <pre className="terminal-panel">{JSON.stringify(sel, null, 2)}</pre>
            <button
              className="btn btn-outline mt-3"
              onClick={() => {
                navigator.clipboard?.writeText(JSON.stringify(sel));
                toast("Copied");
              }}
              type="button"
            >
              <Copy size={15} />
              Copy details
            </button>
          </>
        )}
      </Drawer>
    </div>
  );
}
function Help() {
  const [open, setOpen] = useState(null);
  const articles = [
    "How to connect GitHub",
    "How to create your first project",
    "Using AI Code Review",
    "Deploying your application",
    "Creating workflows",
    "Managing API keys",
  ];
  return (
    <div>
      <Crumb items={["Dashboard", "Help Center"]} />
      <PageHeader
        title="Help Center"
        subtitle="Find answers, guides, and resources for building with DevFlow AI."
      />
      <section className="card p-6 mt-6">
        <label className="dash-search w-full">
          <Search />
          <input placeholder="How can we help?" />
        </label>
        <div className="dash-grid-3 mt-5">
          {[
            "Getting Started",
            "AI Tools",
            "Projects",
            "GitHub",
            "Deployments",
            "Workflows",
            "Billing",
            "API",
            "Account",
          ].map((x) => (
            <article
              className="rounded-xl border border-(--border) p-4"
              key={x}
            >
              <BookOpen color="var(--primary)" />
              <h3>{x}</h3>
              <p className="muted text-sm">
                Helpful developer guides · 12 articles
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="card p-5 mt-6">
        <h2>Popular articles</h2>
        {articles.map((x, i) => (
          <button
            className="w-full text-left p-3 border-b border-(--border) bg-transparent text-(--text)"
            onClick={() => setOpen(i)}
            key={x}
            type="button"
          >
            {x}
          </button>
        ))}
      </section>
      <Drawer
        open={open !== null}
        title={articles[open] || "Article"}
        onClose={() => setOpen(null)}
      >
        <p className="muted">Updated today · 4 min read</p>
        <p>
          This guide explains the recommended setup, safe defaults, and next
          steps for your DevFlow AI workspace.
        </p>
      </Drawer>
    </div>
  );
}
export function AdminPage({ section = "Overview" }) {
  const [tab, setTab] = useState("7 Days"),
    [selected, setSelected] = useState(null),
    [confirm, setConfirm] = useState(false),
    [loading, setLoading] = useState(true),
    [data, setData] = useState(null),
    [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        let result;
        if (section === "Overview") {
          result = await api.admin.overview();
        } else if (section === "Users") {
          result = await api.admin.users({ page: 1, limit: 20 });
        } else if (section === "AI Usage") {
          result = await api.admin.aiUsage();
        } else if (section === "Subscriptions") {
          result = await api.admin.subscriptions({ page: 1, limit: 20 });
        } else if (section === "Reports") {
          result = await api.admin.reports();
        } else if (section === "Audit Logs") {
          result = await api.admin.auditLogs({ page: 1, limit: 20 });
        }
        setData(result?.data || result);
      } catch (err) {
        setError(err.message || "Failed to load data");
        toast(err.message || "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [section]);

  const titles = {
    Overview: "Admin Overview",
    Users: "User Management",
    "AI Usage": "AI Usage",
    Subscriptions: "Subscriptions",
    Reports: "Reports",
    "Audit Logs": "Audit Logs",
  };

  const getRows = () => {
    if (!data) return [];
    if (section === "Overview") return [];
    if (section === "Users") return data.users || [];
    if (section === "Subscriptions") return data.subscriptions || [];
    if (section === "Audit Logs") return data.logs || [];
    return [];
  };

  const getStats = () => {
    if (!data) return [];
    if (section === "Overview") {
      return [
        { label: "Total Users", value: data.totalUsers || 0 },
        { label: "Active Users", value: data.activeUsers || 0 },
        { label: "AI Requests Today", value: data.aiRequestsToday || 0 },
        { label: "Total Subscriptions", value: data.totalSubscriptions || 0 }
      ];
    }
    return [];
  };

  const rows = getRows();
  const stats = getStats();

  return (
    <div>
      <PageHeader
        title={titles[section]}
        subtitle={
          section === "Overview"
            ? "Monitor platform health, users, AI usage, subscriptions, and system activity."
            : "Platform administration · Real backend data."
        }
      />
      {loading && <div style={{ padding: "24px", textAlign: "center" }}>Loading...</div>}
      {error && <div style={{ padding: "24px", color: "var(--danger)" }}>Error: {error}</div>}
      {!loading && !error && (
        <>
          {stats.length > 0 && (
            <div className="dash-grid-4 mt-6">
              {stats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={String(stat.value)} />
              ))}
            </div>
          )}
          <section className="card p-5 mt-6">
            <div className="flex justify-between mb-4">
              <h2 className="m-0">{section} overview</h2>
              {section !== "Overview" && (
                <div className="flex gap-2">
                  {["24 Hours", "7 Days", "30 Days"].map((x) => (
                    <button
                      key={x}
                      className={`btn ${tab === x ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setTab(x)}
                      type="button"
                    >
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {rows.length === 0 ? (
              <EmptyState icon={Search} title="No data found" description="No records available for this section." />
            ) : (
              <table className="data-table mt-5">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Details</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x, i) => (
                    <tr key={x._id || i}>
                      <td>{x.name || x.actor?.name || x.email || "N/A"}</td>
                      <td>
                        <StatusBadge status={x.status || "active"} />
                      </td>
                      <td>{x.createdAt ? new Date(x.createdAt).toLocaleDateString() : x.created || "N/A"}</td>
                      <td>{x.action || x.amount || x.email || "N/A"}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          onClick={() => setSelected(x)}
                          type="button"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {section === "Reports" && (
              <button
                className="btn btn-primary mt-4"
                onClick={() => toast("Report generated")}
                type="button"
              >
                <FileText size={15} />
                Generate Report
              </button>
            )}
          </section>
          <Drawer
            open={!!selected}
            title={`${section} details`}
            onClose={() => setSelected(null)}
          >
            {selected && (
              <pre className="terminal-panel">
                {JSON.stringify(selected, null, 2)}
              </pre>
            )}
            {section === "Users" && (
              <button
                className="btn btn-outline mt-3"
                onClick={() => setConfirm(true)}
                type="button"
              >
                Suspend user
              </button>
            )}
          </Drawer>
          <ConfirmDialog
            open={confirm}
            title="Suspend user?"
            description="This action will suspend the user account."
            confirmLabel="Suspend User"
            danger
            onConfirm={() => {
              setConfirm(false);
              toast("User suspended");
            }}
            onCancel={() => setConfirm(false)}
          />
        </>
      )}
    </div>
  );
}
