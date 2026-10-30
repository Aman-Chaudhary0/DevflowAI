"use client";

import { useState } from "react";
import { Bot, Braces, Database, FileCode2, Layers3, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { EmptyState, PageHeader, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { backendGeneratorExamples } from "@/lib/mock/ai";

const tabs = ["Architecture", "Database", "API", "Code"];

export default function BackendGeneratorPage() {
  const examples = backendGeneratorExamples;
  const [prompt, setPrompt] = useState("");
  const [stage, setStage] = useState("empty");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("Architecture");
  async function generate() {
    if (!prompt.trim()) return toast("Describe the backend you want to build", "error");
    if (stage === "generating") return;
    setStage("generating"); setResult(null);
    try { const response = await api.ai.tools.backendBlueprint({ prompt }); setResult(response.data?.result); setStage("generated"); toast("Backend blueprint is ready"); }
    catch (error) { setStage("error"); toast(error.message || "AI generation failed", "error"); }
  }
  return <div>
    <PageHeader title="AI Backend Generator" subtitle="Turn a product brief into a structured backend blueprint, ready for your engineering team."><button className="btn btn-outline" type="button" onClick={() => toast("Draft saved")}>Save draft</button></PageHeader>
    <div className="grid grid-cols-12 gap-6 mt-6">
      <section className="col-span-5 card p-5 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,.09), transparent 28%), var(--card)" }}>
        <div className="flex justify-between gap-3 mb-4"><div><h2 className="m-0 font-semibold">Project brief</h2><p className="muted text-sm m-0 mt-1">Include users, data, integrations, and key workflows.</p></div><Bot size={22} color="var(--primary)" /></div>
        <textarea className="input w-full min-h-47.5 resize-y" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Build a multi-tenant appointment platform with doctors, patients, availability, reminders, payments, and role-based access." />
        <div className="flex gap-2 mt-4"><button className="btn btn-primary" onClick={generate} type="button">Generate blueprint</button><button className="btn btn-ghost" onClick={() => setPrompt("")} type="button">Clear</button></div>
        <div className="flex items-center justify-between mt-6 mb-3"><h3 className="m-0 text-sm font-semibold">Quick templates</h3><span className="muted text-xs">Load a starting point</span></div>
        <div className="grid gap-2">{examples.map((example) => <button key={example.id} className="text-left rounded-xl border border-(--border) p-3 bg-(--bg) hover:border-(--primary) transition-colors" type="button" onClick={() => setPrompt(example.prompt)}><div className="flex gap-2 items-center font-medium text-sm"><Rocket size={15} color="var(--primary)" />{example.title}</div><div className="muted text-xs mt-1 line-clamp-2">{example.prompt}</div></button>)}</div>
      </section>
      <section className="col-span-7 card p-5 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(16,185,129,.07), transparent 25%), var(--card)" }}>
        <div className="flex items-start justify-between gap-3 mb-5"><div><h2 className="m-0 font-semibold">Blueprint workspace</h2><p className="muted text-sm m-0 mt-1">Review architecture, data model, API contract, and scaffold.</p></div>{stage !== "empty" && <span className="badge capitalize">{stage}</span>}</div>
        {stage === "empty" && <div className="min-h-127.5 rounded-2xl border border-dashed border-(--border) bg-(--bg) grid place-items-center p-8 text-center"><div className="max-w-md"><div className="w-16 h-16 mx-auto rounded-2xl grid place-items-center" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)" }}><Sparkles color="var(--primary)" /></div><h3 className="mt-4 mb-2">Start with your product brief</h3><p className="muted text-sm leading-7">We’ll outline service boundaries, a database model, route groups, security controls, and an implementation-ready folder structure.</p></div></div>}
        {stage === "generating" && <div className="min-h-127.5 grid place-items-center"><div className="w-full"><div className="flex items-center gap-3 mb-5"><Sparkles className="animate-pulse" color="var(--primary)" /><div><div className="font-semibold">Designing your backend</div><div className="muted text-sm">Mapping services, models, and routes...</div></div></div><SkeletonCard /></div></div>}
        {stage === "error" && <EmptyState icon={Bot} title="Generation couldn’t complete" description="Try again with a little more detail in the project brief." action="Try again" onAction={generate} />}
        {stage === "generated" && result && <div><div className="flex justify-end mb-3"><button className="btn btn-outline" onClick={() => { const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "backend-blueprint.json"; link.click(); URL.revokeObjectURL(url); }} type="button">Download</button></div><div className="tabs">{tabs.map((name) => <button key={name} type="button" className={`tab ${tab === name ? "active" : ""}`} onClick={() => setTab(name)}>{name}</button>)}</div><BlueprintPanel tab={tab} result={result} /></div>}
      </section>
    </div>
  </div>;
}

function BlueprintPanel({ tab, result }) {
  const content = { Architecture: [Layers3, "Service-oriented foundation", "API gateway, auth, domain services, event queue, and a background worker give the product room to grow."], Database: [Database, "Relational data model", "Users, organizations, roles, sessions, and domain records use indexed foreign keys and audit timestamps."], API: [ShieldCheck, "Predictable, guarded routes", "Versioned REST endpoints include validation, role checks, pagination, and consistent error responses."], Code: [FileCode2, "Scaffold-ready structure", "controllers, services, models, validators, jobs, and shared middleware."] };
  const [Icon, title, description] = content[tab];
  const actual = result?.[tab.toLowerCase()];
  return <div className="mt-4 rounded-2xl border border-(--border) p-5 bg-(--bg)"><div className="flex gap-3 items-center"><div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}><Icon size={19} color="var(--primary)" /></div><div><h3 className="m-0 text-base">{title}</h3><p className="muted text-sm m-0 mt-1">{description}</p></div></div><pre className="mt-5 mb-0 rounded-xl p-4 text-xs" style={{ background: "#0b1220", color: "#dbeafe", overflowY: "auto", maxHeight: 480, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{typeof actual === "string" ? actual : JSON.stringify(actual, null, 2)}</pre></div>;
}
