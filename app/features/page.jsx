import { ArrowRight } from "lucide-react";
import { CodeBlock, FeatureGrid, PageHero, SearchBar } from "@/components/ui-blocks";

const categories = ["AI", "Projects", "Deployment", "Git", "Analytics"];

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Features" title="A complete workspace for modern software teams." description="Search, filter, inspect, and combine AI features with the developer workflows teams already use.">
        <SearchBar placeholder="Search AI, deployments, git, analytics" />
        <div className="row wrap center" style={{ gap: 10 }}>{categories.map((category) => <span className="badge" key={category}>{category}</span>)}</div>
      </PageHero>
      <section className="section-tight"><div className="container"><FeatureGrid /></div></section>
      <section className="section">
        <div className="container stack-lg">
          {categories.map((category, index) => (
            <article className="grid grid-2" key={category} style={{ alignItems: "center" }}>
              <div className="dashboard-mock"><CodeBlock /></div>
              <div className="stack">
                <span className="eyebrow">{category}</span>
                <h2 className="h2">{category} workflows that stay fast under pressure.</h2>
                <p className="lead">Each area includes preview states, action buttons, benefits, and responsive behavior suitable for a production-grade product UI.</p>
                <button className="btn btn-primary" type="button">View Demo <ArrowRight size={18} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section-tight">
        <div className="container grid grid-4">{["99.9%", "1.8s", "42%", "12-column"].map((stat) => <div className="card card-pad center stack" key={stat}><strong className="font-display" style={{ fontSize: 42 }}>{stat}</strong><span className="muted">Performance signal</span></div>)}</div>
      </section>
    </>
  );
}
