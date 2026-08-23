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
        <button className="btn btn-primary" onClick={() => toast('Deployment started')} type="button">New Deployment</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Production" value="3" delta="live deployments" trend="up" />
        <StatCard label="Preview" value="12" delta="active previews" trend="neutral" />
        <StatCard label="Successful" value="142" delta="last 30 days" trend="up" />
        <StatCard label="Failed" value="7" delta="last 30 days" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 24%), var(--card)" }}>
        <div className="flex gap-2 mb-4 flex-wrap">
          { ["All","Production","Preview","Development"].map((e) => (
            <button key={e} className={`btn ${env===e ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnv(e)} type="button">{e}</button>
          )) }
        </div>

        {rows === null ? <SkeletonCard /> : filtered.length===0 ? <EmptyState title="No deployments found" description="Create your first deployment to see pipeline activity here." action="New Deployment" onAction={() => toast("Deployment started")} /> : (
          <div className="overflow-x-auto">
            <table className="table w-full" style={{ minWidth: 1050 }}>
              <thead><tr><th>Project</th><th>Environment</th><th>Commit</th><th>Branch</th><th>Status</th><th>Duration</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="font-semibold">{r.project}</div>
                      <div className="muted text-xs">deployed by {r.author}</div>
                    </td>
                    <td><span className="badge">{r.environment}</span></td>
                    <td className="font-mono text-xs">{r.commit}</td>
                    <td>{r.branch}</td>
                    <td><StatusBadge status={r.status.toLowerCase()} /></td>
                    <td>{r.duration}</td>
                    <td>{r.created}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
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
function LegacyDeploymentsPage() {
  const [items, setItems] = useState(null);
  const [env, setEnv] = useState("All");

  useEffect(() => { mockApi.deployments.list().then(setItems); }, []);

  const filtered = useMemo(() => {
    const list = items || [];
    return env === "All" ? list : list.filter((d) => d.environment === env);
  }, [items, env]);

  return (
    <div>
      <PageHeader title="Deployments" subtitle="Monitor builds, releases, environments, and application deployments.">
        <button className="btn btn-primary" onClick={() => toast("New deployment started")}>New Deployment</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Production" value="3" />
        <StatCard label="Preview" value="12" />
        <StatCard label="Successful" value="142" />
        <StatCard label="Failed" value="7" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Deployment list</h3>
            <p className="m-0 mt-1 muted text-sm">A cleaner, card-style deployment surface with environment chips and direct access to details.</p>
          </div>
          <span className="badge">Live rollout</span>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          { ["All","Production","Preview","Development"].map((e) => (
            <button key={e} className={`btn ${env===e ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnv(e)} type="button">{e}</button>
          )) }
        </div>

        {items === null ? (
          <SkeletonCard />
        ) : filtered.length === 0 ? (
          <EmptyState title="No deployments found" description="Create your first deployment to see pipeline activity here." action="New Deployment" onAction={() => toast("New deployment started")} />
        ) : (
          <div className="grid gap-3">
            {filtered.map((d) => (
              <div key={d.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{d.project}</div>
                      <span className="badge">{d.environment}</span>
                      <StatusBadge status={d.status.toLowerCase()} />
                    </div>
                    <div className="muted text-sm">Branch {d.branch} • {d.created} • {d.author}</div>
                    <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Commit</div><div className="font-mono text-xs">{d.commit}</div></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Duration</div><div className="font-medium">{d.duration}</div></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Updated</div><div className="font-medium">{d.created}</div></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Type</div><div className="font-medium">{d.environment}</div></div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <Link className="btn btn-ghost" href={`/dashboard/deployments/${d.id}`}>View</Link>
                    <button className="btn btn-outline" onClick={() => toast("Redeploy triggered")} type="button">Redeploy</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
