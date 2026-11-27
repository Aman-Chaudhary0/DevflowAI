import Link from "next/link";
import {
  ArrowRight, Bug, Code2, Database, FileText, MessageSquare, Play,
  Server, ShieldCheck, Sparkles, WandSparkles, Zap
} from "lucide-react";
import { PageHeader } from "@/components/dashboard-ui";

const aiTools = [
  {
    id: "chat", title: "AI Chat Assistant", description: "Work through ideas, debug issues, and keep the conversation history for later.",
    icon: MessageSquare, color: "#3b82f6", link: "/dashboard/ai/chat", tag: "Chat & history"
  },
  {
    id: "generator", title: "Code Generator", description: "Create application code with language, framework, styling, and TypeScript options.",
    icon: Code2, color: "#8b5cf6", link: "/dashboard/ai/code-generator", tag: "Multi-framework"
  },
  {
    id: "review", title: "Code Review", description: "Review code for security risks, performance issues, and maintainability improvements.",
    icon: ShieldCheck, color: "#10b981", link: "/dashboard/ai/code-review", tag: "Quality & security"
  },
  {
    id: "docs", title: "Documentation Generator", description: "Draft Markdown guides, API specifications, and inline documentation.",
    icon: FileText, color: "#ec4899", link: "/dashboard/ai/docs-generator", tag: "Markdown & OpenAPI"
  },
  {
    id: "fixer", title: "Bug Fixer", description: "Explain stack traces, find likely causes, and suggest focused code changes.",
    icon: Bug, color: "#f59e0b", link: "/dashboard/ai/bug-fixer", tag: "Debugging"
  },
  {
    id: "backend", title: "Backend Generator", description: "Shape backend services, routes, and data models from a project brief.",
    icon: Server, color: "#06b6d4", link: "/dashboard/ai/backend-generator", tag: "APIs & services"
  },
  {
    id: "sql", title: "SQL Generator", description: "Generate and refine SQL queries, schemas, and database operations.",
    icon: Database, color: "#f97316", link: "/dashboard/ai/sql-generator", tag: "Database"
  }
];

const promptTemplates = [
  "Create a Next.js server action with Zod validation for user login.",
  "Explain this React hydration mismatch and suggest a fix.",
  "Review this SQL query for performance and indexing opportunities.",
  "Generate an OpenAPI spec for a versioned authentication API."
];

export default function AIHubPage() {
  return (
    <div className="ai-hub">
      <PageHeader title="AI Assistant Hub" subtitle="A focused set of AI tools for building, reviewing, and documenting software.">
        <Link className="btn btn-primary ai-hub-primary-action" href="/dashboard/ai/chat">
          <Sparkles size={16} /> Open AI Chat
        </Link>
      </PageHeader>

      <section className="ai-hub-hero" aria-labelledby="ai-hub-hero-title">
        <div className="ai-hub-hero-copy">
          <span className="ai-hub-eyebrow"><WandSparkles size={14} /> YOUR DEVELOPER TOOLKIT</span>
          <h2 id="ai-hub-hero-title">Move from question to working code.</h2>
          <p>Start a persistent AI conversation or jump straight into a tool built for a specific development task.</p>
          <div className="ai-hub-hero-actions">
            <Link className="btn btn-primary" href="/dashboard/ai/chat"><MessageSquare size={15} /> Start a conversation</Link>
            <a className="ai-hub-text-link" href="#ai-suite">Explore all tools <ArrowRight size={14} /></a>
          </div>
        </div>
        <div className="ai-hub-hero-aside">
          <div className="ai-hub-sparkle-orb"><Sparkles size={26} /></div>
          <div>
            <strong>One workspace, seven tools</strong>
            <span>Chat, generate, review, debug, and document.</span>
          </div>
          <div className="ai-hub-hero-divider" />
          <div className="ai-hub-provider-note"><span className="ai-hub-status-dot" /> Chat replies depend on server-side AI provider configuration.</div>
        </div>
      </section>

      <section className="ai-hub-section" id="ai-suite" aria-labelledby="ai-suite-title">
        <div className="ai-hub-section-heading">
          <div>
            <h2 id="ai-suite-title">AI tools</h2>
            <p>Choose a tool to get started with your next task.</p>
          </div>
          <span className="ai-hub-count">{aiTools.length} tools</span>
        </div>

        <div className="ai-hub-tools-grid">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <article className="ai-hub-tool-card" key={tool.id} style={{ "--tool-accent": tool.color }}>
                <div className="ai-hub-tool-topline">
                  <span className="ai-hub-tool-icon"><Icon size={21} /></span>
                  <span className="ai-hub-tool-tag">{tool.tag}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <Link className="ai-hub-tool-link" href={tool.link}>Open tool <ArrowRight size={15} /></Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ai-hub-prompts" aria-labelledby="ai-prompts-title">
        <div className="ai-hub-section-heading">
          <div className="ai-hub-prompts-title">
            <span className="ai-hub-prompt-icon"><Zap size={17} /></span>
            <div>
              <h2 id="ai-prompts-title">Need a starting point?</h2>
              <p>Open a chat with a prompt ready to go.</p>
            </div>
          </div>
        </div>
        <div className="ai-hub-prompt-grid">
          {promptTemplates.map((prompt) => (
            <Link className="ai-hub-prompt-card" key={prompt} href={`/dashboard/ai/chat?prompt=${encodeURIComponent(prompt)}`}>
              <span>{prompt}</span><Play size={14} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
