"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, FolderOpen, Plus, Rocket, Upload, X } from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";

const steps = ["Basic Info", "Technology", "Repository", "Team", "Review"];

const techOptions = [
  { label: "React", color: "#61dafb" }, { label: "Next.js", color: "#000" },
  { label: "Vue", color: "#42b883" }, { label: "Node.js", color: "#339933" },
  { label: "Express", color: "#000" }, { label: "MongoDB", color: "#47a248" },
  { label: "PostgreSQL", color: "#336791" }, { label: "Docker", color: "#2496ed" },
  { label: "Redis", color: "#dc382d" }, { label: "TypeScript", color: "#3178c6" },
  { label: "Python", color: "#3776ab" }, { label: "FastAPI", color: "#009688" }
];

const colorOptions = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#22c55e", "#ef4444", "#f97316"];

const roleOptions = ["Admin", "Developer", "Viewer"];

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", color: "#3b82f6",
    tech: [], repo: "empty", branch: "main",
    invites: [{ email: "", role: "Developer" }]
  });

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name") {
      setForm((prev) => ({ ...prev, name: value, slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }));
    }
  }

  function toggleTech(t) {
    setForm((prev) => ({
      ...prev,
      tech: prev.tech.includes(t) ? prev.tech.filter((x) => x !== t) : [...prev.tech, t]
    }));
  }

  function addInvite() {
    setForm((prev) => ({ ...prev, invites: [...prev.invites, { email: "", role: "Developer" }] }));
  }

  function updateInvite(i, key, value) {
    setForm((prev) => {
      const invites = [...prev.invites];
      invites[i] = { ...invites[i], [key]: value };
      return { ...prev, invites };
    });
  }

  function removeInvite(i) {
    setForm((prev) => ({ ...prev, invites: prev.invites.filter((_, idx) => idx !== i) }));
  }

  async function handleCreate() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard/projects/p1"), 1800);
  }

  if (success) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "color-mix(in srgb, var(--success) 15%, transparent)", display: "grid", placeItems: "center", color: "var(--success)" }}>
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 style={{ margin: "0 0 8px", fontFamily: "Space Grotesk, Inter, sans-serif" }}>Project Created!</h2>
            <p className="muted" style={{ margin: 0 }}>Redirecting to your new project...</p>
          </div>
          <div className="spinner" style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Create Project" subtitle="Set up your new workspace in a few steps." />

      {/* Wizard Steps */}
      <div className="stat-card" style={{ padding: "24px 32px" }}>
        <div className="wizard-steps">
          {steps.map((s, i) => (
            <div className={`wizard-step ${i < step ? "done" : i === step ? "active" : ""}`} key={s}>
              <div className="wizard-step-num">
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: i === step ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="stat-card" style={{ minHeight: 360 }}>
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontFamily: "Space Grotesk, Inter, sans-serif" }}>Basic Information</h3>
            <div className="dash-grid-2">
              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Project Name *</span>
                <input className="input" placeholder="My Awesome Project" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </label>
              <label className="form-field">
                <span style={{ fontSize: 13, fontWeight: 600 }}>Slug</span>
                <input className="input" placeholder="my-awesome-project" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
              </label>
            </div>
            <label className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Description</span>
              <textarea className="textarea" placeholder="What is this project about?" value={form.description} onChange={(e) => update("description", e.target.value)} style={{ minHeight: 90 }} />
            </label>
            <div className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Project Color</span>
              <div style={{ display: "flex", gap: 10 }}>
                {colorOptions.map((c) => (
                  <button key={c} onClick={() => update("color", c)} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: form.color === c ? "3px solid var(--text)" : "3px solid transparent", cursor: "pointer", transition: "border 150ms ease" }} type="button" />
                ))}
              </div>
            </div>
            <div className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Logo</span>
              <div style={{ border: "2px dashed var(--border)", borderRadius: 14, padding: "24px", textAlign: "center", cursor: "pointer" }}>
                <Upload size={24} color="var(--muted)" style={{ margin: "0 auto 8px" }} />
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>Drag & drop or click to upload</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontFamily: "Space Grotesk, Inter, sans-serif" }}>Technology Stack</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>Select all technologies used in this project.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
              {techOptions.map((t) => (
                <button
                  key={t.label}
                  onClick={() => toggleTech(t.label)}
                  style={{ padding: "10px 14px", border: `2px solid ${form.tech.includes(t.label) ? t.color : "var(--border)"}`, borderRadius: 12, background: form.tech.includes(t.label) ? `color-mix(in srgb, ${t.color} 12%, transparent)` : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text)", transition: "all 150ms ease" }}
                  type="button"
                >
                  {form.tech.includes(t.label) ? <Check size={14} color={t.color} /> : <div style={{ width: 14, height: 14, borderRadius: 4, border: "1px solid var(--border)" }} />}
                  {t.label}
                </button>
              ))}
            </div>
            {form.tech.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {form.tech.map((t) => <span key={t} className="badge" style={{ padding: "4px 10px" }}>{t}</span>)}
              </div>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontFamily: "Space Grotesk, Inter, sans-serif" }}>Repository</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["empty", "Create Empty Repository", "Start fresh with a blank repository"], ["github", "Import from GitHub", "Connect an existing GitHub repository"]].map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => update("repo", val)}
                  style={{ padding: "16px 20px", border: `2px solid ${form.repo === val ? "var(--primary)" : "var(--border)"}`, borderRadius: 14, background: form.repo === val ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent", cursor: "pointer", textAlign: "left", transition: "all 150ms ease" }}
                  type="button"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.repo === val ? "var(--primary)" : "var(--border)"}`, display: "grid", placeItems: "center" }}>
                      {form.repo === val ? <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)" }} /> : null}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{label}</p>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <label className="form-field">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Default Branch</span>
              <input className="input" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
            </label>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontFamily: "Space Grotesk, Inter, sans-serif" }}>Invite Team Members</h3>
            {form.invites.map((inv, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input className="input" placeholder="teammate@company.com" value={inv.email} onChange={(e) => updateInvite(i, "email", e.target.value)} style={{ flex: 1 }} />
                <select className="input" value={inv.role} onChange={(e) => updateInvite(i, "role", e.target.value)} style={{ width: 140 }}>
                  {roleOptions.map((r) => <option key={r}>{r}</option>)}
                </select>
                {form.invites.length > 1 ? (
                  <button className="icon-btn" onClick={() => removeInvite(i)} style={{ width: 36, height: 36, border: "none", background: "transparent", color: "var(--danger)", flexShrink: 0 }} type="button"><X size={16} /></button>
                ) : null}
              </div>
            ))}
            <button className="btn btn-outline" onClick={addInvite} style={{ minHeight: 38, fontSize: 13, alignSelf: "flex-start" }} type="button"><Plus size={15} /> Add Another</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontFamily: "Space Grotesk, Inter, sans-serif" }}>Review & Create</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                ["Project Name", form.name || "—"],
                ["Slug", form.slug || "—"],
                ["Repository", form.repo === "github" ? "Import from GitHub" : "Empty Repository"],
                ["Branch", form.branch],
                ["Tech Stack", form.tech.join(", ") || "None selected"],
                ["Team Invites", form.invites.filter((i) => i.email).length + " members"]
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 12 }}>
                  <p className="muted" style={{ margin: "0 0 4px", fontSize: 12 }}>{label}</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "color-mix(in srgb, var(--success) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)", borderRadius: 12 }}>
              <Rocket size={18} color="var(--success)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Everything looks good! Click Create Project to launch.</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn btn-outline" onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()} style={{ minHeight: 40, fontSize: 13 }} type="button">
          <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
        </button>
        {step < steps.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !form.name} style={{ minHeight: 40, fontSize: 13 }} type="button">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ minHeight: 40, fontSize: 13 }} type="button">
            {loading ? <span className="spinner" /> : <FolderOpen size={16} />}
            {loading ? "Creating..." : "Create Project"}
          </button>
        )}
      </div>
    </>
  );
}
