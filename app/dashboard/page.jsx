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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark" style={{ width: 40, height: 40 }}><Sparkles size={18} /></div>
            <span className="eyebrow">Workspace Overview</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>
            {getGreeting()}, {mockUser.name.split(" ")[0]} 👋
          </h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            You have <strong style={{ color: "var(--text)" }}>{activeProjCount} active projects</strong>,{" "}
            <strong style={{ color: "var(--text)" }}>{todayTasks} tasks due today</strong>, and{" "}
            <strong style={{ color: "var(--text)" }}>{unread} unread notifications</strong>.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/dashboard/projects/create" style={{ minHeight: 38, fontSize: 13 }}>
            <Plus size={16} /> New Project
          </Link>
          <Link className="btn btn-outline" href="/dashboard/ai" style={{ minHeight: 38, fontSize: 13 }}>
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
            <Link href="/dashboard/projects" style={{ textDecoration: "none" }}>
              <StatCard label="Projects" value={mockProjects.length} delta="+3 this week" trend="up" icon={FolderOpen} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)">
                <MiniBarChart data={[3,5,4,6,5,7,6]} color="var(--primary)" height={36} />
              </StatCard>
            </Link>
            <Link href="/dashboard/tasks" style={{ textDecoration: "none" }}>
              <StatCard label="Tasks" value={42} delta={`${todayTasks} due today`} trend="neutral" icon={CheckCircle2} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)">
                <ProgressBar value={34} max={42} />
              </StatCard>
            </Link>
            <StatCard label="AI Requests" value={138} delta="20 remaining" trend="neutral" icon={Bot} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ProgressRing value={118} max={138} size={40} color="var(--purple)" />
                <span className="muted" style={{ fontSize: 12 }}>118 / 138 used</span>
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
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Productivity</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Tasks completed over time</p>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["day", "week", "month"].map((p) => (
                <button key={p} className={`filter-chip ${chartPeriod === p ? "active" : ""}`} onClick={() => setChartPeriod(p)} style={{ padding: "4px 10px", fontSize: 12 }} type="button">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
            {mockAnalytics.weeklyTasks.map((v, i) => {
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const max = Math.max(...mockAnalytics.weeklyTasks);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: `${(v / max) * 90}px`, background: i === 6 ? "var(--primary)" : "color-mix(in srgb, var(--primary) 35%, transparent)", borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 400ms ease" }} />
                  <span style={{ fontSize: 10, color: "var(--soft)" }}>{days[i]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Tasks", "var(--primary)"], ["AI Usage", "var(--purple)"], ["Deploys", "var(--success)"]].map(([label, color]) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{label}
              </span>
            ))}
          </div>
        </div>

        {/* AI Usage Widget */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>AI Usage</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Current billing period</p>
            </div>
            <div className="logo-mark" style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}><Bot size={18} /></div>
          </div>
          {[
            { label: "Current Model", value: mockAnalytics.aiStats.model },
            { label: "Tokens Used", value: mockAnalytics.aiStats.tokensUsed.toLocaleString() },
            { label: "Avg Response", value: mockAnalytics.aiStats.avgResponse },
            { label: "Success Rate", value: mockAnalytics.aiStats.successRate }
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
              <span className="muted" style={{ fontSize: 13 }}>{label}</span>
              <strong style={{ fontSize: 13 }}>{value}</strong>
            </div>
          ))}
          <Link className="btn btn-outline" href="/dashboard/analytics" style={{ minHeight: 36, fontSize: 13 }}>
            <BarChart3 size={15} /> View Analytics
          </Link>
        </div>
      </div>

      {/* Projects + Tasks Row */}
      <div className="dash-grid-2">
        {/* Recent Projects */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Projects</p>
            <Link href="/dashboard/projects" className="muted" style={{ fontSize: 13, fontWeight: 600 }}>View all</Link>
          </div>
          {mockProjects.slice(0, 4).map((p) => (
            <Link href={`/dashboard/projects/${p._id}`} key={p._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", textDecoration: "none", color: "inherit" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: p.color, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {p.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {p.stack.slice(0, 2).map((s) => <span key={s} className="badge" style={{ padding: "2px 7px", fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>{p.progress}%</p>
                <ProgressBar value={p.progress} />
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming Tasks */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Upcoming Tasks</p>
            <Link href="/dashboard/tasks" className="muted" style={{ fontSize: 13, fontWeight: 600 }}>View all</Link>
          </div>
          {mockTasks.slice(0, 5).map((t) => (
            <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.priority === "high" ? "var(--danger)" : t.priority === "medium" ? "var(--warning)" : "var(--info)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                <span className="muted" style={{ fontSize: 11 }}>{t.project}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: t.dueDate === "Today" ? "var(--danger)" : "var(--muted)", fontWeight: 600 }}>{t.dueDate}</span>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity + Notifications Row */}
      <div className="dash-grid-2">
        {/* Activity Timeline */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Recent Activity</p>
            <Clock size={16} color="var(--muted)" />
          </div>
          <div className="timeline">
            {mockActivity.slice(0, 5).map((a) => {
              const Icon = activityIcons[a.icon] || Activity;
              return (
                <div className="timeline-item" key={a._id}>
                  <div className="timeline-dot"><Icon size={16} color="var(--primary)" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{a.title}</p>
                    <span style={{ fontSize: 11, color: "var(--soft)" }}>{a.user} · {a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Notifications</p>
            <span className="sidebar-badge">{unread}</span>
          </div>
          {mockNotifications.slice(0, 5).map((n) => (
            <div key={n._id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", alignItems: "flex-start" }}>
              {!n.read ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", marginTop: 5, flexShrink: 0 }} /> : <div style={{ width: 7, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{n.title}</p>
                <p className="muted" style={{ margin: "0 0 2px", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.desc}</p>
                <span style={{ fontSize: 11, color: "var(--soft)" }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stat-card" style={{ gap: 16 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Quick Actions</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link
              key={label}
              href={href}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", border: "1px solid var(--border)", borderRadius: 14, background: "color-mix(in srgb, var(--card) 92%, transparent)", textDecoration: "none", color: "inherit", fontWeight: 600, fontSize: 14, transition: "all 150ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center", color }}>
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
