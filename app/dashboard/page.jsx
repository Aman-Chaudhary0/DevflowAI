"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  FolderOpen,
  Plus,
  Rocket,
  Server,
  Sparkles,
  Upload,
  UserPlus,
  Users,
  Zap
} from "lucide-react";
import {
  AvatarGroup,
  MiniBarChart,
  PageHeader,
  ProgressBar,
  ProgressRing,
  SkeletonCard,
  StatCard,
  StatusBadge,
  toast
} from "@/components/dashboard-ui";
import {
  getGreeting,
  mockActivity,
  mockAnalytics,
  mockNotifications,
  mockProjects,
  mockTasks,
  mockUser
} from "@/lib/dashboard-data";

const quickActions = [
  { label: "New Project", icon: FolderOpen, href: "/dashboard/projects/create", color: "var(--primary)" },
  { label: "Ask AI", icon: Sparkles, href: "/dashboard/ai", color: "var(--purple)" },
  { label: "Upload File", icon: Upload, href: "/dashboard/files", color: "var(--info)" },
  { label: "Invite Member", icon: UserPlus, href: "/dashboard/settings", color: "var(--success)" },
  { label: "Create Task", icon: Plus, href: "/dashboard/tasks", color: "var(--warning)" }
];

const activityIcons = {
  bot: Bot, "git-merge": Activity, rocket: Rocket, "check-circle": CheckCircle2,
  upload: Upload, "user-plus": UserPlus, "git-commit": Activity
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("week");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const unread = mockNotifications.filter((n) => !n.read).length;
  const todayTasks = mockTasks.filter((t) => t.dueDate === "Today").length;
  const activeProjCount = mockProjects.filter((p) => p.status === "active").length;

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="logo-mark w-10 h-10"><Sparkles size={18} /></div>
            <span className="eyebrow">Workspace Overview</span>
          </div>
          <h2 className="m-0 text-[26px] font-extrabold font-display">
            {getGreeting()}, {mockUser.name.split(" ")[0]} 👋
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
        ) : (
          <>
            <Link href="/dashboard/projects" className="no-underline text-inherit">
              <StatCard label="Projects" value={mockProjects.length} delta="+3 this week" trend="up" icon={FolderOpen} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)">
                <MiniBarChart data={[3,5,4,6,5,7,6]} color="var(--primary)" height={36} />
              </StatCard>
            </Link>
            <Link href="/dashboard/tasks" className="no-underline text-inherit">
              <StatCard label="Tasks" value={42} delta={`${todayTasks} due today`} trend="neutral" icon={CheckCircle2} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)">
                <ProgressBar value={34} max={42} />
              </StatCard>
            </Link>
            <StatCard label="AI Requests" value={138} delta="20 remaining" trend="neutral" icon={Bot} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)">
              <div className="flex items-center gap-2.5">
                <ProgressRing value={118} max={138} size={40} color="var(--purple)" />
                <span className="muted text-xs">118 / 138 used</span>
              </div>
            </StatCard>
            <StatCard label="Storage" value="4.3" suffix="GB" delta="of 10 GB" trend="neutral" icon={Server} iconBg="color-mix(in srgb, var(--info) 15%, transparent)">
              <ProgressBar value={4.3} max={10} color="linear-gradient(90deg, var(--info), var(--primary))" />
            </StatCard>
            <StatCard label="Deployments" value={12} delta="Last 2h ago" trend="up" icon={Rocket} iconBg="color-mix(in srgb, var(--success) 15%, transparent)">
              <MiniBarChart data={[2,4,3,6,4,8,5]} color="var(--success)" height={36} />
            </StatCard>
            <StatCard label="Team Online" value={18} delta="3 active now" trend="up" icon={Users} iconBg="color-mix(in srgb, var(--pink) 15%, transparent)">
              <AvatarGroup members={mockProjects[0].members} max={4} size={28} />
            </StatCard>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="dash-grid-2">
        {/* Productivity Chart */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
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
          <div className="flex items-end gap-1.5 h-30">
            {mockAnalytics.weeklyTasks.map((v, i) => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const max = Math.max(...mockAnalytics.weeklyTasks);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full rounded-sm" style={{ height: `${(v / max) * 90}px`, background: i === 6 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 35%, transparent)", minHeight: 4, transition: "height 400ms ease" }} />
                  <span className="text-[10px] text-(--soft)">{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-5">
            {[["Tasks", "var(--primary)"], ["AI Usage", "var(--purple)"], ["Deploys", "var(--success)"]].map(([label, color]) => (
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
              <p className="muted mt-0.5 mb-0 text-xs">Current billing period</p>
            </div>
            <div className="logo-mark w-9 h-9" style={{ background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
          </div>
          {[
            { label: "Current Model", value: mockAnalytics.aiStats.model },
            { label: "Tokens Used", value: mockAnalytics.aiStats.tokensUsed.toLocaleString() },
            { label: "Avg Response", value: mockAnalytics.aiStats.avgResponse },
            { label: "Success Rate", value: mockAnalytics.aiStats.successRate }
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
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Recent Projects</p>
            <Link href="/dashboard/projects" className="muted text-[13px] font-semibold">View all</Link>
          </div>
          {mockProjects.slice(0, 4).map((p) => (
            <Link href={`/dashboard/projects/${p._id}`} key={p._id} className="flex items-center gap-3 py-2.5 border-b border-(--border)/40 no-underline text-inherit" style={{ borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)" }}>
              <div className="w-9 h-9 rounded-[10px] grid place-items-center text-white font-extrabold text-sm shrink-0" style={{ background: p.color }}>
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 font-semibold text-[13px] overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</p>
                <div className="flex gap-1.5">
                  {p.stack.slice(0, 2).map((s) => <span key={s} className="badge px-1.5 py-0.5 text-[11px]">{s}</span>)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="m-0 mb-1 text-[13px] font-bold">{p.progress}%</p>
                <ProgressBar value={p.progress} />
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming Tasks */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Upcoming Tasks</p>
            <Link href="/dashboard/tasks" className="muted text-[13px] font-semibold">View all</Link>
          </div>
          {mockTasks.slice(0, 5).map((t) => (
            <div key={t._id} className="flex items-center gap-3 py-2 border-b border-(--border)/40">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.priority === "high" ? "var(--danger)" : t.priority === "medium" ? "var(--warning)" : "var(--info)" }} />
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{t.title}</p>
                <span className="muted text-[11px]">{t.project}</span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] font-semibold" style={{ color: t.dueDate === "Today" ? "var(--danger)" : "var(--muted)" }}>{t.dueDate}</span>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity + Notifications Row */}
      <div className="dash-grid-2">
        {/* Activity Timeline */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Recent Activity</p>
            <Clock size={16} color="var(--muted)" />
          </div>
          <div className="timeline">
            {mockActivity.slice(0, 5).map((a) => {
              const Icon = activityIcons[a.icon] || Activity;
              return (
                <div className="timeline-item" key={a._id}>
                  <div className="timeline-dot"><Icon size={16} color="var(--primary)" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 mb-0.5 text-[13px] font-semibold">{a.title}</p>
                    <span className="text-[11px] text-(--soft)">{a.user} · {a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="stat-card gap-4">
          <div className="flex items-center justify-between">
            <p className="m-0 font-bold text-[15px]">Notifications</p>
            <span className="sidebar-badge">{unread}</span>
          </div>
          {mockNotifications.slice(0, 5).map((n) => (
            <div key={n._id} className="flex gap-2.5 py-2 border-b border-(--border)/40 items-start">
              {!n.read ? <div className="w-1.75 h-1.75 rounded-full bg-(--primary) mt-1.25 shrink-0" /> : <div className="w-1.75 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13px] font-semibold">{n.title}</p>
                <p className="muted m-0 mb-0.5 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{n.desc}</p>
                <span className="text-[11px] text-(--soft)">{n.time}</span>
              </div>
            </div>
          ))}
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
              className="flex items-center gap-2.5 border border-(--border) rounded-[14px] no-underline text-inherit font-semibold text-sm transition-all duration-150"
              className="p-5" style={{ background: "color-mix(in srgb, var(--card) 92%, transparent)" }}
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
