"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Users,
  Wand2,
} from "lucide-react";
import { Avatar, PageHeader, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";

export default function TeamDashboardPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState({ name: "Workspace Team", activeMembers: 0, projects: 0, description: "Team collaboration overview" });
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const workspaceIdRef = useRef(null);

  const loadTeamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsRes = await api.projects.list({ page: 1, limit: 100, sortBy: "updatedAt", sortOrder: "desc" });
      const projectItems = projectsRes?.data?.projects || projectsRes?.projects || [];
      const workspace = projectItems[0]?.workspace;
      const workspaceId = workspace?._id || workspace;
      workspaceIdRef.current = workspaceId || null;
      if (!workspaceId) {
        setMembers([]);
        setTasks([]);
        setActivity([]);
        setTeam({ name: "Workspace Team", activeMembers: 0, projects: projectItems.length, description: "No accessible project is available to identify the workspace." });
        return;
      }

      const [membersRes, tasksRes, activityRes] = await Promise.all([
        api.tasks.members.workspace(workspaceId),
        api.tasks.list({ workspaceId, page: 1, limit: 100 }),
        api.tasks.activityWorkspace(workspaceId)
      ]);
      const memberItems = membersRes?.data?.members || membersRes?.members || [];
      const taskItems = tasksRes?.data?.tasks || tasksRes?.tasks || [];
      const activityItems = activityRes?.data?.activity || activityRes?.activity || [];
      setTasks(taskItems);
      const normalizedMembers = memberItems.map((member) => {
        const userId = String(member.user?._id || "");
        const assigned = taskItems.filter((task) => String(task.assignee?._id || task.assignee || "") === userId);
        const latestTask = assigned[0];
        return {
          _id: member._id || userId,
          userId,
          name: member.user?.name || "Unknown Member",
          email: member.user?.email || "",
          role: member.role || "member",
          status: member.status || "pending",
          currentTask: latestTask?.title || "No assigned tasks",
          lastActive: member.joinedAt ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}` : "—",
          projects: member.projectCount || 0,
          color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"][Math.abs((member.user?.name || "").length) % 5],
          tasks: assigned.length,
          completedTasks: assigned.filter((task) => task.status === "done").length
        };
      });
      setMembers(normalizedMembers);
      setTeam({
        name: workspace?.name || "Workspace Team",
        activeMembers: normalizedMembers.filter((member) => member.status === "active").length,
        projects: projectItems.length,
        description: "Workspace members, tasks, and persisted activity"
      });
      const projectNames = new Map(projectItems.map((project) => [String(project._id), project.name]));
      setActivity(activityItems.slice(0, 10).map((entry, index) => ({
        id: String(entry._id),
        user: entry.actor?.name || "Team member",
        action: String(entry.action || "updated").replaceAll("_", " "),
        target: entry.metadata?.title || entry.entityId || entry.entityType,
        project: projectNames.get(String(entry.project)) || "Workspace",
        time: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "",
        color: ["#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4", "#f59e0b"][index % 5]
      })));
    } catch (err) {
      setError(err.message || "Unable to load workspace team data");
      toast(err.message || "Unable to load workspace team data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
    const socket = connectRealtime();
    const refresh = (event) => {
      if (!event?.workspaceId || String(event.workspaceId) === String(workspaceIdRef.current)) loadTeamData();
    };
    socket.on("activity.created", refresh);
    socket.on("task.created", refresh);
    socket.on("task.updated", refresh);
    socket.on("task.deleted", refresh);
    socket.on("connect", loadTeamData);
    return () => {
      socket.off("activity.created", refresh);
      socket.off("task.created", refresh);
      socket.off("task.updated", refresh);
      socket.off("task.deleted", refresh);
      socket.off("connect", loadTeamData);
    };
  }, [loadTeamData]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) => `${m.name} ${m.role}`.toLowerCase().includes(term));
  }, [members, search]);

  const stats = {
    completedTasks: tasks.filter((task) => task.status === "done").length,
    openTasks: tasks.filter((task) => task.status !== "done").length
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

  const leaderboard = [...members].sort((a, b) => b.tasks - a.tasks);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Team Dashboard">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={() => toast("Team chat is not connected to a backend yet", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
            <MessageSquare size={15} /> Team Chat
          </button>
          <button className="btn btn-outline" onClick={() => toast("Workspace invitations are not supported by the current backend", "info")} style={{ minHeight: 38, fontSize: 13 }} type="button">
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
            Presence unavailable
          </span>
        </div>
      </div>

      <div className="dash-grid-4">
        <StatCard label="Members" value={team.activeMembers} icon={Users} iconBg="color-mix(in srgb, var(--primary) 15%, transparent)" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} iconBg="color-mix(in srgb, var(--success) 15%, transparent)" delta="live sync" trend="up" />
        <StatCard label="Open Tasks" value={stats.openTasks} icon={FileText} iconBg="color-mix(in srgb, var(--warning) 15%, transparent)" delta="workspace" trend="up" />
        <StatCard label="AI Requests" value="—" icon={Wand2} iconBg="color-mix(in srgb, var(--purple) 15%, transparent)" delta="not tracked by current API" trend="neutral" />
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
            {filteredMembers.length === 0 ? <p className="muted" style={{ margin: 0, fontSize: 13 }}>No workspace members match this search.</p> : filteredMembers.map((member) => (
              <div key={member._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)" }}>
                <div style={{ position: "relative" }}>
                  <Avatar name={member.name} size={40} color={member.color} />
                  <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--bg)", background: member.status === "active" ? "var(--success)" : "var(--muted)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{member.name}</span>
                    <span style={{ padding: "2px 8px", background: "var(--border)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{member.role}</span>
                  </div>
                  <p className="muted" style={{ margin: "0 0 4px", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Latest assigned task: {member.currentTask}</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span className="muted" style={{ fontSize: 11 }}>{member.tasks} tasks</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.projects} projects</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.lastActive}</span>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => toast("Direct messaging is not connected to a backend", "info")} style={{ minHeight: 32, padding: "0 10px", fontSize: 12 }} type="button">Message</button>
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
                    <span className="muted" style={{ fontSize: 11 }}>{member.tasks} assigned tasks</span>
                    <span className="muted" style={{ fontSize: 11 }}>{member.completedTasks} completed</span>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="stat-card" style={{ gap: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Shared Resources</p>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Workspace resource summaries are not available from the current API.</p>
          </div>

          <div className="stat-card" style={{ gap: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Team Calendar</p>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Calendar events are not backed by a current API.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
