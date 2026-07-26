"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Download,
  FileDiff,
  GitCommit,
  LineChart,
  Plus,
  Search,
  User,
  X
} from "lucide-react";
import { toast } from "@/components/dashboard-ui";
import { Avatar } from "@/components/dashboard-ui";

const mockCommits = [
  { hash: "a1b2c3d", shortHash: "a1b2c3d", message: "feat: implement JWT authentication with refresh tokens", author: { name: "Rahul Singh", avatar: "#8b5cf6" }, branch: "main", time: "2 hours ago", date: "2026-07-26", files: 12, additions: 342, deletions: 89 },
  { hash: "e4f5g6h", shortHash: "e4f5g6h", message: "fix: resolve memory leak in WebSocket handler", author: { name: "Priya Sharma", avatar: "#ec4899" }, branch: "main", time: "5 hours ago", date: "2026-07-26", files: 5, additions: 45, deletions: 128 },
  { hash: "i7j8k9l", shortHash: "i7j8k9l", message: "docs: update API documentation for v2 endpoints", author: { name: "Aman Chaudhary", avatar: "#3b82f6" }, branch: "develop", time: "8 hours ago", date: "2026-07-26", files: 8, additions: 210, deletions: 34 },
  { hash: "m0n1o2p", shortHash: "m0n1o2p", message: "refactor: migrate dashboard components to Tailwind v4", author: { name: "Neha Gupta", avatar: "#f59e0b" }, branch: "feature/tailwind", time: "1 day ago", date: "2026-07-25", files: 32, additions: 1205, deletions: 890 },
  { hash: "q3r4s5t", shortHash: "q3r4s5t", message: "chore: update dependencies and lockfile", author: { name: "Arjun Mehta", avatar: "#06b6d4" }, branch: "develop", time: "1 day ago", date: "2026-07-25", files: 3, additions: 12, deletions: 8 },
  { hash: "u6v7w8x", shortHash: "u6v7w8x", message: "feat: add real-time notifications with Socket.io", author: { name: "Rahul Singh", avatar: "#8b5cf6" }, branch: "feature/notifications", time: "2 days ago", date: "2026-07-24", files: 8, additions: 567, deletions: 42 },
  { hash: "y9z0a1b", shortHash: "y9z0a1b", message: "fix: correct email validation regex pattern", author: { name: "Priya Sharma", avatar: "#ec4899" }, branch: "main", time: "3 days ago", date: "2026-07-23", files: 2, additions: 8, deletions: 2 },
  { hash: "c2d3e4f", shortHash: "c2d3e4f", message: "style: improve responsive layout for mobile devices", author: { name: "Neha Gupta", avatar: "#f59e0b" }, branch: "develop", time: "4 days ago", date: "2026-07-22", files: 6, additions: 156, deletions: 89 }
];

const mockDiffs = [
  { type: "added", content: "const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });" },
  { type: "removed", content: "const session = await Session.create({ userId, data });" },
  { type: "modified", content: "- const tokens = Math.floor(Math.random() * 1000)\n+ const tokens = generatedTokens" }
];

const authorOptions = ["All Authors", ...Array.from(new Set(mockCommits.map((c) => c.author.name)))];
const branchOptions = ["All Branches", ...Array.from(new Set(mockCommits.map((c) => c.branch)))];
const sortOptions = ["Newest", "Oldest", "Most Changes", "Author"];

export default function CommitHistoryPage() {
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("All Authors");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  const filtered = mockCommits.filter((commit) => {
    const matchesSearch = commit.message.toLowerCase().includes(search.toLowerCase()) || commit.hash.toLowerCase().includes(search.toLowerCase());
    const matchesAuthor = authorFilter === "All Authors" || commit.author.name === authorFilter;
    const matchesBranch = branchFilter === "All Branches" || commit.branch === branchFilter;
    return matchesSearch && matchesAuthor && matchesBranch;
  });

  const stats = {
    today: filtered.filter((c) => c.date === "2026-07-26").length,
    thisWeek: filtered.filter((c) => ["2026-07-26", "2026-07-25", "2026-07-24", "2026-07-23", "2026-07-22"].includes(c.date)).length,
    avgSize: Math.round(filtered.reduce((sum, c) => sum + c.files, 0) / (filtered.length || 1))
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Commit History">
        <button className="btn btn-outline" onClick={() => toast("Exporting commits...", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
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
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk" }}>{stats.avgSize}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
        {filtered.map((commit, i) => (
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
              <FileDiff size={13} /> Diff
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
          <div style={{ display: "grid", gap: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
            {mockDiffs.map((line, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "8px 12px", borderRadius: 8,
                background: line.type === "added" ? "color-mix(in srgb, var(--success) 10%, transparent)" :
                  line.type === "removed" ? "color-mix(in srgb, var(--danger) 10%, transparent)" :
                    "color-mix(in srgb, var(--warning) 10%, transparent)",
              }}>
                <span style={{
                  minWidth: 50, color: line.type === "added" ? "var(--success)" : line.type === "removed" ? "var(--danger)" : "var(--warning)",
                  fontWeight: 700, textTransform: "capitalize"
                }}>
                  {line.type === "added" ? "+ Add" : line.type === "removed" ? "- Rem" : "~ Mod"}
                </span>
                <span style={{ color: "var(--text)", whiteSpace: "pre-wrap" }}>{line.content}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={() => toast("File opened", "info")} style={{ minHeight: 34, fontSize: 13 }} type="button">
              <Plus size={14} /> View Full File
            </button>
            <button className="btn btn-outline" onClick={() => toast("Copied to clipboard", "success")} style={{ minHeight: 34, fontSize: 13 }} type="button">
              Copy Diff
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
