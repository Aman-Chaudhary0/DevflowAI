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
      <div className="grid place-items-center min-h-[60vh]">
        <div className="text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl grid place-items-center" style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
            <CheckCircle2 size={40} />
          </div>
          <div>
            <h2 className="m-0 mb-2" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Project Created!</h2>
            <p className="muted m-0">Redirecting to your new project...</p>
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
              <span className="text-[13px] font-semibold whitespace-nowrap" style={{ color: i === step ? "var(--text)" : "var(--muted)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="stat-card" style={{ minHeight: 360 }}>
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h3 className="m-0" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Basic Information</h3>
            <div className="dash-grid-2">
              <label className="form-field">
                <span className="text-[13px] font-semibold">Project Name *</span>
                <input className="input" placeholder="My Awesome Project" value={form.name} onChange={(e) => update("name", e.target.value)} />
              </label>
              <label className="form-field">
                <span className="text-[13px] font-semibold">Slug</span>
                <input className="input" placeholder="my-awesome-project" value={form.slug} onChange={(e) => update("slug", e.target.value)} />
              </label>
            </div>
            <label className="form-field">
              <span className="text-[13px] font-semibold">Description</span>
              <textarea className="textarea" placeholder="What is this project about?" value={form.description} onChange={(e) => update("description", e.target.value)} style={{ minHeight: 90 }} />
            </label>
            <div className="form-field">
              <span className="text-[13px] font-semibold">Project Color</span>
              <div className="flex gap-2.5">
                {colorOptions.map((c) => (
                  <button key={c} onClick={() => update("color", c)} className="w-8 h-8 rounded-full cursor-pointer transition-all duration-150" style={{ background: c, border: form.color === c ? "3px solid var(--text)" : "3px solid transparent" }} type="button" />
                ))}
              </div>
            </div>
            <div className="form-field">
              <span className="text-[13px] font-semibold">Logo</span>
              <div className="border-2 border-dashed border-(--border) rounded-[14px] p-6 text-center cursor-pointer">
                <Upload size={24} color="var(--muted)" className="mx-auto mb-2" />
                <p className="muted m-0 text-[13px]">Drag & drop or click to upload</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h3 className="m-0" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Technology Stack</h3>
            <p className="muted m-0 text-[13px]">Select all technologies used in this project.</p>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
              {techOptions.map((t) => (
                <button
                  key={t.label}
                  onClick={() => toggleTech(t.label)}
                  className="flex items-center gap-2 text-[13px] font-semibold text-(--text) cursor-pointer rounded-xl transition-all duration-150"
                  style={{ padding: "10px 14px", border: `2px solid ${form.tech.includes(t.label) ? t.color : "var(--border)"}`, background: form.tech.includes(t.label) ? `color-mix(in srgb, ${t.color} 12%, transparent)` : "transparent" }}
                  type="button"
                >
                  {form.tech.includes(t.label) ? <Check size={14} color={t.color} /> : <div className="w-3.5 h-3.5 rounded border border-(--border)" />}
                  {t.label}
                </button>
              ))}
            </div>
            {form.tech.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {form.tech.map((t) => <span key={t} className="badge" style={{ padding: "4px 10px" }}>{t}</span>)}
              </div>
            ) : null}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="m-0" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Repository</h3>
            <div className="flex flex-col gap-2.5">
              {[["empty", "Create Empty Repository", "Start fresh with a blank repository"], ["github", "Import from GitHub", "Connect an existing GitHub repository"]].map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => update("repo", val)}
                  className="text-left cursor-pointer rounded-[14px] transition-all duration-150"
                  style={{ padding: "16px 20px", border: `2px solid ${form.repo === val ? "var(--primary)" : "var(--border)"}`, background: form.repo === val ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent" }}
                  type="button"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full grid place-items-center" style={{ border: `2px solid ${form.repo === val ? "var(--primary)" : "var(--border)"}` }}>
                      {form.repo === val ? <div className="w-2.5 h-2.5 rounded-full bg-(--primary)" /> : null}
                    </div>
                    <div>
                      <p className="m-0 mb-0.5 font-bold text-sm">{label}</p>
                      <p className="muted m-0 text-xs">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <label className="form-field">
              <span className="text-[13px] font-semibold">Default Branch</span>
              <input className="input" value={form.branch} onChange={(e) => update("branch", e.target.value)} />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="m-0" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Invite Team Members</h3>
            {form.invites.map((inv, i) => (
              <div key={i} className="flex gap-2.5 items-center">
                <input className="input" placeholder="teammate@company.com" value={inv.email} onChange={(e) => updateInvite(i, "email", e.target.value)} style={{ flex: 1 }} />
                <select className="input" value={inv.role} onChange={(e) => updateInvite(i, "role", e.target.value)} style={{ width: 140 }}>
                  {roleOptions.map((r) => <option key={r}>{r}</option>)}
                </select>
                {form.invites.length > 1 ? (
                  <button className="icon-btn w-9 h-9 border-0 bg-transparent text-(--danger) shrink-0" onClick={() => removeInvite(i)} type="button"><X size={16} /></button>
                ) : null}
              </div>
            ))}
            <button className="btn btn-outline self-start" onClick={addInvite} style={{ minHeight: 38, fontSize: 13 }} type="button"><Plus size={15} /> Add Another</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <h3 className="m-0" style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}>Review & Create</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Project Name", form.name || "—"],
                ["Slug", form.slug || "—"],
                ["Repository", form.repo === "github" ? "Import from GitHub" : "Empty Repository"],
                ["Branch", form.branch],
                ["Tech Stack", form.tech.join(", ") || "None selected"],
                ["Team Invites", form.invites.filter((i) => i.email).length + " members"]
              ].map(([label, value]) => (
                <div key={label} className="p-3.5 border border-(--border)/40 rounded-xl">
                  <p className="muted m-0 mb-1 text-xs">{label}</p>
                  <p className="m-0 font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border" style={{ background: "color-mix(in srgb, var(--success) 8%, transparent)", borderColor: "color-mix(in srgb, var(--success) 30%, transparent)" }}>
              <Rocket size={18} color="var(--success)" />
              <span className="text-[13px] font-semibold">Everything looks good! Click Create Project to launch.</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
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
