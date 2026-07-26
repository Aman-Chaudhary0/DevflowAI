"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, Bot, CheckCircle2, Clock, Download, Eye, FileText, FolderOpen, GitCommit, MoreHorizontal, Rocket, Share2, Star, Users } from "lucide-react";
import { AvatarGroup, EmptyState, PageHeader, ProgressBar, ProgressRing, StatusBadge, toast } from "@/components/dashboard-ui";
import { mockActivity, mockFiles, mockProjects, mockTasks } from "@/lib/dashboard-data";

const recentCommits = [
  { hash: "abc123f", message: "Add authentication middleware", author: "Aman", time: "Today, 10:30" },
  { hash: "def456a", message: "Fix CORS configuration", author: "Rahul", time: "Today, 09:15" },
  { hash: "ghi789b", message: "Update database schema", author: "Priya", time: "Yesterday" },
  { hash: "jkl012c", message: "Add Redis caching layer", author: "Aman", time: "2 days ago" }
];

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p._id === projectId) || mockProjects[0];
  const projectTasks = mockTasks.slice(0, 4);
  const projectFiles = mockFiles.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <div className="welcome-banner">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: project.color, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
            {project.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>{project.name}</h1>
              <StatusBadge status={project.status} />
              <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{project.visibility}</span>
            </div>
            <p className="muted" style={{ margin: "0 0 8px", fontSize: 13 }}>{project.description}</p>
            <AvatarGroup members={project.members} max={5} size={26} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => toast("Added to favorites", "success")} style={{ minHeight: 36, fontSize: 13 }} type="button"><Star size={15} /> Star {project.stars}</button>
          <button className="btn btn-outline" onClick={() => toast("Link copied", "success")} style={{ minHeight: 36, fontSize: 13 }} type="button"><Share2 size={15} /> Share</button>
          <button className="btn btn-primary" onClick={() => toast("Cloning...", "info")} style={{ minHeight: 36, fontSize: 13 }} type="button"><GitCommit size={15} /> Clone</button>
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="dash-grid-3">
        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Development Progress</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ProgressRing value={project.progress} size={72} stroke={7} />
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>{project.progress}%</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Overall completion</p>
            </div>
          </div>
          <ProgressBar value={project.progress} />
        </div>
        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Tasks</p>
          {[["Open", project.tasks.open, "var(--info)"], ["Completed", project.tasks.completed, "var(--success)"], ["Overdue", project.tasks.overdue, "var(--danger)"]].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted" style={{ fontSize: 13 }}>{label}</span>
              <strong style={{ color, fontSize: 16 }}>{val}</strong>
            </div>
          ))}
        </div>
        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Deployment</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <Rocket size={20} color="var(--success)" />
            </div>
            <div>
              <StatusBadge status={project.deployments.status} />
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>{project.deployments.env}</p>
            </div>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>Last deploy: {project.deployments.lastDeploy}</p>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600 }}>{project.commits} total commits</p>
        </div>
      </div>

      {/* Files + Commits */}
      <div className="dash-grid-2">
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Files</p>
            <Link href={`/dashboard/projects/${projectId}/files`} className="muted" style={{ fontSize: 13, fontWeight: 600 }}>View all</Link>
          </div>
          {projectFiles.map((f) => (
            <div key={f._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 12%, transparent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <FileText size={16} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                <span className="muted" style={{ fontSize: 11 }}>{f.size} · {f.updatedAt}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="icon-btn" onClick={() => toast("Opening preview", "info")} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><Eye size={14} /></button>
                <button className="icon-btn" onClick={() => toast("Downloading", "success")} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><Download size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Commits</p>
            <Link href={`/dashboard/projects/${projectId}/activity`} className="muted" style={{ fontSize: 13, fontWeight: 600 }}>View all</Link>
          </div>
          <div className="timeline">
            {recentCommits.map((c) => (
              <div className="timeline-item" key={c.hash}>
                <div className="timeline-dot"><GitCommit size={16} color="var(--primary)" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{c.message}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <code style={{ fontSize: 11, color: "var(--primary)", fontFamily: "JetBrains Mono, monospace" }}>{c.hash}</code>
                    <span style={{ fontSize: 11, color: "var(--soft)" }}>{c.author} · {c.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Widget + Docs + Team */}
      <div className="dash-grid-3">
        <div className="stat-card" style={{ gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark" style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>AI Assistant</p>
          </div>
          {[["Generate Docs", "Auto-document this project"], ["Explain Folder", "Understand the codebase"], ["Review Project", "Get AI code review"]].map(([label, desc]) => (
            <button key={label} className="sidebar-item" onClick={() => toast(`${label} started`, "info")} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", height: "auto", flexDirection: "column", alignItems: "flex-start", gap: 2 }} type="button">
              <span style={{ fontWeight: 700, fontSize: 13 }}>{label}</span>
              <span className="muted" style={{ fontSize: 11 }}>{desc}</span>
            </button>
          ))}
        </div>

        <div className="stat-card" style={{ gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Documentation</p>
            <Link href={`/dashboard/projects/${projectId}/docs`} className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Open</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProgressRing value={68} size={56} stroke={6} color="var(--info)" />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800 }}>68%</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Docs complete</p>
            </div>
          </div>
          {["README", "API Reference", "Database Schema", "Deployment Guide"].map((doc) => (
            <div key={doc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={14} color="var(--success)" />
              <span style={{ fontSize: 13 }}>{doc}</span>
            </div>
          ))}
          <Link className="btn btn-outline" href={`/dashboard/projects/${projectId}/docs`} style={{ minHeight: 34, fontSize: 12 }}>Improve Docs</Link>
        </div>

        <div className="stat-card" style={{ gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team</p>
            <Link href={`/dashboard/projects/${projectId}/team`} className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Manage</Link>
          </div>
          {project.members.map((m) => (
            <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.color, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{m.name.charAt(0)}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
            </div>
          ))}
          <button className="btn btn-outline" onClick={() => toast("Invite sent", "success")} style={{ minHeight: 34, fontSize: 12 }} type="button"><Users size={14} /> Invite Member</button>
        </div>
      </div>
    </>
  );
}
