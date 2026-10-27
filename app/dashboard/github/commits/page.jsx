"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Download,
  FileDiff,
  GitCommit,
  LineChart,
  Search,
  User,
  X
} from "lucide-react";
import { Avatar, EmptyState, PageHeader } from "@/components/dashboard-ui";
import { useGitHubResource } from "@/lib/use-github-resource";
import GitHubRepositoryPicker from "@/components/github-repository-picker";
import { api } from "@/lib/api";

const sortOptions = ["Newest", "Oldest", "Author"];

export default function CommitHistoryPage() {
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("All Authors");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const { repositories, repository, setRepository, repositoryPage, setRepositoryPage, repositoryPagination, items, pagination, loading, loadingRepositories, error, retry, next, previous, selectedRepository } = useGitHubResource("commits");
  const commits = (items || []).map((item) => ({ hash: item.sha, shortHash: item.sha.slice(0, 7), message: item.commit.message.split("\n")[0], author: { name: item.author?.login || item.commit.author?.name || "Unknown", avatar: "var(--primary)" }, branch: selectedRepository?.defaultBranch || "default branch", time: item.commit.author?.date ? new Date(item.commit.author.date).toLocaleString() : "", date: item.commit.author?.date?.slice(0, 10) || "", files: "—", additions: "—", deletions: "—", url: item.html_url }));
  const authorOptions = ["All Authors", ...new Set(commits.map((commit) => commit.author.name))];
  const branchOptions = ["All Branches", ...new Set(commits.map((commit) => commit.branch))];

  const matching = commits.filter((commit) => {
    const matchesSearch = commit.message.toLowerCase().includes(search.toLowerCase()) || commit.hash.toLowerCase().includes(search.toLowerCase());
    const matchesAuthor = authorFilter === "All Authors" || commit.author.name === authorFilter;
    const matchesBranch = branchFilter === "All Branches" || commit.branch === branchFilter;
    return matchesSearch && matchesAuthor && matchesBranch;
  });
  const filtered = [...matching].sort((a, b) => sortBy === "Oldest" ? new Date(a.date) - new Date(b.date) : sortBy === "Author" ? a.author.name.localeCompare(b.author.name) : new Date(b.date) - new Date(a.date));

  const currentDate = new Date();
  const weekStart = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const stats = { today: filtered.filter((commit) => commit.date === currentDate.toISOString().slice(0, 10)).length, thisWeek: filtered.filter((commit) => commit.date && new Date(commit.date) >= weekStart).length, avgSize: "—" };

  const handleExport = () => {
    const csv = ["sha,message,author,date", ...filtered.map((commit) => [commit.hash, commit.message, commit.author.name, commit.date].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = url; link.download = "github-commits.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Commit History">
        <button className="btn btn-outline" onClick={handleExport} disabled={!filtered.length} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <Download size={15} /> Export
        </button>
      </PageHeader>

      {/* Statistics */}
      <div className="dash-grid-3">
        <div className="stat-card" style={{ gap: 8 }}>
          <p className="stat-label">Commits Today</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk" }}>{stats.today}</p>
        </div>
        <div className="stat-card" style={{ gap: 8 }}>
          <p className="stat-label">Commits This Week</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk" }}>{stats.thisWeek}</p>
        </div>
        <div className="stat-card" style={{ gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LineChart size={16} color="var(--primary)" />
            <span className="stat-label">Avg Files / Commit</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk" }}>—</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <GitHubRepositoryPicker repositories={repositories} value={repository} onChange={setRepository} pagination={repositoryPagination} onPrevious={() => setRepositoryPage((page) => Math.max(1, page - 1))} onNext={() => setRepositoryPage((page) => page + 1)} loading={loadingRepositories} />
        <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <Search size={16} color="var(--muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commits..."
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text)" }}
          />
        </div>
        <div style={{ position: "relative" }}>
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} style={{ padding: "10px 32px 10px 14px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", appearance: "none" }}>
            {authorOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ padding: "10px 32px 10px 14px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", appearance: "none" }}>
            {branchOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px 32px 10px 14px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer", appearance: "none" }}>
            {sortOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
        </div>
      </div>

      {/* Commit Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {error ? <div role="alert" className="card p-4">{error}<button className="btn btn-ghost ml-2" onClick={retry} type="button">Retry</button></div> : loading || loadingRepositories ? <div role="status" className="card p-4">Loading commits…</div> : !repository ? <EmptyState title="Connect GitHub" description="Connect GitHub to browse commits." action="Connect GitHub" onAction={() => { window.location.href = api.github.connectUrl(); }} /> : filtered.length === 0 ? <EmptyState title="No commits found" description="No commits match this repository and the current filters." /> : filtered.map((commit, i) => (
          <div
            key={commit.hash}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              padding: "16px 20px",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "var(--card)",
              cursor: "pointer",
              transition: "border-color 150ms ease",
              borderLeft: selectedCommit?.hash === commit.hash ? "3px solid var(--primary)" : undefined
            }}
            onClick={() => { if (selectedCommit?.hash === commit.hash) { setSelectedCommit(null); setShowDiff(false); } else { setSelectedCommit(commit); setShowDiff(false); } }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "color-mix(in srgb, var(--info) 15%, transparent)",
              display: "grid", placeItems: "center", flexShrink: 0
            }}>
              <GitCommit size={18} color="var(--info)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{commit.hash}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{commit.time}</span>
                <span style={{ padding: "2px 8px", background: "var(--bg-soft)", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>{commit.branch}</span>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{commit.message}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Avatar name={commit.author.name} size={24} color={commit.author.avatar} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{commit.author.name}</span>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                  <Clock size={12} /> {commit.time}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                  <FileDiff size={12} /> {commit.files} files
                </span>
                <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>+{commit.additions}</span>
                <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>-{commit.deletions}</span>
              </div>
            </div>
              <button
              onClick={(e) => { e.stopPropagation(); setSelectedCommit(commit); setShowDiff(true); }}
              style={{
                padding: "6px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 8,
                cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, flexShrink: 0
              }}
              type="button"
            >
              <FileDiff size={13} /> Details
            </button>
          </div>
        ))}
      </div>

      {/* Diff Viewer */}
      {showDiff && selectedCommit && (
        <div className="card card-pad" style={{ gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>Diff: {selectedCommit.hash}</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>{selectedCommit.message}</p>
            </div>
            <button onClick={() => setShowDiff(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button">
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "grid", gap: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}><p>{selectedCommit.author.name} · {selectedCommit.date}</p><a href={selectedCommit.url} target="_blank" rel="noreferrer">View the complete commit and diff on GitHub</a><p className="muted">File and line-change statistics are not included in this commit list response.</p></div>
          <div style={{ display: "flex", gap: 8 }}>
            <a className="btn btn-outline" href={selectedCommit.url} target="_blank" rel="noreferrer" style={{ minHeight: 34, fontSize: 13 }}>View commit</a>
            <button className="btn btn-outline" onClick={async () => { try { await navigator.clipboard.writeText(selectedCommit.hash); } catch { /* Clipboard access can be unavailable outside secure contexts. */ } }} style={{ minHeight: 34, fontSize: 13 }} type="button">Copy SHA</button>
          </div>
        </div>
      )}
      {pagination && <div className="flex justify-between items-center"><span className="muted text-sm">Page {pagination.page} · {pagination.perPage} per page</span><div className="flex gap-2"><button className="btn btn-ghost" disabled={!pagination.hasPrevious || loading} onClick={previous}>Previous</button><button className="btn btn-ghost" disabled={!pagination.hasNext || loading} onClick={next}>Next</button></div></div>}
    </div>
  );
}
