"use client";

import Link from "next/link";
import { Menu, Rocket } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";

// Navbar is a component that renders the navigation bar at the top of the website, including the company logo, navigation links, theme toggle button, and call-to-action buttons for login and starting a free trial. It also includes a mobile menu button for smaller screens.
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="nav solid">
      <div className="container nav-inner">
        <Link className="logo" href="/">
          <span className="logo-mark"><Rocket size={19} /></span>
          <span className="font-display">Devflow AI</span>
        </Link>
        <nav aria-label="Primary navigation" className="nav-links">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="btn btn-ghost desktop-only" href="/login">Login</Link>
          <ThemeToggle />
          <Link className="btn btn-primary desktop-only" href="/pricing">Start Free</Link>
          <button
            aria-label="Open mobile menu"
            className="icon-btn mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="container pb-4 lg:hidden">
          <div className="card card-pad stack" style={{ gap: 10 }}>
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>
            ))}
            <div className="row gap-2 wrap pt-2">
              <Link className="btn btn-ghost" href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link className="btn btn-primary" href="/pricing" onClick={() => setMobileOpen(false)}>Start Free</Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
