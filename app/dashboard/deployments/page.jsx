"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function DeploymentsPage() {
  const [rows, setRows] = useState(null);
  const [env, setEnv] = useState("All");

  useEffect(() => { mockApi.deployments.list().then(setRows); }, []);

  const filtered = useMemo(() => {
    const list = rows || [];
    return env === "All" ? list : list.filter((d) => d.environment === env);
  }, [rows, env]);

  return (
    <div>
      <PageHeader title="Deployments" subtitle="Monitor builds, releases, environments, and application deployments.">
        <button className="btn btn-primary" onClick={() => toast("Deployment started")} type="button">New Deployment</button>
      </PageHeader>

      <div className="dash-grid-4 mt-6">
        <StatCard label="Production" value="3" delta="live deployments" trend="up" />
        <StatCard label="Preview" value="12" delta="active previews" trend="neutral" />
        <StatCard label="Successful" value="142" delta="last 30 days" trend="up" />
        <StatCard label="Failed" value="7" delta="last 30 days" trend="down" />
      </div>

      <div className="card p-4 mt-6" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 24%), var(--card)" }}>
        <div className="flex gap-2 mb-4 flex-wrap">
          {["All", "Production", "Preview", "Development"].map((e) => (
            <button key={e} className={`btn ${env === e ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnv(e)} type="button">{e}</button>
          ))}
        </div>

        {rows === null ? (
          <SkeletonCard />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No deployments found"
            description="Create your first deployment to see pipeline activity here."
            action="New Deployment"
            onAction={() => toast("Deployment started")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Environment</th>
                  <th>Commit</th>
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
                      <div className="font-semibold">{r.project}</div>
                      <div className="muted text-xs">by {r.author}</div>
                    </td>
                    <td><span className="badge">{r.environment}</span></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{r.commit}</td>
                    <td>{r.branch}</td>
                    <td><StatusBadge status={r.status.toLowerCase()} /></td>
                    <td>{r.duration}</td>
                    <td>{r.created}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link className="btn btn-ghost" href={`/dashboard/deployments/${r.id}`}>View</Link>
                        <button className="btn btn-outline" onClick={() => toast("Redeploy triggered")} type="button">Redeploy</button>
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
