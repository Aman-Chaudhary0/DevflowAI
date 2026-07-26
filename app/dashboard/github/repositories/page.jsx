"use client";

import { useState } from "react";
import {
  Archive,
  Book,
  ChevronDown,
  Filter,
  Github,
  Lock,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  Star,
  Users,
  Wand2
} from "lucide-react";
import { toast } from "@/components/dashboard-ui";
import { Avatar } from "@/components/dashboard-ui";

// Mock repositories data
const mockRepositories = [
  {
    id: "r1",
    name: "devflow-ai",
    owner: "Aman-Chaudhary0",
    description: "AI-powered developer workspace with projects, tasks, and analytics.",
    language: "JavaScript",
    languageColor: "#f59e0b",
    stars: 128,
    forks: 34,
    visibility: "private",
    defaultBranch: "main",
    lastSync: "2 min ago",
    syncStatus: "synced",
    size: "245 MB",
    updatedAt: "2026-07-26T10:00:00Z"
  },
  {
    id: "r2",
    name: "ecommerce-platform",
    owner: "Aman-Chaudhary0",
    description: "Full-stack e-commerce solution with payments and inventory management.",
    language: "TypeScript",
    languageColor: "#3b82f6",
    stars: 64,
    forks: 18,
    visibility: "private",
    defaultBranch: "main",
    lastSync: "1 hour ago",
    syncStatus: "synced",
    size: "189 MB",
    updatedAt: "2026-07-25T14:00:00Z"
  },
  {
    id: "r3",
    name: "mobile-banking-app",
    owner: "team-devflow",
    description: "Secure mobile banking application with biometric authentication.",
    language: "React Native",
    languageColor: "#61dafb",
    stars: 32,
    forks: 8,
    visibility: "team",
    defaultBranch: "develop",
    lastSync: "3 hours ago",
    syncStatus: "warning",
    size: "312 MB",
    updatedAt: "2026-07-24T11:00:00Z"
  },
  {
    id: "r4",
    name: "analytics-dashboard",
    owner: "Aman-Chaudhary0",
    description: "Real-time analytics and reporting platform for business intelligence.",
    language: "Vue.js",
    languageColor: "#42b883",
    stars: 256,
    forks: 67,
    visibility: "public",
    defaultBranch: "main",
    lastSync: "30 min ago",
    syncStatus: "synced",
    size: "156 MB",
    updatedAt: "2026-07-26T09:30:00Z"
  },
  {
    id: "r5",
    name: "devops-pipeline",
    owner: "Aman-Chaudhary0",
    description: "Automated CI/CD pipeline with Docker, Kubernetes, and monitoring.",
    language: "Go",
    languageColor: "#00add8",
    stars: 89,
    forks: 23,
    visibility: "private",
    defaultBranch: "main",
    lastSync: "2 weeks ago",
    syncStatus: "outdated",
    size: "78 MB",
    updatedAt: "2026-07-10T08:00:00Z"
  },
  {
    id: "r6",
    name: "ai-code-review",
    owner: "team-devflow",
    description: "Automated code review tool powered by GPT-4 with inline suggestions.",
    language: "Python",
    languageColor: "#3776ab",
    stars: 412,
    forks: 98,
    visibility: "public",
    defaultBranch: "main",
    lastSync: "5 hours ago",
    syncStatus: "failed",
    size: "234 MB",
    updatedAt: "2026-07-26T07:00:00Z"
  }
];

const languageOptions = ["All Languages", "JavaScript", "TypeScript", "Python", "Go", "Vue.js", "React Native"];
const visibilityOptions = ["All", "Public", "Private", "Team"];
const sortOptions = ["Last Updated", "Name", "Stars", "Forks"];

export default function GitHubRepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All Languages");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Last Updated");
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  const filteredRepos = mockRepositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === "All Languages" || repo.language === languageFilter;
    const matchesVisibility = visibilityFilter === "All" || repo.visibility === visibilityFilter.toLowerCase();
    return matchesSearch && matchesLanguage && matchesVisibility;
  });

  const handleSelectRepo = (repoId) => {
    setSelectedRepos(prev =>
      prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRepos(prev =>
      prev.length === filteredRepos.length ? [] : filteredRepos.map(r => r.id)
    );
  };

  const handleSync = (repoId) => {
    toast("Syncing repository...", "info");
    setTimeout(() => toast("Repository synced successfully", "success"), 2000);
  };

  const handleBulkSync = () => {
    toast(`Syncing ${selectedRepos.length} repositories...`, "info");
    setTimeout(() => toast("All repositories synced", "success"), 3000);
  };

  const handleArchive = (repoId) => {
    toast("Repository archived", "success");
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case "synced": return "var(--success)";
      case "warning": return "var(--warning)";
      case "failed": return "var(--danger)";
      case "outdated": return "var(--muted)";
      default: return "var(--muted)";
    }
  };

  const getSyncStatusText = (status) => {
    switch (status) {
      case "synced": return "Synced";
      case "warning": return "Warning";
      case "failed": return "Failed";
      case "outdated": return "Outdated";
      default: return "Unknown";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "Space Grotesk" }}>
            Connected Repositories
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Manage your GitHub repositories and sync status
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 20px",
            background: "var(--primary)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "white"
          }}
          type="button"
        >
          <Github size={16} />
          Connect Repository
        </button>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "16px 20px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 16
      }}>
        {/* Search */}
        <div style={{
          flex: 1,
          minWidth: 200,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          background: "var(--bg-soft)",
          border: "1px solid var(--border)",
          borderRadius: 10
        }}>
          <Search size={16} color="var(--muted)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: "var(--text)"
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              style={{
                padding: "10px 32px 10px 14px",
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                cursor: "pointer",
                appearance: "none"
              }}
            >
              {languageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              style={{
                padding: "10px 32px 10px 14px",
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                cursor: "pointer",
                appearance: "none"
              }}
            >
              {visibilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 32px 10px 14px",
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)",
                cursor: "pointer",
                appearance: "none"
              }}
            >
              {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted)" }} />
          </div>
        </div>

        {/* View Toggle */}
        <div style={{
          display: "flex",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden"
        }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "10px 14px",
              background: viewMode === "grid" ? "var(--primary)" : "var(--bg-soft)",
              border: "none",
              cursor: "pointer",
              color: viewMode === "grid" ? "white" : "var(--muted)"
            }}
            type="button"
          >
            <Filter size={14} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              padding: "10px 14px",
              background: viewMode === "list" ? "var(--primary)" : "var(--bg-soft)",
              border: "none",
              cursor: "pointer",
              color: viewMode === "list" ? "white" : "var(--muted)"
            }}
            type="button"
          >
            <Book size={14} />
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedRepos.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              onClick={handleBulkSync}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)"
              }}
              type="button"
            >
              <RefreshCw size={14} />
              Sync ({selectedRepos.length})
            </button>
            <button
              onClick={() => { toast("Repositories archived", "success"); setSelectedRepos([]); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)"
              }}
              type="button"
            >
              <Archive size={14} />
              Archive
            </button>
          </div>
        )}
      </div>

      {/* Repository Grid/List */}
      {viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--card)",
                padding: 20,
                cursor: "pointer",
                transition: "all 200ms ease"
              }}
              onClick={() => window.location.href = `/dashboard/github/repositories/${repo.id}`}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={repo.name} size={40} color="#3b82f6" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{repo.name}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{repo.owner}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {repo.visibility === "public" ? (
                    <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Public</span>
                  ) : repo.visibility === "team" ? (
                    <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--info) 15%, transparent)", color: "var(--info)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Team</span>
                  ) : (
                    <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--muted) 15%, transparent)", color: "var(--muted)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Private</span>
                  )}
                </div>
              </div>

              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5, minHeight: 36 }}>
                {repo.description}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: repo.languageColor }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{repo.language}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} color="var(--warning)" />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{repo.stars}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Users size={12} color="var(--muted)" />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{repo.forks}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: getSyncStatusColor(repo.syncStatus) }} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{getSyncStatusText(repo.syncStatus)}</span>
                  <span style={{ fontSize: 11, color: "var(--soft)" }}>• {repo.lastSync}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSync(repo.id); }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--surface)",
                      border: "none",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--muted)"
                    }}
                    title="Sync"
                    type="button"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--surface)",
                      border: "none",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--muted)"
                    }}
                    title="More options"
                    type="button"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", background: "var(--card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Repository</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Language</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Stars</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Forks</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Visibility</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Last Sync</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.map(repo => (
                <tr key={repo.id} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => window.location.href = `/dashboard/github/repositories/${repo.id}`}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={repo.name} size={32} color="#3b82f6" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{repo.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{repo.owner}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: repo.languageColor }} />
                      <span style={{ fontSize: 13 }}>{repo.language}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                      <Star size={12} color="var(--warning)" />
                      {repo.stars}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{repo.forks}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      padding: "2px 8px",
                      background: repo.visibility === "public" ? "color-mix(in srgb, var(--success) 15%, transparent)" : repo.visibility === "team" ? "color-mix(in srgb, var(--info) 15%, transparent)" : "color-mix(in srgb, var(--muted) 15%, transparent)",
                      color: repo.visibility === "public" ? "var(--success)" : repo.visibility === "team" ? "var(--info)" : "var(--muted)",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {repo.visibility}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: getSyncStatusColor(repo.syncStatus) }} />
                      <span style={{ fontSize: 13 }}>{getSyncStatusText(repo.syncStatus)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "var(--muted)" }}>{repo.lastSync}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSync(repo.id); }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: "var(--surface)",
                        border: "none",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        color: "var(--muted)"
                      }}
                      title="Sync"
                      type="button"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}