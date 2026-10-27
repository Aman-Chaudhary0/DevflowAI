"use client";
import { PageHeader, EmptyState, SkeletonCard, StatCard } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { useGitHubResource } from "@/lib/use-github-resource";
import GitHubRepositoryPicker from "@/components/github-repository-picker";

export default function ReleasesPage() {
  const { repositories, repository, setRepository, repositoryPage, setRepositoryPage, repositoryPagination, items, pagination, loading, loadingRepositories, error, retry, next, previous } = useGitHubResource("releases");
  const releases = Array.isArray(items) ? items.map((release) => ({ id: release.id, title: release.name || release.tag_name, version: release.tag_name, status: release.draft ? "Draft" : release.prerelease ? "Pre-release" : "Published", repo: repository, date: release.published_at || release.created_at, author: release.author?.login || "Unknown", notes: release.body || "No release notes.", url: release.html_url })) : items;

  return (
    <div>
      <PageHeader title="Releases" subtitle="Track versions, release notes, tags, and deployment milestones.">
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-primary" disabled title="Release creation is not available in this read-only integration" type="button">New Release</button>
          <button className="btn btn-ghost" onClick={retry} type="button">Refresh</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Published" value={releases?.filter((r) => r.status === 'Published').length ?? '—'} delta="stable releases" trend="up" />
        <StatCard label="Latest" value={releases?.[0]?.version ?? '—'} delta={repository || "current tag"} trend="neutral" />
        <StatCard label="Release notes" value={releases ? releases.reduce((acc, r) => acc + (r.notes ? 1 : 0), 0) : '—'} delta="with notes" trend="up" />
        <StatCard label="Repository" value={repository.split("/").pop() || "—"} delta="selected" trend="neutral" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Release timeline</h3>
            <p className="m-0 mt-1 muted text-sm">Each release is presented as a clean card with structured notes and next actions.</p>
          </div>
          <GitHubRepositoryPicker repositories={repositories} value={repository} onChange={setRepository} pagination={repositoryPagination} onPrevious={() => setRepositoryPage((page) => Math.max(1, page - 1))} onNext={() => setRepositoryPage((page) => page + 1)} loading={loadingRepositories} />
        </div>

        {error ? <div role="alert" className="card p-4">{error}<button className="btn btn-ghost ml-3" onClick={retry} type="button">Retry</button></div> : loading || loadingRepositories ? (
          <SkeletonCard />
        ) : !repository ? (
          <EmptyState title="Connect GitHub" description="Connect your GitHub account to browse releases." action="Connect GitHub" onAction={() => { window.location.href = api.github.connectUrl(); }} />
        ) : releases.length === 0 ? (
          <EmptyState title="No releases" description="This repository has no GitHub releases on the current page." />
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
                    <a className="btn btn-ghost" href={r.url} target="_blank" rel="noreferrer">View</a>
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
                      <div className="flex items-center justify-between"><span>Tag</span><span className="badge">{r.version}</span></div>
                      <div className="flex items-center justify-between"><span>Published</span><span className="badge">{r.status}</span></div>
                      <div className="flex items-center justify-between"><span>Created by</span><span className="badge">{r.author}</span></div>
                    </div>
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
