"use client";

import { useState } from "react";
import {
  Archive,
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  GitCommit,
  Globe,
  Lock,
  MoreVertical,
  RefreshCw,
  Rocket,
  Settings,
  Share2,
  Sparkles,
  Star,
  Users,
  Wand2
} from "lucide-react";
import { toast } from "@/components/dashboard-ui";
import { Avatar, StatCard, StatusBadge } from "@/components/dashboard-ui";

const mockRepo = {
  id: "r1",
  name: "devflow-ai",
  owner: "Aman-Chaudhary0",
  description: "AI-powered developer workspace with projects, tasks, and analytics.",
  language: "JavaScript",
  languageColor: "#f59e0b",
  visibility: "private",
  defaultBranch: "main",
  size: "245 MB",
  stars: 128,
  forks: 34,
  openIssues: 12,
  watchers: 45,
  updatedAt: "2026-07-26T10:00:00Z",
  createdAt: "2026-01-10T08:00:00Z",
  ciStatus: "passing",
  deploymentStatus: "running",
  lastDeploy: "2 hours ago"
};

const branches = [
  { name: "main", lastCommit: "2 hours ago", protected: true },
  { name: "develop", lastCommit: "4 hours ago", protected: true },
  { name: "feature/auth", lastCommit: "1 day ago", protected: false },
  { name: "feature/dashboard", lastCommit: "2 days ago", protected: false },
  { name: "fix/login-bug", lastCommit: "3 days ago", protected: false }
];

const contributors = [
  { name: "Aman Chaudhary", contributions: 342, avatar: "#3b82f6" },
  { name: "Rahul Singh", contributions: 187, avatar: "#8b5cf6" },
  { name: "Priya Sharma", contributions: 98, avatar: "#ec4899" },
  { name: "Neha Gupta", contributions: 64, avatar: "#f59e0b" }
];

const releases = [
  { tag: "v1.2.0", name: "AI Assistant Update", date: "2026-07-20", author: "Aman Chaudhary" },
  { tag: "v1.1.0", name: "Dashboard Improvements", date: "2026-07-05", author: "Rahul Singh" },
  { tag: "v1.0.0", name: "Initial Release", date: "2026-06-15", author: "Aman Chaudhary" }
];

const languages = [
  { name: "JavaScript", pct: 62, color: "#f59e0b" },
  { name: "CSS", pct: 20, color: "#8b5cf6" },
  { name: "HTML", pct: 12, color: "#ef4444" },
  { name: "Other", pct: 6, color: "#64748b" }
];

const tabs = ["Overview", "Branches", "Contributors", "Releases", "Settings"];

export default function RepositoryDetailsPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  const getStatusColor = (status) => {
    switch (status) {
      case "passing": return "var(--success)";
      case "failing": return "var(--danger)";
      case "running": return "var(--info)";
      default: return "var(--muted)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero Section */}
      <div className="card card-pad" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${mockRepo.languageColor} 12%, transparent), var(--card))` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: mockRepo.languageColor,
              display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 24
            }}>
              {mockRepo.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, fontFamily: "Space Grotesk" }}>{mockRepo.name}</h1>
                <span className={`status ${mockRepo.visibility === "public" ? "status-success" : "status-muted"}`}>
                  {mockRepo.visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
                  {mockRepo.visibility}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14, maxWidth: 600 }}>{mockRepo.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: mockRepo.languageColor }} />
                  {mockRepo.language}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Star size={13} color="var(--warning)" /> {mockRepo.stars}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <GitBranch size={13} /> {mockRepo.forks}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Users size={13} /> {mockRepo.watchers}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Clock size={13} /> Updated {mockRepo.updatedAt.split("T")[0]}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-outline" onClick={() => toast("Opened in GitHub", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
              <ExternalLink size={15} /> Open in GitHub
            </button>
            <button className="btn btn-outline" onClick={() => toast("Shared", "success")} style={{ minHeight: 38, fontSize: 13 }} type="button">
              <Share2 size={15} /> Share
            </button>
            <button className="btn btn-primary" onClick={() => toast("Syncing...", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
              <RefreshCw size={15} /> Sync
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="dash-grid-4">
        <StatCard label="Commits" value={mockRepo.stars + 214} icon={GitCommit} iconBg="color-mix(in srgb, var(--info) 15%, transparent)" delta="+12 this week" trend="up" />
        <StatCard label="Contributors" value={contributors.length} icon={Users} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)" delta="4 active" trend="up" />
        <StatCard label="Open Issues" value={mockRepo.openIssues} icon={Code2} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" delta="-3 from last week" trend="up" />
        <StatCard label="Pull Requests" value={8} icon={GitBranch} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" delta="3 pending review" trend="neutral" />
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ borderBottom: "1px solid var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-item ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="dash-grid-3">
            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Latest Commit</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name="AC" size={32} color="#3b82f6" />
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>Aman Chaudhary</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>feat: add ai suggestions widget</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>main</span>
                <span className="muted" style={{ fontSize: 12 }}>2 hours ago</span>
              </div>
            </div>

            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Deployment Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <Rocket size={18} color="var(--success)" />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>Production</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>{mockRepo.lastDeploy}</p>
                </div>
              </div>
              <StatusBadge status="running" />
            </div>

            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>CI Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>All Checks Passed</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>3/3 tests passing</p>
                </div>
              </div>
              <StatusBadge status="success" />
            </div>
          </div>

          <div className="dash-grid-2">
            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Languages</p>
              <div style={{ display: "grid", gap: 10 }}>
                {languages.map((lang) => (
                  <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: lang.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80 }}>{lang.name}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ width: `${lang.pct}%`, height: "100%", background: lang.color, borderRadius: "inherit" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 36, textAlign: "right" }}>{lang.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Repository Size</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--info) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <Archive size={18} color="var(--info)" />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{mockRepo.size}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>Includes LFS objects</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Branches" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Last Commit</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <GitBranch size={14} color="var(--muted)" />
                      <span style={{ fontWeight: 600, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{branch.name}</span>
                    </div>
                  </td>
                  <td className="muted">{branch.lastCommit}</td>
                  <td>
                    {branch.protected ? (
                      <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--warning) 15%, transparent)", color: "var(--warning)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Protected</span>
                    ) : (
                      <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Active</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-ghost" onClick={() => toast(`Switched to ${branch.name}`, "info")} style={{ padding: 6, minHeight: 32, fontSize: 12 }} type="button">Switch</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Contributors" && (
        <div style={{ display: "grid", gap: 12 }}>
          {contributors.map((c, i) => (
            <div key={c.name} className="stat-card" style={{ gap: 10, flexDirection: "row", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? "var(--warning)" : i === 1 ? "var(--muted)" : i === 2 ? "#cd7f32" : "var(--soft)", width: 28, textAlign: "center" }}>{i + 1}</span>
              <Avatar name={c.name} size={40} color={c.avatar} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>{c.contributions} contributions</p>
              </div>
              <button className="btn btn-outline" onClick={() => toast("Profile opened", "info")} style={{ minHeight: 32, fontSize: 12 }} type="button">View Profile</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Releases" && (
        <div style={{ display: "grid", gap: 12 }}>
          {releases.map((rel) => (
            <div key={rel.tag} className="stat-card" style={{ gap: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rocket size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 14 }}>{rel.tag}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: 14 }}>{rel.name}</p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="muted" style={{ fontSize: 12 }}>{rel.date}</span>
                  <span className="muted" style={{ fontSize: 12 }}>by {rel.author}</span>
                  <button className="btn btn-ghost" onClick={() => toast("Downloading release...", "info")} style={{ minHeight: 32, fontSize: 12 }} type="button">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="stat-card" style={{ gap: 16, maxWidth: 600 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Repository Settings</p>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Default Branch</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>The primary branch for pull requests and initial clone</p>
              </div>
              <select defaultValue="main" style={{ padding: "8px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                <option value="main">main</option>
                <option value="develop">develop</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Allow Squash Merging</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Automatically squash commits when merging</p>
              </div>
              <button className="btn btn-outline" onClick={() => toast("Setting updated", "success")} style={{ minHeight: 32, fontSize: 12 }} type="button">Enabled</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Delete Repository</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Once deleted, it cannot be recovered</p>
              </div>
              <button className="btn btn-outline" onClick={() => toast("This action would open a confirmation dialog", "warning")} style={{ minHeight: 32, fontSize: 12, color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 40%, var(--border))" }} type="button">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
