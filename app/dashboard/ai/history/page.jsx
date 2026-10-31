"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const TOOL_LABELS = {
  "chat": "Chat",
  "code-generator": "Code Generator",
  "code-review": "Code Review",
  "documentation": "Documentation",
  "bug-fixer": "Bug Fixer",
  "backend-generator": "Backend Generator",
  "sql-generator": "SQL Generator"
};

const STATUS_COLORS = {
  completed: "var(--success)",
  failed: "var(--danger)",
  cancelled: "var(--warning)",
  pending: "var(--muted)",
  processing: "var(--info)"
};

const FILTERS = ["All", "chat", "code-generator", "code-review", "documentation", "bug-fixer", "backend-generator", "sql-generator"];

export default function AiHistoryPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const searchTimer = useRef(null);

  const loadHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.ai.history.list({
        page: params.page ?? page,
        limit: 20,
        ...(params.tool && params.tool !== "All" ? { tool: params.tool } : {}),
        ...(params.search ? { search: params.search } : {})
      });
      setExecutions(res.data?.executions || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      setError(err.message);
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await api.ai.usage.summary();
      setSummary(res.data);
    } catch {
      setSummary(null);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadHistory({ page, tool: filter, search: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const handleSearch = (value) => {
    setQuery(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadHistory({ page: 1, tool: filter, search: value });
    }, 350);
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.ai.history.delete(id);
      toast("Record deleted", "success");
      setConfirmDelete(null);
      await Promise.all([
        loadHistory({ page, tool: filter, search: query }),
        loadSummary()
      ]);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleOpen = (execution) => {
    if (execution.tool === "chat" && execution.conversation) {
      router.push(`/dashboard/ai/chat?conversation=${encodeURIComponent(execution.conversation)}`);
    } else {
      toast("No saved output is available for this execution", "info");
    }
  };

  const handleDuplicate = (execution) => {
    const toolRoutes = {
      "chat": "/dashboard/ai/chat",
      "code-generator": "/dashboard/ai/code-generator",
      "code-review": "/dashboard/ai/code-review",
      "documentation": "/dashboard/ai/docs-generator",
      "bug-fixer": "/dashboard/ai/bug-fixer",
      "backend-generator": "/dashboard/ai/backend-generator",
      "sql-generator": "/dashboard/ai/sql-generator"
    };
    const route = toolRoutes[execution.tool];
    if (route) {
      router.push(route);
      toast("Navigated to tool — re-enter your prompt to run again", "info");
    } else {
      toast("Tool route unavailable", "info");
    }
  };

  const formatDuration = (ms) => {
    if (ms == null) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (n) => (n == null ? "—" : n.toLocaleString());

  return (
    <div>
      <PageHeader title="AI History" subtitle="Search, revisit, and manage past AI executions.">
        <div className="flex gap-2 flex-wrap">
          <span className="badge">Executions</span>
          <span className="badge">Usage</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Requests" value={summary?.total ?? "—"} delta="all time" trend="neutral" />
        <StatCard label="Completed" value={summary?.completed ?? "—"} delta="successful" trend="up" />
        <StatCard label="Failed" value={summary?.failed ?? "—"} delta="errors" trend={summary?.failed > 0 ? "down" : "neutral"} />
        <StatCard
          label="Avg Duration"
          value={summary?.avgRequestDurationMs != null ? formatDuration(summary.avgRequestDurationMs) : "—"}
          delta="per request"
          trend="neutral"
        />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.08), transparent 22%), var(--card)" }}>
        <div className="flex gap-3 flex-wrap items-center mb-4">
          <div className="flex-1 min-w-65">
            <input
              className="input"
              placeholder="Search by tool, model, or provider..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => router.push("/dashboard/ai/chat")}
          >
            New session
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
              onClick={() => handleFilterChange(f)}
              type="button"
            >
              {f === "All" ? "All" : TOOL_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <div role="alert" style={{ padding: 16, borderRadius: 10, background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
            {error}
            <button
              onClick={() => loadHistory({ page, tool: filter, search: query })}
              type="button"
              style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: 0, color: "inherit", cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        ) : executions.length === 0 ? (
          <EmptyState
            title="No AI executions found."
            description="Clear filters or start a new AI task."
            action="Start a task"
            onAction={() => router.push("/dashboard/ai")}
          />
        ) : (
          <div className="grid gap-3">
            {executions.map((ex) => (
              <div key={ex._id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                {confirmDelete === ex._id && (
                  <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, background: "color-mix(in srgb, var(--danger) 12%, transparent)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: "var(--danger)" }}>Delete this execution record?</span>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 12, minHeight: 30, color: "var(--danger)", borderColor: "var(--danger)" }}
                      onClick={() => handleDelete(ex._id)}
                      disabled={deleting === ex._id}
                      type="button"
                    >
                      {deleting === ex._id ? "Deleting…" : "Confirm"}
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: 12, minHeight: 30 }} onClick={() => setConfirmDelete(null)} type="button">Cancel</button>
                  </div>
                )}
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{TOOL_LABELS[ex.tool] || ex.tool}</div>
                      <span className="badge">{ex.tool}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[ex.status] || "var(--muted)" }}>
                        {ex.status}
                      </span>
                    </div>
                    <div className="muted text-sm">
                      {ex.provider ? `${ex.provider} · ` : ""}{ex.model || "—"} · {new Date(ex.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn btn-ghost" onClick={() => handleOpen(ex)} type="button">Open</button>
                    <button className="btn btn-ghost" onClick={() => handleDuplicate(ex)} type="button">Duplicate</button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setConfirmDelete(ex._id)}
                      type="button"
                      disabled={deleting === ex._id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-(--border) p-3 bg-(--bg)">
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><div className="muted mb-1">Tool</div><div className="font-medium">{TOOL_LABELS[ex.tool] || ex.tool}</div></div>
                    <div><div className="muted mb-1">Duration</div><div className="font-medium">{formatDuration(ex.requestDurationMs)}</div></div>
                    <div>
                      <div className="muted mb-1">Tokens</div>
                      <div className="font-medium">
                        {ex.usageSource === "provider" ? formatTokens(ex.totalTokens) : "unavailable"}
                      </div>
                    </div>
                    <div><div className="muted mb-1">Created</div><div className="font-medium">{new Date(ex.createdAt).toLocaleDateString()}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <button
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              type="button"
            >
              Previous
            </button>
            <span className="muted" style={{ alignSelf: "center", fontSize: 13 }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <button
              className="btn btn-ghost"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
