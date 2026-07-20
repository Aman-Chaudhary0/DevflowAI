import Link from "next/link";
import { Share2 } from "lucide-react";
import { CodeBlock, Rating } from "@/components/ui-blocks";

export default function BlogDetailPage() {
  return (
    <>
      <section className="section-tight">
        <div className="container stack-lg">
          <div className="terminal" style={{ minHeight: 360 }}>AI workspace hero image</div>
          <div className="row between wrap" style={{ gap: 16 }}>
            <div className="stack">
              <span className="badge">AI / 7 min read / Jul 18, 2026</span>
              <h1 className="h1">Designing AI workspaces developers actually trust</h1>
              <p className="lead">Context, control, and visibility matter more than novelty when AI becomes part of the delivery loop.</p>
            </div>
            <button className="icon-btn" aria-label="Share article" type="button"><Share2 size={18} /></button>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container doc-layout">
          <aside className="toc card card-pad stack">
            <strong>Table of contents</strong>
            {["Principles", "Context", "Review loops", "Shipping"].map((item) => (
              <a className="muted" href={`#${item.toLowerCase().replace(" ", "-")}`} key={item}>{item}</a>
            ))}
          </aside>
          <article className="article stack-lg">
            <h2 id="principles">Principles</h2>
            <p>The best AI workspaces make the system state inspectable. Developers should see what the AI knows, what it changed, and where human review still matters.</p>
            <h2 id="context">Context</h2>
            <p>Project context should include tasks, docs, branches, deployments, and user intent. Without that context, AI is only a text box.</p>
            <CodeBlock />
            <h2 id="review-loops">Review loops</h2>
            <p>Regenerate, stop, copy, compare, and cite actions turn AI output into a controllable workflow.</p>
            <h2 id="shipping">Shipping</h2>
            <p>Great interfaces compress the path from idea to deployment while preserving the moments where teams need judgment.</p>
          </article>
          <aside className="toc card card-pad stack">
            <strong>Related Articles</strong>
            <Link className="muted" href="/blog">Kanban automation</Link>
            <Link className="muted" href="/blog">Secure AI features</Link>
            <Rating />
          </aside>
        </div>
      </section>

      <section className="section-tight">
        <div className="container card card-pad stack">
          <h2 className="h2">Comments</h2>
          <textarea className="textarea" placeholder="Add a thoughtful comment" />
          <button className="btn btn-primary" type="button">Post Comment</button>
        </div>
      </section>
    </>
  );
}
