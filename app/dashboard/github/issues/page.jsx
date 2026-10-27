"use client";
import { useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { useGitHubResource } from "@/lib/use-github-resource";
import GitHubRepositoryPicker from "@/components/github-repository-picker";

export default function IssuesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const { repositories, repository, setRepository, repositoryPage, setRepositoryPage, repositoryPagination, items: rawIssues, pagination, loading, loadingRepositories, error, retry, next, previous } = useGitHubResource("issues");
  const issues = Array.isArray(rawIssues) ? rawIssues.filter((issue) => !issue.pull_request) : rawIssues;

  const filtered = (issues || []).filter((i) => {
    const matchesQuery = !query || `${i.title} ${repository} ${(i.assignees || []).map((assignee) => assignee.login).join(" ")}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || i.state === status.toLowerCase();
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <PageHeader title="Issues" subtitle="Track bugs, feature requests, technical debt, and development tasks.">
        <button className="btn btn-primary" disabled title="Issue creation is not available in this read-only integration" type="button">New Issue</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Open" value={issues?.filter((i) => i.state === 'open').length ?? '—'} delta="current page" trend="neutral" />
        <StatCard label="Closed" value={issues?.filter((i) => i.state === 'closed').length ?? '—'} delta="current page" trend="neutral" />
        <StatCard label="Labeled" value={issues?.filter((i) => i.labels?.length).length ?? '—'} delta="current page" trend="neutral" />
        <StatCard label="Repository" value={repository.split('/').pop() || '—'} delta="selected" trend="neutral" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(245,158,11,0.06), transparent 22%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Issue inbox</h3>
            <p className="m-0 mt-1 muted text-sm">Search, filter, and open issues without losing the project context.</p>
          </div>
          <GitHubRepositoryPicker repositories={repositories} value={repository} onChange={setRepository} pagination={repositoryPagination} onPrevious={() => setRepositoryPage(repositoryPage - 1)} onNext={() => setRepositoryPage(repositoryPage + 1)} loading={loadingRepositories} />
        </div>

        <div className="grid grid-cols-[1.4fr_0.9fr] gap-3 mb-4">
          <div className="min-w-0">
            <input className="input w-full" placeholder="Search issues by title, repo, or assignee..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap justify-start lg:justify-end">
            {['All', 'Open', 'Closed'].map((s) => (
              <button key={s} className={`btn ${status===s ? 'btn-primary' : 'btn-ghost'}`} type="button" onClick={() => setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>

        {error ? <div role="alert" className="card p-4">{error}<button className="btn btn-ghost ml-3" onClick={retry} type="button">Retry</button></div> : loading || loadingRepositories ? (
          <SkeletonCard />
        ) : !repository ? (
          <EmptyState title="Connect GitHub" description="Connect your GitHub account to browse issues." action="Connect GitHub" onAction={() => { window.location.href = api.github.connectUrl(); }} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No issues found" description="No GitHub issues match the current repository and filters." />
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
                      <span className="badge">{it.state}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {it.labels.map((label) => <span key={label.id} className="badge">{label.name}</span>)}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Repository</div>
                        <div className="font-medium">{repository}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Assignee</div>
                        <div className="font-medium">{it.assignees?.map((assignee) => assignee.login).join(", ") || "Unassigned"}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Updated</div>
                        <div className="font-medium">{new Date(it.updated_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <a className="btn btn-ghost shrink-0" href={it.html_url} target="_blank" rel="noreferrer">Open</a>
                </div>
                <div className="mt-4 rounded-2xl border border-(--border) p-4 bg-(--bg) text-sm leading-7">
                  <div className="muted text-xs mb-2">Description</div>
                  {it.body || "No description provided."}
                </div>
              </div>
            ))}
          </div>
        )}
        {!error && pagination && <div className="flex justify-between items-center mt-4"><span className="muted text-sm">Page {pagination.page} · {pagination.perPage} per page</span><div className="flex gap-2"><button className="btn btn-ghost" disabled={!pagination.hasPrevious || loading} onClick={previous}>Previous</button><button className="btn btn-ghost" disabled={!pagination.hasNext || loading} onClick={next}>Next</button></div></div>}
      </div>
    </div>
  );
}
