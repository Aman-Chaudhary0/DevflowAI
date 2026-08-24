"use client";
import { useState } from "react";
import { AlertTriangle, Copy, KeyRound, Plus } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { apiKeys as seed } from "@/lib/mock/workspace";
export default function ApiKeys() {
  const [keys, setKeys] = useState(seed),
    [create, setCreate] = useState(false),
    [selected, setSelected] = useState(null),
    [revoke, setRevoke] = useState(null);
  function make() {
    const key = {
      id: Date.now(),
      name: "New integration key",
      key: "df_test_7H29KJ83LQ82P1",
      environment: "Test",
      created: "Today",
      lastUsed: "Never",
      permissions: "Read + AI",
      status: "active",
    };
    setKeys((p) => [key, ...p]);
    setCreate(false);
    setSelected(key);
    toast("API key created.");
  }
  return (
    <div>
      <Crumb items={["Dashboard", "Developer", "API Keys"]} />
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API credentials for your DevFlow integrations."
      >
        <button
          className="btn btn-primary"
          onClick={() => setCreate(true)}
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
        <StatCard label="Active Keys" value="4" icon={KeyRound} />
        <StatCard label="Requests Today" value="12,482" />
        <StatCard label="Last Used" value="4 min" />
        <StatCard label="Expiring Soon" value="1" />
      </div>
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
              <tr key={k.id}>
                <td>
                  <b>{k.name}</b>
                  <small className="block muted">{k.environment}</small>
                </td>
                <td className="font-code">{k.key}</td>
                <td>{k.created}</td>
                <td>{k.lastUsed}</td>
                <td>{k.permissions}</td>
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
      <ConfirmDialog
        open={create}
        title="Create API key"
        description="A fake test key with Read and AI permissions will be generated."
        confirmLabel="Create Key"
        onConfirm={make}
        onCancel={() => setCreate(false)}
      />
      <Drawer
        open={!!selected}
        title="API key details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="terminal-panel">{selected.key}</div>
            <p className="muted">
              Copy this key now. You won't be able to see it again. This is a
              fictional frontend-only key.
            </p>
            <p>
              Environment: {selected.environment}
              <br />
              Permissions: {selected.permissions}
              <br />
              Last used: {selected.lastUsed}
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard?.writeText(selected.key);
                  toast("API key copied.");
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
        onConfirm={() => {
          setKeys((p) => p.filter((k) => k.id !== revoke.id));
          setRevoke(null);
          setSelected(null);
          toast("API key revoked.");
        }}
        onCancel={() => setRevoke(null)}
      />
    </div>
  );
}
