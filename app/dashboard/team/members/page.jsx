"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Shield, Users, X } from "lucide-react";
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
    [error, setError] = useState(null),
    [workspaceId, setWorkspaceId] = useState(""),
    [invitations, setInvitations] = useState([]),
    [invitationListError, setInvitationListError] = useState(""),
    [inviteOpen, setInviteOpen] = useState(false),
    [inviteEmail, setInviteEmail] = useState(""),
    [inviteRole, setInviteRole] = useState("member"),
    [inviteError, setInviteError] = useState(""),
    [inviteLoading, setInviteLoading] = useState(false),
    [busyInvitation, setBusyInvitation] = useState(""),
    [recipientToken, setRecipientToken] = useState(""),
    [recipientInvite, setRecipientInvite] = useState(null),
    [recipientError, setRecipientError] = useState(""),
    [recipientBusy, setRecipientBusy] = useState(false);

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
        setInvitations([]);
        return;
      }
      setWorkspaceId(String(workspaceId));
      const [membersResponse, tasksResponse] = await Promise.all([
        api.tasks.members.workspace(workspaceId),
        api.tasks.list({ workspaceId, page: 1, limit: 100 })
      ]);
      const invitesResponse = await api.invitations.listWorkspace(workspaceId).catch((err) => { setInvitationListError(err.message || "Unable to load invitations"); return null; });
      if (invitesResponse) setInvitationListError("");
      setInvitations(invitesResponse?.data?.invitations || []);
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
    if (new URLSearchParams(window.location.search).get("invite") === "1") setInviteOpen(true);
    const token = new URLSearchParams(window.location.hash.slice(1)).get("invite") || "";
    if (/^[a-fA-F0-9]{64}$/.test(token)) {
      setRecipientToken(token);
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    if (!recipientToken) return;
    api.invitations.details(recipientToken)
      .then((response) => setRecipientInvite(response?.data?.invitation || null))
      .catch((err) => setRecipientError(err.message || "Unable to load invitation"));
  }, [recipientToken]);

  async function respondToInvite(accept) {
    if (!recipientToken || recipientBusy) return;
    setRecipientBusy(true);
    setRecipientError("");
    try {
      const response = accept ? await api.invitations.accept(recipientToken) : await api.invitations.decline(recipientToken);
      const membership = response?.data?.membership;
      setRecipientInvite(null);
      setRecipientToken("");
      toast(accept ? "Invitation accepted" : "Invitation declined", "success");
      if (accept && membership?.scope === "project" && membership.projectId) {
        window.location.assign(`/dashboard/projects/${membership.projectId}/team`);
      } else {
        await loadMembers();
      }
    } catch (err) {
      setRecipientError(err.message || "Unable to update invitation");
    } finally {
      setRecipientBusy(false);
    }
  }

  async function submitInvitation(event) {
    event.preventDefault();
    if (!workspaceId || inviteLoading) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      await api.invitations.createWorkspace(workspaceId, { email: inviteEmail, role: inviteRole });
      toast("Invitation email sent", "success");
      setInviteOpen(false);
      setInviteEmail("");
      await loadMembers();
    } catch (err) {
      setInviteError(err.message || "Unable to send invitation");
    } finally {
      setInviteLoading(false);
    }
  }

  async function revokeInvitation(invitationId) {
    setBusyInvitation(invitationId);
    try {
      await api.invitations.revoke(invitationId);
      toast("Invitation revoked", "success");
      await loadMembers();
    } catch (err) {
      toast(err.message || "Unable to revoke invitation", "error");
    } finally {
      setBusyInvitation("");
    }
  }

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
  const pendingCount = members.filter((member) => member.status === "pending" || member.status === "invited").length + invitations.filter((invitation) => invitation.status === "pending").length;
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
          onClick={() => { setInviteError(""); setInviteOpen(true); }}
          type="button"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </PageHeader>
      {recipientToken ? <section className="card p-5 mt-6" aria-live="polite">
        <h2 className="m-0 text-lg font-bold">Invitation</h2>
        {recipientInvite ? <><p className="muted">{recipientInvite.inviter?.name || "A DevFlow AI member"} invited <b>{recipientInvite.email}</b> to {recipientInvite.project?.name || recipientInvite.workspace?.name} as <b>{recipientInvite.role}</b>. Invitation expires {new Date(recipientInvite.expiresAt).toLocaleString()}.</p>{recipientInvite.message ? <p>{recipientInvite.message}</p> : null}<div className="flex gap-2"><button className="btn btn-primary" disabled={recipientBusy} onClick={() => respondToInvite(true)} type="button">{recipientBusy ? "Working..." : "Accept invitation"}</button><button className="btn btn-outline" disabled={recipientBusy} onClick={() => respondToInvite(false)} type="button">Decline</button></div></> : recipientError ? <p role="alert" style={{ color: "var(--danger)" }}>{recipientError}</p> : <p className="muted">Loading invitation...</p>}
      </section> : null}
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
      <section className="card p-5 mt-6">
        <h2 className="m-0 mb-4 text-lg font-bold">Pending invitations</h2>
        {invitationListError ? <p className="muted m-0">{invitationListError}</p> : null}
        {!invitationListError && invitations.filter((invitation) => invitation.status === "pending").length === 0 ? <p className="muted m-0">There are no pending workspace invitations.</p> : (
          <div className="grid gap-3">
            {invitations.filter((invitation) => invitation.status === "pending").map((invitation) => (
              <div key={invitation._id} className="flex items-center gap-3 flex-wrap border border-(--border) rounded-xl p-3">
                <div className="flex-1 min-w-45"><b>{invitation.email}</b><small className="block muted">{invitation.role} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</small></div>
                <StatusBadge status="pending" />
                <button className="btn btn-outline" disabled={busyInvitation === invitation._id} onClick={() => revokeInvitation(invitation._id)} type="button">{busyInvitation === invitation._id ? "Revoking..." : "Revoke"}</button>
              </div>
            ))}
          </div>
        )}
      </section>
      {inviteOpen ? (
        <div className="dialog-overlay" onClick={() => setInviteOpen(false)}>
          <form className="dialog" onSubmit={submitInvitation} onClick={(event) => event.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="flex items-center justify-between mb-4"><strong className="text-lg">Invite workspace member</strong><button className="icon-btn" onClick={() => setInviteOpen(false)} type="button" aria-label="Close"><X size={18} /></button></div>
            <label className="form-field"><span>Email address</span><input className="input" type="email" required maxLength={254} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@company.com" /></label>
            <label className="form-field mt-4"><span>Workspace role</span><select className="input" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}><option value="member">Member</option><option value="viewer">Viewer</option><option value="admin">Admin</option></select></label>
            {inviteError ? <p role="alert" style={{ color: "var(--danger)" }}>{inviteError}</p> : null}
            <div className="flex justify-end gap-2 mt-5"><button className="btn btn-outline" onClick={() => setInviteOpen(false)} type="button">Cancel</button><button className="btn btn-primary" disabled={inviteLoading || !workspaceId} type="submit">{inviteLoading ? "Sending..." : "Send invite"}</button></div>
          </form>
        </div>
      ) : null}
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
