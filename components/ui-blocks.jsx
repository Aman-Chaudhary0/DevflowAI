import Link from "next/link";
import { Check, ChevronRight, Copy, Play, Search, Star } from "lucide-react";
import { features, pricingPlans } from "@/lib/data";

// PageHero is a component that renders a hero section for a page, displaying an optional eyebrow, title, description, and any child components passed to it.
export function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="section-tight">
      <div className="container stack-lg center" style={{ textAlign: "center" }}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="h1" style={{ marginInline: "auto" }}>{title}</h1>
        <p className="lead" style={{ marginInline: "auto" }}>{description}</p>
        {children}
      </div>
    </section>
  );
}

// The FeatureGrid component renders a grid of feature cards, each displaying an icon, title, description, and a "Learn More" link that navigates to the features page.
export function FeatureGrid() {
  return (
    <div className="grid grid-3">
      {features.map((feature) => (
        <article className="card card-pad stack" key={feature.title}>
          <span className="logo-mark"><feature.icon size={20} /></span>
          <h3 className="h3">{feature.title}</h3>
          <p className="muted">{feature.description}</p>
          <Link className="row" href="/features" style={{ gap: 8, color: "var(--primary)", fontWeight: 800 }}>
            Learn More <ChevronRight size={16} />
          </Link>
        </article>
      ))}
    </div>
  );
}

// PricingCards is a component that renders a grid of pricing plan cards, each displaying the plan's name, description, price, features, and a call-to-action button. It supports a compact view that limits the number of displayed features.
export function PricingCards({ compact = false }) {
  return (
    <div className="grid grid-4">
      {pricingPlans.map((plan) => (
        <article
          className="card card-pad stack"
          key={plan.name}
          style={plan.popular ? { borderColor: "var(--primary)", transform: "translateY(-6px)" } : undefined}
        >
          <div className="row between">
            <h3 className="h3">{plan.name}</h3>
            {plan.popular ? <span className="badge">Popular</span> : null}
          </div>
          <p className="muted">{plan.description}</p>
          <strong className="font-display" style={{ fontSize: 42 }}>{plan.price}</strong>
          <div className="stack">
            {(compact ? plan.features.slice(0, 3) : plan.features).map((feature) => (
              <span className="row" key={feature} style={{ gap: 10 }}>
                <Check color="var(--success)" size={18} /> {feature}
              </span>
            ))}
          </div>
          <Link className={`btn ${plan.popular ? "btn-primary" : "btn-outline"}`} href="/pricing">{plan.cta}</Link>
        </article>
      ))}
    </div>
  );
}


// DashboardPreview is a component that renders a mock dashboard interface, displaying key metrics, a terminal output, and cards for AI responses and code reviews. It simulates a real-time dashboard experience for users to visualize their workflow and performance statistics.
export function DashboardPreview() {
  return (
    <div className="dashboard-mock floating">
      <div className="mock-top">
        <span className="badge">AI Sprint Control</span>
        <button className="btn btn-primary" type="button"><Play size={16} /> Run</button>
      </div>
      <div className="grid grid-3">
        {[["Velocity", "84%"], ["Reviews", "126"], ["Deploys", "42"]].map(([label, value]) => (
          <div className="card card-pad" key={label}>
            <p className="soft">{label}</p>
            <strong className="font-display" style={{ fontSize: 30 }}>{value}</strong>
          </div>
        ))}
      </div>
      <div className="terminal">
        <div>$ devflow ai plan --sprint</div>
        <div style={{ color: "var(--success)" }}>Generated 7 tasks, 3 tests, 2 deploy checks</div>
        <div>$ npm run build</div>
        <div style={{ color: "var(--info)" }}>Ready in 1.8s</div>
      </div>
      <div className="grid grid-2">
        <div className="card card-pad floating delay-1">
          <span className="badge">AI Response</span>
          <p className="muted">Refactor plan prepared with risk notes and rollback steps.</p>
        </div>
        <div className="card card-pad floating delay-2">
          <span className="badge">Code Review</span>
          <p className="muted">No blocking issues. Suggested two accessibility improvements.</p>
        </div>
      </div>
    </div>
  );
}

// The SearchBar component renders a search input field with an optional placeholder text, allowing users to search for content within the application.
export function SearchBar({ placeholder = "Search Devflow AI" }) {
  return (
    <label className="row card" style={{ gap: 12, maxWidth: 620, width: "100%", padding: "10px 16px" }}>
      <Search className="soft" size={20} />
      <input aria-label={placeholder} className="input" placeholder={placeholder} style={{ border: 0, background: "transparent" }} />
    </label>
  );
}

// The CodeBlock component renders a styled code block with a copy button, allowing users to view and copy code snippets easily. It displays a sample code snippet related to running a workflow with Devflow AI.
export function CodeBlock() {
  return (
    <pre className="code-card">
      <button aria-label="Copy code" className="icon-btn" style={{ float: "right" }} type="button"><Copy size={16} /></button>
      <code>{`const workflow = await devflow.ai.run({\n  context: "launch checklist",\n  mode: "review",\n  output: ["tasks", "tests", "deploy"]\n});`}</code>
    </pre>
  );
}

export function Rating() {
  return (
    <span className="row" style={{ gap: 4 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Star fill="var(--warning)" color="var(--warning)" key={item} size={16} />
      ))}
    </span>
  );
}
