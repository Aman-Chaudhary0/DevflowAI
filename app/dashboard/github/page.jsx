"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, GitBranch, GitCommit, GitMerge, GitPullRequest, Github, Plus, RefreshCw, Star } from "lucide-react";
import { PageHeader, StatCard, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const activityIcon = { commit: GitCommit, pr: GitPullRequest, merge: GitMerge };
const activityColor = { commit: "var(--info)", pr: "var(--success)", merge: "var(--purple)" };

export default function GithubPage() {
  const [syncing, setSyncing] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [connected, setConnected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const status = await api.github.status();
      setConnected(status.data);
      if (!status.data.connected) { setRepositories([]); setRecentActivity([]); return; }
      const response = await api.github.repositories({ page: 1, perPage: 30 });
      const repos = response.data.repositories.map((repo) => ({ ...repo, languageColor: "var(--primary)", openPRs: 0, lastCommit: "" }));
      const activity = [];
      for (const repo of repos.slice(0, 8)) {
        const [commits, pulls] = await Promise.all([
          api.github.resource(repo.owner, repo.name, "commits", { page: 1, perPage: 10 }),
          api.github.resource(repo.owner, repo.name, "pulls", { page: 1, perPage: 10 })
        ]);
        repo.openPRs = (pulls.data.pulls || []).filter((item) => item.state === "open").length;
        repo.lastCommit = commits.data.commits?.[0]?.commit?.author?.date ? new Date(commits.data.commits[0].commit.author.date).toLocaleString() : "";
        activity.push(...(commits.data.commits || []).map((item) => ({ type: "commit", message: item.commit.message.split("\n")[0], repo: repo.name, author: item.author?.login || item.commit.author?.name || "Unknown", time: item.commit.author?.date || "" })));
        activity.push(...(pulls.data.pulls || []).map((item) => ({ type: item.merged_at ? "merge" : "pr", message: `#${item.number} ${item.title}`, repo: repo.name, author: item.user?.login || "Unknown", time: item.updated_at })));
      }
      setRepositories(repos);
      setRecentActivity(activity.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8));
      setError("");
    } catch (requestError) { setError(requestError.message); setRepositories([]); setRecentActivity([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true);
    try { const result = await api.github.sync(); toast(`Synchronized ${result.data.repositoryCount} repositories`, "success"); await load(); }
    catch (requestError) { setError(requestError.message); toast(requestError.message, "error"); }
    finally { setSyncing(false); }
  }

  async function handleDisconnect() {
    try { await api.github.disconnect(); toast("GitHub disconnected", "success"); await load(); }
    catch (requestError) { setError(requestError.message); toast(requestError.message, "error"); }
  }

  return (
    <>
      <PageHeader title="GitHub" subtitle="Connected repositories and activity">
        {connected?.connected ? <button className="btn btn-outline" onClick={handleSync} disabled={syncing} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <RefreshCw size={15} style={{ animation: syncing ? "spin 800ms linear infinite" : "none" }} />
          {syncing ? "Syncing..." : "Sync"}
        </button> : <a className="btn btn-primary" href={api.github.connectUrl()}>Connect GitHub</a>}
        {connected?.connected && <button className="btn btn-ghost" onClick={handleDisconnect} disabled={syncing} type="button">Disconnect</button>}
        <Link className="btn btn-primary" href="/dashboard/github/repositories" style={{ minHeight: 38, fontSize: 13 }}>
          <Github size={15} /> View All Repos
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="dash-grid-3">
        <StatCard label="Repositories" value={loading ? "—" : repositories.length} delta="accessible on this page" trend="neutral" icon={Github} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)" />
        <StatCard label="Open Pull Requests" value={repositories.reduce((sum, repo) => sum + repo.openPRs, 0)} delta="from loaded repositories" trend="neutral" icon={GitPullRequest} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" />
        <StatCard label="Recent Commits" value={recentActivity.filter((item) => item.type === "commit").length} delta="latest fetched activity" trend="neutral" icon={GitCommit} iconBg="color-mix(in srgb, var(--info) 15%, transparent)" />
      </div>

      {/* Quick Nav */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Repositories", href: "/dashboard/github/repositories", icon: Github, color: "var(--primary)" },
          { label: "Pull Requests", href: "/dashboard/github/pull-requests", icon: GitPullRequest, color: "var(--success)" },
          { label: "Commit History", href: "/dashboard/github/commits", icon: GitCommit, color: "var(--info)" }
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", border: "1px solid var(--border)", borderRadius: 14, background: "color-mix(in srgb, var(--card) 92%, transparent)", textDecoration: "none", color: "inherit", fontWeight: 600, fontSize: 14, flex: 1, minWidth: 160, transition: "all 150ms ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center", color }}>
              <Icon size={18} />
            </div>
            {label}
          </Link>
        ))}
      </div>

      <div className="dash-grid-2">
        {/* Repositories */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Repositories</p>
            <Link href="/dashboard/github/repositories" className="muted" style={{ fontSize: 13, fontWeight: 600 }}>View all</Link>
          </div>
          {loading ? <p className="muted">Loading repositories…</p> : error ? <div role="alert">{error}<button className="btn btn-ghost ml-2" type="button" onClick={load}>Retry</button></div> : repositories.length === 0 ? <p className="muted">No accessible repositories. <a href={api.github.connectUrl()}>Connect GitHub</a></p> : repositories.slice(0, 5).map((repo) => (
            <Link key={repo.id} href={`/dashboard/github/repositories/${repo.id}`} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 12%, transparent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Github size={18} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{repo.name}</p>
                  <span className="badge" style={{ padding: "1px 6px", fontSize: 10 }}>{repo.visibility}</span>
                </div>
                <p className="muted" style={{ margin: "0 0 6px", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repo.description}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: repo.languageColor, display: "inline-block" }} />
                    {repo.language}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}><Star size={11} /> {repo.stars}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted)" }}><GitBranch size={11} /> {repo.openPRs} PRs</span>
                  <span style={{ fontSize: 11, color: "var(--soft)" }}>{repo.lastCommit}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Activity</p>
            <Activity size={16} color="var(--muted)" />
          </div>
          <div className="timeline">
            {!loading && !error && recentActivity.length === 0 ? <p className="muted">No recent activity available.</p> : recentActivity.map((a, i) => {
              const Icon = activityIcon[a.type] || GitCommit;
              const color = activityColor[a.type] || "var(--primary)";
              return (
                <div className="timeline-item" key={i}>
                  <div className="timeline-dot" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{a.message}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span className="muted" style={{ fontSize: 11 }}>{a.repo}</span>
                      <span style={{ fontSize: 11, color: "var(--soft)" }}>by {a.author} · {a.time ? new Date(a.time).toLocaleString() : ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
