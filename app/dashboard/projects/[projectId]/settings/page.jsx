"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  Archive,
  Bell,
  ChevronRight,
  Copy,
  Eye,
  Github,
  GitMerge,
  Key,
  Link as LinkIcon,
  Lock,
  Mail,
  MoreVertical,
  RefreshCw,
  Settings2,
  Shield,
  Slack,
  Trash2,
  UserX,
  Webhook,
  X
} from "lucide-react";
import { ConfirmDialog, PageHeader, toast } from "@/components/dashboard-ui";
import { mockProjects } from "@/lib/dashboard-data";

const tabs = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "git", label: "Git", icon: GitMerge },
  { id: "integrations", label: "Integrations", icon: LinkIcon },
  { id: "members", label: "Members", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Lock },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle }
];

const integrations = [
  { name: "GitHub", icon: Github, connected: true, desc: "Connect your GitHub repositories" },
  { name: "Slack", icon: Slack, connected: false, desc: "Get notified in Slack channels" },
  { name: "Discord", icon: Github, connected: false, desc: "Send updates to Discord webhooks" },
  { name: "OpenAI", icon: Key, connected: true, desc: "Use GPT-4 for AI features" }
];

const notificationOptions = [
  { id: "email_deploy", label: "Deployment notifications", desc: "Get email when deployments complete or fail", enabled: true },
  { id: "email_pr", label: "Pull request updates", desc: "Notifications for PR reviews and merges", enabled: true },
  { id: "push_tasks", label: "Task assignments", desc: "Push notifications for new task assignments", enabled: false },
  { id: "push_mentions", label: "Mentions", desc: "Push notifications when mentioned", enabled: true },
  { id: "webhook_activity", label: "Activity webhooks", desc: "Send activity events to webhook URL", enabled: false }
];

export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const project = mockProjects.find((p) => p._id === projectId) || mockProjects[0];
  const [activeTab, setActiveTab] = useState("general");
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [transferDialog, setTransferDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.example.com/devflow");
  const [notifications, setNotifications] = useState(notificationOptions);

  function toggleNotification(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
    toast("Notification preference updated", "success");
  }

  function handleDelete() {
    toast("Project deleted", "success");
    setTimeout(() => router.push("/dashboard/projects"), 1500);
  }

  function handleArchive() {
    toast("Project archived", "success");
    setArchiveDialog(false);
  }

  function handleTransfer() {
    toast("Transfer request sent", "info");
    setTransferDialog(false);
  }

  function generateApiKey() {
    const key = "sk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    toast(`API key generated: ${key.substring(0, 12)}...`, "success");
  }

  return (
    <>
      <PageHeader title="Project Settings" subtitle="Manage project configuration" />

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Tabs Navigation */}
        <div className="stat-card" style={{ gap: 4, padding: 12, height: "fit-content", position: "sticky", top: 84 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ borderRadius: 10, padding: "8px 12px", fontSize: 13, justifyContent: "flex-start" }}
              type="button"
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
              <ChevronRight size={14} color="var(--muted)" style={{ marginLeft: "auto" }} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="stat-card" style={{ gap: 20, minHeight: 400 }}>
          {activeTab === "general" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Project Information</h3>
                <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Project Name</span>
                    <input className="input" defaultValue={project.name} />
                  </label>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Slug</span>
                    <input className="input" defaultValue={project.slug} />
                  </label>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Description</span>
                    <textarea className="textarea" defaultValue={project.description} style={{ minHeight: 80 }} />
                  </label>
                  <button className="btn btn-primary" onClick={() => toast("Settings saved", "success")} style={{ minHeight: 38, fontSize: 13, alignSelf: "flex-start" }} type="button">
                    Save Changes
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: "var(--border)" }} />

              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Visibility</h3>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { value: "private", label: "Private", desc: "Only team members can access" },
                    { value: "team", label: "Team", desc: "Organization members can view" },
                    { value: "public", label: "Public", desc: "Anyone can view the project" }
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toast(`Visibility set to ${opt.label}`, "success")}
                      style={{
                        flex: 1,
                        padding: 16,
                        border: `2px solid ${project.visibility === opt.value ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: 14,
                        background: project.visibility === opt.value ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 150ms ease"
                      }}
                      type="button"
                    >
                      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>{opt.label}</p>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "git" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Repository</h3>
                <div style={{ display: "grid", gap: 16, maxWidth: 500 }}>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Repository URL</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="input" defaultValue="https://github.com/devflow/ai-workspace" readOnly />
                      <button className="btn btn-outline" onClick={() => toast("URL copied", "success")} style={{ minHeight: 40, padding: "0 14px" }} type="button">
                        <Copy size={15} />
                      </button>
                    </div>
                  </label>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Default Branch</span>
                    <input className="input" defaultValue="main" />
                  </label>
                  <label className="form-field">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Webhook URL</span>
                    <input className="input" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
                  </label>
                  <button className="btn btn-primary" onClick={() => toast("Git settings saved", "success")} style={{ minHeight: 38, fontSize: 13, alignSelf: "flex-start" }} type="button">
                    Save Changes
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "integrations" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Connected Integrations</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {integrations.map((integration) => (
                    <div key={integration.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "color-mix(in srgb, var(--primary) 10%, transparent)", display: "grid", placeItems: "center" }}>
                        <integration.icon size={24} color={integration.connected ? "var(--success)" : "var(--muted)"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{integration.name}</p>
                        <p className="muted" style={{ margin: 0, fontSize: 13 }}>{integration.desc}</p>
                      </div>
                      <button
                        className={`btn ${integration.connected ? "btn-outline" : "btn-primary"}`}
                        onClick={() => toast(integration.connected ? `${integration.name} disconnected` : `${integration.name} connected`, "success")}
                        style={{ minHeight: 36, fontSize: 13 }}
                        type="button"
                      >
                        {integration.connected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "members" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Team Permissions</h3>
                <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>Manage who has access to this project and their permission levels.</p>
                <button className="btn btn-primary" onClick={() => router.push(`/dashboard/projects/${projectId}/team`)} style={{ minHeight: 38, fontSize: 13 }} type="button">
                  Manage Team Members
                </button>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Notification Preferences</h3>
                <div style={{ display: "grid", gap: 4 }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 12 }}>
                      <button
                        onClick={() => toggleNotification(n.id)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: n.enabled ? "var(--primary)" : "var(--border)",
                          border: "none",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 200ms ease"
                        }}
                        type="button"
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "white",
                            position: "absolute",
                            top: 2,
                            left: n.enabled ? 22 : 2,
                            transition: "left 200ms ease"
                          }}
                        />
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{n.label}</p>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>API Keys</h3>
                <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>Manage API keys for programmatic access to your project.</p>
                <button className="btn btn-primary" onClick={generateApiKey} style={{ minHeight: 38, fontSize: 13, marginBottom: 20 }} type="button">
                  <Key size={15} /> Generate New API Key
                </button>

                <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", background: "color-mix(in srgb, var(--primary) 5%, transparent)", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>Production Key</p>
                    <code style={{ fontSize: 12, color: "var(--muted)" }}>sk_live_••••••••••••••••••••••••••••••••</code>
                  </div>
                  <div style={{ display: "flex", gap: 8, padding: 12 }}>
                    <button className="btn btn-outline" onClick={() => toast("Key copied", "success")} style={{ minHeight: 32, padding: "0 12px", fontSize: 12 }} type="button">
                      <Copy size={13} /> Copy
                    </button>
                    <button className="btn btn-outline" onClick={() => toast("Key regenerated", "success")} style={{ minHeight: 32, padding: "0 12px", fontSize: 12 }} type="button">
                      <RefreshCw size={13} /> Regenerate
                    </button>
                    <button className="btn btn-outline" onClick={() => setDeleteDialog("key")} style={{ minHeight: 32, padding: "0 12px", fontSize: 12, color: "var(--danger)", borderColor: "var(--danger)" }} type="button">
                      <Trash2 size={13} /> Revoke
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "danger" && (
            <>
              <div>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--danger)" }}>Danger Zone</h3>
                <p className="muted" style={{ margin: "0 0 20px", fontSize: 13 }}>Irreversible actions that affect the entire project.</p>

                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>Archive Project</p>
                      <p className="muted" style={{ margin: 0, fontSize: 13 }}>Archive this project. It will be hidden from view but can be restored.</p>
                    </div>
                    <button className="btn btn-outline" onClick={() => setArchiveDialog(true)} style={{ minHeight: 38, fontSize: 13, color: "var(--warning)", borderColor: "var(--warning)" }} type="button">
                      <Archive size={15} /> Archive
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1px solid var(--border)", borderRadius: 14 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>Transfer Ownership</p>
                      <p className="muted" style={{ margin: 0, fontSize: 13 }}>Transfer this project to another user or organization.</p>
                    </div>
                    <button className="btn btn-outline" onClick={() => setTransferDialog(true)} style={{ minHeight: 38, fontSize: 13 }} type="button">
                      <UserX size={15} /> Transfer
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", border: "1px solid var(--danger)", borderRadius: 14, background: "color-mix(in srgb, var(--danger) 5%, transparent)" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "var(--danger)" }}>Delete Project</p>
                      <p className="muted" style={{ margin: 0, fontSize: 13 }}>Permanently delete this project and all associated data.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setDeleteDialog("project")} style={{ minHeight: 38, fontSize: 13, background: "var(--danger)" }} type="button">
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog === "project"}
        title="Delete Project"
        description="This action cannot be undone. All project data, files, and history will be permanently deleted."
        confirmLabel="Delete Project"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
      />

      <ConfirmDialog
        open={deleteDialog === "key"}
        title="Revoke API Key"
        description="The API key will be immediately invalidated. Any applications using this key will stop working."
        confirmLabel="Revoke Key"
        danger
        onConfirm={() => { toast("API key revoked", "success"); setDeleteDialog(null); }}
        onCancel={() => setDeleteDialog(null)}
      />

      <ConfirmDialog
        open={!!archiveDialog}
        title="Archive Project"
        description="The project will be hidden from view but can be restored at any time from the archived projects list."
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveDialog(false)}
      />

      {transferDialog && (
        <div className="dialog-overlay" onClick={() => setTransferDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <strong style={{ fontSize: 18 }}>Transfer Ownership</strong>
              <button onClick={() => setTransferDialog(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button">
                <X size={18} />
              </button>
            </div>
            <label className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>New Owner Email</span>
              <input className="input" placeholder="newowner@example.com" />
            </label>
            <p className="muted" style={{ margin: "12px 0", fontSize: 12 }}>
              The new owner will receive an email to accept the transfer.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setTransferDialog(false)} style={{ minHeight: 38 }} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleTransfer} style={{ minHeight: 38 }} type="button">
                Send Transfer Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}