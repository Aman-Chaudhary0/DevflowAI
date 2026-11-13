"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Copy, KeyRound, Plus, Loader2 } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
  EmptyState
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [revoke, setRevoke] = useState(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    environment: "test",
    permissions: []
  });

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      setLoading(true);
      const response = await api.apiKeys.list();
      setKeys(response.data || []);
    } catch (error) {
      toast(error.message || "Failed to load API keys", "error");
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!formData.name.trim()) {
      toast("Please enter a key name", "warning");
      return;
    }

    try {
      setCreating(true);
      const response = await api.apiKeys.create({
        name: formData.name,
        environment: formData.environment,
        permissions: formData.permissions
      });
      
      setNewKeyData(response.data);
      setShowNewKey(true);
      setFormData({ name: "", environment: "test", permissions: [] });
      await loadKeys();
      toast("API key created successfully");
    } catch (error) {
      toast(error.message || "Failed to create API key", "error");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey() {
    if (!revoke) return;
    try {
      await api.apiKeys.revoke(revoke._id);
      setKeys(keys.filter(k => k._id !== revoke._id));
      setRevoke(null);
      setSelected(null);
      toast("API key revoked successfully");
    } catch (error) {
      toast(error.message || "Failed to revoke API key", "error");
    }
  }

  const activeKeys = keys.filter(k => k.status === "active").length;

  return (
    <div>
      <Crumb items={["Dashboard", "Developer", "API Keys"]} />
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API credentials for your DevFlow integrations."
      >
        <button
          className="btn btn-primary"
          onClick={() => setShowNewKey(true)}
          type="button"
        >
          <Plus size={16} />
          Create API Key
        </button>
      </PageHeader>
      <div className="card p-4 mt-5 flex gap-3">
        <AlertTriangle color="var(--warning)" />
        <span>
          <b>Keep keys secure.</b>
          <span className="muted">
            {" "}
            Never expose API keys in client-side applications.
          </span>
        </span>
      </div>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Active Keys" value={String(activeKeys)} icon={KeyRound} />
        <StatCard label="Total Keys" value={String(keys.length)} />
        <StatCard label="Last Created" value={keys.length > 0 ? "Today" : "Never"} />
        <StatCard label="Expiring Soon" value="0" />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Loader2 size={32} className="spin" style={{ margin: "0 auto" }} />
        </div>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No API keys yet"
          description="Create your first API key to get started."
        />
      ) : (
        <section className="card p-5 mt-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Created</th>
                <th>Last used</th>
                <th>Permissions</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k._id}>
                  <td>
                    <b>{k.name}</b>
                    <small className="block muted">{k.environment}</small>
                  </td>
                  <td className="font-code">{k.key}</td>
                  <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</td>
                  <td>{k.permissions.length > 0 ? k.permissions.join(", ") : "None"}</td>
                  <td>
                    <StatusBadge status={k.status} />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSelected(k)}
                      type="button"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Drawer
        open={showNewKey && !newKeyData}
        title="Create API key"
        onClose={() => setShowNewKey(false)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Key Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Production API"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Environment</label>
            <select
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
            >
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>Permissions</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["projects:read", "projects:write", "files:read", "files:write", "tasks:read", "tasks:write", "ai:read", "ai:execute"].map(perm => (
                <label key={perm} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                      } else {
                        setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                      }
                    }}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowNewKey(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={createKey}
              disabled={creating}
              type="button"
            >
              {creating ? <><Loader2 size={15} className="spin" /> Creating...</> : "Create Key"}
            </button>
          </div>
        </div>
      </Drawer>

      <Drawer
        open={!!newKeyData}
        title="API key created"
        onClose={() => {
          setNewKeyData(null);
          setShowNewKey(false);
        }}
      >
        {newKeyData && (
          <>
            <p className="muted" style={{ marginBottom: 16 }}>
              Copy this key now. You will not be able to see it again.
            </p>
            <div className="terminal-panel" style={{ marginBottom: 16, wordBreak: "break-all" }}>
              {newKeyData.plainKey}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard?.writeText(newKeyData.plainKey);
                  toast("API key copied to clipboard");
                }}
                type="button"
              >
                <Copy size={15} />
                Copy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setNewKeyData(null);
                  setShowNewKey(false);
                }}
                type="button"
              >
                Done
              </button>
            </div>
          </>
        )}
      </Drawer>

      <Drawer
        open={!!selected}
        title="API key details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="terminal-panel" style={{ marginBottom: 16 }}>{selected.key}</div>
            <p className="muted" style={{ marginBottom: 16 }}>
              Environment: {selected.environment}
              <br />
              Permissions: {selected.permissions.length > 0 ? selected.permissions.join(", ") : "None"}
              <br />
              Created: {new Date(selected.createdAt).toLocaleDateString()}
              <br />
              Last used: {selected.lastUsedAt ? new Date(selected.lastUsedAt).toLocaleDateString() : "Never"}
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard?.writeText(selected.key);
                  toast("API key copied");
                }}
                type="button"
              >
                <Copy size={15} />
                Copy
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setRevoke(selected)}
                type="button"
              >
                Revoke
              </button>
            </div>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!revoke}
        title="Revoke this API key?"
        description="Applications using this key will immediately lose access."
        confirmLabel="Revoke Key"
        danger
        onConfirm={revokeKey}
        onCancel={() => setRevoke(null)}
      />
    </div>
  );
}
