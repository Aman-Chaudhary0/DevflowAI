import Link from "next/link";
import { ArrowRight, Building2, CircleDot, GitBranch, MessageSquare, Rocket, ShieldCheck } from "lucide-react";
import { DashboardPreview, FeatureGrid, PricingCards, Rating } from "@/components/ui-blocks";

const screenshots = ["Dashboard", "AI Chat", "Kanban", "Analytics", "Code Review"];
const workflow = ["Idea", "AI", "Develop", "Deploy"];

export default function HomePage() {
  return (
    <>
      <section className="container hero-grid">
        <div className="stack-lg">
          <span className="eyebrow">AI Powered Developer Workspace</span>
          <h1 className="h1">Build Smarter. Ship Faster. Powered by AI.</h1>
          <p className="lead">Devflow AI brings planning, coding, project tracking, docs, reviews, and analytics into one polished workspace for modern product teams.</p>
          <div className="row wrap" style={{ gap: 12 }}>
            <Link className="btn btn-primary" href="/pricing">Start Free <ArrowRight size={18} /></Link>
            <Link className="btn btn-outline" href="/features">Watch Demo</Link>
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="section-tight">
        <div className="container stack">
          <p className="eyebrow">Trusted by shipping teams</p>
          <div className="grid grid-4">
            {["Northstar", "LinearWorks", "CloudPeak", "Vertex Labs"].map((company) => (
              <div className="card card-pad center" key={company} style={{ minHeight: 96 }}>
                <Building2 className="soft" size={22} />
                <strong className="muted" style={{ marginLeft: 10 }}>{company}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <div className="row between wrap" style={{ gap: 24 }}>
            <div>
              <span className="eyebrow">Features</span>
              <h2 className="h2">Everything developers need to keep flow.</h2>
            </div>
            <Link className="btn btn-secondary" href="/features">Explore Features</Link>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <section className="section-tight">
        <div className="container grid grid-2">
          <div className="dashboard-mock">
            <div className="row between">
              <span className="badge"><MessageSquare size={16} /> AI Chat</span>
              <span className="badge">Streaming</span>
            </div>
            <div className="card card-pad">Explain the deploy risk for the payment refactor.</div>
            <div className="card card-pad" style={{ borderColor: "var(--primary)" }}>
              <p className="muted">Risk is moderate. I found three impacted routes, two migration checks, and one rollback path.</p>
            </div>
          </div>
          <div className="stack-lg">
            <span className="eyebrow">AI Showcase</span>
            <h2 className="h2">Chat, review, document, and plan with project context.</h2>
            {["Markdown responses with code blocks", "Regenerate, stop, copy, and cite actions", "Chat history grouped by project"].map((item) => (
              <span className="row" key={item} style={{ gap: 12 }}><ShieldCheck color="var(--success)" size={20} /> {item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <span className="eyebrow">Product Screens</span>
          <div className="grid grid-3">
            {screenshots.map((screen) => (
              <div className="card card-pad stack" key={screen}>
                <span className="badge">{screen}</span>
                <div className="terminal" style={{ minHeight: 160 }}>{screen.toLowerCase()} / preview</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container stack-lg center" style={{ textAlign: "center" }}>
          <span className="eyebrow">Workflow</span>
          <h2 className="h2">From idea to deployment.</h2>
          <div className="grid grid-4" style={{ width: "100%" }}>
            {workflow.map((step) => (
              <div className="card card-pad stack center" key={step}>
                <CircleDot color="var(--primary)" />
                <h3 className="h3">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <div className="grid grid-3">
            {["A calm command center for a noisy product cycle.", "Our reviews ship faster because context no longer leaks.", "The dashboard made our deployment rituals visible."].map((quote, index) => (
              <article className="card card-pad stack" key={quote}>
                <Rating />
                <p>{quote}</p>
                <strong>{["Ava, CTO at Northstar", "Liam, Staff Engineer", "Mina, Product Lead"][index]}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container stack-lg">
          <div className="center stack" style={{ textAlign: "center" }}>
            <span className="eyebrow">Pricing</span>
            <h2 className="h2">Start small, scale cleanly.</h2>
          </div>
          <PricingCards compact />
        </div>
      </section>

      <section className="section-tight">
        <div className="container grid grid-2">
          {["Can I use light mode?", "Does it support teams?", "Can AI read project context?", "Is this production-ready UI?"].map((question) => (
            <details className="card card-pad" key={question}>
              <summary className="h3">{question}</summary>
              <p className="muted">Yes. The interface is designed around polished dark mode with light mode support, responsive layouts, and accessible controls.</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
