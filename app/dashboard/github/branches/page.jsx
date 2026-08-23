"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge, toast, ConfirmDialog } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function BranchesPage() {
  const [branches, setBranches] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => { mockApi.github.branches().then(setBranches); }, []);

  const filtered = (branches || []).filter((b) => !query || `${b.name} ${b.repo} ${b.author}`.toLowerCase().includes(query.toLowerCase()));

  function handleCreate() {
    setCreating(true);
    setTimeout(() => {
      setBranches((prev) => [{ id: 'b' + Date.now(), name: 'feature/new-branch', repo: 'devflow-ai', lastCommit: 'New branch', author: 'You', updated: 'now', protected: false, type: 'feature' }, ...(prev || [])]);
      setCreating(false);
      toast('Branch created successfully');
    }, 900);
  }

  function handleDelete(b) { setToDelete(b); setShowConfirm(true); }
  function confirmDelete() {
    setBranches((prev) => prev.filter((x) => x !== toDelete));
    setShowConfirm(false);
    toast('Branch deleted');
  }

  return (
    <div>
      <PageHeader title="Branches" subtitle="Browse, compare, and manage Git branches across your repositories.">
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating} type="button">{creating ? 'Creating...' : 'New Branch'}</button>
          <button className="btn btn-ghost" onClick={() => mockApi.github.branches().then(setBranches)} type="button">Refresh</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Branches" value={branches?.length ?? '—'} delta="tracked repos" trend="neutral" />
        <StatCard label="Protected" value={branches ? branches.filter((b) => b.protected).length : '—'} delta="safe lanes" trend="up" />
        <StatCard label="Feature" value={branches ? branches.filter((b) => b.type === 'feature').length : '—'} delta="active work" trend="up" />
        <StatCard label="Updated" value="2m" delta="latest change" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(34,197,94,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Branch explorer</h3>
            <p className="m-0 mt-1 muted text-sm">A cleaner, card-based overview with protected branch signals and quick compare actions.</p>
          </div>
          <button className="btn btn-ghost" type="button" onClick={() => toast('Compare view opened', 'info')}>Compare selected</button>
        </div>

        <div className="grid grid-cols-[1.35fr_auto] gap-3 mb-4">
          <div className="min-w-0">
            <input className="input w-full" placeholder="Search branch, repo, or author..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="badge">Protected lanes</span>
            <span className="badge">Feature work</span>
          </div>
        </div>

        {branches === null ? (
          <SkeletonCard />
        ) : filtered.length === 0 ? (
          <EmptyState title="No branches found" description="Create a new branch to get started." action="Create branch" onAction={handleCreate} />
        ) : (
          <div className="grid gap-3">
            {filtered.map((b) => (
              <div key={b.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="badge">{b.repo}</span>
                      <div className="font-semibold text-[15px]">{b.name}</div>
                      <StatusBadge status={b.protected ? 'success' : 'info'} />
                    </div>
                    <div className="muted text-sm">Last commit: {b.lastCommit}</div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Author</div>
                        <div className="font-medium text-sm">{b.author}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Updated</div>
                        <div className="font-medium text-sm">{b.updated}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Type</div>
                        <div className="font-medium text-sm capitalize">{b.type}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button className="btn btn-ghost" onClick={() => toast('View (mock)')} type="button">View</button>
                    <button className="btn btn-ghost" onClick={() => toast('Compare (mock)')} type="button">Compare</button>
                    {!b.protected && <button className="btn btn-outline" onClick={() => handleDelete(b)} type="button">Delete</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={showConfirm} title="Delete branch" description={`Delete branch ${toDelete?.name}? This cannot be undone.`} onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)} confirmLabel="Delete" danger />
    </div>
  );
}
