"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Check, Crown, Search, UserPlus, X } from "lucide-react";
import { Avatar, EmptyState, FilterBar, PageHeader, StatusBadge, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const roleFilters = [
  { label: "All", value: "all" },
  { label: "Admin", value: "Admin" },
  { label: "Developer", value: "Developer" },
  { label: "Viewer", value: "Viewer" }
];
const permissionOptions = [
  { label: "Manage Files", value: "files" },
  { label: "Manage Team", value: "team" },
  { label: "Deploy", value: "deploy" },
  { label: "Delete Project", value: "delete" }
];
const rolePermissions = {
  Admin: ["files", "team", "deploy", "delete"],
  Developer: ["files", "deploy"],
  Viewer: ["files"]
};
const roleLabels = { owner: "Admin", admin: "Admin", editor: "Developer", viewer: "Viewer" };

export default function ProjectTeamPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationListError, setInvitationListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [busyInvitation, setBusyInvitation] = useState("");
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Developer", message: "" });

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectResponse, memberResponse, inviteResponse] = await Promise.all([
        api.projects.get(projectId),
        api.tasks.members.project(projectId),
        api.invitations.listProject(projectId).catch((err) => { setInvitationListError(err.message || "Unable to load invitations"); return null; })
      ]);
      setProject(projectResponse?.data?.project || projectResponse?.project || null);
      const memberRows = memberResponse?.data?.members || memberResponse?.members || [];
      setMembers(memberRows.map((member, index) => ({
        _id: String(member._id),
        userId: String(member.user?._id || ""),
        name: member.user?.name || "Unknown member",
        email: member.user?.email || "",
        role: roleLabels[member.role] || member.role,
        backendRole: member.role,
        status: "active",
        tasks: 0,
        commits: "—",
        joined: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "—",
        color: ["#3b82f6", "#8b5cf6", "#14b8a6", "#ec4899", "#f59e0b"][index % 5]
      })));
      setInvitations(inviteResponse?.data?.invitations || []);
      if (inviteResponse) setInvitationListError("");
    } catch (err) {
      setError(err.message || "Unable to load project team");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadTeam(); }, [loadTeam]);

  const filtered = useMemo(() => members.filter((member) =>
    (roleFilter === "all" || member.role === roleFilter) &&
    `${member.name} ${member.email}`.toLowerCase().includes(search.toLowerCase())
  ), [members, roleFilter, search]);

  async function handleInvite(event) {
    event.preventDefault();
    if (inviteBusy) return;
    setInviteBusy(true);
    setInviteError("");
    const role = { Admin: "admin", Developer: "editor", Viewer: "viewer" }[inviteForm.role];
    try {
      await api.invitations.createProject(projectId, { email: inviteForm.email, role, message: inviteForm.message });
      toast(`Invitation email sent to ${inviteForm.email}`, "success");
      setInviteOpen(false);
      setInviteForm({ email: "", role: "Developer", message: "" });
      await loadTeam();
    } catch (err) {
      setInviteError(err.message || "Unable to send invitation");
    } finally {
      setInviteBusy(false);
    }
  }

  async function revokeInvitation(id) {
    setBusyInvitation(id);
    try {
      await api.invitations.revoke(id);
      toast("Invitation revoked", "success");
      await loadTeam();
    } catch (err) {
      toast(err.message || "Unable to revoke invitation", "error");
    } finally {
      setBusyInvitation("");
    }
  }

  if (loading && !project) return <div className="stat-card p-6">Loading project team...</div>;
  if (error && !project) return <div className="stat-card p-6"><p role="alert">{error}</p><button className="btn btn-outline" onClick={loadTeam} type="button">Retry</button></div>;
  if (!project) return <EmptyState icon={UserPlus} title="Project not found" description="This team workspace is unavailable." action="Back to projects" onAction={() => window.location.assign("/dashboard/projects")} />;

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: project.name, href: `/dashboard/projects/${projectId}` }, { label: "Team" }]} />
      <PageHeader title="Team" subtitle={`${filtered.length} project members`}>
        <button className="btn btn-primary" onClick={() => { setInviteError(""); setInviteOpen(true); }} style={{ minHeight: 36, fontSize: 13 }} type="button"><UserPlus size={15} /> Invite</button>
      </PageHeader>
      {error ? <p role="alert" style={{ color: "var(--danger)" }}>{error}</p> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ flex: 1, maxWidth: 300 }}><Search size={15} color="var(--muted)" /><input placeholder="Search members..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <FilterBar filters={roleFilters} active={roleFilter} onChange={setRoleFilter} />
      </div>
      {loading ? <div className="stat-card p-5">Refreshing project team...</div> : filtered.length === 0 ? (
        <EmptyState icon={UserPlus} title="No members found" description="Invite team members to collaborate on this project." action="Invite Member" onAction={() => setInviteOpen(true)} />
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}><table className="data-table"><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Tasks</th><th>Commits</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((member) => <tr key={member._id}><td><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar name={member.name} size={36} color={member.color} /><div><p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{member.name}</p><p className="muted" style={{ margin: 0, fontSize: 12 }}>{member.email}</p></div></div></td><td><span className="badge" style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>{member.role === "Admin" ? <Crown size={12} style={{ marginRight: 4 }} /> : null}{member.role}</span></td><td><StatusBadge status="active" /></td><td>{member.tasks}</td><td className="muted">{member.commits}</td><td className="muted">{member.joined}</td><td><button className="btn btn-ghost" onClick={() => toast("Project role changes and member removal are not supported yet", "info")} type="button">Actions</button></td></tr>)}
        </tbody></table></div>
      )}
      <section className="stat-card" style={{ marginTop: 20, gap: 12 }}><h2 style={{ margin: 0, fontSize: 16 }}>Pending invitations</h2>
        {invitationListError ? <p className="muted" style={{ margin: 0 }}>{invitationListError}</p> : null}
        {!invitationListError && invitations.filter((invitation) => invitation.status === "pending").length === 0 ? <p className="muted" style={{ margin: 0 }}>There are no pending project invitations.</p> : invitations.filter((invitation) => invitation.status === "pending").map((invitation) => <div key={invitation._id} className="flex items-center gap-3 flex-wrap"><div style={{ flex: 1 }}><b>{invitation.email}</b><small className="block muted">{roleLabels[invitation.role] || invitation.role} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</small></div><StatusBadge status="pending" /><button className="btn btn-outline" disabled={busyInvitation === invitation._id} onClick={() => revokeInvitation(invitation._id)} type="button">{busyInvitation === invitation._id ? "Revoking..." : "Revoke"}</button></div>)}
      </section>

      {inviteOpen && <div className="dialog-overlay" onClick={() => !inviteBusy && setInviteOpen(false)}><form className="dialog" onSubmit={handleInvite} onClick={(event) => event.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><strong style={{ fontSize: 18 }}>Invite Team Member</strong><button onClick={() => setInviteOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button" aria-label="Close"><X size={18} /></button></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label className="form-field"><span style={{ fontSize: 13, fontWeight: 600 }}>Email Address</span><input className="input" type="email" required maxLength={254} placeholder="teammate@company.com" value={inviteForm.email} onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))} /></label>
          <label className="form-field"><span style={{ fontSize: 13, fontWeight: 600 }}>Role</span><select className="input" value={inviteForm.role} onChange={(event) => setInviteForm((prev) => ({ ...prev, role: event.target.value }))}><option value="Admin">Admin</option><option value="Developer">Developer</option><option value="Viewer">Viewer</option></select></label>
          <label className="form-field"><span style={{ fontSize: 13, fontWeight: 600 }}>Personal Message (Optional)</span><textarea className="textarea" maxLength={1000} placeholder="Add a personal note to the invitation..." value={inviteForm.message} onChange={(event) => setInviteForm((prev) => ({ ...prev, message: event.target.value }))} style={{ minHeight: 80 }} /></label>
          <div style={{ padding: 14, background: "color-mix(in srgb, var(--primary) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)", borderRadius: 12 }}><p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13 }}>Permissions for {inviteForm.role}</p><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{permissionOptions.map((permission) => <span key={permission.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: rolePermissions[inviteForm.role].includes(permission.value) ? "var(--success)" : "var(--muted)" }}>{rolePermissions[inviteForm.role].includes(permission.value) ? <Check size={12} /> : <X size={12} />}{permission.label}</span>)}</div></div>
        </div>
        {inviteError ? <p role="alert" style={{ color: "var(--danger)" }}>{inviteError}</p> : null}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}><button className="btn btn-outline" onClick={() => setInviteOpen(false)} disabled={inviteBusy} type="button">Cancel</button><button className="btn btn-primary" disabled={inviteBusy || !inviteForm.email} type="submit">{inviteBusy ? "Sending..." : "Send Invite"}</button></div>
      </form></div>}
    </>
  );
}
