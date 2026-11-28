"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BookOpen, Bot, Code2, FileText, GitBranch,
  Layers3, ListChecks, LockKeyhole, Rocket, Search, Users, Workflow
} from "lucide-react";

const features = [
  { category: "AI", title: "AI tools for the work at hand", description: "Use chat, code review, bug fixing, SQL, documentation, and code generation workflows from one place.", href: "/dashboard/ai", icon: Bot, label: "Explore AI tools" },
  { category: "Planning", title: "Projects and task tracking", description: "Organize work by project, follow task status, and keep ownership and priorities visible.", href: "/dashboard/projects", icon: ListChecks, label: "Explore projects" },
  { category: "Code", title: "A workspace for code", description: "Use the in-app editor, playground, and snippets to keep development work and useful code close.", href: "/dashboard/editor", icon: Code2, label: "Open the editor" },
  { category: "Integrations", title: "GitHub activity in context", description: "Connect repositories and follow branches, commits, issues, pull requests, and releases.", href: "/dashboard/github", icon: GitBranch, label: "Explore GitHub" },
  { category: "Delivery", title: "Deployments and domains", description: "Create deployments, track their status, and manage project domains from the dashboard.", href: "/dashboard/deployments", icon: Rocket, label: "Explore deployments" },
  { category: "Insights", title: "Workspace analytics", description: "Review activity and project summaries to understand what is moving and where attention is needed.", href: "/dashboard/analytics", icon: BarChart3, label: "View analytics" },
  { category: "Planning", title: "Team collaboration", description: "Keep members, project work, calendar activity, and team updates connected.", href: "/dashboard/team", icon: Users, label: "Explore team tools" },
  { category: "Delivery", title: "Repeatable workflows", description: "Create workflows that connect triggers and actions across your workspace.", href: "/dashboard/workflows", icon: Workflow, label: "Explore workflows" },
  { category: "Integrations", title: "Developer access and webhooks", description: "Manage API keys and configure webhook integrations for your developer workflows.", href: "/dashboard/developer/api-keys", icon: LockKeyhole, label: "Open developer settings" },
  { category: "Planning", title: "Project docs and files", description: "Keep project documentation and shared files accessible alongside the work they support.", href: "/dashboard/files", icon: FileText, label: "Explore files" }
];

const categories = ["All features", ...new Set(features.map((feature) => feature.category))];

export default function FeaturesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All features");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return features.filter((feature) => {
      const matchesCategory = category === "All features" || feature.category === category;
      const matchesQuery = !term || `${feature.title} ${feature.description} ${feature.category}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="features-page">
      <section className="features-hero"><div className="container"><span className="eyebrow"><Layers3 size={14} /> The Devflow workspace</span><h1>Tools that keep<br /><span>the work connected.</span></h1><p>Plan projects, build with AI, collaborate around code, and follow delivery in one workspace.</p><div className="features-hero-actions"><Link className="btn btn-primary" href="/register">Create your workspace <ArrowRight size={16} /></Link><Link className="features-about-link" href="/about">Why Devflow AI <ArrowRight size={14} /></Link></div></div></section>

      <section className="section-tight features-list-section"><div className="container">
        <div className="features-controls"><label className="features-search"><Search size={16} /><input aria-label="Search features" placeholder="Search features..." value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery("")}>Clear</button>}</label><span>{results.length} {results.length === 1 ? "feature" : "features"}</span></div>
        <div className="features-filters" role="group" aria-label="Filter features by category">{categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {results.length ? <div className="features-catalog">{results.map(({ category: label, title, description, href, icon: Icon, label: action }) => <Link className="features-catalog-card" href={href} key={title}><span className="features-card-category">{label}</span><span className="features-card-icon"><Icon size={20} /></span><h2>{title}</h2><p>{description}</p><span className="features-card-action">{action}<ArrowRight size={14} /></span></Link>)}</div> : <div className="features-no-results"><span><Search size={19} /></span><h2>No matching features</h2><p>Try another keyword or category.</p><button type="button" className="btn btn-outline" onClick={() => { setQuery(""); setCategory("All features"); }}>Clear filters</button></div>}
      </div></section>

      <section className="features-context-section"><div className="container"><div className="features-context-card"><div className="features-context-symbol"><BookOpen size={22} /></div><div><span className="eyebrow">One shared context</span><h2>Keep the details close to the work.</h2><p>Projects, tasks, docs, code activity, and AI tools are easier to use when they live in the same workflow.</p></div><Link className="btn btn-outline" href="/docs">Read the docs <ArrowRight size={15} /></Link></div></div></section>
    </div>
  );
}
