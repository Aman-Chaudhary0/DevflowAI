"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Workflow, Play, CheckCircle2, XCircle, Clock, ArrowRight, Plus, Sparkles,
  Github, RefreshCw, Power, Settings, FileCode, AlertTriangle, ChevronRight
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";

const initialWorkflows = [
  {
    id: "wf-1",
    name: "Automated PR Code Review & Security Audit",
    trigger: "GitHub Pull Request Opened",
    triggerIcon: Github,
    action: "AI Code Review Engine",
    output: "Post Review Comments on PR",
    status: "active",
    lastRun: "12 mins ago",
    totalRuns: 184,
    successRate: "98.2%"
  },
  {
    id: "wf-2",
    name: "Auto Docs Sync on Main Branch Commit",
    trigger: "Git Push to branch 'main'",
    triggerIcon: FileCode,
    action: "AI Documentation Generator",
    output: "Update Workspace Docs & Export PDF",
    status: "active",
    lastRun: "1 hour ago",
    totalRuns: 92,
    successRate: "100%"
  },
  {
    id: "wf-3",
    name: "Sentry Stack Trace AI Bug Fixer",
    trigger: "Sentry Error Exception Webhook",
    triggerIcon: AlertTriangle,
    action: "AI Bug Fixer & Diff Generator",
    output: "Open Hotfix Pull Request",
    status: "active",
    lastRun: "3 hours ago",
    totalRuns: 45,
    successRate: "93.3%"
  },
  {
    id: "wf-4",
    name: "Vercel Preview Build & E2E Tests",
    trigger: "Pull Request Updated",
    triggerIcon: RefreshCw,
    action: "Run Playwright Tests & Build",
    output: "Deploy Vercel Preview URL",
    status: "paused",
    lastRun: "2 days ago",
    totalRuns: 310,
    successRate: "96.5%"
  }
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [runningId, setRunningId] = useState(null);

  const toggleWorkflowStatus = (id) => {
    setWorkflows(workflows.map(wf => {
      if (wf.id === id) {
        const nextStatus = wf.status === "active" ? "paused" : "active";
        toast(`Workflow ${wf.name} ${nextStatus}`, "info");
        return { ...wf, status: nextStatus };
      }
      return wf;
    }));
  };

  const triggerWorkflowManually = (wf) => {
    setRunningId(wf.id);
    toast(`Triggering pipeline execution for: ${wf.name}`, "info");
    setTimeout(() => {
      setRunningId(null);
      setWorkflows(workflows.map(w => w.id === wf.id ? { ...w, lastRun: "Just now", totalRuns: w.totalRuns + 1 } : w));
      toast(`Workflow ${wf.name} executed successfully!`, "success");
    }, 2000);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1300, margin: "0 auto" }}>
      <PageHeader title="Workflows & Automation" subtitle="Configure automated CI/CD pipelines, AI code reviews, and event triggers">
        <button className="btn btn-primary" onClick={() => toast("Workflow builder modal opened", "info")} style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Plus size={16} /> Create Workflow
        </button>
      </PageHeader>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Workflows" value={workflows.filter(w => w.status === "active").length} delta="3 automated" trend="up" icon={Workflow} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="Pipeline Runs (30d)" value="631" delta="+18% vs last month" trend="up" icon={Play} iconBg="rgba(16, 185, 129, 0.15)" />
        <StatCard label="Average Success Rate" value="97.0%" delta="High reliability" trend="up" icon={CheckCircle2} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Time Saved / Month" value="42.5 hrs" delta="AI automation" trend="up" icon={Clock} iconBg="rgba(245, 158, 11, 0.15)" />
      </div>

      {/* Workflow Pipeline Cards */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Configured Pipelines</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
        {workflows.map(wf => {
          const TriggerIcon = wf.triggerIcon;
          const isRunning = runningId === wf.id;

          return (
            <div
              key={wf.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 18
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", display: "grid", placeItems: "center" }}>
                    <Workflow size={20} style={{ color: "#3b82f6" }} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{wf.name}</h3>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Last run: {wf.lastRun} • {wf.totalRuns} total runs • Success: {wf.successRate}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => triggerWorkflowManually(wf)}
                    disabled={isRunning}
                    style={{ minHeight: 36, fontSize: 12, gap: 6 }}
                  >
                    <Play size={14} style={{ color: "var(--success)" }} /> {isRunning ? "Running..." : "Manual Trigger"}
                  </button>
                  <button
                    onClick={() => toggleWorkflowStatus(wf.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      border: "none",
                      background: wf.status === "active" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: wf.status === "active" ? "#10b981" : "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <Power size={14} /> {wf.status.toUpperCase()}
                  </button>
                </div>
              </div>

              {/* Visual Pipeline Nodes: Trigger -> Action -> Output */}
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignItems: "center" }}>
                {/* Step 1: Trigger */}
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>1. TRIGGER EVENT</div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    <TriggerIcon size={16} style={{ color: "var(--primary)" }} /> {wf.trigger}
                  </div>
                </div>

                <div style={{ textAlign: "center", color: "var(--muted)" }} className="hidden-mobile">
                  <ArrowRight size={18} />
                </div>

                {/* Step 2: Action */}
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>2. AI ACTION</div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: "#a855f7" }}>
                    <Sparkles size={16} /> {wf.action}
                  </div>
                </div>

                <div style={{ textAlign: "center", color: "var(--muted)" }} className="hidden-mobile">
                  <ArrowRight size={18} />
                </div>

                {/* Step 3: Output */}
                <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>3. TARGET OUTPUT</div>
                  <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: "#10b981" }}>
                    <CheckCircle2 size={16} /> {wf.output}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
