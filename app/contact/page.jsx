import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/ui-blocks";
import ContactForm from "@/components/contact-form";

const supportChannels = ["Sales", "Support", "Security"];

// ContactPage is a page component that renders the "Contact" page of the application, providing information on how to get in touch with the team, including office location, email, phone number, and a contact form for inquiries.
export default function ContactPage() {
  const email = process.env.EMAIL || "";
  const channels = [
    { label: "Office", value: "San Francisco and remote", Icon: MapPin },
    ...(email ? [{ label: "Email", value: email, Icon: Mail, href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent("Devflow AI inquiry")}` }] : []),
    { label: "Phone", value: "+1 415 555 0138", Icon: Phone }
  ];

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
            {channels.map(({ label, value, Icon, href }) => (
              <div className="card card-pad row" key={label} style={{ gap: 14 }}>
                <span className="logo-mark"><Icon size={19} /></span>
                <div>
                  <strong>{label}</strong>
                  {href ? <a className="muted" href={href} target="_blank" rel="noopener noreferrer">{value}</a> : <p className="muted">{value}</p>}
                </div>
              </div>
            ))}
            <div className="terminal" style={{ minHeight: 220 }}>Map preview / global team coverage</div>
          </div>

          <ContactForm />
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
