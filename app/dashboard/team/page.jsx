"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Users,
  Wand2,
  X
} from "lucide-react";
import { Avatar, AvatarGroup, PageHeader, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

export default function TeamDashboardPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState({ name: "Workspace Team", activeMembers: 0, projects: 0, onlineUsers: 0, description: "Team collaboration overview" });
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true);
        setError(null);

        const projectsRes = await api.projects.list({ page: 1, limit: 100, sortBy: "updatedAt", sortOrder: "desc" });
        const projectItems = projectsRes?.data?.projects || projectsRes?.projects || [];
        setProjects(projectItems);

        const workspaceId = projectItems[0]?.workspace?._id || projectItems[0]?.workspace;
        const membersRes = workspaceId ? await api.tasks.members.workspace(workspaceId) : { data: { members: [] } };
        const memberItems = membersRes?.data?.members || membersRes?.members || [];
        const normalizedMembers = memberItems.map((member) => ({
          _id: member._id || member.user?._id,
          name: member.user?.name || "Unknown Member",
          email: member.user?.email || "",
          role: member.role || "member",
          status: member.status === "active" ? "online" : "offline",
          currentTask: "Reviewing workspace activity",
          lastActive: member.updatedAt ? new Date(member.updatedAt).toLocaleDateString() : "Recently",
          color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"][Math.abs((member.user?.name || "").length) % 5],
          tasks: 0,
          commits: 0
        }));

        setMembers(normalizedMembers);
        setTeam((prev) => ({
          ...prev,
          name: projectItems[0]?.workspace?.name || "Workspace Team",
          activeMembers: normalizedMembers.length,
          projects: projectItems.length,
          onlineUsers: normalizedMembers.filter((member) => member.status === "online").length,
          description: "Workspace activity, members, and collaboration status"
        }));

        const activityItems = (projectItems[0] && projectItems[0].activity) || [];
        setActivity(
          activityItems.length
            ? activityItems.map((entry, index) => ({
                id: entry._id || `${entry.action}-${index}`,
                user: entry.actor?.name || "System",
                action: entry.action || "updated project",
                target: entry.entityId || projectItems[0]?.name || "workspace",
                time: entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "Recently",
                color: ["#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b"][index % 5]
              }))
            : []
        );
      } catch (err) {
        setError(err.message || "Unable to load workspace team data");
        toast(err.message || "Unable to load workspace team data", "error");
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, []);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) => `${m.name} ${m.role}`.toLowerCase().includes(term));
  }, [members, search]);

  const stats = {
    completedTasks: 0,
    openTasks: 0,
    deployments: 0,
    aiRequests: 0
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader title="Team Dashboard" subtitle="Loading workspace members..." />
        <div className="dash-grid-4">
          {[1,2,3,4].map((item) => <div key={item} className="stat-card" style={{ minHeight: 96 }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <PageHeader title="Team Dashboard" subtitle="Error loading team workspace" />
        <div className="stat-card" style={{ padding: 24 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Unable to load team data</p>
          <p className="muted" style={{ margin: "8px 0 0" }}>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 16 }} type="button">Retry</button>
        </div>
      </div>
    );
  }

  const leaderboard = [...members]
    .map((member) => ({ ...member, efficiency: Math.max(60, Math.min(99, member.tasks + member.commits / 5)), aiUsage: 60 + (member.commits % 150) }))
    .sort((a, b) => (b.tasks + b.commits) - (a.tasks + a.commits));

  const sharedResources = [
    { name: "API Design Guide", type: "doc", updated: "2 days ago", owner: team.name },
    { name: "Deployment Checklist", type: "doc", updated: "1 week ago", owner: members[0]?.name || "Workspace" },
    { name: "Code Review Template", type: "template", updated: "3 days ago", owner: members[1]?.name || "Workspace" }
  ];

  const upcomingEvents = [
    { title: "Sprint Planning", date: "Next week", type: "meeting" },
    { title: "Sprint Review", date: "This week", type: "review" },
    { title: "Release Checkpoint", date: "Upcoming", type: "deploy" }
  ];

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

      <div className="dash-grid-4">
        <StatCard label="Members" value={team.activeMembers} icon={Users} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" delta="live sync" trend="up" />
        <StatCard label="Open Tasks" value={stats.openTasks} icon={FileText} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" delta="workspace" trend="up" />
        <StatCard label="AI Requests" value={stats.aiRequests} icon={Wand2} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)" delta="tracked" trend="up" />
      </div>

      <div className="dash-grid-2">
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
                  <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--bg)", background: member.status === "online" ? "var(--success)" : "var(--muted)" }} />
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

        <div className="stat-card" style={{ gap: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Activity Feed</p>
          <div style={{ display: "grid", gap: 10 }}>
            {activity.length === 0 ? (
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>No recent workspace activity yet.</p>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                  <Avatar name={entry.user.split(" ")[0]} size={28} color={entry.color} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{entry.user}</span>
                      <span className="muted"> {entry.action} </span>
                      <span style={{ fontWeight: 600 }}>{entry.target}</span>
                    </p>
                    <span className="muted" style={{ fontSize: 11 }}>{entry.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid-2">
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
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "var(--success)" }}>{Math.round(member.efficiency)}%</p>
                  <div style={{ width: 80, height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.round(member.efficiency)}%`, height: "100%", background: "var(--success)", borderRadius: "inherit" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
