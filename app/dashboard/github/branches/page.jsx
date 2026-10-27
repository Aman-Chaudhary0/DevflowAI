"use client";
import { useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { useGitHubResource } from "@/lib/use-github-resource";
import GitHubRepositoryPicker from "@/components/github-repository-picker";

export default function BranchesPage() {
  const [query, setQuery] = useState("");
  const { repositories, repository, setRepository, repositoryPage, setRepositoryPage, repositoryPagination, items, pagination, loading, loadingRepositories, error, retry, next, previous } = useGitHubResource("branches");
  const branches = Array.isArray(items) ? items.map((branch) => ({ id: `${repository}:${branch.name}`, name: branch.name, repo: repository, lastCommit: branch.commit?.sha?.slice(0, 7) || "Unknown", author: "—", updated: "—", protected: branch.protected, type: branch.name.split("/")[0], url: `https://github.com/${repository}/tree/${encodeURIComponent(branch.name)}` })) : items;

  const filtered = (branches || []).filter((b) => !query || `${b.name} ${b.repo} ${b.author}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Branches" subtitle="Browse, compare, and manage Git branches across your repositories.">
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" disabled title="Branch creation is not available in this read-only integration" type="button">New Branch</button>
          <button className="btn btn-ghost" onClick={retry} type="button">Refresh</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Branches" value={branches?.length ?? '—'} delta="tracked repos" trend="neutral" />
        <StatCard label="Protected" value={branches ? branches.filter((b) => b.protected).length : '—'} delta="safe lanes" trend="up" />
        <StatCard label="Feature" value={branches ? branches.filter((b) => b.type === 'feature').length : '—'} delta="active work" trend="up" />
        <StatCard label="Repository" value={repository.split("/").pop() || "—"} delta="selected" trend="neutral" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(34,197,94,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Branch explorer</h3>
            <p className="m-0 mt-1 muted text-sm">A cleaner, card-based overview with protected branch signals and quick compare actions.</p>
          </div>
          <GitHubRepositoryPicker repositories={repositories} value={repository} onChange={setRepository} pagination={repositoryPagination} onPrevious={() => setRepositoryPage((page) => Math.max(1, page - 1))} onNext={() => setRepositoryPage((page) => page + 1)} loading={loadingRepositories} />
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

        {error ? <div role="alert" className="card p-4">{error}<button className="btn btn-ghost ml-3" onClick={retry} type="button">Retry</button></div> : loading || loadingRepositories ? (
          <SkeletonCard />
        ) : !repository ? (
          <EmptyState title="Connect GitHub" description="Connect your GitHub account to browse branches." action="Connect GitHub" onAction={() => { window.location.href = api.github.connectUrl(); }} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No branches found" description="This repository has no branches on the current page." />
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
                    <a className="btn btn-ghost" href={b.url} target="_blank" rel="noreferrer">View</a>
                    <a className="btn btn-ghost" href={`https://github.com/${repository}/compare/${encodeURIComponent(b.name)}`} target="_blank" rel="noreferrer">Compare</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination && <div className="flex justify-between items-center mt-4"><span className="muted text-sm">Page {pagination.page}</span><div className="flex gap-2"><button className="btn btn-ghost" disabled={!pagination.hasPrevious || loading} onClick={previous}>Previous</button><button className="btn btn-ghost" disabled={!pagination.hasNext || loading} onClick={next}>Next</button></div></div>}
    </div>
  );
}
