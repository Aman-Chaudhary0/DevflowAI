import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { CodeBlock, SearchBar } from "@/components/ui-blocks";

const nav = ["Getting Started", "AI Chat", "Projects", "Analytics", "API Reference", "Deployment"];

// DocsPage is a page component that renders the "Documentation" page of the application, providing a search bar, navigation links, and sections for different documentation topics. It includes a table of contents, code blocks, and navigation buttons for moving between sections.
export default function DocsPage() {
  return (
    <section className="section-tight">
      <div className="container stack-lg">
        <SearchBar placeholder="Search documentation" />
        <div className="doc-layout">
          <aside className="toc card card-pad stack">
            <strong>Navigation</strong>
            {nav.map((item) => (
              <a className="muted" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>
            ))}
          </aside>

      
          <article className="article stack-lg">
            <h1 className="h1">Documentation</h1>
            <p>Use Devflow AI to manage projects, ask AI for implementation support, review code, and track deployments from a single workspace.</p>
            {nav.slice(0, 4).map((item) => (
              <section className="stack" id={item.toLowerCase().replaceAll(" ", "-")} key={item}>
                <h2>{item}</h2>
                <p>Configure the workspace, choose the right project, and keep AI responses grounded in visible context.</p>
                <CodeBlock />
              </section>
            ))}
            <div className="row between wrap" style={{ gap: 12 }}>
              <button className="btn btn-outline" type="button"><ChevronLeft size={18} /> Previous</button>
              <button className="btn btn-primary" type="button">Next <ChevronRight size={18} /></button>
            </div>
          </article>


          <aside className="toc card card-pad stack">
            <strong>On this page</strong>
            <span className="muted">Getting Started</span>
            <span className="muted">AI Chat</span>
            <button className="btn btn-secondary" type="button"><Copy size={16} /> Copy page</button>
            <button className="btn btn-outline" type="button">Send Feedback</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
