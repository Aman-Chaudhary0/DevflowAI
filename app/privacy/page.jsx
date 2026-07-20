import { PageHero } from "@/components/ui-blocks";

const sections = ["Introduction", "Data", "Cookies", "Security", "Rights", "Contact"];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Privacy" title="Privacy Policy" description="A simple, readable policy layout for Devflow AI public pages." />
      <section className="section-tight">
        <div className="container doc-layout">
          <aside className="toc card card-pad stack">
            {sections.map((section) => <a className="muted" href={`#${section.toLowerCase()}`} key={section}>{section}</a>)}
          </aside>
          <article className="article stack-lg">
            {sections.map((section) => (
              <section id={section.toLowerCase()} key={section}>
                <h2>{section}</h2>
                <p>Devflow AI uses only the information needed to provide workspace functionality, support, security, and product improvement. Replace this placeholder with final legal copy before production.</p>
              </section>
            ))}
            <a className="btn btn-primary" href="#top">Back to top</a>
          </article>
          <aside className="toc card card-pad"><p className="muted">Last updated July 20, 2026</p></aside>
        </div>
      </section>
    </>
  );
}
