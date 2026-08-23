"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge, ConfirmDialog, toast } from "@/components/dashboard-ui";
import { mockApi } from "@/lib/api";

export default function DomainsPage() {
  const [rows, setRows] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { mockApi.domains.list().then(setRows); }, []);

  function addDomain() {
    setVerifying(true);
    setTimeout(() => {
      setRows((prev) => [{ id: `dom_${Date.now()}`, domain: "new.example.com", project: "DevFlow AI", environment: "Production", ssl: true, dns: "Connected", status: "Active", added: new Date().toISOString().slice(0, 10) }, ...(prev || [])]);
      setVerifying(false);
      setAddOpen(false);
      toast("Domain added", "success");
    }, 1600);
  }

  return (
    <div>
      <PageHeader title="Domains" subtitle="Manage custom domains and deployment URLs.">
        <button className="btn btn-primary" onClick={() => setAddOpen(true)} type="button">Add Domain</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Connected" value={rows?.length ?? '—'} delta="custom domains" trend="up" />
        <StatCard label="SSL active" value={rows ? rows.filter((r) => r.ssl).length : '—'} delta="secure sites" trend="up" />
        <StatCard label="DNS pending" value={rows ? rows.filter((r) => r.dns === 'Pending').length : '—'} delta="needs attention" trend="neutral" />
        <StatCard label="Status" value="Healthy" delta="overall" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 24%), var(--card)" }}>
        {rows === null ? <SkeletonCard /> : rows.length === 0 ? <EmptyState title="No domains connected" description="Add a custom domain to your deployment." action="Add Domain" onAction={() => setAddOpen(true)} /> : (
          <div className="overflow-x-auto">
            <table className="table w-full" style={{ minWidth: 1050 }}>
              <thead><tr><th>Domain</th><th>Project</th><th>Environment</th><th>SSL</th><th>DNS</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td className="font-semibold">{r.domain}</td><td>{r.project}</td><td><span className="badge">{r.environment}</span></td><td><StatusBadge status={r.ssl ? 'success' : 'warning'} /></td><td>{r.dns}</td><td><StatusBadge status={r.status.toLowerCase()} /></td><td>{r.added}</td><td><button className="btn btn-outline" onClick={() => toast(`Opened ${r.domain}`)} type="button">View</button></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={addOpen}
        title="Add custom domain"
        description={verifying ? "Checking DNS..." : "Add a new domain and verify DNS/SSL."}
        confirmLabel={verifying ? "Verifying..." : "Add Domain"}
        onConfirm={addDomain}
        onCancel={() => setAddOpen(false)}
      />
    </div>
  );
}
function LegacyDomainsPage() {
  const [items, setItems] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { mockApi.domains.list().then(setItems); }, []);

  function addDomain() {
    setVerifying(true);
    setTimeout(() => {
      setItems((prev) => [{ id: `dom_${Date.now()}`, domain: "new.example.com", project: "DevFlow AI", environment: "Production", ssl: true, dns: "Connected", status: "Active", added: new Date().toISOString().slice(0, 10) }, ...(prev || [])]);
      setVerifying(false);
      setAddOpen(false);
      toast("Domain added");
      toast("DNS verification complete", "success");
    }, 1800);
  }

  return (
    <div>
      <PageHeader title="Domains" subtitle="Manage custom domains and deployment URLs.">
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>Add Domain</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Connected Domains" value="8" />
        <StatCard label="Active" value="7" />
        <StatCard label="SSL Protected" value="8" />
        <StatCard label="Pending DNS" value="1" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 24%), var(--card)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="m-0 font-semibold">Domain control center</h3>
            <p className="m-0 mt-1 muted text-sm">Custom domains with SSL and DNS state shown as clean cards instead of dense tables.</p>
          </div>
          <span className="badge">DNS verification</span>
        </div>

        {items === null ? (
          <SkeletonCard />
        ) : items.length === 0 ? (
          <EmptyState title="No domains connected" description="Add a custom domain to map it to a deployment." action="Add Domain" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="grid gap-3">
            {items.map((d) => (
              <div key={d.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{d.domain}</div>
                      <span className="badge">{d.environment}</span>
                      <StatusBadge status={d.status.toLowerCase()} />
                    </div>
                    <div className="muted text-sm">{d.project} • added {d.added}</div>
                    <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">SSL</div><StatusBadge status={d.ssl ? 'success' : 'warning'} /></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">DNS</div><div className="font-medium">{d.dns}</div></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Project</div><div className="font-medium">{d.project}</div></div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)"><div className="muted text-xs mb-1">Added</div><div className="font-medium">{d.added}</div></div>
                    </div>
                  </div>
                  <button className="btn btn-outline shrink-0" onClick={() => toast(`Opened ${d.domain}`)} type="button">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={addOpen}
        title="Add custom domain"
        description={verifying ? "Checking DNS..." : "Add a new domain and verify DNS/SSL."}
        confirmLabel={verifying ? "Verifying..." : "Add Domain"}
        onConfirm={addDomain}
        onCancel={() => setAddOpen(false)}
      />
    </div>
  );
}
