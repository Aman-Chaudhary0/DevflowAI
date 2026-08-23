"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function AiHistoryPage() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    mockApi.ai.history().then(setItems);
  }, []);

  const filtered = (items || []).filter((it) => {
    const matchesFilter = filter === "All" || it.tool === filter;
    const matchesQuery = !query || `${it.title} ${it.tool} ${it.project}`.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div>
      <PageHeader title="AI History" subtitle="Search, revisit, and duplicate past AI sessions and generated outputs.">
        <div className="flex gap-2 flex-wrap">
          <span className="badge">Sessions</span>
          <span className="badge">Projects</span>
          <span className="badge">Artifacts</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Sessions" value={items?.length ?? "—"} delta="total records" trend="neutral" />
        <StatCard label="This week" value="18" delta="recent activity" trend="up" />
        <StatCard label="Openable" value="100%" delta="saved entries" trend="up" />
        <StatCard label="Time saved" value="14h" delta="from reuse" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.08), transparent 22%), var(--card)" }}>
        <div className="flex gap-3 flex-wrap items-center mb-4">
          <div className="flex-1 min-w-[260px]">
            <input className="input" placeholder="Search sessions, projects, or tools..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <button className="btn btn-ghost" type="button" onClick={() => toast("Filters saved", "success")}>Save view</button>
          <button className="btn btn-primary" type="button" onClick={() => toast("Open AI Hub to start", "info")}>New session</button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["All","Chat","Code Generator","Code Review","Documentation","Bug Fixer","Backend Generator"].map((f) => (
            <button key={f} className={`btn ${filter===f? 'btn-primary':'btn-ghost'}`} onClick={() => setFilter(f)} type="button">{f}</button>
          ))}
        </div>

        {items === null ? (
          <SkeletonCard />
        ) : filtered.length === 0 ? (
          <EmptyState title="No AI sessions found." description="Clear filters or start a new AI task." action="Start a task" onAction={() => toast('Open AI Hub to start', 'info')} />
        ) : (
          <div className="grid gap-3">
            {filtered.map((it) => (
              <div key={it.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{it.title}</div>
                      <span className="badge">{it.tool}</span>
                    </div>
                    <div className="muted text-sm">{it.project} • {new Date(it.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button className="btn btn-ghost" onClick={() => toast('Open (not implemented)')} type="button">Open</button>
                    <button className="btn btn-ghost" onClick={() => toast('Duplicate (mock)')} type="button">Duplicate</button>
                    <button className="btn btn-outline" onClick={() => toast('Delete (mock)')} type="button">Delete</button>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-(--border) p-3 bg-(--bg)">
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><div className="muted mb-1">Tool</div><div className="font-medium">{it.tool}</div></div>
                    <div><div className="muted mb-1">Project</div><div className="font-medium">{it.project}</div></div>
                    <div><div className="muted mb-1">Created</div><div className="font-medium">{new Date(it.createdAt).toLocaleDateString()}</div></div>
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
