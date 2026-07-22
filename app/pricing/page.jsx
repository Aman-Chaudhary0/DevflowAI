import { BarChart3, Check } from "lucide-react";
import { PageHero, PricingCards } from "@/components/ui-blocks";

const rows = ["Projects", "AI reviews", "Analytics", "Team roles", "SSO"];
const plans = ["Free", "Pro", "Team", "Enterprise"];

// PricingPage is a page component that renders the "Pricing" page of the application, providing information on different subscription plans, their features, and a comparison table. It includes a hero section with a toggle for monthly and yearly billing, pricing cards for each plan, a feature comparison table, and a call-to-action for custom enterprise plans.
export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Flexible plans for AI-powered teams."
        description="Choose a plan that fits your current workflow, then scale into team controls, analytics, and enterprise security."
      >
        <div className="row card card-pad" style={{ gap: 8, padding: 8 }}>
          <button className="btn btn-primary" type="button">Monthly</button>
          <button className="btn btn-ghost" type="button">Yearly</button>
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container">
          <PricingCards />
        </div>
      </section>

      <section className="section">
        <div className="container stack-lg">
          <h2 className="h2">Compare features</h2>
          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {plans.map((plan) => <th key={plan}>{plan}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <td>{row}</td>
                    {plans.map((plan) => (
                      <td key={plan}><Check size={18} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container card card-pad row between wrap" style={{ gap: 24 }}>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="h2">Need a custom plan?</h2>
            <p className="muted">Enterprise teams can align security, retention, and success workflows.</p>
          </div>
          <button className="btn btn-primary" type="button">
            <BarChart3 size={18} /> Contact Sales
          </button>
        </div>
      </section>
    </>
  );
}
