"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Send, Twitter } from "lucide-react";
import { footerGroups } from "@/lib/data";
import { toast } from "@/components/dashboard-ui";

const socials = [
  { Icon: Github, label: "GitHub", href: "https://github.com/Aman-Chaudhary0" },
  { Icon: Twitter, label: "Twitter", href: "https://x.com/AmanChaudh5987" },
  { Icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/aman-chaudhary-a1ba38386" },
  { Icon: Mail, label: "Email", href: "mailto:aidevflow1@gmail.com" }
];

const footerLinks = {
  "AI Chat": "/dashboard/ai/chat",
  Projects: "/dashboard/projects",
  Analytics: "/dashboard/analytics",
  "Code Review": "/dashboard/ai/code-review",
  Documentation: "/docs",
  Blog: "/blog",
  Templates: "/dashboard/workflows/create",
  Status: "/dashboard/deployments",
  About: "/about",
  Careers: "/contact",
  Contact: "/contact",
  Security: "/privacy"
};

// Footer is a component that renders the footer section of the website, including the company logo, description, social media links, footer navigation groups, newsletter subscription form, and copyright information.  
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
          <div className="row wrap gap-2.5">
            {socials.map(({ Icon, label, href }) => (
              <a aria-label={label} className="icon-btn" href={href} key={label} rel="noopener noreferrer" target="_blank">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div className="stack" key={group.title}>
            <h3 className="h3">{group.title}</h3>
            {group.links.map((link) => (
              <Link className="muted" href={footerLinks[link] || "/features"} key={link}>{link}</Link>
            ))}
          </div>
        ))}

        <div className="stack">
          <h3 className="h3">Newsletter</h3>
          <p className="muted">Monthly product notes, AI workflow ideas, and launch checklists.</p>
          <form className="row gap-2" onSubmit={(e) => { e.preventDefault(); toast("Subscribed to newsletter", "success"); }}>
            <input aria-label="Email address" className="input" placeholder="you@company.com" />
            <button aria-label="Subscribe" className="icon-btn" type="submit"><Send size={18} /></button>
          </form>
          <div className="row wrap gap-3.5">
            <Link className="soft" href="/privacy">Privacy</Link>
            <Link className="soft" href="/terms">Terms</Link>
          </div>
        </div>
      </div>

      <div className="container mt-10">
        <p className="soft">Copyright 2026 Devflow AI. All rights reserved.</p>
      </div>
    </footer>
  );
}
