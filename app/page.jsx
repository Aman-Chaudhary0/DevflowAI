import Link from "next/link";
import {
  ArrowRight, Bot, Check, Code2, FileText, GitBranch, GitPullRequest,
  Layers3, ListChecks, Rocket, ShieldCheck, Sparkles, Workflow
} from "lucide-react";
import { FeatureGrid, PricingCards } from "@/components/ui-blocks";

const workflow = [
  { number: "01", icon: Layers3, title: "Bring your work together", copy: "Keep projects, tasks, docs, and team context in one workspace." },
  { number: "02", icon: Sparkles, title: "Move forward with AI", copy: "Use project context to plan work, review code, and create documentation." },
  { number: "03", icon: Rocket, title: "Ship with confidence", copy: "Follow tasks, deployments, and activity through the full delivery cycle." }
];

function WorkspacePreview() {
  return (
    <div className="home-preview-wrap" aria-label="Illustration of the Devflow AI workspace">
      <div className="home-preview-glow" />
      <div className="home-preview-window">
        <div className="home-preview-topbar">
          <div className="home-window-dots"><i /><i /><i /></div>
          <span>Devflow workspace</span>
          <span className="home-preview-live"><i /> Workspace</span>
        </div>
        <div className="home-preview-content">
          <aside className="home-preview-sidebar">
            <div className="home-preview-brand"><span><Workflow size={15} /></span> Devflow</div>
            <small>WORKSPACE</small>
            <div className="home-preview-side-item active"><Layers3 size={14} /> Overview</div>
            <div className="home-preview-side-item"><ListChecks size={14} /> My tasks</div>
            <div className="home-preview-side-item"><GitBranch size={14} /> Repositories</div>
            <div className="home-preview-side-item"><Bot size={14} /> AI tools</div>
            <div className="home-preview-side-project"><span /> Product platform</div>
            <div className="home-preview-side-project"><span /> API service</div>
          </aside>
          <div className="home-preview-main">
            <div className="home-preview-heading"><div><span>MONDAY, YOUR WORKSPACE</span><strong>Build in flow.</strong></div><button type="button"><Sparkles size={13} /> Ask AI</button></div>
            <div className="home-preview-stat-row">
              <div><span>Open tasks</span><strong>12</strong><small><i className="home-stat-dot amber" /> Across your projects</small></div>
              <div><span>In progress</span><strong>04</strong><small><i className="home-stat-dot blue" /> Moving forward</small></div>
              <div><span>Deployments</span><strong>08</strong><small><i className="home-stat-dot green" /> This workspace</small></div>
            </div>
            <div className="home-preview-lower">
              <div className="home-preview-task-card">
                <div className="home-preview-card-heading"><strong>Current focus</strong><span>View tasks <ArrowRight size={12} /></span></div>
                <div className="home-preview-task"><i className="task-check"><Check size={10} /></i><span>Review authentication flow</span><em>IN REVIEW</em></div>
                <div className="home-preview-task"><i /><span>Update API documentation</span><em className="task-progress">IN PROGRESS</em></div>
                <div className="home-preview-task"><i /><span>Prepare release checklist</span><em className="task-backlog">TO DO</em></div>
              </div>
              <div className="home-preview-ai-card"><span className="home-ai-icon"><Sparkles size={14} /></span><div><strong>AI project assistant</strong><p>Ask about your project, code, or next steps.</p></div><ArrowRight size={14} /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="home-preview-float"><span><GitPullRequest size={15} /></span><div><strong>Code review ready</strong><small>Context attached</small></div><Check size={15} /></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero container">
        <div className="home-hero-copy">
          <span className="home-kicker"><span><Sparkles size={13} /></span> The workspace for software teams</span>
          <h1>From first task<br />to <span>final deploy.</span></h1>
          <p>Plan projects, build with AI, review code, and track delivery in one connected workspace. Give your team the context to keep moving.</p>
          <div className="home-hero-actions">
            <Link className="btn btn-primary" href="/register">Create your workspace <ArrowRight size={17} /></Link>
            <Link className="home-secondary-link" href="/features">Explore features <ArrowRight size={15} /></Link>
          </div>
          <div className="home-hero-note"><ShieldCheck size={15} /> Projects, code, and team activity in one place</div>
        </div>
        <WorkspacePreview />
      </section>

      <section className="home-capabilities">
        <div className="container home-capability-row">
          <span>ONE CONNECTED WORKSPACE</span>
          <div><Layers3 size={16} /> Project planning</div><i />
          <div><Code2 size={16} /> AI development</div><i />
          <div><GitBranch size={16} /> GitHub workflow</div><i />
          <div><FileText size={16} /> Living documentation</div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container stack-lg">
          <div className="home-section-heading">
            <div><span className="eyebrow">A better way to build</span><h2 className="h2">Less tool switching.<br /><span>More forward motion.</span></h2></div>
            <p>Bring the work and the context together, so every teammate can see what matters and what comes next.</p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <section className="home-ai-section">
        <div className="container home-ai-layout">
          <div className="home-ai-visual">
            <div className="home-ai-window">
              <div className="home-ai-window-top"><span><Bot size={15} /> Devflow AI</span><small>Project context on</small></div>
              <div className="home-ai-message user">What should I review before merging the auth changes?</div>
              <div className="home-ai-answer"><div className="home-ai-answer-icon"><Sparkles size={15} /></div><div><strong>Here’s what to check</strong><p>Review token refresh behavior, confirm the session expiry path, and run the auth integration tests.</p><div className="home-ai-source"><FileText size={12} /> Based on your project docs and tasks</div></div></div>
              <div className="home-ai-input">Ask about your project... <span><ArrowRight size={14} /></span></div>
            </div>
          </div>
          <div className="home-ai-copy"><span className="eyebrow">AI with your context</span><h2 className="h2">Useful answers start with the work you’ve already done.</h2><p>Connect project details to AI workflows for code reviews, bug fixes, documentation, SQL, and implementation planning.</p><ul><li><Check size={16} /> Keep project context close to every prompt</li><li><Check size={16} /> Move from a suggestion to an actionable task</li><li><Check size={16} /> Use the AI tools that fit your workflow</li></ul><Link href="/dashboard/ai" className="home-secondary-link">Explore AI tools <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container stack-lg">
          <div className="home-process-heading"><span className="eyebrow">A clear path through the work</span><h2 className="h2">Keep every step connected.</h2></div>
          <div className="home-process-grid">
            {workflow.map(({ number, icon: Icon, title, copy }) => <article className="home-process-card" key={number}><span className="home-process-number">{number}</span><div className="home-process-icon"><Icon size={20} /></div><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section-tight home-pricing-section">
        <div className="container stack-lg">
          <div className="home-process-heading"><span className="eyebrow">Plans that grow with your team</span><h2 className="h2">Start with what you need.</h2><p>Explore the plans and choose the workspace that fits your team.</p></div>
          <PricingCards compact />
        </div>
      </section>

      <section className="home-final-cta">
        <div className="container home-final-cta-inner"><div><span className="eyebrow">Your next release starts here</span><h2>Bring the work into focus.</h2><p>Set up your workspace and give your team a clearer path from idea to delivery.</p></div><Link className="btn btn-primary" href="/register">Get started <ArrowRight size={17} /></Link></div>
      </section>
    </div>
  );
}
