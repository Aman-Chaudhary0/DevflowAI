"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Eye, EyeOff, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { ConfirmDialog, EmptyState, PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { mockProjects } from "@/lib/dashboard-data";

const tabs = ["General", "Git", "Integrations", "Members", "Notifications", "Security", "Danger Zone"];

const integrations = [
  { name: "GitHub", desc: "Sync repositories and pull requests", connected: true, color: "#333" },
  { name: "Slack", desc: "Get notifications in your Slack workspace", connected: false, color: "#4a154b" },
  { name: "Discord", desc: "Send activity updates to Discord", connected: false, color: "#5865f2" },
  { name: "OpenAI", desc: "Power AI features with your own API key", connected: true, color: "#10a37f" },
  { name: "ImageKit", desc: "Store and serve project assets", connected: true, color: "#f59e0b" }
];

export default function ProjectSettingsPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const project = mockProjects.find((p) => p._id === projectId);
  const [tab, setTab] = useState("General");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");

  if (!project) {
    return <EmptyState icon={AlertTriangle} title="Project not found" description="Open another project to manage settings." action="Back to projects" onAction={() => router.push("/dashboard/projects")} />;
  }

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: project.name, href: `/dashboard/projects/${projectId}` }, { label: "Settings" }]} />
      <PageHeader title="Settings" subtitle={project.name} />

      <div className="tab-bar" style={{ overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t} className={`tab-item ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} type="button"
            style={{ color: t === "Danger Zone" && tab !== t ? "var(--danger)" : undefined }}>
            {t}
          </button>
        ))}
      </div>

      <div className="stat-card" style={{ gap: 24 }}>
        {tab === "General" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>General Settings</h3>
            <div className="dash-grid-2">
              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Project Name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Slug</span>
                <input className="input" value={project.slug} readOnly style={{ opacity: 0.6 }} />
              </label>
            </div>
            <label className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Description</span>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 80 }} />
            </label>
            <label className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Visibility</span>
              <select className="input" defaultValue={project.visibility}>
                {["private", "team", "public"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <button className="btn btn-primary" onClick={() => toast("Settings saved", "success")} style={{ alignSelf: "flex-start", minHeight: 38, fontSize: 13 }} type="button">Save Changes</button>
          </>
        )}

        {tab === "Git" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Git Configuration</h3>
            {[["Repository URL", "https://github.com/aman/devflow-ai"], ["Default Branch", "main"], ["Webhook URL", "https://devflow.ai/webhooks/p1"]].map(([label, val]) => (
              <label key={label} className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                <input className="input" defaultValue={val} />
              </label>
            ))}
            <button className="btn btn-primary" onClick={() => toast("Git settings saved", "success")} style={{ alignSelf: "flex-start", minHeight: 38, fontSize: 13 }} type="button">Save</button>
          </>
        )}

        {tab === "Integrations" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Integrations</h3>
            {integrations.map((intg) => (
              <div key={intg.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${intg.color} 20%, transparent)`, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, color: intg.color }}>{intg.name.charAt(0)}</div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{intg.name}</p>
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>{intg.desc}</p>
                  </div>
                </div>
                <button
                  className={`btn ${intg.connected ? "btn-outline" : "btn-primary"}`}
                  onClick={() => toast(intg.connected ? `${intg.name} disconnected` : `${intg.name} connected`, "success")}
                  style={{ minHeight: 34, fontSize: 12 }}
                  type="button"
                >
                  {intg.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </>
        )}

        {tab === "Notifications" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Notification Preferences</h3>
            {[["Email notifications", "Receive updates via email"], ["Push notifications", "Browser push alerts"], ["Deployment alerts", "Notify on deploy success/failure"], ["PR reviews", "Notify when review requested"], ["Task assignments", "Notify when assigned a task"]].map(([label, desc]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{label}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>{desc}</p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: "absolute", inset: 0, background: "var(--primary)", borderRadius: 999, transition: "0.2s" }} />
                </label>
              </div>
            ))}
          </>
        )}

        {tab === "Security" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>API Keys & Security</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 12 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>Project API Key</p>
                <code style={{ fontSize: 12, color: "var(--muted)", fontFamily: "JetBrains Mono, monospace" }}>
                  {showKey ? "sk-devflow-p1-abc123xyz789" : "sk-devflow-p1-••••••••••••"}
                </code>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" onClick={() => setShowKey((s) => !s)} style={{ width: 34, height: 34, border: "none", background: "transparent" }} type="button">{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button className="icon-btn" onClick={() => toast("Key regenerated", "success")} style={{ width: 34, height: 34, border: "none", background: "transparent" }} type="button"><RefreshCw size={15} /></button>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => toast("New key created", "success")} style={{ alignSelf: "flex-start", minHeight: 38, fontSize: 13 }} type="button"><Plus size={15} /> Create New Key</button>
          </>
        )}

        {tab === "Danger Zone" && (
          <>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--danger)" }}>Danger Zone</h3>
            {[
              { label: "Archive Project", desc: "Disable the project and hide it from active views.", action: "Archive", onAction: () => setArchiveDialog(true) },
              { label: "Transfer Ownership", desc: "Transfer this project to another team member.", action: "Transfer", onAction: () => toast("Transfer initiated", "info") },
              { label: "Delete Project", desc: "Permanently delete this project and all its data.", action: "Delete", danger: true, onAction: () => setDeleteDialog(true) }
            ].map(({ label, desc, action, danger, onAction }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: `1px solid ${danger ? "color-mix(in srgb, var(--danger) 30%, var(--border))" : "var(--border)"}`, borderRadius: 14 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14 }}>{label}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>{desc}</p>
                </div>
                <button className="btn btn-outline" onClick={onAction} style={{ minHeight: 36, fontSize: 13, color: danger ? "var(--danger)" : undefined, borderColor: danger ? "var(--danger)" : undefined, flexShrink: 0 }} type="button">{action}</button>
              </div>
            ))}
          </>
        )}
      </div>

      <ConfirmDialog open={deleteDialog} title="Delete Project" description="This will permanently delete the project and all its data. This cannot be undone." confirmLabel="Delete Project" danger onConfirm={() => { toast("Project deleted", "success"); setDeleteDialog(false); router.push("/dashboard/projects"); }} onCancel={() => setDeleteDialog(false)} />
      <ConfirmDialog open={archiveDialog} title="Archive Project" description="The project will be archived and hidden from active views." confirmLabel="Archive" onConfirm={() => { toast("Project archived", "success"); setArchiveDialog(false); }} onCancel={() => setArchiveDialog(false)} />
    </>
  );
}
