"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, SkeletonCard, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function DeploymentDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [deployment, setDeployment] = useState(null);

  useEffect(() => {
    mockApi.deployments.get(id).then(setDeployment);
  }, [id]);

  if (!deployment) {
    return (
      <div>
        <PageHeader title="Deployment Details" subtitle="Live build pipeline and rollout state." />
        <div className="mt-6"><SkeletonCard /></div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Deployment Details" subtitle={`${deployment.project} • ${deployment.environment} • ${deployment.id}`}>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status="success" />
          <button className="btn btn-ghost" type="button" onClick={() => toast("Copied URL", "success")}>Copy URL</button>
          <button className="btn btn-outline" type="button" onClick={() => toast("Rollback requested", "warning")}>Rollback</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Build time" value={deployment.buildTime} delta="end to end" trend="up" />
        <StatCard label="Branch" value={deployment.branch} delta="source" trend="neutral" />
        <StatCard label="Commit" value={deployment.commit} delta="artifact" trend="neutral" />
        <StatCard label="Status" value="Live" delta="served globally" trend="up" />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-8">
          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 22%), var(--card)" }}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <h3 className="font-semibold mb-1">Pipeline</h3>
                <p className="muted text-sm m-0">Queued → build → checks → deploy → live.</p>
              </div>
              <Link href={deployment.url} className="btn btn-primary" target="_blank">Open live site</Link>
            </div>

            <div className="grid gap-3">
              {deployment.pipeline.map((step, index) => (
                <div key={step.name} className="flex items-center gap-4 p-3 rounded-2xl border border-(--border) bg-(--bg)">
                  <div className="w-10 h-10 rounded-full grid place-items-center font-bold" style={{ background: index === deployment.pipeline.length - 1 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 14%, transparent)", color: index === deployment.pipeline.length - 1 ? "white" : "var(--primary)" }}>{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="muted text-xs">Duration: {step.duration}</div>
                  </div>
                  <StatusBadge status={step.status === 'done' ? 'success' : 'warning'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4 grid gap-6">
          <div className="card p-4 border border-(--border)">
            <h3 className="font-semibold mb-3">Deployment summary</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="muted">Project</span><strong>{deployment.project}</strong></div>
              <div className="flex justify-between"><span className="muted">Environment</span><strong>{deployment.environment}</strong></div>
              <div className="flex justify-between"><span className="muted">Author</span><strong>{deployment.author}</strong></div>
              <div className="flex justify-between"><span className="muted">Created</span><strong>{deployment.created}</strong></div>
              <div className="flex justify-between"><span className="muted">URL</span><strong className="truncate max-w-[180px]">{deployment.url}</strong></div>
            </div>
          </div>

          <div className="card p-4 border border-(--border)">
            <h3 className="font-semibold mb-3">Terminal logs</h3>
            <div className="rounded-2xl border border-(--border) p-3 bg-[#050814] text-[#a7f3d0] font-mono text-xs leading-6 max-h-[360px] overflow-auto">
              {deployment.logs.map((line, index) => <div key={index}>{line}</div>)}
            </div>
          </div>

          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))" }}>
            <h3 className="font-semibold mb-2">Actions</h3>
            <div className="grid gap-2">
              <button className="btn btn-ghost justify-start" type="button" onClick={() => toast("Redeploy queued", "success")}>Redeploy</button>
              <button className="btn btn-ghost justify-start" type="button" onClick={() => toast("Logs copied", "success")}>Copy logs</button>
              <button className="btn btn-outline justify-start" type="button" onClick={() => toast("Rollback requested", "warning")}>Rollback</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}