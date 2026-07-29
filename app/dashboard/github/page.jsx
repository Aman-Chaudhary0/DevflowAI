"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, GitBranch, GitCommit, GitMerge, GitPullRequest, Github, Plus, RefreshCw, Star } from "lucide-react";
import { MiniBarChart, PageHeader, ProgressBar, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";

const mockRepos = [
  { id: "r1", name: "devflow-ai", fullName: "aman/devflow-ai", description: "AI-powered developer workspace", stars: 128, forks: 34, language: "JavaScript", languageColor: "#f59e0b", visibility: "private", defaultBranch: "main", openPRs: 3, lastCommit: "2 hours ago", status: "active" },
  { id: "r2", name: "ecommerce-platform", fullName: "aman/ecommerce-platform", description: "Full-stack e-commerce solution", stars: 64, forks: 12, language: "TypeScript", languageColor: "#3b82f6", visibility: "private", defaultBranch: "main", openPRs: 1, lastCommit: "1 day ago", status: "active" },
  { id: "r3", name: "mobile-banking", fullName: "aman/mobile-banking", description: "Secure mobile banking app", stars: 32, forks: 8, language: "React Native", languageColor: "#06b6d4", visibility: "team", defaultBranch: "develop", openPRs: 2, lastCommit: "3 days ago", status: "active" },
  { id: "r4", name: "analytics-dashboard", fullName: "aman/analytics-dashboard", description: "Real-time analytics platform", stars: 256, forks: 67, language: "Vue.js", languageColor: "#22c55e", visibility: "public", defaultBranch: "main", openPRs: 0, lastCommit: "30 min ago", status: "active" }
];

const recentActivity = [
  { type: "commit", message: "feat: add JWT authentication", repo: "devflow-ai", author: "Aman", time: "2h ago" },
  { type: "pr", message: "PR #42 opened: Implement refresh tokens", repo: "devflow-ai", author: "Rahul", time: "3h ago" },
  { type: "merge", message: "PR #40 merged: Update API docs", repo: "devflow-ai", author: "Aman", time: "5h ago" },
  { type: "commit", message: "fix: resolve memory leak", repo: "ecommerce-platform", author: "Priya", time: "1d ago" },
  { type: "pr", message: "PR #41 opened: Fix WebSocket handler", repo: "devflow-ai", author: "Priya", time: "1d ago" }
];

const activityIcon = { commit: GitCommit, pr: GitPullRequest, merge: GitMerge };
const activityColor = { commit: "var(--info)", pr: "var(--success)", merge: "var(--purple)" };

export default function GithubPage() {
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSyncing(false);
    toast("Repositories synced", "success");
  }

  return (
    <>
      <PageHeader title="GitHub" subtitle="Connected repositories and activity">
        <button className="btn btn-outline" onClick={handleSync} disabled={syncing} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <RefreshCw size={15} style={{ animation: syncing ? "spin 800ms linear infinite" : "none" }} />
          {syncing ? "Syncing..." : "Sync"}
        </button>
        <Link className="btn btn-primary" href="/dashboard/github/repositories" style={{ minHeight: 38, fontSize: 13 }}>
          <Github size={15} /> View All Repos
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="dash-grid-3">
        <StatCard label="Repositories" value={mockRepos.length} delta="+1 this month" trend="up" icon={Github} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)">
          <MiniBarChart data={[2, 3, 3, 4, 4, 4, 4]} color="var(--primary)" height={36} />
        </StatCard>
        <StatCard label="Open Pull Requests" value={mockRepos.reduce((s, r) => s + r.openPRs, 0)} delta="2 need review" trend="neutral" icon={GitPullRequest} iconBg="color-mix(in srgb, var(--success) 15%, transparent)">
          <MiniBarChart data={[1, 3, 2, 4, 3, 5, 6]} color="var(--success)" height={36} />
        </StatCard>
        <StatCard label="Commits This Week" value={28} delta="+12% vs last week" trend="up" icon={GitCommit} iconBg="color-mix(in srgb, var(--info) 15%, transparent)">
          <MiniBarChart data={[4, 6, 3, 7, 5, 8, 5]} color="var(--info)" height={36} />
        </StatCard>
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
          {mockRepos.map((repo) => (
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
            {recentActivity.map((a, i) => {
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
                      <span style={{ fontSize: 11, color: "var(--soft)" }}>by {a.author} · {a.time}</span>
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
