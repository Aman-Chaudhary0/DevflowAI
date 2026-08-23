"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function ReleasesPage() {
  const [releases, setReleases] = useState(null);

  useEffect(() => { mockApi.github.releases().then(setReleases); }, []);

  function handleNewRelease() {
    toast('Open Create Release (mock)');
  }

  return (
    <div>
      <PageHeader title="Releases" subtitle="Track versions, release notes, tags, and deployment milestones.">
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={handleNewRelease} type="button">New Release</button>
          <button className="btn btn-ghost" onClick={() => mockApi.github.releases().then(setReleases)} type="button">Refresh</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Published" value={releases?.filter((r) => r.status === 'Published').length ?? '—'} delta="stable releases" trend="up" />
        <StatCard label="Latest" value={releases?.[0]?.version ?? '—'} delta="current tag" trend="neutral" />
        <StatCard label="Release notes" value={releases ? releases.reduce((acc, r) => acc + (r.notes ? 1 : 0), 0) : '—'} delta="with notes" trend="up" />
        <StatCard label="Publish flow" value="1-click" delta="draft → live" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Release timeline</h3>
            <p className="m-0 mt-1 muted text-sm">Each release is presented as a clean card with structured notes and next actions.</p>
          </div>
          <span className="badge">Draft → Publish</span>
        </div>

        {releases === null ? (
          <SkeletonCard />
        ) : releases.length === 0 ? (
          <EmptyState title="No releases" description="Create a release to publish changes." action="New Release" onAction={handleNewRelease} />
        ) : (
          <div className="grid gap-4">
            {releases.map((r) => (
              <div key={r.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{r.title}</div>
                      <span className="badge">{r.version}</span>
                      <span className="badge">{r.status}</span>
                    </div>
                    <div className="muted text-sm">{r.repo} • {r.date} • {r.author}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button className="btn btn-ghost" onClick={() => toast('View release')} type="button">View</button>
                    <button className="btn btn-outline" onClick={() => toast('Publish (mock)')} type="button">Publish</button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-[1.45fr_0.55fr] gap-3">
                  <div className="rounded-3xl border border-(--border) p-4 bg-(--bg)">
                    <div className="muted text-xs mb-2">Release notes</div>
                    <div className="text-sm leading-7 whitespace-pre-wrap">{r.notes}</div>
                  </div>
                  <div className="rounded-3xl border border-(--border) p-4 bg-(--bg)">
                    <div className="muted text-xs mb-2">Actions</div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between"><span>Draft review</span><span className="badge">Done</span></div>
                      <div className="flex items-center justify-between"><span>Tag validation</span><span className="badge">Ready</span></div>
                      <div className="flex items-center justify-between"><span>Publish</span><span className="badge">1 click</span></div>
                    </div>
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
