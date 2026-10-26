"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Shield, Users } from "lucide-react";
import {
  Avatar,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";
export default function MembersPage() {
  const [members, setMembers] = useState([]),
    [query, setQuery] = useState(""),
    [role, setRole] = useState("All"),
    [selected, setSelected] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsResponse = await api.projects.list({ page: 1, limit: 100 });
      const projects = projectsResponse?.data?.projects || projectsResponse?.projects || [];
      const workspace = projects[0]?.workspace;
      const workspaceId = workspace?._id || workspace;
      if (!workspaceId) {
        setMembers([]);
        return;
      }
      const [membersResponse, tasksResponse] = await Promise.all([
        api.tasks.members.workspace(workspaceId),
        api.tasks.list({ workspaceId, page: 1, limit: 100 })
      ]);
      const memberRows = membersResponse?.data?.members || membersResponse?.members || [];
      const tasks = tasksResponse?.data?.tasks || tasksResponse?.tasks || [];
      const roleName = { owner: "Admin", admin: "Admin", member: "Developer", viewer: "Viewer" };
      setMembers(memberRows.map((member, index) => {
        const userId = String(member.user?._id || "");
        return {
          id: String(member._id),
          userId,
          name: member.user?.name || "Unknown Member",
          email: member.user?.email || "",
          role: roleName[member.role] || member.role,
          status: member.status || "pending",
          projects: member.projectCount || 0,
          tasks: tasks.filter((task) => String(task.assignee?._id || task.assignee || "") === userId).length,
          lastActive: "—",
          joined: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "—",
          color: ["#3b82f6", "#8b5cf6", "#14b8a6", "#ec4899", "#f59e0b"][index % 5]
        };
      }));
    } catch (err) {
      setError(err.message || "Unable to load workspace members");
      toast(err.message || "Unable to load workspace members", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    const socket = connectRealtime();
    socket.on("task.created", loadMembers);
    socket.on("task.updated", loadMembers);
    socket.on("task.deleted", loadMembers);
    socket.on("connect", loadMembers);
    return () => {
      socket.off("task.created", loadMembers);
      socket.off("task.updated", loadMembers);
      socket.off("task.deleted", loadMembers);
      socket.off("connect", loadMembers);
    };
  }, [loadMembers]);

  const activeCount = members.filter((member) => member.status === "active").length;
  const pendingCount = members.filter((member) => member.status === "pending" || member.status === "invited").length;
  const adminCount = members.filter((member) => member.role === "Admin").length;
  const visible = useMemo(
    () =>
      members.filter(
        (m) =>
          (role === "All" || m.role === role) &&
          `${m.name} ${m.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [members, query, role],
  );
  return (
    <div>
      <Crumb items={["Dashboard", "Team", "Members"]} />
      <PageHeader
        title="Team Members"
        subtitle="Manage workspace members, roles, permissions, and invitations."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Role changes are not supported by the current backend", "info")}
          type="button"
        >
          Manage Roles
        </button>
        <button
          className="btn btn-primary"
          onClick={() => toast("Workspace invitations are not supported by the current backend", "info")}
          type="button"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Members" value={members.length} icon={Users} />
        <StatCard
          label="Active Members"
          value={activeCount}
        />
        <StatCard label="Pending Invites" value={pendingCount} />
        <StatCard label="Admins" value={adminCount} icon={Shield} />
      </div>
      <section className="card p-5 mt-6">
        <div className="flex gap-3 flex-wrap mb-4">
          <label className="dash-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
            />
          </label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {["All", "Admin", "Developer", "Viewer"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Projects</th>
                <th>Tasks</th>
                <th>Last active</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8}>Loading workspace members...</td></tr> : null}
              {!loading && error ? <tr><td colSpan={8}>{error}</td></tr> : null}
              {!loading && !error && visible.length === 0 ? <tr><td colSpan={8}><EmptyState title="No workspace members" description="No members are available for the workspace associated with your projects." /></td></tr> : null}
              {visible.map((m) => (
                <tr key={m.id}>
                  <td>
                    <button
                      className="flex items-center gap-2 bg-transparent border-0 text-(--text) cursor-pointer"
                      onClick={() => setSelected(m)}
                      type="button"
                    >
                      <Avatar name={m.name} color={m.color} />
                      <span>
                        <b>{m.name}</b>
                        <small className="block muted">{m.email}</small>
                      </span>
                    </button>
                  </td>
                  <td>{m.role}</td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>{m.projects}</td>
                  <td>{m.tasks}</td>
                  <td>{m.lastActive}</td>
                  <td>{m.joined}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSelected(m)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Drawer
        open={!!selected}
        title="Member details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="grid gap-4">
            <div>
              <b>{selected.name}</b>
              <p className="muted m-0">
                {selected.email} · {selected.role}
              </p>
            </div>
            <div className="dash-grid-3">
              <StatCard label="Projects" value={selected.projects} />
              <StatCard label="Tasks" value={selected.tasks} />
              <StatCard label="AI usage" value="—" />
            </div>
            <h3 className="m-0">Permissions</h3>
            <p className="muted m-0">The current membership API provides role labels but not a permission matrix.</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
