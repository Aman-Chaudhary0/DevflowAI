import { stats } from "@/lib/data";
import { PageHero } from "@/components/ui-blocks";

const timeline = ["Started as an AI code review lab", "Added project dashboards and docs", "Launched team workspaces", "Opened developer platform"];
const values = ["Clarity", "Momentum", "Trust", "Craft"];
const stack = ["Next.js", "TypeScript", "Tailwind", "Radix UI", "Framer Motion", "Recharts", "Monaco", "Zod"];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title="We help builders keep their best work in motion." description="Devflow AI exists to make software delivery feel focused, transparent, and deeply assisted without removing human judgment." />
      <section className="section-tight">
        <div className="container grid grid-2">
          <div className="stack-lg"><h2 className="h2">Company story</h2>{timeline.map((item) => <div className="card card-pad" key={item}>{item}</div>)}</div>
          <div className="stack-lg"><h2 className="h2">Vision, mission, values</h2><p className="lead">A developer workspace should reduce cognitive load, surface the right context, and protect the decision points that matter.</p><div className="grid grid-2">{values.map((value) => <div className="card card-pad h3" key={value}>{value}</div>)}</div></div>
        </div>
      </section>
      <section className="section"><div className="container stack-lg"><h2 className="h2">Technology stack</h2><div className="grid grid-4">{stack.map((item) => <div className="card card-pad center" key={item}>{item}</div>)}</div></div></section>
      <section className="section-tight"><div className="container grid grid-4">{stats.map((stat) => <div className="card card-pad stack" key={stat.label}><strong className="font-display" style={{ fontSize: 40 }}>{stat.value}</strong><span className="muted">{stat.label}</span></div>)}</div></section>
      <section className="section-tight"><div className="container grid grid-3">{["Maya Chen", "Owen Lee", "Iris Patel"].map((name) => <article className="card card-pad stack center" key={name}><div className="logo-mark" style={{ width: 72, height: 72 }}>{name[0]}</div><h3 className="h3">{name}</h3><p className="muted">Product engineering leader</p></article>)}</div></section>
    </>
  );
}
