import {
  Activity,
  BarChart3,
  Bot,
  BrainCircuit,
  Code2,
  GitBranch,
  LayoutDashboard,
  Lock,
  MessageSquareText,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow
} from "lucide-react";

export const navItems = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Contact" }
];

export const features = [
  { icon: BrainCircuit, title: "AI Pairing", description: "Plan, code, summarize, and review work with context-aware AI assistance." },
  { icon: LayoutDashboard, title: "Developer Dashboard", description: "Track projects, tasks, deployments, health, and velocity in one workspace." },
  { icon: Code2, title: "Code Workspace", description: "A VS Code-inspired interface with file explorer, tabs, terminal, and run actions." },
  { icon: Workflow, title: "Workflow Automation", description: "Move ideas through AI, development, review, and deploy pipelines." },
  { icon: BarChart3, title: "Analytics", description: "Area charts, progress rings, heat maps, and operational insights built for teams." },
  { icon: ShieldCheck, title: "Secure by Default", description: "Clear permission boundaries, audit-friendly activity, and team controls." }
];

export const pricingPlans = [
  { name: "Free", price: "$0", description: "For solo builders exploring AI workflows.", features: ["3 projects", "AI chat history", "Community support", "Basic analytics"], cta: "Start Free" },
  { name: "Pro", price: "$19", description: "For developers shipping serious products.", features: ["Unlimited projects", "Code review AI", "Kanban and docs", "Priority support"], cta: "Upgrade Pro", popular: true },
  { name: "Team", price: "$49", description: "For product teams needing shared context.", features: ["Team spaces", "Roles and permissions", "Deployment insights", "Shared command palette"], cta: "Start Team" },
  { name: "Enterprise", price: "Custom", description: "For organizations with advanced controls.", features: ["SSO", "Security reviews", "Dedicated success", "Custom retention"], cta: "Contact Sales" }
];

export const posts = [
  { slug: "ai-workspaces", title: "Designing AI workspaces developers actually trust", category: "AI", author: "Maya Chen", date: "Jul 18, 2026", read: "7 min", image: "AI workspace console", excerpt: "A practical model for context, review loops, and product velocity." },
  { slug: "kanban-automation", title: "From kanban cards to autonomous delivery loops", category: "Workflow", author: "Owen Lee", date: "Jul 12, 2026", read: "5 min", image: "Workflow board", excerpt: "How teams keep automation visible without losing control." },
  { slug: "clean-dashboards", title: "The anatomy of a calm developer dashboard", category: "Design", author: "Iris Patel", date: "Jul 08, 2026", read: "6 min", image: "Dashboard analytics", excerpt: "Make data dense, fast, and readable without adding clutter." },
  { slug: "secure-ai", title: "Building secure AI features for product teams", category: "Security", author: "Noah Stone", date: "Jun 29, 2026", read: "8 min", image: "Security review", excerpt: "Permissioning, audit trails, and trust boundaries for AI tools." }
];

export const stats = [
  { label: "Projects shipped", value: "48K+" },
  { label: "Active developers", value: "120K" },
  { label: "Deployments tracked", value: "9.4M" },
  { label: "Open-source stars", value: "32K" }
];

export const footerGroups = [
  { title: "Product", links: ["AI Chat", "Projects", "Analytics", "Code Review"] },
  { title: "Resources", links: ["Documentation", "Blog", "Templates", "Status"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Security"] }
];

export const activities = [
  { icon: Bot, title: "AI generated a test plan", meta: "Today, 10:42" },
  { icon: GitBranch, title: "Review branch merged", meta: "Today, 09:18" },
  { icon: Activity, title: "Deployment health improved", meta: "Yesterday" },
  { icon: MessageSquareText, title: "Docs feedback resolved", meta: "Yesterday" },
  { icon: Rocket, title: "Production deploy completed", meta: "Monday" },
  { icon: Lock, title: "Security policy updated", meta: "Monday" },
  { icon: Users, title: "3 teammates joined project", meta: "Last week" },
  { icon: Sparkles, title: "AI workflow optimized", meta: "Last week" }
];
