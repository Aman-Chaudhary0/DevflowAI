"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Code2,
  FileDiff,
  GitPullRequest,
  MessageSquare,
  Shield,
  XCircle,
  X
} from "lucide-react";
import { Avatar, EmptyState, FilterBar, PageHeader, StatusBadge, toast } from "@/components/dashboard-ui";
import { useGitHubResource } from "@/lib/use-github-resource";
import GitHubRepositoryPicker from "@/components/github-repository-picker";
import { api } from "@/lib/api";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Merged", value: "merged" },
  { label: "Closed", value: "closed" }
];

export default function PullRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const { repositories, repository, setRepository, repositoryPage, setRepositoryPage, repositoryPagination, items, pagination, loading, loadingRepositories, error, retry, next, previous } = useGitHubResource("pulls");
  const pullRequests = (items || []).map((item) => ({ ...item, id: item.id, author: { name: item.user?.login || "Unknown", avatar: "var(--primary)" }, status: item.merged_at ? "merged" : item.state, reviewers: [], commits: "—", filesChanged: "—", labels: (item.labels || []).map((label) => label.name), createdAt: item.created_at, branch: item.head?.ref, baseBranch: item.base?.ref, description: item.body || "No description provided.", additions: "—", deletions: "—" }));
  const labelOptions = [...new Set(pullRequests.flatMap((pr) => pr.labels))];

  const filteredPRs = pullRequests.filter((pr) => {
    const matchesSearch = pr.title.toLowerCase().includes(search.toLowerCase()) || pr.author.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
    const matchesLabels = selectedLabels.length === 0 || selectedLabels.some((l) => pr.labels.includes(l));
    return matchesSearch && matchesStatus && matchesLabels;
  });


  const getReviewerStatus = (status) => {
    switch (status) {
      case "approved": return { label: "Approved", class: "status-success" };
      case "changes_requested": return { label: "Changes Req.", class: "status-danger" };
      default: return { label: "Pending", class: "status-warning" };
    }
  };

  const toggleLabel = (label) => {
    setSelectedLabels((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Pull Requests">
        <button className="btn btn-primary" disabled title="Pull request creation is not available in this read-only integration" style={{ minHeight: 38, fontSize: 13 }} type="button">
          <GitPullRequest size={15} /> New Pull Request
        </button>
      </PageHeader>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <GitHubRepositoryPicker repositories={repositories} value={repository} onChange={setRepository} pagination={repositoryPagination} onPrevious={() => setRepositoryPage((page) => Math.max(1, page - 1))} onNext={() => setRepositoryPage((page) => page + 1)} loading={loadingRepositories} />
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <MessageSquare size={16} color="var(--muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pull requests..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text)" }}
          />
        </div>
        <FilterBar filters={statusFilters} active={statusFilter} onChange={setStatusFilter} />
        <div style={{ position: "relative" }}>
          <button className="btn btn-outline" onClick={() => setShowLabelsMenu((m) => !m)} style={{ minHeight: 38, fontSize: 13 }} type="button">
            <Code2 size={15} /> Labels
          </button>
          {showLabelsMenu && (
            <div style={{ position: "absolute", right: 0, top: 52, width: 200, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", zIndex: 50, padding: 8 }}>
              {labelOptions.map((label) => (
                <button key={label} onClick={() => toggleLabel(label)} style={{ width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: selectedLabels.includes(label) ? "var(--primary)" : "var(--text)", borderRadius: 8, fontSize: 13, fontWeight: 600 }} type="button">
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {error ? <div role="alert" className="card p-4">{error}<button className="btn btn-ghost ml-2" onClick={retry} type="button">Retry</button></div> : loading || loadingRepositories ? <div role="status" className="card p-4">Loading pull requests…</div> : !repository ? <EmptyState title="Connect GitHub" description="Connect GitHub to browse pull requests." action="Connect GitHub" onAction={() => { window.location.href = api.github.connectUrl(); }} /> : filteredPRs.length === 0 ? (
          <EmptyState icon={GitPullRequest} title="No pull requests found" description="Try adjusting your search or filters" />
        ) : (
          filteredPRs.map((pr) => (
            <div
              key={pr.id}
              className="card card-pad"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedPR(selectedPR?.id === pr.id ? null : pr)}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ marginTop: 3 }}>
                  {pr.status === "open" ? (
                    <GitPullRequest size={20} color="var(--success)" />
                  ) : pr.status === "merged" ? (
                    <CheckCircle2 size={20} color="var(--purple)" />
                  ) : (
                    <XCircle size={20} color="var(--danger)" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{pr.title}</h3>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>#{pr.number}</span>
                  </div>
                  <p className="muted" style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5 }}>{pr.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar name={pr.author.name} size={24} color="var(--primary)" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{pr.author.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {pr.reviewers.map((r) => {
                        const s = getReviewerStatus(r.status);
                        return (
                          <span key={r.name} className={`status ${s.class}`} style={{ fontSize: 10 }}>
                            {r.name.split(" ")[0]}
                          </span>
                        );
                      })}
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                      <Clock size={12} /> {new Date(pr.createdAt).toLocaleDateString()}
                    </span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Commits: {pr.commits}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      <FileDiff size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {pr.filesChanged} files
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {pr.labels.map((l) => (
                        <span key={l} style={{ padding: "2px 8px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{l}</span>
                      ))}
                    </div>
                  </div>

                  {selectedPR?.id === pr.id && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <a className="btn btn-outline" href={`${pr.html_url}/files`} target="_blank" rel="noreferrer" style={{ minHeight: 34, fontSize: 13 }}>
                          <FileDiff size={14} /> Files Changed ({pr.filesChanged})
                        </a>
                        <a className="btn btn-outline" href={`${pr.html_url}#issuecomment-new`} target="_blank" rel="noreferrer" style={{ minHeight: 34, fontSize: 13 }}><MessageSquare size={14} /> Open comments</a>
                        <a className="btn btn-primary" href={pr.html_url} target="_blank" rel="noreferrer" style={{ minHeight: 34, fontSize: 13, background: "var(--purple)" }}>Open on GitHub</a>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Shield size={14} color="var(--info)" />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Merge Status</span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span className="status status-muted" style={{ fontSize: 11 }}>CI and review checks are not loaded</span>
                          </div>
                        </div>

                        <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--border)" }}>
                          <p className="muted" style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Changes Summary</p>
                          <div style={{ display: "flex", gap: 16 }}>
                            <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 700 }}>+{pr.additions}</span>
                            <span style={{ color: "var(--danger)", fontSize: 13, fontWeight: 700 }}>-{pr.deletions}</span>
                            <span style={{ color: "var(--muted)", fontSize: 13 }}>{pr.filesChanged} files</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Timeline</p>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <Avatar name={pr.author.name} size={24} />
                            <div><span style={{ fontSize: 12, fontWeight: 600 }}>{pr.author.name}</span><span className="muted" style={{ fontSize: 12 }}> opened this pull request</span><p className="muted" style={{ margin: "2px 0 0", fontSize: 11 }}>{new Date(pr.createdAt).toLocaleString()}</p></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {pagination && <div className="flex justify-between items-center"><span className="muted text-sm">Page {pagination.page} · {pagination.perPage} per page</span><div className="flex gap-2"><button className="btn btn-ghost" disabled={!pagination.hasPrevious || loading} onClick={previous}>Previous</button><button className="btn btn-ghost" disabled={!pagination.hasNext || loading} onClick={next}>Next</button></div></div>}
    </div>
  );
}
