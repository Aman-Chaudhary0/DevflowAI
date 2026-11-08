"use client";
import { useEffect, useState } from "react";
import { PageHeader, EmptyState, SkeletonCard, StatCard, StatusBadge, ConfirmDialog, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

export default function DomainsPage() {
  const [domains, setDomains] = useState(null);
  const [stats, setStats] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newEnv, setNewEnv] = useState("production");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await api.domains.list();
        setDomains(result.domains || []);
        
        const active = (result.domains || []).filter(d => d.status === "active").length;
        const ssl = (result.domains || []).filter(d => d.sslStatus === "issued").length;
        const pending = (result.domains || []).filter(d => d.dnsStatus === "pending").length;
        
        setStats({ total: result.domains?.length || 0, active, ssl, pending });
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load domains");
        setDomains([]);
      }
    }
    load();
  }, []);

  async function handleAddDomain() {
    if (!newDomain.trim()) {
      toast("Please enter a domain name", "error");
      return;
    }

    setVerifying(true);
    try {
      const result = await api.domains.create({
        domain: newDomain.trim(),
        environment: newEnv,
        projectId: "" // User should select project in a real form
      });
      
      setDomains(prev => [result.domain, ...(prev || [])]);
      setNewDomain("");
      setNewEnv("production");
      setAddOpen(false);
      toast("Domain added successfully", "success");
    } catch (err) {
      toast(err.message || "Failed to add domain", "error");
    } finally {
      setVerifying(false);
    }
  }

  async function handleVerifyDomain(domainId) {
    try {
      const result = await api.domains.verify(domainId);
      setDomains(prev => prev.map(d => d.id === domainId ? result.domain : d));
      toast("Domain verification refreshed", "success");
    } catch (err) {
      toast(err.message || "Failed to verify domain", "error");
    }
  }

  async function handleDeleteDomain(domainId) {
    try {
      await api.domains.delete(domainId);
      setDomains(prev => prev.filter(d => d.id !== domainId));
      toast("Domain removed", "success");
    } catch (err) {
      toast(err.message || "Failed to remove domain", "error");
    }
  }

  return (
    <div>
      <PageHeader title="Domains" subtitle="Manage custom domains and deployment URLs.">
        <button className="btn btn-primary" onClick={() => setAddOpen(true)} type="button">Add Domain</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Connected" value={String(stats?.total || 0)} delta="custom domains" trend="up" />
        <StatCard label="SSL active" value={String(stats?.ssl || 0)} delta="secure sites" trend="up" />
        <StatCard label="DNS pending" value={String(stats?.pending || 0)} delta="needs attention" trend="neutral" />
        <StatCard label="Status" value={stats?.active ? "Healthy" : "—"} delta="overall" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 24%), var(--card))" }}>
        {domains === null ? (
          <SkeletonCard />
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">{error}</div>
        ) : domains.length === 0 ? (
          <EmptyState title="No domains connected" description="Add a custom domain to your deployment." action="Add Domain" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="grid gap-3">
            {domains.map((d) => (
              <div key={d.id} className="card p-4 border border-(--border) hover:border-(--primary) transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="font-semibold text-[15px]">{d.domain}</div>
                      <span className="badge">{d.environment}</span>
                      <StatusBadge status={d.status.toLowerCase()} />
                    </div>
                    <div className="muted text-sm">{d.projectName} • added {new Date(d.createdAt).toLocaleDateString()}</div>
                    <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">SSL</div>
                        <StatusBadge status={d.sslStatus === "issued" ? "success" : d.sslStatus === "pending" ? "warning" : "error"} />
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">DNS</div>
                        <div className="font-medium capitalize">{d.dnsStatus}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Verification</div>
                        <div className="font-medium capitalize">{d.verificationStatus}</div>
                      </div>
                      <div className="rounded-2xl border border-(--border) p-3 bg-(--bg)">
                        <div className="muted text-xs mb-1">Status</div>
                        <div className="font-medium capitalize">{d.status}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    <button className="btn btn-ghost" onClick={() => handleVerifyDomain(d.id)} type="button">Verify</button>
                    <button className="btn btn-outline" onClick={() => handleDeleteDomain(d.id)} type="button">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={addOpen}
        title="Add custom domain"
        description={verifying ? "Adding domain..." : "Add a new domain and verify DNS/SSL."}
        confirmLabel={verifying ? "Adding..." : "Add Domain"}
        onConfirm={handleAddDomain}
        onCancel={() => {
          setAddOpen(false);
          setNewDomain("");
          setNewEnv("production");
        }}
      >
        <div className="grid gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Domain name</label>
            <input
              type="text"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={verifying}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Environment</label>
            <select
              value={newEnv}
              onChange={(e) => setNewEnv(e.target.value)}
              disabled={verifying}
              className="input w-full"
            >
              <option value="production">Production</option>
              <option value="preview">Preview</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
