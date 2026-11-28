import Link from "next/link";
import {
  ArrowRight, Bot, Check, Code2, Compass, FileText, GitPullRequest,
  Layers3, ListChecks, ShieldCheck, Sparkles
} from "lucide-react";
import { PageHero } from "@/components/ui-blocks";

const principles = [
  { icon: Compass, title: "Make the work clear", body: "Good delivery starts with a shared view of the goal, the next step, and who owns it." },
  { icon: Layers3, title: "Keep context connected", body: "Plans, tasks, code, and documentation are more useful when they can inform one another." },
  { icon: Bot, title: "Put AI to practical work", body: "Use AI to help plan, review, debug, and document while people stay in control of decisions." },
  { icon: ShieldCheck, title: "Ship with confidence", body: "Make progress and delivery visible, so teams can catch risks and act with confidence." }
];

const workAreas = [
  { icon: ListChecks, label: "Plan", detail: "Organize projects, tasks, and team work." },
  { icon: Code2, label: "Build", detail: "Use AI tools alongside your development workflow." },
  { icon: GitPullRequest, label: "Review", detail: "Bring code changes and project context together." },
  { icon: FileText, label: "Document", detail: "Keep useful technical knowledge close to the work." }
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <PageHero
        eyebrow="About Devflow AI"
        title="Software delivery works better when the context stays connected."
        description="Devflow AI brings project planning, development tools, collaboration, and AI assistance into one workspace, helping teams move from an idea to a shipped product with less friction."
      >
        <div className="about-hero-actions">
          <Link className="btn btn-primary" href="/register">Create a workspace <ArrowRight size={16} /></Link>
          <Link className="about-text-link" href="/features">Explore the product <ArrowRight size={15} /></Link>
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container about-mission">
          <div className="about-mission-label"><span><Sparkles size={16} /></span><div><small>OUR PURPOSE</small><strong>Make building feel connected.</strong></div></div>
          <div className="about-mission-copy"><h2>Less time looking for context. More time making progress.</h2><p>Software work crosses planning, code, reviews, documentation, and delivery. Devflow AI gives teams a shared place to connect those steps and use AI where it can help.</p></div>
        </div>
      </section>

      <section className="section about-work-section">
        <div className="container stack-lg">
          <div className="about-section-heading"><span className="eyebrow">One connected workflow</span><h2 className="h2">The pieces of delivery,<br />working together.</h2><p>Move between the work areas your team uses every day without losing the thread.</p></div>
          <div className="about-work-grid">
            {workAreas.map(({ icon: Icon, label, detail }, index) => <article className="about-work-card" key={label}><span className="about-work-step">0{index + 1}</span><div className="about-work-icon"><Icon size={19} /></div><h3>{label}</h3><p>{detail}</p>{index < workAreas.length - 1 && <ArrowRight className="about-work-arrow" size={16} />}</article>)}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container stack-lg">
          <div className="about-section-heading"><span className="eyebrow">What guides the product</span><h2 className="h2">Built around how teams work.</h2><p>Useful tools should make the work easier to understand and easier to move forward.</p></div>
          <div className="about-principles-grid">
            {principles.map(({ icon: Icon, title, body }) => <article className="about-principle-card" key={title}><div className="about-principle-icon"><Icon size={19} /></div><h3>{title}</h3><p>{body}</p><span><Check size={14} /> A product principle</span></article>)}
          </div>
        </div>
      </section>

      <section className="about-bottom-cta">
        <div className="container about-bottom-cta-inner"><div><span className="eyebrow">Build with a clearer view</span><h2>Bring your workflow into focus.</h2><p>Explore the tools that connect your team’s projects, code, and delivery.</p></div><Link className="btn btn-primary" href="/register">Get started <ArrowRight size={16} /></Link></div>
      </section>
    </div>
  );
}
