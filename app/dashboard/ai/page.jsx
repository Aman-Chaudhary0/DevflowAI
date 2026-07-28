"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles, MessageSquare, Code2, ShieldCheck, FileText, Bug, ArrowRight,
  Zap, Cpu, CheckCircle2, History, Copy, Play
} from "lucide-react";
import { PageHeader, StatCard, ProgressRing, toast } from "@/components/dashboard-ui";

const aiTools = [
  {
    id: "chat",
    title: "AI Chat Assistant",
    description: "Context-aware conversational AI with streaming responses, code highlighting, and repo context.",
    icon: MessageSquare,
    color: "#3b82f6",
    link: "/dashboard/ai/chat",
    tag: "Gemini & GPT-4o"
  },
  {
    id: "generator",
    title: "AI Code Generator",
    description: "Multi-language code generator with framework, styling, and TypeScript parameter options.",
    icon: Code2,
    color: "#8b5cf6",
    link: "/dashboard/ai/code-generator",
    tag: "Multi-Framework"
  },
  {
    id: "review",
    title: "AI Code Review",
    description: "Automated PR & code analyzer for security vulnerabilities, performance bottlenecks, and refactoring.",
    icon: ShieldCheck,
    color: "#10b981",
    link: "/dashboard/ai/code-review",
    tag: "Automated PR"
  },
  {
    id: "docs",
    title: "AI Documentation Generator",
    description: "Generate structured markdown documentation, API specs, and inline JSDoc comments automatically.",
    icon: FileText,
    color: "#ec4899",
    link: "/dashboard/ai/docs-generator",
    tag: "Markdown & OpenAPI"
  },
  {
    id: "fixer",
    title: "AI Bug Fixer",
    description: "Instant stack trace parser, root cause analyzer, and auto-generated code diff fixer.",
    icon: Bug,
    color: "#f59e0b",
    link: "/dashboard/ai/bug-fixer",
    tag: "Stack Trace Diff"
  }
];

const promptTemplates = [
  { text: "Create a Next.js 15 Server Action with Zod validation for user login.", tool: "generator" },
  { text: "Fix hydration mismatch error in React 19 SSR component.", tool: "fixer" },
  { text: "Audit this PostgreSQL query for N+1 performance bottlenecks.", tool: "review" },
  { text: "Generate OpenAPI 3.0 specification for authentication REST API.", tool: "docs" }
];

export default function AIHubPage() {
  const [selectedPrompt, setSelectedPrompt] = useState("");

  return (
    <div style={{ padding: "24px", maxWidth: 1300, margin: "0 auto" }}>
      <PageHeader title="AI Assistant Hub" subtitle="Centralized suite of developer AI tools powered by Claude, GPT-4o, and Gemini">
        <Link className="btn btn-primary" href="/dashboard/ai/chat" style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Sparkles size={16} /> Open AI Chat
        </Link>
      </PageHeader>

      {/* Usage & Model Status Banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(26, 34, 53, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)", border: "1px solid var(--border)", borderRadius: 18, padding: 24, marginBottom: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing value={142} max={500} size={70} stroke={8} color="#a855f7" />
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Monthly AI Tokens</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0" }}>142.5K <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ 500K</span></div>
            <div style={{ fontSize: 11, color: "var(--success)" }}>357.5K tokens remaining</div>
          </div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Active AI Engine</div>
          <div style={{ fontSize: 15, fontWeight: 700, margin: "2px 0", color: "#3b82f6", display: "flex", alignItems: "center", gap: 6 }}>
            <Cpu size={16} /> Gemini 1.5 & GPT-4o
          </div>
          <div style={{ fontSize: 11, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 size={12} /> All models operational
          </div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Time Saved This Week</div>
          <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0", color: "#10b981" }}>18.4 Hours</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Across 142 AI prompts</div>
        </div>
      </div>

      {/* AI Tool Cards Grid */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>AI Suite Tools</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, marginBottom: 36 }}>
        {aiTools.map(tool => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                transition: "transform 0.15s, border-color 0.15s"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `color-mix(in srgb, ${tool.color} 15%, transparent)`, display: "grid", placeItems: "center" }}>
                    <Icon size={22} style={{ color: tool.color }} />
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "var(--muted)", fontWeight: 600 }}>
                    {tool.tag}
                  </span>
                </div>

                <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>{tool.title}</h3>
                <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  {tool.description}
                </p>
              </div>

              <Link
                href={tool.link}
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", minHeight: 38, fontSize: 13, gap: 8, borderColor: `color-mix(in srgb, ${tool.color} 40%, transparent)` }}
              >
                Launch Tool <ArrowRight size={15} />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Quick Prompt Starters */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Zap size={18} style={{ color: "#f59e0b" }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Quick Launch Prompts</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {promptTemplates.map((p, idx) => (
            <div
              key={idx}
              onClick={() => {
                toast("Prompt template copied!", "info");
              }}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                background: "rgba(0,0,0,0.2)",
                cursor: "pointer",
                transition: "border-color 0.15s",
                display: "flex",
                alignItems: "center",
                justify: "space-between",
                gap: 12
              }}
            >
              <span style={{ fontSize: 13, color: "var(--fg)", lineHeight: 1.4 }}>{p.text}</span>
              <Play size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
