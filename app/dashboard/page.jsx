"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  GitCommit,
  GitMerge,
  GitPullRequest,
  FolderOpen,
  Github,
  Plus,
  Rocket,
  Server,
  Sparkles,
  Upload,
  UserPlus,
  Users
} from "lucide-react";
import {
  AvatarGroup,
  PageHeader,
  ProgressRing,
  SkeletonCard,
  StatCard,
  StatusBadge,
  toast
} from "@/components/dashboard-ui";
import {
  getGreeting,
  mockAnalytics,
  mockUser
} from "@/lib/dashboard-data";
import { api } from "@/lib/api";

const quickActions = [
  { label: "New Project", icon: FolderOpen, href: "/dashboard/projects/create", color: "var(--primary)" },
  { label: "Ask AI", icon: Sparkles, href: "/dashboard/ai", color: "var(--purple)" },
  { label: "Upload File", icon: Upload, href: "/dashboard/files", color: "var(--info)" },
  { label: "Invite Member", icon: UserPlus, href: "/dashboard/settings", color: "var(--success)" },
  { label: "Create Task", icon: Plus, href: "/dashboard/tasks", color: "var(--warning)" }
];

function formatActivityAge(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatStorageSize(bytes = 0) {
  const size = Math.max(0, Number(bytes) || 0);
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (size === 0) return { value: "0", unit: "B" };
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / (1024 ** unitIndex);
  return { value: value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1), unit: units[unitIndex] };
}

function formatTaskDueDate(value) {
  if (!value) return "No due date";
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return "No due date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);

  if (dueDay.getTime() === today.getTime()) return "Today";
  if (dueDay.getTime() === tomorrow.getTime()) return "Tomorrow";
  return dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("week");
  const [summary, setSummary] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [aiUsageLoading, setAiUsageLoading] = useState(true);
  const [aiUsageError, setAiUsageError] = useState(false);
  const [dashboardTasks, setDashboardTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(false);
  const [githubStatus, setGithubStatus] = useState(null);
  const [githubStatusLoaded, setGithubStatusLoaded] = useState(false);
  const [githubActivity, setGithubActivity] = useState([]);
  const [githubActivityLoading, setGithubActivityLoading] = useState(true);
  const [githubActivityError, setGithubActivityError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const [meRes, summaryRes] = await Promise.all([
          api.me(),
          api.dashboard.summary()
        ]);

        if (ignore) return;

        setUser(meRes?.data?.user || meRes?.user || mockUser);
        setSummary(summaryRes?.data || summaryRes || null);
        setError(false);
      } catch (err) {
        if (ignore) return;
        setError(true);
        toast(err.message || "Unable to load dashboard data", "error");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    api.notifications.list()
      .then((response) => {
        if (!ignore) setNotifications(response?.data?.notifications || []);
      })
      .catch(() => {
        if (!ignore) {
          setNotifications([]);
          setNotificationsError(true);
        }
      })
      .finally(() => {
        if (!ignore) setNotificationsLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadGitHubActivity() {
      try {
        const statusResponse = await api.github.status();
        const status = statusResponse?.data || { connected: false };
        if (ignore) return;
        setGithubStatus(status);
        setGithubStatusLoaded(true);

        if (!status.connected) return;

        const reposResponse = await api.github.repositories({ page: 1, perPage: 6 });
        const repositories = (reposResponse?.data?.repositories || []).slice(0, 4);
        const repoActivities = await Promise.all(repositories.map(async (repo) => {
          const [commitsResult, pullsResult] = await Promise.allSettled([
            api.github.resource(repo.owner, repo.name, "commits", { page: 1, perPage: 5 }),
            api.github.resource(repo.owner, repo.name, "pulls", { page: 1, perPage: 5 })
          ]);
          const items = [];

          if (commitsResult.status === "fulfilled") {
            for (const commit of commitsResult.value?.data?.commits || []) {
              const message = commit.commit?.message?.split("\n")[0] || "Commit pushed";
              items.push({
                id: `commit-${commit.sha}`,
                source: "github",
                type: "commit",
                title: message,
                actor: commit.author?.login || commit.commit?.author?.name || status.account?.login || "GitHub user",
                repo: repo.fullName || `${repo.owner}/${repo.name}`,
                createdAt: commit.commit?.author?.date || commit.commit?.committer?.date,
                url: commit.html_url
              });
            }
          }

          if (pullsResult.status === "fulfilled") {
            for (const pull of pullsResult.value?.data?.pulls || []) {
              items.push({
                id: `pull-${pull.id}`,
                source: "github",
                type: pull.merged_at ? "merge" : "pull",
                title: `${pull.merged_at ? "Merged PR" : "Updated PR"} #${pull.number}: ${pull.title}`,
                actor: pull.user?.login || status.account?.login || "GitHub user",
                repo: repo.fullName || `${repo.owner}/${repo.name}`,
                createdAt: pull.updated_at || pull.created_at,
                url: pull.html_url
              });
            }
          }

          return items;
        }));

        if (!ignore) {
          setGithubActivity(repoActivities.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8));
          setGithubActivityError(false);
        }
      } catch {
        if (!ignore) setGithubActivityError(true);
      } finally {
        if (!ignore) setGithubActivityLoading(false);
      }
    }

    loadGitHubActivity();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;

    api.tasks.list({ limit: 100, sortBy: "dueDate", sortOrder: "asc" })
      .then((response) => {
        if (!ignore) setDashboardTasks(response?.data?.tasks || []);
      })
      .catch(() => {
        if (!ignore) {
          setDashboardTasks([]);
          setTasksError(true);
        }
      })
      .finally(() => {
        if (!ignore) setTasksLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    api.ai.usage.summary({ from: monthStart.toISOString(), to: now.toISOString() })
      .then((response) => {
        if (!ignore) setAiUsage(response?.data || null);
      })
      .catch(() => {
        if (!ignore) {
          setAiUsage(null);
          setAiUsageError(true);
        }
      })
      .finally(() => {
        if (!ignore) setAiUsageLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  const unread = notifications.filter((notification) => !notification.readAt).length;
  const openTasks = dashboardTasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      if (!a.dueDate) return b.dueDate ? 1 : 0;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  const todayTasks = openTasks.filter((task) => formatTaskDueDate(task.dueDate) === "Today").length;
  const activeProjCount = summary?.activeProjects ?? 0;
  const totalProjects = summary?.totalProjects ?? 0;
  const recentProjects = summary?.recentProjects || [];
  const storageUsage = formatStorageSize(summary?.storageBytes);
  const teamAvatarColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ec4899"];
  const teamMembers = (summary?.teamMembers || []).map((member, index) => ({
    ...member,
    color: teamAvatarColors[index % teamAvatarColors.length]
  }));
  const activityFeed = githubStatus?.connected ? githubActivity.slice(0, 5) : [];
  const aiRequestCount = aiUsage?.total ?? 0;
  const aiCompletedCount = aiUsage?.completed ?? 0;
  const aiSuccessRate = aiRequestCount
    ? `${Math.round((aiCompletedCount / aiRequestCount) * 100)}%`
    : "—";
  const aiAverageResponse = aiUsage?.avgRequestDurationMs == null
    ? "—"
    : aiUsage.avgRequestDurationMs < 1000
      ? `${aiUsage.avgRequestDurationMs} ms`
      : `${(aiUsage.avgRequestDurationMs / 1000).toFixed(1)} s`;

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark w-10 h-10"><Sparkles size={18} /></div>
            <span className="eyebrow">Dashboard</span>
          </div>
          <h2 className="m-0 text-[26px] font-semibold font-display">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Developer"} 👋
          </h2>
          <p className="muted m-0 text-sm">
            You have <strong className="text-(--text)">{activeProjCount} active projects</strong>,{" "}
            <strong className="text-(--text)">{todayTasks} tasks due today</strong>, and{" "}
            <strong className="text-(--text)">{unread} unread notifications</strong>.
          </p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <Link className="btn btn-primary min-h-9.5 text-xs" href="/dashboard/projects/create">
            <Plus size={16} /> New Project
          </Link>
          <Link className="btn btn-outline min-h-9.5 text-xs" href="/dashboard/ai">
            <Sparkles size={16} /> Ask AI
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dash-grid-6">
        {loading ? (
          [1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="stat-card col-span-full">
            <p className="m-0 font-bold text-[15px]">Dashboard is unavailable</p>
            <p className="muted m-0 text-sm">The project summary could not be loaded right now.</p>
          </div>
        ) : (
          <>
            <Link href="/dashboard/projects" className="no-underline text-inherit">
              <StatCard label="Projects" value={String(totalProjects).toLocaleString()} delta={summary?.archivedProjects ? `${String(summary.archivedProjects).toLocaleString()} archived` : "No archived projects"} trend="up" icon={FolderOpen} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)" />
            </Link>
            <Link href="/dashboard/tasks" className="no-underline text-inherit">
              <StatCard label="Tasks" value={(summary?.taskCount ?? 0).toLocaleString()} delta={`${(summary?.openTaskCount ?? 0).toLocaleString()} open`} trend="neutral" icon={CheckCircle2} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" />
            </Link>
            <StatCard label="AI Requests" value={aiUsageLoading ? "…" : aiUsageError ? "—" : aiRequestCount.toLocaleString()} delta={aiUsageLoading ? "Loading usage" : aiUsageError ? "Usage unavailable" : `${aiCompletedCount.toLocaleString()} completed this month`} trend="neutral" icon={Bot} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)">
              <div className="flex items-center gap-2.5">
                <ProgressRing value={aiCompletedCount} max={Math.max(aiRequestCount, 1)} size={40} color="var(--purple)" />
                <span className="muted text-xs">{aiUsageError ? "Could not load AI usage" : `${aiCompletedCount.toLocaleString()} / ${aiRequestCount.toLocaleString()} completed`}</span>
              </div>
            </StatCard>
            <StatCard label="Storage" value={storageUsage.value} suffix={storageUsage.unit} delta="Used by project files" trend="neutral" icon={Server} iconBg="color-mix(in srgb, var(--info) 15%, transparent)" />
            <StatCard label="Deployments" value={(summary?.deploymentCount ?? 0).toLocaleString()} delta={summary?.latestDeploymentAt ? `Last ${formatActivityAge(summary.latestDeploymentAt)}` : "No deployments yet"} trend="neutral" icon={Rocket} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" />
            <StatCard label="Team Members" value={(summary?.teamMemberCount ?? 0).toLocaleString()} delta="Across your workspaces" trend="neutral" icon={Users} iconBg="color-mix(in srgb, var(--pink) 15%, transparent)">
              <AvatarGroup members={teamMembers} max={4} size={28} />
            </StatCard>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="dash-grid-2">
        {/* Productivity Chart */}
        <div className="stat-card gap-4 productivity-card" style={{ gap: 12 }}>
          <div className="flex items-center justify-between productivity-card-header">
            <div>
              <p className="m-0 font-bold text-[15px]">Productivity</p>
              <p className="muted mt-0.5 mb-0 text-xs">Tasks completed over time</p>
            </div>
            <div className="flex gap-1">
              {["day", "week", "month"].map((p) => (
                <button key={p} className={`filter-chip ${chartPeriod === p ? "active" : ""} px-2.5 py-1 text-xs`} onClick={() => setChartPeriod(p)} type="button">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-30 productivity-chart" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", columnGap: 12, height: 120, paddingTop: 4 }}>
            {mockAnalytics.weeklyTasks.map((v, i) => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const max = Math.max(...mockAnalytics.weeklyTasks);
              return (
                <div key={i} className="productivity-chart-column" style={{ minWidth: 0, height: "100%", display: "grid", gridTemplateRows: "1fr 16px", rowGap: 6 }}>
                  <div className="w-full rounded-sm productivity-bar" style={{ width: "100%", height: `${(v / max) * 90}px`, alignSelf: "end", background: i === 6 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 35%, transparent)", minHeight: 4, transition: "height 400ms ease" }} />
                  <span className="text-[10px] text-(--soft) productivity-day" style={{ textAlign: "center", lineHeight: "16px" }}>{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5 productivity-legend" style={{ marginTop: 2 }}>
            {[ ["Tasks", "var(--primary)"], ["AI Usage", "var(--purple)"], ["Deploys", "var(--success)"] ].map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-(--muted)">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: color }} />{label}
              </span>
            ))}
          </div>
        </div>

        {/* AI Usage Widget */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="m-0 font-bold text-[15px]">AI Usage</p>
              <p className="muted mt-0.5 mb-0 text-xs">This month</p>
            </div>
            <div className="logo-mark w-9 h-9" style={{ background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
          </div>
          { [
            { label: "Most Used Model", value: aiUsageLoading ? "Loading…" : aiUsageError ? "Unavailable" : aiUsage?.mostUsedModel || "No usage yet" },
            { label: "Tokens Used", value: aiUsageLoading ? "Loading…" : aiUsageError ? "Unavailable" : aiUsage?.tokensAvailable ? aiUsage.totalTokens.toLocaleString() : "Not reported" },
            { label: "Avg Response", value: aiUsageLoading ? "Loading…" : aiUsageError ? "Unavailable" : aiAverageResponse },
            { label: "Success Rate", value: aiUsageLoading ? "Loading…" : aiUsageError ? "Unavailable" : aiSuccessRate }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-(--border)/50">
              <span className="muted text-[13px]">{label}</span>
              <strong className="text-[13px]">{value}</strong>
            </div>
          ))}
          <Link className="btn btn-outline min-h-9 text-xs" href="/dashboard/analytics">
            <BarChart3 size={15} /> View Analytics
          </Link>
        </div>
      </div>

      {/* Projects + Tasks Row */}
      <div className="dash-grid-2">
        {/* Recent Projects */}
        <div className="stat-card recent-projects-card">
          <div className="recent-projects-header">
            <div>
              <p className="m-0 font-bold text-[15px]">Recent Projects</p>
              <p className="muted m-0 mt-1 text-xs">Your latest project updates</p>
            </div>
            <Link href="/dashboard/projects" className="recent-projects-view-all">View all<ChevronRight size={15} /></Link>
          </div>
          <div className="recent-projects-list">
            {recentProjects.slice(0, 4).map((p) => {
              const status = p.status || "active";
              const technologies = p.settings?.techStack || [];
              return (
                <Link href={`/dashboard/projects/${p._id}`} key={p._id} className="recent-project-row">
                  <div className="recent-project-icon" style={{ "--project-color": p.settings?.color || "var(--primary)" }}>
                    {(p.name || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="recent-project-info">
                    <span className="recent-project-name">{p.name || "Untitled project"}</span>
                    <span className="recent-project-meta">{p.slug || p.visibility || "Project workspace"}</span>
                    {technologies.length > 0 ? (
                      <span className="recent-project-tech">{technologies.slice(0, 2).join(" · ")}{technologies.length > 2 ? ` +${technologies.length - 2}` : ""}</span>
                    ) : null}
                  </div>
                  <span className={`recent-project-status status-${status}`}>{status}</span>
                  <ChevronRight className="recent-project-arrow" size={16} />
                </Link>
              );
            })}
          </div>
          {!recentProjects.length && !loading && (
            <div className="recent-projects-empty">
              <FolderOpen size={20} />
              <p>No projects yet</p>
              <span>Create a project to see it here.</span>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="stat-card upcoming-tasks-card">
          <div className="upcoming-tasks-header">
            <div>
              <p className="m-0 font-bold text-[15px]">Upcoming Tasks</p>
              <p className="muted m-0 mt-1 text-xs">Open tasks sorted by due date</p>
            </div>
            <div className="upcoming-tasks-header-actions">
              {!tasksLoading && !tasksError ? <span className="upcoming-tasks-count">{openTasks.length} open</span> : null}
              <Link href="/dashboard/tasks" className="recent-activity-view-all">View all<ChevronRight size={14} /></Link>
            </div>
          </div>
          <div className="upcoming-tasks-list">
            {tasksLoading ? (
              <p className="upcoming-tasks-message">Loading tasks…</p>
            ) : tasksError ? (
              <p className="upcoming-tasks-message">Tasks are unavailable right now.</p>
            ) : openTasks.length ? openTasks.slice(0, 5).map((task) => {
              const dueLabel = formatTaskDueDate(task.dueDate);
              const priority = task.priority || "low";
              const normalizedStatus = (task.status || "todo").replaceAll("_", "-");
              return (
                <div key={task._id} className="upcoming-task-row" style={{ "--task-priority": priority === "urgent" || priority === "high" ? "var(--danger)" : priority === "medium" ? "var(--warning)" : "var(--info)" }}>
                  <span className="upcoming-task-priority" title={`${priority} priority`} />
                  <div className="upcoming-task-copy">
                    <p>{task.title}</p>
                    <span>{task.project?.name || "Project"}</span>
                  </div>
                  <div className="upcoming-task-details">
                    <span className={`upcoming-task-due${dueLabel === "Today" ? " is-today" : ""}`}>{dueLabel}</span>
                    <StatusBadge status={normalizedStatus} />
                  </div>
                </div>
              );
            }) : (
              <p className="upcoming-tasks-message">No open tasks right now.</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Notifications Row */}
      <div className="dash-grid-2">
        {/* Activity Timeline */}
        <div className="stat-card recent-activity-card">
          <div className="recent-activity-header">
            <div>
              <p className="m-0 font-bold text-[15px]">Recent Activity</p>
              <p className="muted m-0 mt-1 text-xs">{githubStatus?.connected ? "Latest activity from GitHub" : "Connect GitHub to see repository activity"}</p>
            </div>
            <div className="recent-activity-header-actions">
              {githubStatus?.connected ? (
                <>
                  <span className="recent-activity-source"><Github size={13} /> GitHub</span>
                  <Link href="/dashboard/github" className="recent-activity-view-all">View all<ChevronRight size={14} /></Link>
                </>
              ) : <span className="recent-activity-source is-disconnected">Not connected</span>}
            </div>
          </div>
          <div className="recent-activity-list">
            {(!githubStatusLoaded && !githubActivityError) || (githubStatus?.connected && githubActivityLoading) ? (
              <p className="muted m-0 text-sm">Loading activity…</p>
            ) : !githubStatus?.connected ? (
              <div className="recent-activity-connect">
                <div className="recent-activity-connect-icon"><Github size={20} /></div>
                <p>Connect your GitHub account</p>
                <span>Recent commits and pull requests will appear here.</span>
                <Link href="/dashboard/github" className="btn btn-primary min-h-9 px-4 text-xs">Connect GitHub</Link>
              </div>
            ) : githubStatus?.connected && githubActivityError && !githubActivity.length ? (
              <p className="muted m-0 text-sm">GitHub activity is unavailable right now.</p>
            ) : activityFeed.length ? activityFeed.map((activity) => {
              const Icon = activity.type === "merge" ? GitMerge : activity.type === "pull" ? GitPullRequest : GitCommit;
              const title = activity.title;
              const actorName = activity.actor;
              const subjectName = activity.repo;
              const timeLabel = formatActivityAge(activity.createdAt);
              return (
                <div className="recent-activity-item" key={activity._id || activity.id}>
                  <div className={`recent-activity-icon is-${activity.type}`}><Icon size={16} /></div>
                  <div className="recent-activity-copy">
                    <p className="recent-activity-title">
                      {activity.url ? <a href={activity.url} target="_blank" rel="noreferrer">{title}</a> : title}
                    </p>
                    <div className="recent-activity-meta">
                      <span>{actorName}</span><span className="recent-activity-meta-separator" />
                      <span className="recent-activity-repo">{subjectName}</span>
                      <time>{timeLabel}</time>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="muted m-0 text-sm">No recent GitHub activity yet.</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Notifications</p>
            <div className="flex items-center gap-2.5">
              <span className="sidebar-badge">{unread}</span>
              <Link href="/dashboard/notifications" className="recent-activity-view-all">View all<ChevronRight size={14} /></Link>
            </div>
          </div>
          {notificationsLoading ? (
            <p className="muted m-0 text-sm">Loading notifications…</p>
          ) : notificationsError ? (
            <p className="muted m-0 text-sm">Notifications are unavailable right now.</p>
          ) : notifications.length ? notifications.slice(0, 5).map((notification) => {
            const content = (
              <>
                <span className="notification-unread-dot" />
                <span className="dashboard-notification-copy">
                  <strong>{notification.title}</strong>
                  <span className="dashboard-notification-message">{notification.message}</span>
                  <time>{formatActivityAge(notification.createdAt)}</time>
                </span>
              </>
            );
            const className = `dashboard-notification${notification.readAt ? " is-read" : " is-unread"}`;
            return notification.targetUrl?.startsWith("/") ? (
              <Link key={notification._id} href={notification.targetUrl} className={className}>{content}</Link>
            ) : (
              <div key={notification._id} className={className}>{content}</div>
            );
          }) : (
            <p className="muted m-0 text-sm">No notifications yet.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stat-card gap-4">
        <p className="m-0 font-bold text-[15px]">Quick Actions</p>
        <div className="flex gap-3 flex-wrap">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 border border-(--border) rounded-[14px] no-underline text-inherit font-semibold text-sm transition-all duration-150 p-5"
              style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div className="w-8 h-8 rounded-[10px] grid place-items-center" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                <Icon size={16} />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
