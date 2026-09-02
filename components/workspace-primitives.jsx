"use client";
import Link from "next/link";
import { X } from "lucide-react";

const breadcrumbRoutes = {
  Dashboard: "/dashboard",
  GitHub: "/dashboard/github",
  Repositories: "/dashboard/github/repositories",
  Branches: "/dashboard/github/branches",
  Commits: "/dashboard/github/commits",
  Releases: "/dashboard/github/releases",
  Issues: "/dashboard/github/issues",
  Projects: "/dashboard/projects",
  Project: "/dashboard/projects",
  Billing: "/dashboard/billing",
  History: "/dashboard/billing/history",
  Team: "/dashboard/team",
  Members: "/dashboard/team/members",
  Activity: "/dashboard/team/activity",
  Calendar: "/dashboard/team/calendar",
  Editor: "/dashboard/editor",
  Snippets: "/dashboard/editor/snippets",
  Playground: "/dashboard/editor/playground",
  Workflows: "/dashboard/workflows",
  Create: "/dashboard/workflows/create",
  Developer: "/dashboard/developer/api-keys",
  "API Keys": "/dashboard/developer/api-keys",
  Help: "/help",
  "Help Center": "/help",
  AI: "/dashboard/ai",
  Analytics: "/dashboard/analytics",
  Tasks: "/dashboard/tasks",
  Files: "/dashboard/files",
  Documentation: "/docs",
  Settings: "/dashboard/settings",
  Integrations: "/dashboard/integrations",
  Search: "/search",
  Feedback: "/feedback",
  Notifications: "/dashboard/notifications",
  Deployments: "/dashboard/deployments",
  Details: "/dashboard/deployments"
};

export function Crumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="muted text-xs mb-3 flex items-center gap-1 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">/</span>}
          {typeof item === "object" && item !== null ? (
            i < items.length - 1 && item.href ? (
              <Link className="hover:text-(--text) transition-colors" href={item.href}>{item.label}</Link>
            ) : (
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{item.label}</span>
            )
          ) : i < items.length - 1 && breadcrumbRoutes[item] ? (
            <Link className="hover:text-(--text) transition-colors" href={breadcrumbRoutes[item]}>{item}</Link>
          ) : i < items.length - 1 ? (
            <span className="hover:text-(--text) cursor-default transition-colors">{item}</span>
          ) : (
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{item}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function Drawer({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <aside
        className="dialog"
        style={{
          width: "min(100%, 560px)",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-lg">{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
