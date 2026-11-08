"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Copy, Check } from "lucide-react";
import { EmptyState, PageHeader, SkeletonCard, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function DeploymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [deployment, setDeployment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [state, setState] = useState("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setState("loading");
    
    async function load() {
      try {
        const result = await api.deployments.get(id);
        if (!alive) return;
        setDeployment(result.deployment);
        
        const logsResult = await api.deployments.logs(id);
        if (!alive) return;
        setLogs(logsResult.logs || []);
        setState(result.deployment ? "ready" : "empty");
      } catch (err) {
        if (!alive) return;
        setDeployment(null);
        setState("error");
      }
    }
    
    load();
    return () => { alive = false; };
  }, [id]);

  const handleCopyUrl = () => {
    if (deployment?.deploymentUrl) {
      navigator.clipboard.writeText(deployment.deploymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRedeploy = async () => {
    try {
      await api.deployments.redeploy(id);
      toast("Redeployment queued", "success");
    } catch (err) {
      toast(err.message || "Failed to redeploy", "error");
    }
  };

  const handleRollback = async () => {
    try {
      await api.deployments.rollback(id);
      toast("Rollback queued", "success");
    } catch (err) {
      toast(err.message || "Failed to rollback", "error");
    }
  };

  const handleCancel = async () => {
    try {
      await api.deployments.cancel(id);
      toast("Deployment cancelled", "success");
    } catch (err) {
      toast(err.message || "Failed to cancel", "error");
    }
  };

  if (state === "loading") {
    return (
      <div>
        <Crumb items={["Dashboard", "Deployments", "Details"]} />
        <PageHeader title="Deployment Details" subtitle="Live build pipeline and rollout state." />
        <div className="mt-6"><SkeletonCard /></div>
      </div>
    );
  }

  if (state !== "ready" || !deployment) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Deployment not found"
        description="This deployment link is unavailable. Return to the deployments list and open another item."
        action="Back to deployments"
        onAction={() => router.push("/dashboard/deployments")}
      />
    );
  }

  const isInProgress = ["queued", "initializing", "building", "deploying"].includes(deployment.status);

  return (
    <div>
      <Crumb items={["Dashboard", "Deployments", deployment.id]} />
      <PageHeader title="Deployment Details" subtitle={`${deployment.projectName} • ${deployment.environment} • ${deployment.branch}`}>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status={deployment.status.toLowerCase()} />
          <button className="btn btn-ghost" type="button" onClick={handleCopyUrl}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          {isInProgress && <button className="btn btn-outline" type="button" onClick={handleCancel}>Cancel</button>}
          {deployment.status === "ready" && <button className="btn btn-outline" type="button" onClick={handleRollback}>Rollback</button>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Build time" value={formatDuration(deployment.duration)} delta="end to end" trend="up" />
        <StatCard label="Branch" value={deployment.branch} delta="source" trend="neutral" />
        <StatCard label="Commit" value={deployment.commitSha ? deployment.commitSha.substring(0, 7) : "—"} delta="artifact" trend="neutral" />
        <StatCard label="Status" value={deployment.status} delta="current state" trend={deployment.status === "ready" ? "up" : "neutral"} />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-8">
          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 22%), var(--card))" }}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <h3 className="font-semibold mb-1">Deployment Status</h3>
                <p className="muted text-sm m-0">{deployment.status === "ready" ? "Deployment is live and serving traffic." : `Current status: ${deployment.status}`}</p>
              </div>
              {deployment.deploymentUrl && <Link href={deployment.deploymentUrl} className="btn btn-primary" target="_blank">Open live site</Link>}
            </div>

            <div className="grid gap-3">
              {["queued", "initializing", "building", "deploying", "ready"].map((step, index) => {
                const isActive = step === deployment.status;
                const isDone = ["ready", "failed", "cancelled"].includes(deployment.status) && ["queued", "initializing", "building", "deploying"].includes(step);
                const isCompleted = ["ready"].includes(deployment.status) || (["failed", "cancelled"].includes(deployment.status) && ["queued", "initializing", "building", "deploying"].includes(step));
                
                return (
                  <div key={step} className="flex items-center gap-4 p-3 rounded-2xl border border-(--border) bg-(--bg)">
                    <div className="w-10 h-10 rounded-full grid place-items-center font-bold" style={{ background: isActive || isCompleted ? "var(--primary)" : "color-mix(in srgb, var(--primary) 14%, transparent)", color: isActive || isCompleted ? "white" : "var(--primary)" }}>{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-medium capitalize">{step}</div>
                      <div className="muted text-xs">Pipeline step</div>
                    </div>
                    <StatusBadge status={isCompleted ? "success" : isActive ? "warning" : "neutral"} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-4 grid gap-6">
          <div className="card p-4 border border-(--border)">
            <h3 className="font-semibold mb-3">Deployment summary</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="muted">Project</span><strong>{deployment.projectName}</strong></div>
              <div className="flex justify-between"><span className="muted">Environment</span><strong>{deployment.environment}</strong></div>
              <div className="flex justify-between"><span className="muted">Author</span><strong>{deployment.createdByName || "unknown"}</strong></div>
              <div className="flex justify-between"><span className="muted">Created</span><strong>{formatDate(deployment.createdAt)}</strong></div>
              {deployment.deploymentUrl && <div className="flex justify-between"><span className="muted">URL</span><strong className="truncate max-w-45 text-blue-400">{deployment.deploymentUrl}</strong></div>}
            </div>
          </div>

          <div className="card p-4 border border-(--border)">
            <h3 className="font-semibold mb-3">Terminal logs</h3>
            <div className="rounded-2xl border border-(--border) p-3 bg-[#050814] text-[#a7f3d0] font-mono text-xs leading-6 max-h-90 overflow-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs available yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap break-words">
                    {log.message || ""}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))" }}>
            <h3 className="font-semibold mb-2">Actions</h3>
            <div className="grid gap-2">
              <button className="btn btn-ghost justify-start" type="button" onClick={handleRedeploy}>Redeploy</button>
              {isInProgress && <button className="btn btn-outline justify-start" type="button" onClick={handleCancel}>Cancel deployment</button>}
              {deployment.status === "ready" && <button className="btn btn-outline justify-start" type="button" onClick={handleRollback}>Rollback</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
