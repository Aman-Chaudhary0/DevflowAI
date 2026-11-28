import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { posts } from "@/lib/data";

const articleSections = {
  "ai-workspaces": [
    { title: "Make context visible", body: "AI recommendations are easier to evaluate when people can see which project details informed them. Connect answers to the tasks, documentation, and code that shaped the response." },
    { title: "Keep people in control", body: "Give developers clear ways to inspect, edit, retry, or reject generated work. AI should help move a decision forward without hiding the decision itself." },
    { title: "Design useful review loops", body: "Treat generation as part of an iterative workflow. Let people compare changes, ask follow-up questions, and carry useful output into the tools where work gets done." },
    { title: "Connect assistance to delivery", body: "The most useful AI experience helps teams move from an idea to a concrete next step, while preserving the context and review points needed to ship responsibly." }
  ],
  "kanban-automation": [
    { title: "Start with a visible rule", body: "Automation works best when the team can see what triggers it, which work it affects, and what it will do next. Start with one repeatable handoff and make the rule easy to inspect." },
    { title: "Keep people in the loop", body: "Let automation handle routine updates while people retain clear review points for decisions that change scope, quality, or delivery risk." },
    { title: "Make outcomes easy to follow", body: "Record what ran and what changed. A useful delivery loop leaves a clear trail that teammates can understand and correct." }
  ],
  "clean-dashboards": [
    { title: "Give the important work room", body: "A dashboard should make current priorities easy to scan. Put the measures that guide action first, then make supporting detail available without crowding the main view." },
    { title: "Use consistent visual rules", body: "Keep labels, status colors, spacing, and time ranges consistent. Familiar patterns help people compare information without relearning the interface." },
    { title: "Design for the next decision", body: "A good metric answers a question and points toward a useful next step. Avoid filling the page with numbers that have no clear owner or action." }
  ],
  "secure-ai": [
    { title: "Scope context deliberately", body: "AI features should use only the project information needed for the task. Make the source and boundaries of that context understandable to the people using the tool." },
    { title: "Preserve review and control", body: "Suggestions should remain suggestions until a person accepts them. Show what the system produced and give users clear ways to edit, reject, or retry." },
    { title: "Make important actions visible", body: "Keep a useful record of AI-assisted changes and the decisions around them. Visibility supports debugging, review, and trust across the team." }
  ]
};

const categoryIcons = { Workflow, Design: FileText, Security: ShieldCheck, AI: Sparkles };

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);
  return post ? { title: `${post.title} | Devflow AI`, description: post.excerpt } : {};
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = posts.find((entry) => entry.slug === slug);
  if (!post) notFound();

  const Icon = categoryIcons[post.category] || FileText;
  const sections = articleSections[post.slug] || [];

  return (
    <article className="blog-detail-page">
      <header className="blog-detail-hero"><div className="container"><Link className="blog-back-link" href="/blog"><ArrowLeft size={14} /> Back to journal</Link><span className="badge">{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><div className="blog-article-meta"><span>Devflow AI</span><i /><span>{post.date}</span><i /><span>{post.read} read</span></div></div></header>
      <div className="blog-detail-art"><span><Icon size={36} /></span><div><small>DEVFLOW JOURNAL</small><strong>{post.category}</strong></div></div>
      <div className="container blog-detail-layout">
        <aside className="blog-detail-toc"><strong>In this article</strong>{sections.map((section, index) => <a href={`#section-${index + 1}`} key={section.title}>{section.title}</a>)}</aside>
        <div className="blog-detail-content"><p className="blog-detail-intro">{post.excerpt} This article looks at a few practical ways to make that work clearer and easier for a team to improve.</p>{sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title}><span className="blog-detail-section-number">0{index + 1}</span><h2>{section.title}</h2><p>{section.body}</p></section>)}<div className="blog-detail-takeaway"><Check size={18} /><p>Keep the workflow visible, make the next action clear, and leave room for people to use their judgment.</p></div><Link className="blog-next-link" href="/blog">More from the journal <ArrowRight size={15} /></Link></div>
      </div>
    </article>
  );
}
