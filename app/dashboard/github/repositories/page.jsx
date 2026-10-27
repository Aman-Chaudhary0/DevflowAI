"use client";

import { useCallback, useEffect, useState } from "react";
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
import { api } from "@/lib/api";

const languageOptions = ["All Languages", "JavaScript", "TypeScript", "Python", "Go", "Vue.js", "React Native"];
const visibilityOptions = ["All", "Public", "Private", "Team"];
const sortOptions = ["Last Updated", "Name", "Stars", "Forks"];

export default function GitHubRepositoriesPage() {
  const [repositories, setRepositories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All Languages");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Last Updated");
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.github.repositories({ page, perPage: 30 });
      const colors = { JavaScript: "#f59e0b", TypeScript: "#3b82f6", Python: "#3776ab", Go: "#00add8", "Vue.js": "#42b883" };
      setRepositories((response.data.repositories || []).map((repo) => ({ ...repo, languageColor: colors[repo.language] || "var(--muted)", visibility: repo.visibility, lastSync: `Updated ${new Date(repo.updatedAt).toLocaleString()}`, syncStatus: "accessible", size: `${Math.round((repo.size || 0) / 1024)} MB` })));
      setPagination(response.data.pagination);
      setError("");
    } catch (requestError) { setError(requestError.message); setRepositories([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadRepositories(); }, [loadRepositories]);

  const filteredRepos = repositories.filter(repo => {
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

  const handleSync = async () => {
    setSyncing(true);
    try { const result = await api.github.sync(); toast(`Synchronized ${result.data.repositoryCount} repositories`, "success"); await loadRepositories(); }
    catch (requestError) { setError(requestError.message); toast(requestError.message, "error"); }
    finally { setSyncing(false); }
  };

  const handleBulkSync = async () => { await handleSync(); setSelectedRepos([]); };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case "accessible": return "var(--success)";
      case "warning": return "var(--warning)";
      case "failed": return "var(--danger)";
      case "outdated": return "var(--muted)";
      default: return "var(--muted)";
    }
  };

  const getSyncStatusText = (status) => {
    switch (status) {
      case "accessible": return "Accessible";
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
          onClick={() => { window.location.href = api.github.connectUrl(); }}
          type="button"
        >
          <Github size={16} />
          Connect GitHub
        </button>
      </div>

      {error && <div className="card p-4" role="alert">{error}<button className="btn btn-ghost ml-3" onClick={loadRepositories} type="button">Retry</button></div>}
      {loading && <div className="card p-4" role="status">Loading repositories…</div>}
      {!loading && !error && repositories.length === 0 && <div className="card p-4">No accessible repositories. <a href={api.github.connectUrl()}>Connect GitHub</a></div>}

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
              disabled
              title="Repository archiving is not available in the read-only integration"
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
              Archive unavailable
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
                    disabled
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
                    title="More repository actions are unavailable"
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
      {!loading && !error && filteredRepos.length === 0 && repositories.length > 0 && <div className="card p-4">No repositories match the current filters.</div>}
      {pagination && <div className="flex justify-between items-center"><span className="muted text-sm">Page {pagination.page} · {pagination.perPage} per page</span><div className="flex gap-2"><button className="btn btn-ghost" disabled={!pagination.hasPrevious || loading} onClick={() => setPage(pagination.previousPage)}>Previous</button><button className="btn btn-ghost" disabled={!pagination.hasNext || loading} onClick={() => setPage(pagination.nextPage)}>Next</button></div></div>}
    </div>
  );
}
