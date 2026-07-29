"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  ChevronDown,
  Clock,
  Code,
  Download,
  FileCode,
  GitCommit,
  Layers,
  Rocket,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  FilterBar,
  MiniBarChart,
  PageHeader,
  ProgressBar,
  ProgressRing,
  StatusBadge,
  toast
} from "@/components/dashboard-ui";
import { mockAnalytics, mockProjects, mockTeamMembers } from "@/lib/dashboard-data";

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" }
];

const projectFilter = [
  { label: "All Projects", value: "all" },
  ...mockProjects.map((p) => ({ label: p.name, value: p._id }))
];

const leaderboardData = mockTeamMembers
  .map((m) => ({
    ...m,
    efficiency: Math.floor(Math.random() * 40) + 60,
    aiUsage: Math.floor(Math.random() * 200) + 50
  }))
  .sort((a, b) => b.tasks + b.commits - (a.tasks + a.commits));

const heatmapDays = Array.from({ length: 35 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (34 - i));
  return {
    date: day.toISOString().split("T")[0],
    count: Math.floor(Math.random() * 8),
    day: day.toLocaleDateString("en-US", { weekday: "short" })
  };
});

// AnalyticsPage is a page component that renders the "Analytics" dashboard of the application. It displays key performance metrics such as tasks completed, total commits, deployments, and AI requests, along with visualizations like area charts, pie charts, and heatmaps. The page also includes filters for time and project selection, as well as a team leaderboard showcasing top performers.
export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("week");
  const [projectFilterVal, setProjectFilterVal] = useState("all");
  const [chartView, setChartView] = useState("tasks");

  return (
    <>
      <PageHeader title="Analytics" subtitle="Track your team's performance">
        <button className="btn btn-outline" onClick={() => toast("Downloading report...", "info")} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <Download size={15} /> Export Report
        </button>
      </PageHeader>

      {/* Top Stats */}
      <div className="dash-grid-4">
        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>Tasks Completed</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>
                {mockAnalytics.tasksCompleted.value}
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <TrendingUp size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
              <ArrowUp size={12} /> {mockAnalytics.tasksCompleted.delta}
            </span>
            <span className="muted" style={{ fontSize: 11 }}>vs last period</span>
          </div>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>Total Commits</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>
                {mockAnalytics.commits.value}
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--info) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <GitCommit size={18} color="var(--info)" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
              <ArrowUp size={12} /> {mockAnalytics.commits.delta}
            </span>
            <span className="muted" style={{ fontSize: 11 }}>vs last period</span>
          </div>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>Deployments</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>
                {mockAnalytics.deployments.value}
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <Rocket size={18} color="var(--success)" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>
              <ArrowDown size={12} /> {mockAnalytics.deployments.delta}
            </span>
            <span className="muted" style={{ fontSize: 11 }}>vs last period</span>
          </div>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>AI Requests</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>
                {mockAnalytics.aiRequests.value}
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--purple) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <Zap size={18} color="var(--purple)" />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 2, color: "var(--success)", fontSize: 12, fontWeight: 700 }}>
              <ArrowUp size={12} /> {mockAnalytics.aiRequests.delta}
            </span>
            <span className="muted" style={{ fontSize: 11 }}>vs last period</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <FilterBar filters={timeFilters} active={timeFilter} onChange={setTimeFilter} />
        <FilterBar filters={projectFilter} active={projectFilterVal} onChange={setProjectFilterVal} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 4, border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
          {[
            { id: "tasks", label: "Tasks", icon: Calendar },
            { id: "commits", label: "Commits", icon: GitCommit },
            { id: "deploys", label: "Deploys", icon: Rocket }
          ].map((v) => (
            <button
              key={v.id}
              className={`icon-btn ${chartView === v.id ? "active" : ""}`}
              onClick={() => setChartView(v.id)}
              style={{ width: 32, height: 32, border: "none", background: chartView === v.id ? "var(--primary)" : "transparent", color: chartView === v.id ? "white" : "var(--muted)", borderRadius: 8 }}
              title={v.label}
              type="button"
            >
              <v.icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="dash-grid-2">
        {/* Area Chart - Activity Over Time */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Activity Overview</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Daily activity trends</p>
            </div>
          </div>
          <div style={{ position: "relative", height: 200 }}>
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0,150 Q50,120 100,130 T200,80 T300,100 T400,60 T500,90 T600,40 L600,200 L0,200 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M0,150 Q50,120 100,130 T200,80 T300,100 T400,60 T500,90 T600,40"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[0, 100, 200, 300, 400, 500, 600].map((x, i) => (
                <text key={i} x={x} y="195" fill="var(--soft)" fontSize="10" textAnchor="middle">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Pie Chart - Language Distribution */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Languages Used</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Code distribution by language</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                {/* JavaScript - 42% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3.8" strokeDasharray="42 58" />
                {/* TypeScript - 28% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3.8" strokeDasharray="28 72" strokeDashoffset="-42" />
                {/* Python - 18% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3.8" strokeDasharray="18 82" strokeDashoffset="-70" />
                {/* CSS - 12% */}
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" strokeWidth="3.8" strokeDasharray="12 88" strokeDashoffset="-88" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>4</p>
                  <p className="muted" style={{ margin: 0, fontSize: 10 }}>Languages</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {mockAnalytics.languages.map((lang) => (
                <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: lang.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{lang.name}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{lang.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="dash-grid-2">
        {/* Coding Heatmap */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Coding Activity</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Last 35 days</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="muted" style={{ fontSize: 11 }}>Less</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: level === 0 ? "var(--border)" : `color-mix(in srgb, var(--primary) ${level * 25}%, transparent)`
                    }}
                  />
                ))}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>More</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {heatmapDays.map((day, i) => (
              <div
                key={i}
                title={`${day.date}: ${day.count} activities`}
                style={{
                  aspectRatio: 1,
                  borderRadius: 4,
                  background: day.count === 0 ? "var(--border)" : `color-mix(in srgb, var(--primary) ${day.count * 20}%, transparent)`,
                  cursor: "pointer",
                  transition: "transform 150ms ease",
                  transform: "scale(1)"
                }}
              />
            ))}
          </div>
        </div>

        {/* Deployment Analytics */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Deployment Stats</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Build and deploy metrics</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--border)", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "var(--success)" }}>{mockAnalytics.deployStats.successful}</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Successful</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--border)", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "var(--danger)" }}>{mockAnalytics.deployStats.failed}</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Failed</p>
            </div>
            <div style={{ textAlign: "center", padding: 16, border: "1px solid var(--border)", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "var(--info)" }}>{mockAnalytics.deployStats.avgBuildTime}</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Avg Build</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {mockAnalytics.weeklyDeploys.map((v, i) => {
              const max = Math.max(...mockAnalytics.weeklyDeploys);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${(v / max) * 80}px`,
                      background: i === mockAnalytics.weeklyDeploys.length - 1 ? "var(--success)" : "color-mix(in srgb, var(--success) 40%, transparent)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 4,
                      transition: "height 400ms ease"
                    }}
                  />
                  <span style={{ fontSize: 10, color: "var(--soft)" }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="dash-grid-2">
        {/* Team Leaderboard */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team Leaderboard</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Top performers this week</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {leaderboardData.slice(0, 5).map((member, i) => (
              <div key={member._id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "var(--warning)" : i === 1 ? "var(--muted)" : i === 2 ? "#cd7f32" : "var(--soft)", width: 24, textAlign: "center" }}>
                  {i + 1}
                </span>
                <Avatar name={member.name} size={36} color={member.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{member.name}</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="muted" style={{ fontSize: 11 }}>{member.tasks} tasks</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.commits} commits</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{member.efficiency}%</p>
                  <ProgressBar value={member.efficiency} max={100} color="var(--success)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analytics */}
        <div className="stat-card" style={{ gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>AI Usage Analytics</p>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Model performance and usage</p>
            </div>
            <div className="logo-mark" style={{ width: 36, height: 36, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}>
              <Zap size={18} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="muted" style={{ fontSize: 13 }}>Current Model</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{mockAnalytics.aiStats.model}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["GPT-4o", "GPT-4", "Claude"].map((model) => (
                  <button
                    key={model}
                    className="badge"
                    style={{ padding: "4px 10px", fontSize: 11, background: model === mockAnalytics.aiStats.model ? "var(--primary)" : "transparent", color: model === mockAnalytics.aiStats.model ? "white" : "var(--muted)" }}
                    onClick={() => toast(`Switched to ${model}`, "info")}
                    type="button"
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: "Tokens Used", value: mockAnalytics.aiStats.tokensUsed.toLocaleString(), icon: Code },
              { label: "Avg Response Time", value: mockAnalytics.aiStats.avgResponse, icon: Clock },
              { label: "Success Rate", value: mockAnalytics.aiStats.successRate, icon: TrendingUp }
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "color-mix(in srgb, var(--purple) 15%, transparent)", display: "grid", placeItems: "center" }}>
                  <stat.icon size={16} color="var(--purple)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="muted" style={{ margin: "0 0 2px", fontSize: 12 }}>{stat.label}</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{stat.value}</p>
                </div>
              </div>
            ))}

            <div style={{ padding: 14, background: "color-mix(in srgb, var(--purple) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--purple) 25%, transparent)", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>AI Request Limit</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>118 of 138 requests used</p>
                </div>
                <ProgressRing value={118} max={138} size={48} stroke={5} color="var(--purple)" />
              </div>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={118} max={138} color="linear-gradient(90deg, var(--purple), var(--primary))" />
              </div>
              <button className="btn btn-primary" onClick={() => toast("Opening upgrade page...", "info")} style={{ minHeight: 34, fontSize: 12, marginTop: 12, width: "100%" }} type="button">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}