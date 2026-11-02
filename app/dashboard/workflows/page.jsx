"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Workflow, Play, CheckCircle2, XCircle, Clock, ArrowRight, Plus, Sparkles,
  Github, RefreshCw, Power, FileCode, AlertTriangle, Loader2
} from "lucide-react";
import { PageHeader, StatCard, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const triggerIconMap = {
  github: Github,
  internal: FileCode,
  manual: Play
};

const formatWorkflowStatus = (status) => {
  if (!status) return "draft";
  return String(status).toLowerCase();
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningId, setRunningId] = useState(null);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.workflows.list({ page: 1, limit: 50 });
      const items = res?.data?.workflows || res?.workflows || [];
      setWorkflows(items);
    } catch (err) {
      setError(err.message || "Unable to load workflows");
      toast(err.message || "Unable to load workflows", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const summary = useMemo(() => ({
    active: workflows.filter((wf) => formatWorkflowStatus(wf.status) === "active").length,
    totalRuns: workflows.reduce((sum, wf) => sum + (Number(wf.totalRuns) || 0), 0),
    successRate: workflows.length ? `${((workflows.filter((wf) => Number(wf.successfulRuns || 0) > 0).length / workflows.length) * 100 || 0).toFixed(1)}%` : "0%"
  }), [workflows]);

  const toggleWorkflowStatus = async (workflow) => {
    try {
      const nextStatus = formatWorkflowStatus(workflow.status) === "active" ? "paused" : "active";
      const res = await api.workflows.setStatus(workflow._id, nextStatus);
      const nextWorkflow = res?.data?.workflow || res?.workflow || { ...workflow, status: nextStatus };
      setWorkflows((items) => items.map((item) => item._id === workflow._id ? { ...item, ...nextWorkflow } : item));
      toast(`Workflow ${workflow.name} ${nextStatus}`, "info");
    } catch (err) {
      toast(err.message || "Unable to update workflow", "error");
    }
  };

  const triggerWorkflowManually = async (workflow) => {
    try {
      setRunningId(workflow._id);
      toast(`Triggering pipeline execution for: ${workflow.name}`, "info");
      const res = await api.workflows.run(workflow._id, {
        manualTest: true,
        triggerType: "manual",
        payload: { source: "dashboard" }
      });
      const run = res?.data?.run || res?.run || null;
      if (run) {
        setWorkflows((items) => items.map((item) => item._id === workflow._id ? {
          ...item,
          lastRunAt: new Date().toISOString(),
          totalRuns: Number(item.totalRuns || 0) + 1
        } : item));
      }
      toast(run?.status === "success" ? `Workflow ${workflow.name} executed successfully!` : `Workflow ${workflow.name} was queued.`, run?.status === "success" ? "success" : "info");
    } catch (err) {
      toast(err.message || "Unable to trigger workflow", "error");
    } finally {
      setRunningId(null);
    }
  };

  const openWorkflow = (workflowId) => {
    if (workflowId) window.location.href = `/dashboard/workflows/${workflowId}`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1300, margin: "0 auto" }}>
      <PageHeader title="Workflows & Automation" subtitle="Configure automated CI/CD pipelines, AI code reviews, and event triggers">
        <Link className="btn btn-primary" href="/dashboard/workflows/create" style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Plus size={16} /> Create Workflow
        </Link>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Workflows" value={summary.active} delta="workspace automation" trend="up" icon={Workflow} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="Pipeline Runs (30d)" value={summary.totalRuns} delta="persisted executions" trend="up" icon={Play} iconBg="rgba(16, 185, 129, 0.15)" />
        <StatCard label="Average Success Rate" value={summary.successRate} delta="workflow health" trend="up" icon={CheckCircle2} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Time Saved / Month" value={workflows.length ? `${Math.max(1, workflows.length * 3.5).toFixed(1)} hrs` : "0.0 hrs"} delta="AI automation" trend="up" icon={Clock} iconBg="rgba(245, 158, 11, 0.15)" />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Configured Pipelines</h2>

      {loading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3].map((i) => <div key={i} className="card" style={{ padding: 24, minHeight: 180 }}><Loader2 className="animate-spin" /></div>)}
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <XCircle size={18} color="var(--danger)" />
            <span>{error}</span>
          </div>
        </div>
      ) : workflows.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>
          <Workflow size={28} style={{ display: "block", margin: "0 auto 12px" }} />
          No workflows yet. Create one to start automating your team process.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
          {workflows.map((wf) => {
            const TriggerIcon = triggerIconMap[wf.trigger?.type] || Workflow;
            const status = formatWorkflowStatus(wf.status);
            const isRunning = runningId === wf._id;
            const triggerText = wf.trigger?.event || "workflow.manual_triggered";
            const actionName = wf.actions?.[0]?.name || "AI Action";
            const lastRunText = wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleString() : "Never";

            return (
              <div key={wf._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 18, cursor: "pointer" }} onClick={() => openWorkflow(wf._id)} onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openWorkflow(wf._id);
                }
              }} role="button" tabIndex={0}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", display: "grid", placeItems: "center" }}>
                      <Workflow size={20} style={{ color: "#3b82f6" }} />
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 2px 0", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{wf.name}</h3>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Last run: {lastRunText} • {wf.totalRuns || 0} total runs</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button className="btn btn-outline" onClick={() => triggerWorkflowManually(wf)} disabled={isRunning} style={{ minHeight: 36, fontSize: 12, gap: 6 }} type="button">
                      <Play size={14} style={{ color: "var(--success)" }} /> {isRunning ? "Running..." : "Manual Trigger"}
                    </button>
                    <button
                      onClick={() => toggleWorkflowStatus(wf)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        background: status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: status === "active" ? "#10b981" : "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                      type="button"
                    >
                      <Power size={14} /> {status.toUpperCase()}
                    </button>
                  </div>
                </div>

                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignItems: "center" }}>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>1. TRIGGER EVENT</div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                      <TriggerIcon size={16} style={{ color: "var(--primary)" }} /> {triggerText}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", color: "var(--muted)" }} className="hidden-mobile"><ArrowRight size={18} /></div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>2. AI ACTION</div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: "#a855f7" }}>
                      <Sparkles size={16} /> {actionName}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", color: "var(--muted)" }} className="hidden-mobile"><ArrowRight size={18} /></div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>3. TARGET OUTPUT</div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: "#10b981" }}>
                      <CheckCircle2 size={16} /> {wf.description || "Workflow action output"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
