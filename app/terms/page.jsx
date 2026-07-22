import { PageHero } from "@/components/ui-blocks";

const sections = ["Acceptance", "License", "Restrictions", "Payments", "Subscriptions", "Termination", "Liability", "Contact"];

// TermsPage is a page component that renders the "Terms & Conditions" page of the application, providing information on legal terms, licensing, restrictions, payments, subscriptions, termination, liability, and contact information. It includes a hero section, a table of contents for easy navigation, and detailed sections for each legal topic.
export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms"
        title="Terms & Conditions"
        description="A clean legal page layout with sticky navigation, readable sections, and clear structure."
      />

      <section className="section-tight">
        <div className="container doc-layout">
          <aside className="toc card card-pad stack">
            {sections.map((section) => (
              <a className="muted" href={`#${section.toLowerCase()}`} key={section}>{section}</a>
            ))}
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

          <aside className="toc card card-pad">
            <p className="muted">Legal content placeholder</p>
          </aside>
        </div>
      </section>
    </>
  );
}
