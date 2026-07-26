"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  File,
  Filter,
  GitCommit,
  GitMerge,
  Rocket,
  Search,
  Upload,
  UserPlus
} from "lucide-react";
import { Avatar, FilterBar, PageHeader, toast } from "@/components/dashboard-ui";
import { mockActivity, mockProjects } from "@/lib/dashboard-data";

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" }
];

const typeFilters = [
  { label: "All", value: "all" },
  { label: "Files", value: "file" },
  { label: "Tasks", value: "task" },
  { label: "Deployments", value: "deploy" },
  { label: "AI", value: "ai" },
  { label: "Git", value: "git" }
];

const activityIcons = {
  bot: Bot,
  "git-merge": GitMerge,
  rocket: Rocket,
  "check-circle": CheckCircle2,
  upload: Upload,
  "user-plus": UserPlus,
  "git-commit": GitCommit,
  file: File
};

const groupedActivities = [
  {
    date: "Today",
    activities: [
      { _id: "a1", type: "ai", title: "AI generated API documentation", user: "AI Assistant", time: "2 min ago", icon: "bot" },
      { _id: "a2", type: "git", title: "Rahul merged PR #38 — Add auth middleware", user: "Rahul Singh", time: "5 min ago", icon: "git-merge" },
      { _id: "a3", type: "deploy", title: "Deployment completed — v2.1.0 to Production", user: "System", time: "30 min ago", icon: "rocket" },
      { _id: "a4", type: "task", title: "Aman completed task: Setup Redis caching", user: "Aman Chaudhary", time: "1 hour ago", icon: "check-circle" }
    ]
  },
  {
    date: "Yesterday",
    activities: [
      { _id: "a5", type: "file", title: "Priya uploaded design-system.fig (24.3 MB)", user: "Priya Sharma", time: "2 hours ago", icon: "upload" },
      { _id: "a6", type: "team", title: "Arjun Mehta joined the project", user: "Arjun Mehta", time: "3 hours ago", icon: "user-plus" },
      { _id: "a7", type: "ai", title: "AI reviewed 3 files for code quality", user: "AI Assistant", time: "4 hours ago", icon: "bot" },
      { _id: "a8", type: "git", title: "Neha pushed 4 commits to main branch", user: "Neha Gupta", time: "5 hours ago", icon: "git-commit" }
    ]
  },
  {
    date: "Previous 7 Days",
    activities: [
      { _id: "a9", type: "deploy", title: "Staging deployment failed — build error", user: "System", time: "1 day ago", icon: "rocket" },
      { _id: "a10", type: "task", title: "Priya created task: Update payment gateway", user: "Priya Sharma", time: "2 days ago", icon: "check-circle" },
      { _id: "a11", type: "file", title: "Aman updated database-schema.sql", user: "Aman Chaudhary", time: "3 days ago", icon: "file" },
      { _id: "a12", type: "git", title: "Rahul created branch: feature/auth-v2", user: "Rahul Singh", time: "4 days ago", icon: "git-commit" }
    ]
  }
];

export default function ProjectActivityPage() {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p._id === projectId) || mockProjects[0];
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("today");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expanded, setExpanded] = useState(true);

  const filteredGroups = groupedActivities; // In real app, filter by timeFilter and typeFilter

  return (
    <>
      <PageHeader title="Activity" subtitle="Track all project changes">
        <button className="btn btn-outline" onClick={() => toast("Exporting CSV...", "info")} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <Download size={15} /> Export CSV
        </button>
        <button className="btn btn-outline" onClick={() => toast("Exporting PDF...", "info")} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <File size={15} /> Export PDF
        </button>
      </PageHeader>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ flex: 1, maxWidth: 280 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <FilterBar filters={timeFilters} active={timeFilter} onChange={setTimeFilter} />
        <FilterBar filters={typeFilters} active={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Activity Timeline */}
      <div className="stat-card" style={{ gap: 20 }}>
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.date}>
            <button
              onClick={() => setExpanded(expanded === group.date ? false : group.date)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginBottom: 12
              }}
              type="button"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={14} color="var(--muted)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{group.date}</span>
                <span className="muted" style={{ fontSize: 11 }}>{group.activities.length} events</span>
              </div>
              <ChevronDown size={14} color="var(--muted)" style={{ transition: "transform 200ms ease", transform: expanded === group.date ? "rotate(0deg)" : "rotate(-90deg)" }} />
            </button>

            {expanded === group.date && (
              <div className="timeline" style={{ paddingLeft: 24 }}>
                {group.activities.map((activity) => {
                  const Icon = activityIcons[activity.icon] || Activity;
                  return (
                    <div className="timeline-item" key={activity._id}>
                      <div className="timeline-dot" style={{ background: activity.type === "ai" ? "color-mix(in srgb, var(--purple) 20%, transparent)" : activity.type === "deploy" ? "color-mix(in srgb, var(--success) 20%, transparent)" : "color-mix(in srgb, var(--primary) 20%, transparent)" }}>
                        <Icon size={14} color={activity.type === "ai" ? "var(--purple)" : activity.type === "deploy" ? "var(--success)" : "var(--primary)"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{activity.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Avatar name={activity.user} size={20} color={activity.type === "ai" ? "var(--purple)" : "var(--primary)"} />
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{activity.user}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--soft)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--soft)" }}>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {groupIndex < filteredGroups.length - 1 && <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />}
          </div>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="dash-grid-4">
        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "color-mix(in srgb, var(--purple) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <Bot size={16} color="var(--purple)" />
            </div>
            <span className="muted" style={{ fontSize: 12 }}>AI Actions</span>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>24</p>
          <span className="muted" style={{ fontSize: 11 }}>This week</span>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <Rocket size={16} color="var(--success)" />
            </div>
            <span className="muted" style={{ fontSize: 12 }}>Deployments</span>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>8</p>
          <span className="muted" style={{ fontSize: 11 }}>This week</span>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <GitCommit size={16} color="var(--primary)" />
            </div>
            <span className="muted" style={{ fontSize: 12 }}>Commits</span>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>42</p>
          <span className="muted" style={{ fontSize: 11 }}>This week</span>
        </div>

        <div className="stat-card" style={{ gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "color-mix(in srgb, var(--info) 15%, transparent)", display: "grid", placeItems: "center" }}>
              <File size={16} color="var(--info)" />
            </div>
            <span className="muted" style={{ fontSize: 12 }}>Files Changed</span>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>18</p>
          <span className="muted" style={{ fontSize: 11 }}>This week</span>
        </div>
      </div>
    </>
  );
}