import Link from "next/link";
import { Github, Linkedin, Mail, Send, Twitter } from "lucide-react";
import { footerGroups } from "@/lib/data";

const socials = [
  { Icon: Github, label: "GitHub" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Linkedin, label: "LinkedIn" },
  { Icon: Mail, label: "Email" }
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div className="stack">
          <Link className="logo" href="/">
            <span className="logo-mark">D</span>
            <span className="font-display">Devflow AI</span>
          </Link>
          <p className="muted">A premium, dark-first workspace for developers building with AI.</p>
          <div className="row wrap" style={{ gap: 10 }}>
            {socials.map(({ Icon, label }) => (
              <button aria-label={label} className="icon-btn" key={label} type="button">
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div className="stack" key={group.title}>
            <h3 className="h3">{group.title}</h3>
            {group.links.map((link) => (
              <Link className="muted" href="/features" key={link}>{link}</Link>
            ))}
          </div>
        ))}

        <div className="stack">
          <h3 className="h3">Newsletter</h3>
          <p className="muted">Monthly product notes, AI workflow ideas, and launch checklists.</p>
          <form className="row" style={{ gap: 8 }}>
            <input aria-label="Email address" className="input" placeholder="you@company.com" />
            <button aria-label="Subscribe" className="icon-btn" type="submit"><Send size={18} /></button>
          </form>
          <div className="row wrap" style={{ gap: 14 }}>
            <Link className="soft" href="/privacy">Privacy</Link>
            <Link className="soft" href="/terms">Terms</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 40 }}>
        <p className="soft">Copyright 2026 Devflow AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
