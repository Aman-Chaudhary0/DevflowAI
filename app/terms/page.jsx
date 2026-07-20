import { PageHero } from "@/components/ui-blocks";

const sections = ["Acceptance", "License", "Restrictions", "Payments", "Subscriptions", "Termination", "Liability", "Contact"];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Terms" title="Terms & Conditions" description="A clean legal page layout with sticky navigation, readable sections, and clear structure." />
      <section className="section-tight">
        <div className="container doc-layout">
          <aside className="toc card card-pad stack">
            {sections.map((section) => <a className="muted" href={`#${section.toLowerCase()}`} key={section}>{section}</a>)}
          </aside>
          <article className="article stack-lg">
            {sections.map((section) => (
              <section id={section.toLowerCase()} key={section}>
                <h2>{section}</h2>
                <p>These terms define access, acceptable use, billing, subscriptions, termination, liability, and contact paths. Replace this placeholder copy with reviewed legal language before production.</p>
              </section>
            ))}
            <a className="btn btn-primary" href="#top">Back to top</a>
          </article>
          <aside className="toc card card-pad"><p className="muted">Legal content placeholder</p></aside>
        </div>
      </section>
    </>
  );
}
