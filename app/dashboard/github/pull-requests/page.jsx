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
  Sparkles,
  XCircle,
  X
} from "lucide-react";
import { Avatar, EmptyState, FilterBar, PageHeader, StatusBadge, toast } from "@/components/dashboard-ui";

const mockPRs = [
  {
    id: "pr1",
    number: 42,
    title: "feat: implement JWT authentication with refresh tokens",
    author: { name: "Rahul Singh", avatar: "#8b5cf6" },
    reviewers: [
      { name: "Aman Chaudhary", avatar: "#3b82f6", status: "approved" },
      { name: "Priya Sharma", avatar: "#ec4899", status: "pending" }
    ],
    status: "open",
    commits: 7,
    filesChanged: 12,
    additions: 342,
    deletions: 89,
    labels: ["enhancement", "security"],
    createdAt: "2026-07-25T14:00:00Z",
    branch: "fix/login-bug",
    baseBranch: "main",
    description: "Adds JWT-based authentication with httpOnly cookies and refresh token rotation."
  },
  {
    id: "pr2",
    number: 41,
    title: "fix: resolve memory leak in WebSocket connection handler",
    author: { name: "Priya Sharma", avatar: "#ec4899" },
    reviewers: [
      { name: "Rahul Singh", avatar: "#8b5cf6", status: "approved" },
      { name: "Arjun Mehta", avatar: "#06b6d4", status: "approved" }
    ],
    status: "open",
    commits: 3,
    filesChanged: 5,
    additions: 45,
    deletions: 128,
    labels: ["bug", "critical"],
    createdAt: "2026-07-25T10:00:00Z",
    branch: "fix/websocket-memory",
    baseBranch: "main",
    description: "Properly closes WebSocket connections and clears event listeners."
  },
  {
    id: "pr3",
    number: 40,
    title: "docs: update API documentation with new endpoints",
    author: { name: "Aman Chaudhary", avatar: "#3b82f6" },
    reviewers: [
      { name: "Priya Sharma", avatar: "#ec4899", status: "approved" }
    ],
    status: "merged",
    commits: 2,
    filesChanged: 8,
    additions: 210,
    deletions: 34,
    labels: ["documentation"],
    createdAt: "2026-07-24T16:00:00Z",
    branch: "docs/api-v2",
    baseBranch: "main",
    description: "Updated API docs to include new v2 endpoints."
  },
  {
    id: "pr4",
    number: 39,
    title: "refactor: migrate dashboard UI to Tailwind CSS v4",
    author: { name: "Neha Gupta", avatar: "#f59e0b" },
    reviewers: [
      { name: "Aman Chaudhary", avatar: "#3b82f6", status: "changes_requested" }
    ],
    status: "open",
    commits: 14,
    filesChanged: 32,
    additions: 1205,
    deletions: 890,
    labels: ["refactor", "ui"],
    createdAt: "2026-07-23T09:00:00Z",
    branch: "refactor/tailwind-v4",
    baseBranch: "develop",
    description: "Migrate all dashboard components from CSS modules to Tailwind v4."
  }
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Merged", value: "merged" },
  { label: "Closed", value: "closed" }
];

const labelOptions = ["enhancement", "security", "bug", "critical", "documentation", "refactor", "ui"];

export default function PullRequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [aiReviewing, setAiReviewing] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [showLabelsMenu, setShowLabelsMenu] = useState(false);

  const filteredPRs = mockPRs.filter((pr) => {
    const matchesSearch = pr.title.toLowerCase().includes(search.toLowerCase()) || pr.author.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter;
    const matchesLabels = selectedLabels.length === 0 || selectedLabels.some((l) => pr.labels.includes(l));
    return matchesSearch && matchesStatus && matchesLabels;
  });

  const handleAiReview = async () => {
    setAiReviewing(true);
    setTimeout(() => {
      setAiReview({
        summary: "This PR introduces JWT authentication with secure cookie handling. The implementation follows best practices but has one potential issue.",
        risk: "Medium",
        security: [
          { severity: "warning", message: "Consider adding SameSite attribute to cookies", location: "auth.controller.js:45", fix: "Set cookie.sameSite = 'strict'" },
          { severity: "info", message: "Refresh token rotation is implemented correctly", location: "auth.service.js:78", fix: null }
        ],
        improvements: [
          "Add rate limiting to the login endpoint",
          "Consider implementing token blacklisting for logout",
          "Add input validation for refresh token request"
        ]
      });
      setAiReviewing(false);
      toast("AI review generated", "success");
    }, 2000);
  };

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
        <button className="btn btn-primary" onClick={() => toast("Create PR opened", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <GitPullRequest size={15} /> New Pull Request
        </button>
      </PageHeader>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
        {filteredPRs.length === 0 ? (
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
                      <Avatar name={pr.author.name} size={24} color={pr.author.avatar} />
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
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{pr.commits} commits</span>
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
                        <button className="btn btn-outline" onClick={() => toast("Opened diff view", "info")} style={{ minHeight: 34, fontSize: 13 }} type="button">
                          <FileDiff size={14} /> Files Changed ({pr.filesChanged})
                        </button>
                        <button className="btn btn-outline" onClick={() => toast("Comments loaded", "info")} style={{ minHeight: 34, fontSize: 13 }} type="button">
                          <MessageSquare size={14} /> Comments (2)
                        </button>
                        <button className="btn btn-primary" onClick={() => toast("Merged!", "success")} style={{ minHeight: 34, fontSize: 13, background: "var(--purple)" }} type="button">
                          Merge Pull Request
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ padding: 14, background: "var(--bg-soft)", borderRadius: 12, border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Shield size={14} color="var(--info)" />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Merge Status</span>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {["Build passing", "Tests passing", "Review approved"].map((check) => (
                              <span key={check} className="status status-success" style={{ fontSize: 11 }}>{check}</span>
                            ))}
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

                        <div style={{ display: "flex", gap: 10, padding: 14, background: "color-mix(in srgb, var(--primary) 6%, transparent)", borderRadius: 12, border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)" }}>
                          <Sparkles size={16} color="var(--primary)" />
                          <button onClick={handleAiReview} disabled={aiReviewing || !!aiReview} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontWeight: 600, textAlign: "left", fontSize: 13, padding: 0 }} type="button">
                            {aiReviewing ? "AI is reviewing..." : aiReview ? "AI Review Generated" : "Generate AI Review"}
                          </button>
                        </div>

                        {aiReview && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 14, background: "color-mix(in srgb, var(--info) 6%, transparent)", borderRadius: 12, border: "1px solid color-mix(in srgb, var(--info) 25%, transparent)" }}>
                            <div>
                              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: "var(--info)" }}>Summary</p>
                              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{aiReview.summary}</p>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: "var(--warning)" }}>Risk: {aiReview.risk}</p>
                            </div>
                            <div>
                              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13 }}>Security Checks</p>
                              {aiReview.security.map((s, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                                  {s.severity === "warning" ? <AlertTriangle size={14} color="var(--warning)" /> : <CheckCircle2 size={14} color="var(--success)" />}
                                  <div>
                                    <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600 }}>{s.message}</p>
                                    <p className="muted" style={{ margin: 0, fontSize: 11 }}>{s.location}</p>
                                    {s.fix && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--primary)" }}>Fix: {s.fix}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div>
                              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13 }}>Improvements</p>
                              {aiReview.improvements.map((imp, i) => (
                                <p key={i} style={{ margin: "0 0 3px", fontSize: 12, color: "var(--muted)" }}>• {imp}</p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Timeline</p>
                          {[
                            { user: "Aman Chaudhary", action: "approved this pull request", time: "1 hour ago" },
                            { user: "Priya Sharma", action: "commented on api/validate.ts", time: "3 hours ago" },
                            { user: "Rahul Singh", action: "merged 3 commits", time: "5 hours ago" }
                          ].map((event, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <Avatar name={event.user} size={24} />
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{event.user}</span>
                                <span className="muted" style={{ fontSize: 12 }}> {event.action}</span>
                                <p className="muted" style={{ margin: "2px 0 0", fontSize: 11 }}>{event.time}</p>
                              </div>
                            </div>
                          ))}
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
    </div>
  );
}
