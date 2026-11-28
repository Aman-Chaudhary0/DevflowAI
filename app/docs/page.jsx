"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, Copy, ExternalLink, Search } from "lucide-react";
import { toast } from "@/components/dashboard-ui";

const sections = [
  {
    id: "getting-started", title: "Getting Started", summary: "Set up your account and create your first workspace project.",
    body: <>Create an account, then open <Link href="/dashboard/projects">Projects</Link> and choose <Link href="/dashboard/projects/create">Create project</Link>. Add a name and description so your team has a shared starting point. From the project, you can organize tasks, keep documentation, connect a repository, and review activity.</>,
    steps: ["Create your account and sign in.", "Create a project for the product or initiative you are working on.", "Add tasks and invite collaborators from the project workspace."]
  },
  {
    id: "projects", title: "Projects and Tasks", summary: "Organize delivery work and keep project details together.",
    body: <>Projects bring related tasks, files, documentation, team members, and activity together. Use the <Link href="/dashboard/tasks">Tasks board</Link> to follow work by status and priority. Project pages also include their own task, files, docs, analytics, activity, and team views.</>,
    steps: ["Create a project or open one from the project list.", "Break work into tasks and set clear status and priority.", "Use project tabs to find its docs, files, team, and activity."]
  },
  {
    id: "ai-chat", title: "AI Chat and Tools", summary: "Ask questions and use AI tools for common development tasks.",
    body: <>Open <Link href="/dashboard/ai">AI Tools</Link> to choose a workflow, or start a conversation in <Link href="/dashboard/ai/chat">AI Chat</Link>. Available tools include code generation and review, documentation, SQL, backend generation, and bug fixing. Select a project when you want to provide project context, and review generated output before using it.</>,
    steps: ["Choose a tool that matches the task.", "Select a project or provide the source material the tool requests.", "Review the output and apply changes in your development workflow."]
  },
  {
    id: "code-and-github", title: "Code and GitHub", summary: "Connect repositories and follow code changes from the workspace.",
    body: <>Connect GitHub from <Link href="/dashboard/github">GitHub</Link>, then browse repositories, branches, commits, issues, pull requests, and releases. Repository access depends on the GitHub account permissions you grant during connection.</>,
    steps: ["Open GitHub and connect your account.", "Choose a repository to view its available code activity.", "Use code review and AI tools when you need help understanding a change."]
  },
  {
    id: "analytics", title: "Analytics", summary: "Review project and workspace activity in one place.",
    body: <>Open <Link href="/dashboard/analytics">Analytics</Link> for workspace-level summaries. Project analytics are available from each project. The information shown depends on the data and activity recorded in your workspace.</>,
    steps: ["Open workspace analytics from the dashboard navigation.", "Choose a project to review project-level activity.", "Use the summaries to spot changes and decide what needs attention."]
  },
  {
    id: "api-and-webhooks", title: "API Keys and Webhooks", summary: "Manage developer credentials and integration event destinations.",
    body: <>Manage API credentials from <Link href="/dashboard/developer/api-keys">Developer API Keys</Link> and configure event destinations from <Link href="/dashboard/developer/webhooks">Webhooks</Link>. Treat API keys as secrets: store them securely and revoke any key that is no longer needed.</>,
    steps: ["Create and label a key for its intended integration.", "Store the key in a secure environment variable or secret manager.", "Configure webhook destinations and verify their delivery from the developer settings."]
  },
  {
    id: "deployments", title: "Deployments", summary: "Create and track deployments for connected projects.",
    body: <>Open <Link href="/dashboard/deployments">Deployments</Link> to review workspace deployments or start a deployment from <Link href="/dashboard/deployments/create">Create Deployment</Link>. Domains can be managed from the deployments area. Available deployment options depend on your project configuration and integrations.</>,
    steps: ["Connect or select the project to deploy.", "Review the deployment configuration before starting.", "Follow deployment status and configure domains from the deployments area."]
  }
];

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);
  const filteredSections = useMemo(() => {
    const term = query.trim().toLowerCase();
    return sections.filter((section) => !term || `${section.title} ${section.summary}`.toLowerCase().includes(term));
  }, [query]);

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(articleRef.current?.innerText || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Could not copy the documentation. Check your browser clipboard permissions.", "error");
    }
  };

  const navigateSection = (currentId, direction) => {
    const index = filteredSections.findIndex((section) => section.id === currentId);
    const target = filteredSections[index + direction];
    if (!target) return;
    document.getElementById(target.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="section-tight docs-page">
      <div className="container">
        <header className="docs-heading"><span className="eyebrow"><BookOpen size={14} /> Documentation</span><h1>Build with Devflow AI.</h1><p>Guides to projects, AI tools, integrations, and delivery workflows.</p></header>
        <label className="docs-search"><Search size={17} /><input aria-label="Search documentation" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documentation..." />{query && <button type="button" onClick={() => setQuery("")}>Clear</button>}<kbd>/</kbd></label>

        <div className="docs-layout">
          <aside className="docs-sidebar"><strong>Documentation</strong>{filteredSections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<span className="docs-sidebar-divider" /><Link href="/contact">Need help? Contact us <ExternalLink size={12} /></Link></aside>

          <article className="docs-article" ref={articleRef}>
            <div className="docs-article-top"><div><span className="eyebrow">GUIDES</span><h2>Documentation</h2></div><button className="btn btn-outline docs-copy-button" type="button" onClick={copyPage}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy page"}</button></div>
            <p className="docs-intro">Find your way around the workspace, connect your tools, and keep development work moving with Devflow AI.</p>
            {filteredSections.length ? filteredSections.map((section, index) => (
              <section className="docs-section" id={section.id} key={section.id}>
                <span className="docs-section-index">GUIDE {String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3><p>{section.summary}</p><div className="docs-section-body">{section.body}</div>
                <ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <div className="docs-section-nav"><button className="btn btn-outline" type="button" onClick={() => navigateSection(section.id, -1)} disabled={index === 0}><ArrowLeft size={14} /> Previous</button><button className="btn btn-outline" type="button" onClick={() => navigateSection(section.id, 1)} disabled={index === filteredSections.length - 1}>Next <ArrowRight size={14} /></button></div>
              </section>
            )) : <div className="docs-no-results"><h3>No matching guides</h3><p>Try a different search term.</p></div>}
          </article>

        </div>
      </div>
    </section>
  );
}
