"use client";
import { useMemo, useState } from "react";
import { Plus, Search, Shield, Users } from "lucide-react";
import {
  Avatar,
  ConfirmDialog,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { members as seed } from "@/lib/mock/workspace";
export default function MembersPage() {
  const [members, setMembers] = useState(seed),
    [query, setQuery] = useState(""),
    [role, setRole] = useState("All"),
    [selected, setSelected] = useState(null),
    [invite, setInvite] = useState(false);
  const visible = useMemo(
    () =>
      members.filter(
        (m) =>
          (role === "All" || m.role === role) &&
          `${m.name} ${m.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [members, query, role],
  );
  function send() {
    setMembers((p) => [
      ...p,
      {
        id: Date.now(),
        name: "New teammate",
        email: "invite@devflow.ai",
        role: "Developer",
        status: "invited",
        projects: 0,
        tasks: 0,
        lastActive: "Invitation pending",
        joined: "Today",
        color: "#f59e0b",
      },
    ]);
    setInvite(false);
    toast("Invitation sent successfully.");
  }
  return (
    <div>
      <Crumb items={["Dashboard", "Team", "Members"]} />
      <PageHeader
        title="Team Members"
        subtitle="Manage workspace members, roles, permissions, and invitations."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Role manager opened")}
          type="button"
        >
          Manage Roles
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setInvite(true)}
          type="button"
        >
          <Plus size={16} />
          Invite Member
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Members" value="24" icon={Users} />
        <StatCard
          label="Active Members"
          value="19"
          delta="working this week"
          trend="up"
        />
        <StatCard label="Pending Invites" value="3" />
        <StatCard label="Admins" value="4" icon={Shield} />
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
            {["All", "Admin", "Developer", "Designer", "Viewer"].map((x) => (
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
              <StatCard label="AI usage" value="248" />
            </div>
            <h3 className="m-0">Permissions</h3>
            {[
              "View projects",
              "Create projects",
              "Use AI tools",
              "Generate code",
              "View deployments",
            ].map((x) => (
              <label key={x} className="flex gap-2">
                <input type="checkbox" defaultChecked />
                {x}
              </label>
            ))}
          </div>
        )}
      </Drawer>
      <ConfirmDialog
        open={invite}
        title="Invite a member"
        description="A developer invitation will be sent to invite@devflow.ai."
        confirmLabel="Send Invitation"
        onConfirm={send}
        onCancel={() => setInvite(false)}
      />
    </div>
  );
}
