"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, Bot, CheckCircle2, Clock, Download, Eye, FileText, FolderOpen, GitCommit, MoreHorizontal, Rocket, Share2, Star, Users } from "lucide-react";
import { AvatarGroup, EmptyState, PageHeader, ProgressBar, ProgressRing, StatusBadge, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { mockActivity, mockFiles, mockProjects, mockTasks } from "@/lib/dashboard-data";

const recentCommits = [
  { hash: "abc123f", message: "Add authentication middleware", author: "Aman", time: "Today, 10:30" },
  { hash: "def456a", message: "Fix CORS configuration", author: "Rahul", time: "Today, 09:15" },
  { hash: "ghi789b", message: "Update database schema", author: "Priya", time: "Yesterday" },
  { hash: "jkl012c", message: "Add Redis caching layer", author: "Aman", time: "2 days ago" }
];

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p._id === projectId);
  const projectTasks = mockTasks.slice(0, 4);
  const projectFiles = mockFiles.slice(0, 4);

  if (!project) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Project not found"
        description="This project link is unavailable. Go back to the project list and choose another workspace."
        action="Back to projects"
        onAction={() => window.location.assign("/dashboard/projects")}
      />
    );
  }

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: project.name }]} />
      {/* Hero */}
      <div className="welcome-banner">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl grid place-items-center text-white font-extrabold text-[22px] shrink-0" style={{ background: project.color }}>
            {project.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="m-0 text-[22px] font-extrabold" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>{project.name}</h1>
              <StatusBadge status={project.status} />
              <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{project.visibility}</span>
            </div>
            <p className="muted m-0 mb-2 text-[13px]">{project.description}</p>
            <AvatarGroup members={project.members} max={5} size={26} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-outline" onClick={() => toast("Added to favorites", "success")} style={{ minHeight: 36, fontSize: 13 }} type="button"><Star size={15} /> Star {project.stars}</button>
          <button className="btn btn-outline" onClick={() => toast("Link copied", "success")} style={{ minHeight: 36, fontSize: 13 }} type="button"><Share2 size={15} /> Share</button>
          <button className="btn btn-primary" onClick={() => toast("Cloning...", "info")} style={{ minHeight: 36, fontSize: 13 }} type="button"><GitCommit size={15} /> Clone</button>
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="dash-grid-3">
        <div className="stat-card" style={{ gap: 14 }}>
          <p className="m-0 font-bold text-sm">Development Progress</p>
          <div className="flex items-center gap-4">
            <ProgressRing value={project.progress} size={72} stroke={7} />
            <div>
              <p className="m-0 mb-1 text-[28px] font-extrabold" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>{project.progress}%</p>
              <p className="muted m-0 text-xs">Overall completion</p>
            </div>
          </div>
          <ProgressBar value={project.progress} />
        </div>
        <div className="stat-card" style={{ gap: 14 }}>
          <p className="m-0 font-bold text-sm">Tasks</p>
          {[["Open", project.tasks.open, "var(--info)"], ["Completed", project.tasks.completed, "var(--success)"], ["Overdue", project.tasks.overdue, "var(--danger)"]].map(([label, val, color]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="muted text-[13px]">{label}</span>
              <strong className="text-base" style={{ color }}>{val}</strong>
            </div>
          ))}
        </div>
        <div className="stat-card" style={{ gap: 14 }}>
          <p className="m-0 font-bold text-sm">Deployment</p>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)" }}>
              <Rocket size={20} color="var(--success)" />
            </div>
            <div>
              <StatusBadge status={project.deployments.status} />
              <p className="muted mt-1 mb-0 text-xs">{project.deployments.env}</p>
            </div>
          </div>
          <p className="muted m-0 text-xs">Last deploy: {project.deployments.lastDeploy}</p>
          <p className="m-0 text-xs font-semibold">{project.commits} total commits</p>
        </div>
      </div>

      {/* Files + Commits */}
      <div className="dash-grid-2">
        <div className="stat-card" style={{ gap: 16 }}>
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Recent Files</p>
            <Link href={`/dashboard/projects/${projectId}/files`} className="muted text-[13px] font-semibold">View all</Link>
          </div>
          {projectFiles.map((f) => (
            <div key={f._id} className="flex items-center gap-3 py-2 border-b border-(--border)/40">
              <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                <FileText size={16} color="var(--primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{f.name}</p>
                <span className="muted text-[11px]">{f.size} · {f.updatedAt}</span>
              </div>
              <div className="flex gap-1.5">
                <button className="icon-btn w-7 h-7 border-0 bg-transparent" onClick={() => toast("Opening preview", "info")} type="button"><Eye size={14} /></button>
                <button className="icon-btn w-7 h-7 border-0 bg-transparent" onClick={() => toast("Downloading", "success")} type="button"><Download size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="stat-card" style={{ gap: 16 }}>
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Recent Commits</p>
            <Link href={`/dashboard/projects/${projectId}/activity`} className="muted text-[13px] font-semibold">View all</Link>
          </div>
          <div className="timeline">
            {recentCommits.map((c) => (
              <div className="timeline-item" key={c.hash}>
                <div className="timeline-dot"><GitCommit size={16} color="var(--primary)" /></div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13px] font-semibold">{c.message}</p>
                  <div className="flex gap-2 items-center">
                    <code className="text-[11px] text-(--primary) font-mono">{c.hash}</code>
                    <span className="text-[11px] text-(--soft)">{c.author} · {c.time}</span>
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
          <div className="flex items-center gap-2.5">
            <div className="logo-mark" style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
            <p className="m-0 font-bold text-[15px]">AI Assistant</p>
          </div>
          {[["Generate Docs", "Auto-document this project"], ["Explain Folder", "Understand the codebase"], ["Review Project", "Get AI code review"]].map(([label, desc]) => (
            <button key={label} className="sidebar-item border border-(--border)/40 rounded-xl flex-col items-start h-auto" style={{ padding: "10px 14px", gap: 2 }} onClick={() => toast(`${label} started`, "info")} type="button">
              <span className="font-bold text-[13px]">{label}</span>
              <span className="muted text-[11px]">{desc}</span>
            </button>
          ))}
        </div>

        <div className="stat-card" style={{ gap: 14 }}>
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Documentation</p>
            <Link href={`/dashboard/projects/${projectId}/docs`} className="muted text-[13px] font-semibold">Open</Link>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing value={68} size={56} stroke={6} color="var(--info)" />
            <div>
              <p className="m-0 mb-0.5 text-[20px] font-extrabold">68%</p>
              <p className="muted m-0 text-xs">Docs complete</p>
            </div>
          </div>
          {["README", "API Reference", "Database Schema", "Deployment Guide"].map((doc) => (
            <div key={doc} className="flex items-center gap-2">
              <CheckCircle2 size={14} color="var(--success)" />
              <span className="text-[13px]">{doc}</span>
            </div>
          ))}
          <Link className="btn btn-outline" href={`/dashboard/projects/${projectId}/docs`} style={{ minHeight: 34, fontSize: 12 }}>Improve Docs</Link>
        </div>

        <div className="stat-card" style={{ gap: 14 }}>
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Team</p>
            <Link href={`/dashboard/projects/${projectId}/team`} className="muted text-[13px] font-semibold">Manage</Link>
          </div>
          {project.members.map((m) => (
            <div key={m._id} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full grid place-items-center text-white font-extrabold text-[13px] shrink-0" style={{ background: m.color }}>{m.name.charAt(0)}</div>
              <span className="text-[13px] font-semibold">{m.name}</span>
            </div>
          ))}
          <button className="btn btn-outline" onClick={() => toast("Invite sent", "success")} style={{ minHeight: 34, fontSize: 12 }} type="button"><Users size={14} /> Invite Member</button>
        </div>
      </div>
    </>
  );
}
