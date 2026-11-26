"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Bot, FileText, FolderOpen, GitCommit, Rocket, Share2, Star, Users } from "lucide-react";
import { AvatarGroup, EmptyState, PageHeader, ProgressBar, ProgressRing, StatusBadge, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

function formatActivityAge(value) {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (!Number.isFinite(minutes)) return "Recently";
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatFileSize(bytes = 0) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "Size unavailable";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function describeActivityAction(action = "") {
  const labels = {
    created_task: "Created task",
    updated_task_status: "Changed task status",
    updated_task_priority: "Changed task priority",
    updated_task: "Updated task",
    deleted_task: "Deleted task",
    created_project: "Created project",
    updated_project: "Updated project"
  };
  return labels[action] || action.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase()) || "Project activity";
}

function formatTaskStatus(status = "") {
  const labels = { todo: "To do", in_progress: "In progress", review: "In review", blocked: "Blocked", done: "Done" };
  return labels[status] || status;
}

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState({ tasks: [], files: [], activities: [], deployments: [], documents: [], members: [] });

  useEffect(() => {
    let ignore = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.projects.get(projectId);
        const nextProject = response?.data?.project || response?.project || null;
        if (!ignore) setProject(nextProject);
        if (nextProject) {
          const results = await Promise.allSettled([
            api.tasks.list({ projectId, limit: 100, sortBy: "updatedAt", sortOrder: "desc" }),
            api.files.listProject(projectId, { page: 1, limit: 4 }),
            api.projects.activity(projectId),
            api.deployments.list({ projectId, page: 1, limit: 100 }),
            api.files.docs.list(projectId, { page: 1, limit: 100 }),
            api.tasks.members.project(projectId)
          ]);
          if (!ignore) {
            const dataAt = (index) => results[index].status === "fulfilled" ? results[index].value?.data : null;
            setOverviewData({
              tasks: dataAt(0)?.tasks || [],
              files: dataAt(1)?.files || [],
              activities: dataAt(2)?.activity || [],
              deployments: dataAt(3)?.deployments || [],
              documents: dataAt(4)?.documents || [],
              members: dataAt(5)?.members || []
            });
          }
        }
      } catch (err) {
        if (!ignore) {
          setProject(null);
          setError(err.message || "Unable to load project details");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }

    return () => {
      ignore = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <>
        <PageHeader title="Project Overview" subtitle="Loading project details..." />
        <div className="stat-card" style={{ minHeight: 240 }}>
          <div className="skeleton h-8 w-56 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-5/6 mb-4" />
          <div className="skeleton h-24 w-full" />
        </div>
      </>
    );
  }

  if (!project || error) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Project not found"
        description={error || "This project link is unavailable. Go back to the project list and choose another workspace."}
        action="Back to projects"
        onAction={() => window.location.assign("/dashboard/projects")}
      />
    );
  }

  const projectColor = project.settings?.color || "#3b82f6";
  const owner = project.owner || null;
  const members = overviewData.members.length
    ? overviewData.members.map((member, index) => ({
      _id: String(member.user?._id || member._id),
      name: member.user?.name || "Workspace member",
      role: ({ owner: "Owner", admin: "Admin", editor: "Developer", viewer: "Viewer" })[member.role] || member.role || "Member",
      color: [projectColor, "#8b5cf6", "#14b8a6", "#ec4899", "#f59e0b"][index % 5]
    }))
    : owner ? [{ _id: owner._id || owner, name: owner.name || "Owner", role: "Owner", color: projectColor }] : [];
  const tasks = overviewData.tasks;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  const overdueTasks = tasks.filter((task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) < new Date()).length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const latestDeployment = overviewData.deployments[0] || null;
  const documents = overviewData.documents;

  return (
    <div className="project-overview">
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: project.name }]} />
      {/* Hero */}
      <section className="welcome-banner project-overview-hero">
        <div className="project-overview-identity">
          <div className="project-overview-mark" style={{ background: projectColor }}>
            {(project.name || "P").charAt(0)}
          </div>
          <div className="project-overview-copy">
            <div className="project-overview-title-row">
              <h1 className="project-overview-title">{project.name}</h1>
              <StatusBadge status={project.status || "active"} />
              <span className="badge project-overview-visibility">{project.visibility || "private"}</span>
            </div>
            <p className="project-overview-description">{project.description || "No description provided."}</p>
            <AvatarGroup members={members} max={5} size={26} />
          </div>
        </div>
        <div className="project-overview-actions">
          <button className="btn btn-outline" onClick={() => toast("Added to favorites", "success")} type="button"><Star size={15} /> Star</button>
          <button className="btn btn-outline" onClick={() => toast("Link copied", "success")} type="button"><Share2 size={15} /> Share</button>
          <button className="btn btn-primary" onClick={() => toast("Cloning...", "info")} type="button"><GitCommit size={15} /> Clone</button>
        </div>
      </section>

      {/* Progress + Stats */}
      <div className="dash-grid-3 project-overview-stats">
        <div className="stat-card project-overview-card project-progress-card">
          <p className="project-overview-card-title">Development Progress</p>
          <div className="project-progress-summary">
            <ProgressRing value={taskProgress} size={72} stroke={7} />
            <div>
              <p className="m-0 mb-1 text-[28px] font-extrabold" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>{taskProgress}%</p>
              <p className="muted m-0 text-xs">{completedTasks} of {tasks.length} tasks completed</p>
            </div>
          </div>
          <ProgressBar value={taskProgress} />
        </div>
        <div className="stat-card project-overview-card project-task-card">
          <p className="project-overview-card-title">Tasks</p>
          {[ ["Open", openTasks, "var(--info)"], ["Completed", completedTasks, "var(--success)"], ["Overdue", overdueTasks, "var(--danger)"] ].map(([label, val, color]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="muted text-[13px]">{label}</span>
              <strong className="text-base" style={{ color }}>{val}</strong>
            </div>
          ))}
        </div>
        <div className="stat-card project-overview-card project-deployment-card">
          <p className="project-overview-card-title">Deployment</p>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)" }}>
              <Rocket size={20} color="var(--success)" />
            </div>
            <div>
              <StatusBadge status={latestDeployment?.status || "muted"} />
              <p className="muted mt-1 mb-0 text-xs">{latestDeployment?.environment || "No environment"}</p>
            </div>
          </div>
          <p className="muted m-0 text-xs">{latestDeployment ? `Last deploy: ${formatActivityAge(latestDeployment.createdAt)}` : "No deployments yet"}</p>
          <p className="m-0 text-xs font-semibold">{overviewData.deployments.length} recorded deployment{overviewData.deployments.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {/* Files + Commits */}
      <div className="dash-grid-2 project-overview-content">
        <div className="stat-card project-overview-card project-files-card">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Recent Files</p>
            <Link href={`/dashboard/projects/${projectId}/files`} className="muted text-[13px] font-semibold">View all</Link>
          </div>
          {overviewData.files.length ? overviewData.files.map((f) => (
            <div key={f._id} className="flex items-center gap-3 py-2 border-b border-(--border)/40">
              <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>
                <FileText size={16} color="var(--primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{f.originalName || f.name}</p>
                <span className="muted text-[11px]">{formatFileSize(f.size)} · {formatActivityAge(f.updatedAt || f.createdAt)}</span>
              </div>
            </div>
          )) : <p className="muted m-0 text-sm">No files have been uploaded to this project.</p>}
        </div>

        <div className="stat-card project-overview-card project-commits-card">
          <div className="project-activity-header">
            <div>
              <p className="m-0 font-bold text-[15px]">Recent Activity</p>
              <span>Latest updates in this project</span>
            </div>
            <Link href={`/dashboard/projects/${projectId}/activity`} className="muted text-[13px] font-semibold">View all</Link>
          </div>
          <div className="timeline">
            {overviewData.activities.length ? overviewData.activities.slice(0, 5).map((activity) => (
              <div className="timeline-item project-activity-item" key={activity._id}>
                <div className="timeline-dot project-activity-icon"><Activity size={15} /></div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13px] font-semibold">{describeActivityAction(activity.action)}</p>
                  <div className="project-activity-meta">
                    <span className="project-activity-subject">
                      {activity.entityType === "task"
                        ? tasks.find((task) => String(task._id) === String(activity.entityId))?.title || activity.metadata?.title || "Task"
                        : activity.metadata?.title || activity.entityType}
                    </span>
                    {activity.metadata?.status ? <span className="project-activity-status">{formatTaskStatus(activity.metadata.status.from)} → {formatTaskStatus(activity.metadata.status.to)}</span> : null}
                    <span className="project-activity-byline">{activity.actor?.name || "Workspace member"} · {formatActivityAge(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            )) : <p className="muted m-0 text-sm">No activity has been recorded for this project yet.</p>}
          </div>
        </div>
      </div>

      {/* AI Widget + Docs + Team */}
      <div className="dash-grid-3 project-overview-bottom">
        <div className="stat-card project-overview-card project-ai-card">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark" style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
            <p className="m-0 font-bold text-[15px]">AI Assistant</p>
          </div>
          {[ ["Generate Docs", "Auto-document this project"], ["Explain Folder", "Understand the codebase"], ["Review Project", "Get AI code review"] ].map(([label, desc]) => (
            <button key={label} className="sidebar-item border border-(--border)/40 rounded-xl flex-col items-start h-auto" style={{ padding: "10px 14px", gap: 2 }} onClick={() => toast(`${label} started`, "info")} type="button">
              <span className="font-bold text-[13px]">{label}</span>
              <span className="muted text-[11px]">{desc}</span>
            </button>
          ))}
        </div>

        <div className="stat-card project-overview-card project-docs-card">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Documentation</p>
            <Link href={`/dashboard/projects/${projectId}/docs`} className="muted text-[13px] font-semibold">Open</Link>
          </div>
          <div className="project-documents-count">
            <FileText size={21} />
            <div>
              <p className="m-0 mb-0.5 text-[20px] font-extrabold">{documents.length}</p>
              <p className="muted m-0 text-xs">Project documents</p>
            </div>
          </div>
          {documents.slice(0, 4).map((doc) => (
            <div key={doc._id} className="flex items-center gap-2">
              <FileText size={14} color="var(--info)" />
              <span className="text-[13px]">{doc.title}</span>
            </div>
          ))}
          {!documents.length ? <p className="muted m-0 text-xs">No documents have been created for this project.</p> : null}
          <Link className="btn btn-outline" href={`/dashboard/projects/${projectId}/docs`} style={{ minHeight: 34, fontSize: 12 }}>Improve Docs</Link>
        </div>

        <div className="stat-card project-overview-card project-team-card">
          <div className="project-team-heading">
            <div>
              <p className="m-0 font-bold text-[15px]">Team</p>
              <span className="project-team-count">{members.length} {members.length === 1 ? "member" : "members"}</span>
            </div>
            <Link href={`/dashboard/projects/${projectId}/team`} className="muted text-[13px] font-semibold">Manage</Link>
          </div>
          <div className="project-team-list">
            {members.slice(0, 4).map((m) => (
              <div key={m._id} className="project-team-member">
                <div className="project-team-avatar" style={{ background: m.color }}>{m.name.charAt(0)}</div>
                <span className="project-team-name">{m.name}</span>
                <span className="project-team-role">{m.role}</span>
              </div>
            ))}
            {members.length > 4 ? <span className="project-team-overflow">+{members.length - 4} more members</span> : null}
            {!members.length ? <p className="muted m-0 text-xs">No project members yet.</p> : null}
          </div>
          <Link className="btn btn-outline project-team-invite" href={`/dashboard/projects/${projectId}/team?invite=1`}><Users size={14} /> Invite Member</Link>
        </div>
      </div>
    </div>
  );
}
