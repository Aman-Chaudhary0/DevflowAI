"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, StatCard, SkeletonCard, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function ProjectAnalyticsPage() {
  const params = useParams();
  const projectId = params?.projectId;
  const [data, setData] = useState(null);

  useEffect(() => {
    mockApi.projects.analytics(projectId).then(setData);
  }, [projectId]);

  return (
    <div>
      <PageHeader title="Project Analytics" subtitle={`${projectId} — deep analytics for this project`}>
        <button className="btn btn-ghost" type="button" onClick={() => toast('Report exported', 'success')}>Export report</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Project Progress" value={data ? `${data.progress}%` : '—'} delta="completion" trend="up" />
        <StatCard label="Commits" value={data?.commits ?? '—'} delta="code activity" trend="up" />
        <StatCard label="AI Requests" value={data?.aiRequests ?? '—'} delta="automation" trend="up" />
        <StatCard label="Completed" value={data ? `${data.tasksCompleted.done}/${data.tasksCompleted.total}` : '—'} delta="tasks done" trend="neutral" />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-4">
          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.08), transparent 22%), var(--card)" }}>
            <h3 className="font-semibold mb-3">Project snapshot</h3>
            {data ? (
              <div className="grid gap-3">
                <StatCard label="Progress" value={`${data.progress}%`} />
                <StatCard label="Commits" value={data.commits} />
                <StatCard label="AI Requests" value={data.aiRequests} />
              </div>
            ) : <SkeletonCard />}
          </div>
        </div>

        <div className="col-span-8">
          <div className="card p-4 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent 22%), var(--card)" }}>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h3 className="font-semibold m-0">Activity (last 7 days)</h3>
              <span className="badge">Commits • Tasks • AI</span>
            </div>
            {data ? (
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  {data.daily.commits.map((v, i) => (
                    <div key={`c-${i}`} className="rounded-2xl p-3 bg-(--bg) border border-(--border)">
                      <div className="muted text-xs mb-2">Day {i + 1}</div>
                      <div className="text-lg font-semibold">{v}</div>
                      <div className="muted text-xs">commits</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-(--border) p-4 bg-(--bg)">
                  <div className="muted text-xs mb-2">Summary</div>
                  <div className="text-sm leading-7">Commits: {data.daily.commits.join(', ')} • Tasks: {data.daily.tasks.join(', ')} • AI: {data.daily.ai.join(', ')}</div>
                </div>
              </div>
            ) : <SkeletonCard />}
          </div>
        </div>
      </div>
    </div>
  );
}