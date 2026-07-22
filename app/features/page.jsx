import { ArrowRight } from "lucide-react";
import { CodeBlock, FeatureGrid, PageHero, SearchBar } from "@/components/ui-blocks";

const categories = ["AI", "Projects", "Deployment", "Git", "Analytics"];

// perfStats is an array of performance statistics, each containing a value and a label.
const perfStats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "1.8s", label: "Average build time" },
  { value: "42%", label: "Faster deployments" },
  { value: "12-col", label: "Responsive grid" }
];

// FeaturesPage is a page component that renders the "Features" page of the application, showcasing various features and workflows. It includes a hero section with a search bar, a feature grid, category-specific workflow sections, and performance statistics.
export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="A complete workspace for modern software teams."
        description="Search, filter, inspect, and combine AI features with the developer workflows teams already use."
      >
        <SearchBar placeholder="Search AI, deployments, git, analytics" />
        <div className="row wrap center" style={{ gap: 10 }}>
          {categories.map((category) => (
            <span className="badge" key={category}>{category}</span>
          ))}
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container">
          <FeatureGrid />
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          {categories.map((category) => (
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
        <div className="container grid grid-4">
          {perfStats.map(({ value, label }) => (
            <div className="card card-pad center stack" key={value}>
              <strong className="font-display" style={{ fontSize: 42 }}>{value}</strong>
              <span className="muted">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
