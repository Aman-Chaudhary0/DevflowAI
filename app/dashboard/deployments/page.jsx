"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
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

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState(null);
  const [stats, setStats] = useState(null);
  const [env, setEnv] = useState("All");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [depRes, statsRes] = await Promise.all([
          api.deployments.list(),
          api.deployments.stats()
        ]);
        setDeployments(depRes.deployments || []);
        setStats(statsRes);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load deployments");
        setDeployments([]);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const list = deployments || [];
    return env === "All" ? list : list.filter((d) => d.environment === env);
  }, [deployments, env]);

  return (
    <div>
      <PageHeader title="Deployments" subtitle="Monitor builds, releases, environments, and application deployments.">
        <Link className="btn btn-primary" href="/dashboard/deployments/create">New Deployment</Link>
      </PageHeader>

      <div className="dash-grid-4 mt-6">
        <StatCard label="Production" value={String(stats?.production || 0)} delta="live deployments" trend="up" />
        <StatCard label="Preview" value={String(stats?.preview || 0)} delta="active previews" trend="neutral" />
        <StatCard label="Successful" value={String(stats?.successful || 0)} delta="last 30 days" trend="up" />
        <StatCard label="Failed" value={String(stats?.failed || 0)} delta="last 30 days" trend="down" />
      </div>

      <div className="card p-4 mt-6" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 24%), var(--card))" }}>
        <div className="flex gap-2 mb-4 flex-wrap">
          {["All", "production", "preview", "development"].map((e) => (
            <button key={e} className={`btn ${env === e ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnv(e)} type="button">{e === "All" ? "All" : e.charAt(0).toUpperCase() + e.slice(1)}</button>
          ))}
        </div>

        {deployments === null ? (
          <SkeletonCard />
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No deployments found"
            description="Create your first deployment to see pipeline activity here."
            action="New Deployment"
            onAction={() => window.location.href = "/dashboard/deployments/create"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Environment</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold">{r.projectName}</div>
                      <div className="muted text-xs">by {r.createdByName || "unknown"}</div>
                    </td>
                    <td><span className="badge">{r.environment}</span></td>
                    <td>{r.branch}</td>
                    <td><StatusBadge status={r.status.toLowerCase()} /></td>
                    <td>{formatDuration(r.duration)}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link className="btn btn-ghost" href={`/dashboard/deployments/${r.id}`}>View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
