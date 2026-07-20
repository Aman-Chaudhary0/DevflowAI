import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container hero-grid" style={{ minHeight: "calc(100vh - 72px)" }}>
      <div className="stack-lg">
        <span className="eyebrow">404</span>
        <h1 className="h1">Page Not Found</h1>
        <p className="lead">This route slipped outside the workspace. The good news: the dashboard, docs, and launch paths are still nearby.</p>
        <div className="row wrap" style={{ gap: 12 }}>
          <Link className="btn btn-primary" href="/"><Home size={18} /> Back Home</Link>
          <Link className="btn btn-outline" href="/docs"><Search size={18} /> Search Docs</Link>
        </div>
        <div className="card card-pad font-code">"It compiled on my machine, then wandered into production."</div>
      </div>
      <div className="dashboard-mock floating">
        <div className="logo-mark" style={{ width: 128, height: 128, margin: "24px auto" }}>404</div>
        <div className="terminal">route.inspect("/missing")<br />status: not_found<br />suggestion: return home</div>
        <div className="grid grid-2">
          <Link className="card card-pad" href="/features">Features</Link>
          <Link className="card card-pad" href="/pricing">Pricing</Link>
        </div>
      </div>
    </section>
  );
}
