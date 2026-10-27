"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
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
import { EmptyState, toast } from "@/components/dashboard-ui";
import { Avatar, StatCard, StatusBadge } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const tabs = ["Overview", "Branches", "Contributors", "Releases", "Settings"];

export default function RepositoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const repoId = params?.repoId;
  const [activeTab, setActiveTab] = useState("Overview");
  const [record, setRecord] = useState(null);
  const [branches, setBranches] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [releases, setReleases] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [latestCommit, setLatestCommit] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [openPulls, setOpenPulls] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.github.repositoryById(repoId, { signal: controller.signal }).then(async (response) => {
      const raw = response.data.repository;
      const [branchResult, contributorResult, releaseResult, languageResult, commitResult, pullsResult] = await Promise.all([
        api.github.resource(raw.owner.login, raw.name, "branches", { page: 1, perPage: 30 }, { signal: controller.signal }),
        api.github.resource(raw.owner.login, raw.name, "contributors", { page: 1, perPage: 30 }, { signal: controller.signal }),
        api.github.resource(raw.owner.login, raw.name, "releases", { page: 1, perPage: 30 }, { signal: controller.signal }),
        api.github.resource(raw.owner.login, raw.name, "languages", {}, { signal: controller.signal }),
        api.github.resource(raw.owner.login, raw.name, "commits", { page: 1, perPage: 1 }, { signal: controller.signal }),
        api.github.resource(raw.owner.login, raw.name, "pulls", { page: 1, perPage: 30 }, { signal: controller.signal })
      ]);
      const languageEntries = Object.entries(languageResult.data.languages || {});
      const totalBytes = languageEntries.reduce((sum, [, bytes]) => sum + bytes, 0) || 1;
      const colors = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"];
      setRecord({ raw, repo: { id: String(raw.id), name: raw.name, owner: raw.owner.login, fullName: raw.full_name, url: raw.html_url, description: raw.description || "", stars: raw.stargazers_count, forks: raw.forks_count, language: raw.language || "—", languageColor: colors[0], visibility: raw.visibility || (raw.private ? "private" : "public"), defaultBranch: raw.default_branch }, detail: { watchers: raw.watchers_count, updatedAt: raw.updated_at, createdAt: raw.created_at, openIssues: raw.open_issues_count, size: `${Math.round((raw.size || 0) / 1024)} MB` } });
      setBranches(branchResult.data.branches || []);
      setContributors(contributorResult.data.contributors || []);
      setReleases(releaseResult.data.releases || []);
      setLanguages(languageEntries.map(([name, bytes], index) => ({ name, pct: Math.round(bytes / totalBytes * 100), color: colors[index % colors.length] })));
      setLatestCommit(commitResult.data.commits?.[0] || null);
      setOpenPulls((pullsResult.data.pulls || []).filter((pull) => pull.state === "open").length);
      setError("");
    }).catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
    return () => controller.abort();
  }, [repoId, attempt]);

  const repo = record?.repo;
  const detail = record?.detail;

  if (!repo && !error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Loading repository"
        description="Fetching repository data from GitHub…"
      />
    );
  }

  if (error) return <EmptyState icon={AlertTriangle} title="Unable to load repository" description={error} action="Retry" onAction={() => setAttempt((value) => value + 1)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Crumb items={["Dashboard", "GitHub", "Repositories", repo.name]} />
      {/* Hero Section */}
      <div className="card card-pad" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${repo.languageColor} 12%, transparent), var(--card))` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: repo.languageColor,
              display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 24
            }}>
              {repo.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, fontFamily: "Space Grotesk" }}>{repo.name}</h1>
                <span className={`status ${repo.visibility === "public" ? "status-success" : "status-muted"}`}>
                  {repo.visibility === "public" ? <Globe size={12} /> : <Lock size={12} />}
                  {repo.visibility}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14, maxWidth: 600 }}>{repo.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: repo.languageColor }} />
                  {repo.language}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Star size={13} color="var(--warning)" /> {repo.stars}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <GitBranch size={13} /> {repo.forks}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Users size={13} /> {detail.watchers}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <Clock size={13} /> Updated {detail.updatedAt.split("T")[0]}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-outline" href={repo.url} target="_blank" rel="noreferrer" style={{ minHeight: 38, fontSize: 13 }}>
              <ExternalLink size={15} /> Open in GitHub
            </a>
            <button className="btn btn-outline" onClick={async () => { try { await navigator.clipboard.writeText(repo.url); toast("Repository link copied", "success"); } catch { toast("Unable to copy repository link", "error"); } }} style={{ minHeight: 38, fontSize: 13 }} type="button">
              <Share2 size={15} /> Copy link
            </button>
            <button className="btn btn-primary" onClick={async () => { try { await api.github.sync(); toast("Repositories synchronized", "success"); } catch (syncError) { toast(syncError.message, "error"); } }} style={{ minHeight: 38, fontSize: 13 }} type="button">
              <RefreshCw size={15} /> Sync
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="dash-grid-4">
        <StatCard label="Commits (latest page)" value={latestCommit ? 1 : 0} icon={GitCommit} iconBg="color-mix(in srgb, var(--info) 15%, transparent)" delta="GitHub API" trend="neutral" />
        <StatCard label="Contributors" value={contributors.length} icon={Users} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)" delta="latest API page" trend="neutral" />
        <StatCard label="Open Issues" value={detail.openIssues} icon={Code2} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" delta="GitHub count" trend="neutral" />
        <StatCard label="Open Pull Requests" value={openPulls} icon={GitBranch} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" delta="latest API page" trend="neutral" />
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
                <Avatar name={latestCommit?.commit?.author?.name || "GitHub"} size={32} color="#3b82f6" />
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{latestCommit?.commit?.author?.name || "No commits"}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>{latestCommit?.commit?.message?.split("\n")[0] || "No commit data available"}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{repo.defaultBranch}</span>
                <span className="muted" style={{ fontSize: 12 }}>{latestCommit?.commit?.author?.date ? new Date(latestCommit.commit.author.date).toLocaleString() : ""}</span>
              </div>
            </div>

            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Deployment Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <Rocket size={18} color="var(--success)" />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>Unavailable</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>No deployment provider is connected</p>
                </div>
              </div>
              <StatusBadge status="info" />
            </div>

            <div className="stat-card" style={{ gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>CI Status</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <CheckCircle2 size={18} color="var(--muted)" />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>Not connected</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>No CI provider data is available</p>
                </div>
              </div>
              <StatusBadge status="info" />
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
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{detail.size}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>GitHub repository size</p>
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
                  <td className="muted">{branch.commit?.sha?.slice(0, 7) || "—"}</td>
                  <td>
                    {branch.protected ? (
                      <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--warning) 15%, transparent)", color: "var(--warning)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Protected</span>
                    ) : (
                      <span style={{ padding: "2px 8px", background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Active</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <a className="btn btn-ghost" href={`https://github.com/${repo.fullName}/tree/${encodeURIComponent(branch.name)}`} target="_blank" rel="noreferrer" style={{ padding: 6, minHeight: 32, fontSize: 12 }}>View</a>
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
              <Avatar name={c.login} size={40} color="#3b82f6" />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{c.login}</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>{c.contributions} contributions</p>
              </div>
              <a className="btn btn-outline" href={c.html_url} target="_blank" rel="noreferrer" style={{ minHeight: 32, fontSize: 12 }}>View Profile</a>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Releases" && (
        <div style={{ display: "grid", gap: 12 }}>
          {releases.map((rel) => (
            <div key={rel.tag_name} className="stat-card" style={{ gap: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rocket size={14} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 14 }}>{rel.tag_name}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: 14 }}>{rel.name || rel.tag_name}</p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="muted" style={{ fontSize: 12 }}>{rel.published_at ? new Date(rel.published_at).toLocaleDateString() : "Draft"}</span>
                  <span className="muted" style={{ fontSize: 12 }}>by {rel.author?.login || "Unknown"}</span>
                  <a className="btn btn-ghost" href={rel.zipball_url} style={{ minHeight: 32, fontSize: 12 }}>
                    <Download size={14} />
                  </a>
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
              <select disabled value={repo.defaultBranch} style={{ padding: "8px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {branches.map((branch) => <option key={branch.name} value={branch.name}>{branch.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Allow Squash Merging</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Automatically squash commits when merging</p>
              </div>
              <button className="btn btn-outline" disabled style={{ minHeight: 32, fontSize: 12 }} type="button">Read only</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Delete Repository</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>Once deleted, it cannot be recovered</p>
              </div>
              <button className="btn btn-outline" disabled title="Repository deletion is not exposed by DevFlow" style={{ minHeight: 32, fontSize: 12, color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 40%, var(--border))" }} type="button">Delete unavailable</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
