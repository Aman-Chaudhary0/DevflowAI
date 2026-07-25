"use client";

import Link from "next/link";
import { Menu, Rocket } from "lucide-react";
import { navItems } from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";

// Navbar is a component that renders the navigation bar at the top of the website, including the company logo, navigation links, theme toggle button, and call-to-action buttons for login and starting a free trial. It also includes a mobile menu button for smaller screens.
export function Navbar() {
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
          <Link className="btn btn-ghost desktop-only" href="/contact">Login</Link>
          <ThemeToggle />
          <Link className="btn btn-primary desktop-only" href="/pricing">Start Free</Link>
          <button aria-label="Open mobile menu" className="icon-btn mobile-menu" type="button">
            <Menu size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
