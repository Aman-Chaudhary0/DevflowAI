"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function IssuesPage() {
  const [issues, setIssues] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => { mockApi.github.issues().then(setIssues); }, []);

  const filtered = (issues || []).filter((i) => {
    const matchesQuery = !query || `${i.title} ${i.repo} ${i.assignee}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || i.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <PageHeader title="Issues" subtitle="Track bugs, feature requests, technical debt, and development tasks.">
        <button className="btn btn-primary" onClick={() => toast('New issue (mock)')} type="button">New Issue</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Open" value={issues?.filter((i) => i.status === 'Open').length ?? '—'} delta="needs triage" trend="neutral" />
        <StatCard label="In progress" value={issues?.filter((i) => i.status === 'In Progress').length ?? '—'} delta="active work" trend="up" />
        <StatCard label="Critical" value={issues?.filter((i) => i.priority === 'High').length ?? '—'} delta="priority items" trend="up" />
        <StatCard label="Updated" value="3h" delta="latest change" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(245,158,11,0.06), transparent 22%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Issue inbox</h3>
            <p className="m-0 mt-1 muted text-sm">Search, filter, and open issues without losing the project context.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="badge">Live sync</span>
            <span className="badge">AI analysis</span>
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_0.9fr] gap-3 mb-4">
          <div className="min-w-0">
            <input className="input w-full" placeholder="Search issues by title, repo, or assignee..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap justify-start lg:justify-end">
            {['All', 'Open', 'In Progress'].map((s) => (
              <button key={s} className={`btn ${status===s ? 'btn-primary' : 'btn-ghost'}`} type="button" onClick={() => setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>

        {issues === null ? (
          <SkeletonCard />
        ) : filtered.length === 0 ? (
          <EmptyState title="No issues found" description="Try a different search or create a new issue." action="New Issue" onAction={() => toast('New issue')} />
        ) : (
          <div className="grid gap-3">
            {filtered.map((it) => (
              <div key={it.number} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="badge">#{it.number}</span>
                      <div className="font-semibold text-[15px] leading-6">{it.title}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="badge">{it.status}</span>
                      <span className="badge">{it.priority}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {it.labels.map((label) => <span key={label} className="badge">{label}</span>)}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Repository</div>
                        <div className="font-medium">{it.repo}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Assignee</div>
                        <div className="font-medium">{it.assignee}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Updated</div>
                        <div className="font-medium">{it.updated}</div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost shrink-0" onClick={() => toast('Open issue')} type="button">Open</button>
                </div>
                <div className="mt-4 rounded-2xl border border-(--border) p-4 bg-(--bg) text-sm leading-7">
                  <div className="muted text-xs mb-2">Description</div>
                  {it.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
