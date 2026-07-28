"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings, Moon, Sun, Shield, Key, Bell, CreditCard, User, Globe,
  Copy, Check, Plus, Trash2, RefreshCw, Smartphone, Laptop, CheckCircle2, AlertCircle
} from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [copiedKey, setCopiedKey] = useState(false);

  // Settings State
  const [general, setGeneral] = useState({
    workspaceName: "Devflow AI Workspace",
    defaultBranch: "main",
    timezone: "UTC-08:00 (Pacific Time)",
    language: "English (US)"
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
    accentColor: "#3b82f6",
    fontSize: "14px",
    compactMode: false
  });

  const [notifications, setNotifications] = useState({
    emailPR: true,
    emailBuilds: true,
    emailSecurity: true,
    slackWebhook: "https://hooks.slack.com/services/T000/B000/XXXX",
    desktopPush: false
  });

  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "Production CLI Key", token: "df_live_9f82a1...4b81", created: "Jan 12, 2025", lastUsed: "10 mins ago" },
    { id: "key-2", name: "GitHub Workflow Pipeline", token: "df_live_3c17e4...8192", created: "Feb 04, 2025", lastUsed: "Yesterday" }
  ]);

  const handleSave = (section) => {
    toast(`${section} preferences saved successfully!`, "success");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast("API key copied to clipboard", "info");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const generateNewKey = () => {
    const newKey = {
      id: `key-${Date.now()}`,
      name: "New AI Integration Key",
      token: `df_live_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      created: "Just now",
      lastUsed: "Never"
    };
    setApiKeys([...apiKeys, newKey]);
    toast("Generated new API Key!", "success");
  };

  const revokeKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast("API key revoked", "danger");
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader title="Workspace Settings" subtitle="Manage workspace configuration, security, API keys, and billing">
        <button className="btn btn-primary" onClick={() => handleSave("Workspace")} style={{ minHeight: 38, fontSize: 13 }}>
          Save All Changes
        </button>
      </PageHeader>

      {/* Settings Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 28, overflowX: "auto" }}>
        {[
          { id: "general", label: "General", icon: Settings },
          { id: "appearance", label: "Appearance & Theme", icon: Moon },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security & 2FA", icon: Shield },
          { id: "apikeys", label: "API Keys & Tokens", icon: Key },
          { id: "billing", label: "Billing & Subscription", icon: CreditCard }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid",
                borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
                background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.03)",
                color: activeTab === tab.id ? "#fff" : "var(--muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 800 }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>General Workspace Settings</h3>
          <p style={{ margin: "0 0 24px 0", fontSize: 13, color: "var(--muted)" }}>Configure global details and defaults for your team.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Workspace Name</label>
              <input
                type="text"
                value={general.workspaceName}
                onChange={(e) => setGeneral({ ...general, workspaceName: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Default Git Branch</label>
              <input
                type="text"
                value={general.defaultBranch}
                onChange={(e) => setGeneral({ ...general, defaultBranch: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Timezone</label>
                <select
                  value={general.timezone}
                  onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
                >
                  <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                  <option value="UTC+00:00 (London)">UTC+00:00 (London)</option>
                  <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (India Standard Time)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Display Language</label>
                <select
                  value={general.language}
                  onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => handleSave("General")} style={{ minHeight: 36, fontSize: 13 }}>
                Save General Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance & Theme */}
      {activeTab === "appearance" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 800 }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>Appearance & Theme</h3>
          <p style={{ margin: "0 0 24px 0", fontSize: 13, color: "var(--muted)" }}>Customize workspace interface styling and accessibility options.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--muted)" }}>Color Mode</label>
              <div style={{ display: "flex", gap: 16 }}>
                <div
                  onClick={() => { setAppearance({ ...appearance, theme: "dark" }); toast("Dark theme selected", "info"); }}
                  style={{ flex: 1, border: "2px solid", borderColor: appearance.theme === "dark" ? "var(--primary)" : "var(--border)", borderRadius: 12, padding: 16, background: "#0b0f19", cursor: "pointer", textAlign: "center" }}
                >
                  <Moon size={24} style={{ color: "#3b82f6", marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Dark First (Default)</div>
                </div>
                <div
                  onClick={() => { setAppearance({ ...appearance, theme: "light" }); toast("Light theme selected", "info"); }}
                  style={{ flex: 1, border: "2px solid", borderColor: appearance.theme === "light" ? "var(--primary)" : "var(--border)", borderRadius: 12, padding: 16, background: "#f8fafc", cursor: "pointer", textAlign: "center" }}
                >
                  <Sun size={24} style={{ color: "#f59e0b", marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Light Mode</div>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 10, color: "var(--muted)" }}>Primary Accent Color</label>
              <div style={{ display: "flex", gap: 12 }}>
                {["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"].map(color => (
                  <div
                    key={color}
                    onClick={() => { setAppearance({ ...appearance, accentColor: color }); toast("Accent color updated", "info"); }}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: color, cursor: "pointer", border: appearance.accentColor === color ? "3px solid #fff" : "none", display: "grid", placeItems: "center" }}
                  >
                    {appearance.accentColor === color && <Check size={16} style={{ color: "#fff" }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === "apikeys" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 900 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700 }}>API Keys & Tokens</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Use API tokens to authenticate Devflow CLI and custom integrations.</p>
            </div>
            <button className="btn btn-primary" onClick={generateNewKey} style={{ minHeight: 36, fontSize: 13, gap: 6 }}>
              <Plus size={15} /> Generate Key
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {apiKeys.map(key => (
              <div key={key.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 4 }}>{key.name}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--primary)", background: "rgba(59, 130, 246, 0.1)", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>{key.token}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Created: {key.created} • Last used: {key.lastUsed}</div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="icon-btn" onClick={() => copyToClipboard(key.token)} title="Copy Key">
                    <Copy size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => revokeKey(key.id)} style={{ color: "var(--danger)" }} title="Revoke Key">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security & 2FA */}
      {activeTab === "security" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 800 }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>Security & Authentication</h3>
          <p style={{ margin: "0 0 24px 0", fontSize: 13, color: "var(--muted)" }}>Manage two-factor authentication and active sessions.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ border: "1px solid rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.1)", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircle2 size={20} style={{ color: "#10b981" }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Two-Factor Authentication (2FA) is Active</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Protected with Authenticator App (TOTP)</div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => toast("2FA details opened", "info")} style={{ minHeight: 34, fontSize: 12 }}>
                Manage 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing */}
      {activeTab === "billing" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, maxWidth: 800 }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>Billing & Subscription</h3>
          <p style={{ margin: "0 0 24px 0", fontSize: 13, color: "var(--muted)" }}>Manage your plan, team seats, and payment details.</p>

          <div style={{ border: "1px solid var(--primary)", borderRadius: 14, padding: 20, background: "rgba(59, 130, 246, 0.08)", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--primary)", color: "#fff", fontWeight: 700 }}>CURRENT PLAN</span>
                <h4 style={{ margin: "8px 0 2px 0", fontSize: 20, fontWeight: 800 }}>Pro Developer Workspace</h4>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>$29 / member / month • Renews on April 15, 2025</div>
              </div>
              <button className="btn btn-primary" onClick={() => toast("Redirecting to Stripe Customer Portal...", "info")} style={{ minHeight: 36, fontSize: 13 }}>
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
