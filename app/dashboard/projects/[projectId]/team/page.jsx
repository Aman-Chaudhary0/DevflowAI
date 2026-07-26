"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  Crown,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X
} from "lucide-react";
import { Avatar, ConfirmDialog, EmptyState, FilterBar, PageHeader, StatusBadge, toast } from "@/components/dashboard-ui";
import { mockProjects, mockTeamMembers } from "@/lib/dashboard-data";

const roleFilters = [
  { label: "All", value: "all" },
  { label: "Admin", value: "Admin" },
  { label: "Developer", value: "Developer" },
  { label: "Viewer", value: "Viewer" }
];

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Online", value: "online" },
  { label: "Away", value: "away" },
  { label: "Offline", value: "offline" }
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

export default function ProjectTeamPage() {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p._id === projectId) || mockProjects[0];
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Developer", message: "" });

  const filtered = mockTeamMembers.filter((m) => {
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  function handleInvite() {
    toast(`Invite sent to ${inviteForm.email}`, "success");
    setInviteOpen(false);
    setInviteForm({ email: "", role: "Developer", message: "" });
  }

  function handleRemove(member) {
    setDeleteDialog(member._id);
  }

  function handleRoleChange(member, newRole) {
    toast(`${member.name} role updated to ${newRole}`, "success");
  }

  return (
    <>
      <PageHeader title="Team" subtitle={`${filtered.length} members`}>
        <button className="btn btn-primary" onClick={() => setInviteOpen(true)} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <UserPlus size={15} /> Invite
        </button>
      </PageHeader>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ flex: 1, maxWidth: 300 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <FilterBar filters={roleFilters} active={roleFilter} onChange={setRoleFilter} />
        <FilterBar filters={statusFilters} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Team Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={UserPlus} title="No members found" description="Invite team members to collaborate on this project." action="Invite Member" onAction={() => setInviteOpen(true)} />
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Commits</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar name={m.name} size={36} color={m.color} />
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{m.name}</p>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="badge" style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                        {m.role === "Admin" ? <Crown size={12} style={{ marginRight: 4 }} /> : null}
                        {m.role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.tasks}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.commits}</span>
                  </td>
                  <td>
                    <span className="muted" style={{ fontSize: 12 }}>{m.joined}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="icon-btn"
                        onClick={() => setSelectedMember(selectedMember === m._id ? null : m._id)}
                        style={{ width: 30, height: 30, border: "none", background: "transparent" }}
                        type="button"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {selectedMember === m._id && (
                        <div style={{ position: "absolute", right: 60, top: 80, width: 180, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 10, overflow: "hidden" }}>
                          {m.role !== "Admin" && (
                            <>
                              <button
                                className="sidebar-item"
                                onClick={() => { setSelectedMember(null); handleRoleChange(m, "Admin"); }}
                                style={{ borderRadius: 0, width: "100%" }}
                                type="button"
                              >
                                <Shield size={14} /><span>Make Admin</span>
                              </button>
                              <button
                                className="sidebar-item"
                                onClick={() => { setSelectedMember(null); handleRoleChange(m, "Viewer"); }}
                                style={{ borderRadius: 0, width: "100%" }}
                                type="button"
                              >
                                <Eye size={14} /><span>Change to Viewer</span>
                              </button>
                            </>
                          )}
                          {m.role !== "Admin" && (
                            <button
                              className="sidebar-item"
                              onClick={() => { setSelectedMember(null); handleRemove(m); }}
                              style={{ borderRadius: 0, width: "100%", color: "var(--danger)" }}
                              type="button"
                            >
                              <Trash2 size={14} /><span>Remove</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="dialog-overlay" onClick={() => setInviteOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <strong style={{ fontSize: 18 }}>Invite Team Member</strong>
              <button onClick={() => setInviteOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Email Address</span>
                <input
                  className="input"
                  placeholder="teammate@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </label>

              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Role</span>
                <select
                  className="input"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="Admin">Admin</option>
                  <option value="Developer">Developer</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </label>

              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Personal Message (Optional)</span>
                <textarea
                  className="textarea"
                  placeholder="Add a personal note to the invitation..."
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, message: e.target.value }))}
                  style={{ minHeight: 80 }}
                />
              </label>

              {/* Permissions Preview */}
              <div style={{ padding: 14, background: "color-mix(in srgb, var(--primary) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)", borderRadius: 12 }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13 }}>Permissions for {inviteForm.role}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {permissionOptions.map((p) => (
                    <span key={p.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: rolePermissions[inviteForm.role].includes(p.value) ? "var(--success)" : "var(--muted)" }}>
                      {rolePermissions[inviteForm.role].includes(p.value) ? <Check size={12} /> : <X size={12} />}
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setInviteOpen(false)} style={{ minHeight: 38 }} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={!inviteForm.email} style={{ minHeight: 38 }} type="button">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteDialog}
        title="Remove Team Member"
        description="This member will be removed from the project. They will no longer have access to project resources."
        confirmLabel="Remove"
        danger
        onConfirm={() => { toast("Member removed", "success"); setDeleteDialog(null); }}
        onCancel={() => setDeleteDialog(null)}
      />
    </>
  );
}