"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  FileText,
  GitCommit,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Users,
  Wand2,
  X,
  CheckCircle2
} from "lucide-react";
import { toast } from "@/components/dashboard-ui";
import { Avatar, AvatarGroup, StatCard, StatusBadge } from "@/components/dashboard-ui";

const team = {
  name: "Devflow Team",
  activeMembers: 5,
  projects: 6,
  onlineUsers: 3,
  description: "Building the future of developer tooling with AI-powered workflows."
};

const members = [
  { _id: "u1", name: "Aman Chaudhary", email: "aman@devflow.ai", role: "Admin", status: "online", currentTask: "Reviewing PR #42", lastActive: "Now", color: "#3b82f6", tasks: 24, commits: 187 },
  { _id: "u2", name: "Rahul Singh", email: "rahul@devflow.ai", role: "Developer", status: "online", currentTask: "Implementing JWT auth", lastActive: "5 min ago", color: "#8b5cf6", tasks: 18, commits: 142 },
  { _id: "u3", name: "Priya Sharma", email: "priya@devflow.ai", role: "Developer", status: "away", currentTask: "Writing unit tests", lastActive: "30 min ago", color: "#ec4899", tasks: 15, commits: 98 },
  { _id: "u4", name: "Neha Gupta", email: "neha@devflow.ai", role: "Viewer", status: "offline", currentTask: "Reviewing documentation", lastActive: "2 hours ago", color: "#f59e0b", tasks: 8, commits: 34 },
  { _id: "u5", name: "Arjun Mehta", email: "arjun@devflow.ai", role: "Developer", status: "online", currentTask: "Debugging WebSocket issue", lastActive: "1 min ago", color: "#06b6d4", tasks: 11, commits: 67 }
];

const stats = {
  completedTasks: 142,
  openTasks: 38,
  deployments: 34,
  aiRequests: 1240
};

const activityFeed = [
  { id: 1, user: "Rahul Singh", action: "created project", target: "Auth Service", time: "2 min ago", color: "#8b5cf6" },
  { id: 2, user: "Priya Sharma", action: "reviewed PR #42", target: "Login API", time: "5 min ago", color: "#ec4899" },
  { id: 3, user: "Aman Chaudhary", action: "completed task", target: "Task #42", time: "10 min ago", color: "#3b82f6" },
  { id: 4, user: "AI Assistant", action: "generated docs for", target: "API Reference", time: "15 min ago", color: "#06b6d4" },
  { id: 5, user: "Arjun Mehta", action: "fixed bug in", target: "WebSocket handler", time: "1 hour ago", color: "#06b6d4" },
  { id: 6, user: "Neha Gupta", action: "updated file", target: "README.md", time: "2 hours ago", color: "#f59e0b" }
];

const leaderboard = members
  .map((m) => ({ ...m, efficiency: Math.floor(Math.random() * 40) + 60, aiUsage: Math.floor(Math.random() * 200) + 50 }))
  .sort((a, b) => (b.tasks + b.commits) - (a.tasks + a.commits));

const sharedResources = [
  { name: "API Design Guide", type: "doc", updated: "2 days ago", owner: "Aman Chaudhary" },
  { name: "Deployment Checklist", type: "doc", updated: "1 week ago", owner: "Rahul Singh" },
  { name: "Code Review Template", type: "template", updated: "3 days ago", owner: "Priya Sharma" },
  { name: "Naming Conventions", type: "doc", updated: "5 days ago", owner: "Aman Chaudhary" }
];

const upcomingEvents = [
  { title: "Sprint Planning", date: "Jul 28", type: "meeting" },
  { title: "Sprint Review", date: "Aug 01", type: "review" },
  { title: "Release v1.2.0", date: "Aug 05", type: "deploy" },
  { title: "Team Retrospective", date: "Aug 08", type: "meeting" }
];

export default function TeamDashboardPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Team Dashboard">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => toast("Opened team chat", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
            <MessageSquare size={15} /> Team Chat
          </button>
          <button className="btn btn-outline" onClick={() => setShowInvite(true)} style={{ minHeight: 38, fontSize: 13 }} type="button">
            <Plus size={15} /> Invite Member
          </button>
        </div>
      </PageHeader>

      {/* Team Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{team.name}</h2>
          <span className="muted" style={{ fontSize: 13 }}>{team.description}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Users size={14} /> {team.activeMembers} members
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Rocket size={14} /> {team.projects} projects
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--success)" }}>
            {team.onlineUsers} online
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-grid-4">
        <StatCard label="Members" value={team.activeMembers} icon={Users} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" delta="+12 this week" trend="up" />
        <StatCard label="Open Tasks" value={stats.openTasks} icon={FileText} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" delta="-3 from last week" trend="up" />
        <StatCard label="AI Requests" value={stats.aiRequests} icon={Wand2} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)" delta="+42% vs last month" trend="up" />
      </div>

      {/* Main Grid */}
      <div className="dash-grid-2">
        {/* Team Members */}
        <div className="stat-card" style={{ gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team Members</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <Search size={14} color="var(--muted)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--text)", width: 140 }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {filteredMembers.map((member) => (
              <div key={member._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)" }}>
                <div style={{ position: "relative" }}>
                  <Avatar name={member.name} size={40} color={member.color} />
                  <div style={{
                    position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%",
                    border: "2px solid var(--bg)", background: member.status === "online" ? "var(--success)" : member.status === "away" ? "var(--warning)" : "var(--muted)"
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{member.name}</span>
                    <span style={{ padding: "2px 8px", background: "var(--border)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{member.role}</span>
                  </div>
                  <p className="muted" style={{ margin: "0 0 4px", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Working on: {member.currentTask}</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="muted" style={{ fontSize: 11 }}>{member.commits} commits</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.tasks} tasks</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.lastActive}</span>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => toast(`Messaged ${member.name}`, "info")} style={{ minHeight: 32, padding: "0 10px", fontSize: 12 }} type="button">Message</button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Activity Feed</p>
          <div style={{ display: "grid", gap: 10 }}>
            {activityFeed.map((activity) => (
              <div key={activity.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                <Avatar name={activity.user.split(" ")[0]} size={28} color={activity.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600 }}>{activity.user}</span>
                    <span className="muted"> {activity.action} </span>
                    <span style={{ fontWeight: 600 }}>{activity.target}</span>
                  </p>
                  <span className="muted" style={{ fontSize: 11 }}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dash-grid-2">
        {/* Team Performance */}
        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team Performance</p>
          <div style={{ display: "grid", gap: 10 }}>
            {leaderboard.map((member, i) => (
              <div key={member._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? "var(--warning)" : i === 1 ? "var(--muted)" : i === 2 ? "#cd7f32" : "var(--soft)", width: 24, textAlign: "center" }}>{i + 1}</span>
                <Avatar name={member.name} size={36} color={member.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{member.name}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="muted" style={{ fontSize: 11 }}>{member.tasks} tasks</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.commits} commits</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.reviews} reviews</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{member.efficiency}%</p>
                  <div style={{ width: 80, height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${member.efficiency}%`, height: "100%", background: "var(--success)", borderRadius: "inherit" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Resources & Calendar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="stat-card" style={{ gap: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Shared Resources</p>
            <div style={{ display: "grid", gap: 8 }}>
              {sharedResources.map((res) => (
                <div key={res.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer" }}>
                  <FileText size={14} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{res.name}</p>
                    <p className="muted" style={{ margin: 0, fontSize: 11 }}>Updated {res.updated} by {res.owner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card" style={{ gap: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team Calendar</p>
            <div style={{ display: "grid", gap: 8 }}>
              {upcomingEvents.map((event) => (
                <div key={event.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "color-mix(in srgb, var(--primary) 15%, transparent)", display: "grid", placeItems: "center" }}>
                    <Calendar size={16} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{event.title}</p>
                    <p className="muted" style={{ margin: 0, fontSize: 11 }}>{event.date}</p>
                  </div>
                  <StatusBadge status={event.type === "meeting" ? "in-progress" : event.type === "review" ? "warning" : "success"} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="dialog-overlay" onClick={() => setShowInvite(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Invite Member</p>
              <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button"><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Email Address</label>
                <input placeholder="colleague@example.com" className="input" />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Role</label>
                <select className="select" defaultValue="Developer">
                  <option>Admin</option>
                  <option>Developer</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowInvite(false)} type="button" style={{ minHeight: 40 }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowInvite(false); toast("Invite sent successfully", "success"); }} type="button" style={{ minHeight: 40 }}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
