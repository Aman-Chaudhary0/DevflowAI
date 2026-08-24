export const webhooks = [
  {
    id: "wh_01",
    name: "Production Notifications",
    endpoint: "https://api.example.com/••••••",
    events: 6,
    status: "active",
    last: "2 min ago",
    rate: "99.2%",
    created: "Aug 12, 2026",
  },
];
export const integrations = [
  {
    name: "GitHub",
    category: "Development",
    status: "Connected",
    description:
      "Sync repositories, pull requests, commits, issues, and branches.",
  },
  {
    name: "Vercel",
    category: "Deployment",
    status: "Connected",
    description: "Deploy and monitor production and preview releases.",
  },
  {
    name: "Slack",
    category: "Communication",
    status: "Disconnected",
    description: "Send team updates and workflow notifications.",
  },
  {
    name: "Linear",
    category: "Project Management",
    status: "Disconnected",
    description: "Keep issues and projects in sync.",
  },
  {
    name: "Sentry",
    category: "Analytics",
    status: "Disconnected",
    description: "Turn errors into actionable engineering work.",
  },
  {
    name: "Figma",
    category: "Productivity",
    status: "Disconnected",
    description: "Link designs directly to your delivery workflow.",
  },
];
export const searchResults = [
  {
    type: "Projects",
    title: "MediQueue",
    description: "Healthcare delivery workspace",
    project: "MediQueue",
  },
  {
    type: "Tasks",
    title: "Implement JWT authentication",
    description: "Secure session middleware",
    project: "MediQueue",
  },
  {
    type: "AI",
    title: "JWT middleware generation",
    description: "AI backend session",
    project: "DevFlow AI",
  },
  {
    type: "Files",
    title: "auth.controller.js",
    description: "Authentication controller",
    project: "DevFlow AI",
  },
];
export const feedback = [
  {
    id: "FDB-4812",
    title: "Add deployment annotations",
    type: "Feature Request",
    status: "Planned",
    created: "Aug 21, 2026",
    votes: 42,
  },
  {
    id: "FDB-4804",
    title: "Improve editor search",
    type: "Improvement",
    status: "Under Review",
    created: "Aug 18, 2026",
    votes: 18,
  },
];
export const adminUsers = [
  {
    id: "usr_8291",
    name: "Aarav Patel",
    email: "aarav@example.dev",
    plan: "Team",
    status: "active",
    usage: "7.4k",
    projects: 8,
    joined: "Aug 1, 2026",
    last: "4 min ago",
  },
  {
    id: "usr_8292",
    name: "Maya Chen",
    email: "maya@example.dev",
    plan: "Pro",
    status: "active",
    usage: "2.1k",
    projects: 4,
    joined: "Aug 3, 2026",
    last: "1 hour ago",
  },
];
export const audit = [
  {
    id: "aud_01",
    time: "Aug 23, 2026 20:41",
    actor: "admin@devflow.ai",
    action: "Changed user subscription",
    resource: "User: usr_8291",
    ip: "192.0.2.42",
    status: "success",
    severity: "Medium",
  },
  {
    id: "aud_02",
    time: "Aug 23, 2026 20:12",
    actor: "maya@example.dev",
    action: "User login failed",
    resource: "Authentication",
    ip: "192.0.2.84",
    status: "failed",
    severity: "High",
  },
];
