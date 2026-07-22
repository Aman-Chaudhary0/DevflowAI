import { Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHero } from "@/components/ui-blocks";

const channels = [
  { label: "Office", value: "San Francisco and remote", Icon: MapPin },
  { label: "Email", value: "hello@devflow.ai", Icon: Mail },
  { label: "Phone", value: "+1 415 555 0138", Icon: Phone }
];

const formFields = ["Name", "Email", "Company", "Subject"];

const supportChannels = ["Sales", "Support", "Security"];

// ContactPage is a page component that renders the "Contact" page of the application, providing information on how to get in touch with the team, including office location, email, phone number, and a contact form for inquiries.
export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the team building Devflow AI."
        description="Questions about product, enterprise rollout, security, partnerships, or feedback all land here."
      />

      <section className="section-tight">
        <div className="container grid grid-2">
          <div className="stack-lg">
            {channels.map(({ label, value, Icon }) => (
              <div className="card card-pad row" key={label} style={{ gap: 14 }}>
                <span className="logo-mark"><Icon size={19} /></span>
                <div>
                  <strong>{label}</strong>
                  <p className="muted">{value}</p>
                </div>
              </div>
            ))}
            <div className="terminal" style={{ minHeight: 220 }}>Map preview / global team coverage</div>
          </div>

          <form className="card card-pad stack-lg">
            {formFields.map((field) => (
              <label className="form-field" key={field}>
                <span>{field}</span>
                <input className="input" placeholder={field} />
              </label>
            ))}
            <label className="form-field">
              <span>Message</span>
              <textarea className="textarea" placeholder="Tell us what you are building" />
            </label>
            <button className="btn btn-primary" type="button"><Send size={18} /> Send Message</button>
          </form>
        </div>
      </section>

      <section className="section-tight">
        <div className="container grid grid-3">
          {supportChannels.map((item) => (
            <div className="card card-pad stack" key={item}>
              <h3 className="h3">{item}</h3>
              <p className="muted">We route every message to the right specialist and follow up clearly.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
