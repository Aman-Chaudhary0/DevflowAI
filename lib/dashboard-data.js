export const mockUser = {
  _id: "u1",
  name: "Aman Chaudhary",
  email: "aman@devflow.ai",
  avatar: "",
  role: "admin",
  isVerified: true
};

export const mockProjects = [
  {
    _id: "p1",
    name: "Devflow AI",
    slug: "devflow-ai",
    description: "AI-powered developer workspace with projects, tasks, and analytics.",
    color: "#3b82f6",
    stack: ["Next.js", "Node.js", "MongoDB"],
    progress: 72,
    status: "active",
    visibility: "private",
    members: [
      { _id: "u1", name: "Aman Chaudhary", color: "#3b82f6" },
      { _id: "u2", name: "Rahul Singh", color: "#8b5cf6" },
      { _id: "u3", name: "Priya Sharma", color: "#ec4899" }
    ],
    tasks: { open: 12, completed: 34, overdue: 2 },
    deployments: { status: "running", lastDeploy: "2 hours ago", env: "Production" },
    updatedAt: "2026-07-26T10:00:00Z",
    createdAt: "2026-01-10T08:00:00Z",
    stars: 128,
    commits: 342
  },
  {
    _id: "p2",
    name: "E-Commerce Platform",
    slug: "ecommerce-platform",
    description: "Full-stack e-commerce solution with payments and inventory management.",
    color: "#22c55e",
    stack: ["React", "Express", "PostgreSQL"],
    progress: 58,
    status: "active",
    visibility: "private",
    members: [
      { _id: "u1", name: "Aman Chaudhary", color: "#3b82f6" },
      { _id: "u4", name: "Neha Gupta", color: "#f59e0b" }
    ],
    tasks: { open: 8, completed: 21, overdue: 1 },
    deployments: { status: "warning", lastDeploy: "1 day ago", env: "Staging" },
    updatedAt: "2026-07-25T14:00:00Z",
    createdAt: "2026-03-05T09:00:00Z",
    stars: 64,
    commits: 187
  },
  {
    _id: "p3",
    name: "Mobile Banking App",
    slug: "mobile-banking",
    description: "Secure mobile banking application with biometric authentication.",
    color: "#f59e0b",
    stack: ["React Native", "Node.js", "Redis"],
    progress: 41,
    status: "active",
    visibility: "team",
    members: [
      { _id: "u2", name: "Rahul Singh", color: "#8b5cf6" },
      { _id: "u3", name: "Priya Sharma", color: "#ec4899" },
      { _id: "u5", name: "Arjun Mehta", color: "#06b6d4" }
    ],
    tasks: { open: 18, completed: 9, overdue: 4 },
    deployments: { status: "idle", lastDeploy: "3 days ago", env: "Development" },
    updatedAt: "2026-07-24T11:00:00Z",
    createdAt: "2026-05-12T10:00:00Z",
    stars: 32,
    commits: 98
  },
  {
    _id: "p4",
    name: "Analytics Dashboard",
    slug: "analytics-dashboard",
    description: "Real-time analytics and reporting platform for business intelligence.",
    color: "#8b5cf6",
    stack: ["Vue.js", "Python", "ClickHouse"],
    progress: 89,
    status: "active",
    visibility: "public",
    members: [
      { _id: "u1", name: "Aman Chaudhary", color: "#3b82f6" },
      { _id: "u4", name: "Neha Gupta", color: "#f59e0b" },
      { _id: "u5", name: "Arjun Mehta", color: "#06b6d4" }
    ],
    tasks: { open: 3, completed: 47, overdue: 0 },
    deployments: { status: "running", lastDeploy: "30 min ago", env: "Production" },
    updatedAt: "2026-07-26T09:30:00Z",
    createdAt: "2026-02-18T07:00:00Z",
    stars: 256,
    commits: 521
  },
  {
    _id: "p5",
    name: "DevOps Pipeline",
    slug: "devops-pipeline",
    description: "Automated CI/CD pipeline with Docker, Kubernetes, and monitoring.",
    color: "#06b6d4",
    stack: ["Docker", "Kubernetes", "Terraform"],
    progress: 65,
    status: "archived",
    visibility: "private",
    members: [
      { _id: "u2", name: "Rahul Singh", color: "#8b5cf6" }
    ],
    tasks: { open: 0, completed: 28, overdue: 0 },
    deployments: { status: "idle", lastDeploy: "2 weeks ago", env: "Production" },
    updatedAt: "2026-07-10T08:00:00Z",
    createdAt: "2026-04-01T06:00:00Z",
    stars: 89,
    commits: 203
  },
  {
    _id: "p6",
    name: "AI Code Review",
    slug: "ai-code-review",
    description: "Automated code review tool powered by GPT-4 with inline suggestions.",
    color: "#ec4899",
    stack: ["Python", "FastAPI", "OpenAI"],
    progress: 33,
    status: "active",
    visibility: "public",
    members: [
      { _id: "u1", name: "Aman Chaudhary", color: "#3b82f6" },
      { _id: "u3", name: "Priya Sharma", color: "#ec4899" }
    ],
    tasks: { open: 22, completed: 11, overdue: 3 },
    deployments: { status: "failed", lastDeploy: "5 hours ago", env: "Staging" },
    updatedAt: "2026-07-26T07:00:00Z",
    createdAt: "2026-06-20T11:00:00Z",
    stars: 412,
    commits: 76
  }
];

export const mockTasks = [
  { _id: "t1", title: "Finish Login UI", project: "Devflow AI", priority: "high", status: "todo", dueDate: "Today", assignee: { name: "Aman Chaudhary", color: "#3b82f6" } },
  { _id: "t2", title: "Write API documentation", project: "Devflow AI", priority: "medium", status: "in-progress", dueDate: "Tomorrow", assignee: { name: "Rahul Singh", color: "#8b5cf6" } },
  { _id: "t3", title: "Fix payment gateway bug", project: "E-Commerce Platform", priority: "high", status: "todo", dueDate: "Today", assignee: { name: "Neha Gupta", color: "#f59e0b" } },
  { _id: "t4", title: "Setup Redis caching", project: "Mobile Banking App", priority: "medium", status: "todo", dueDate: "Jul 28", assignee: { name: "Arjun Mehta", color: "#06b6d4" } },
  { _id: "t5", title: "Deploy to production", project: "Analytics Dashboard", priority: "high", status: "done", dueDate: "Jul 25", assignee: { name: "Aman Chaudhary", color: "#3b82f6" } },
  { _id: "t6", title: "Code review for PR #42", project: "AI Code Review", priority: "low", status: "in-progress", dueDate: "Jul 29", assignee: { name: "Priya Sharma", color: "#ec4899" } },
  { _id: "t7", title: "Update database schema", project: "Devflow AI", priority: "high", status: "todo", dueDate: "Today", assignee: { name: "Aman Chaudhary", color: "#3b82f6" } },
  { _id: "t8", title: "Write unit tests", project: "E-Commerce Platform", priority: "medium", status: "todo", dueDate: "Jul 30", assignee: { name: "Rahul Singh", color: "#8b5cf6" } }
];

export const mockActivity = [
  { _id: "a1", type: "ai", title: "AI generated README for Devflow AI", user: "AI Assistant", time: "2 min ago", icon: "bot" },
  { _id: "a2", type: "git", title: "Rahul merged PR #38 — Add auth middleware", user: "Rahul Singh", time: "5 min ago", icon: "git-merge" },
  { _id: "a3", type: "deploy", title: "Deployment completed — Analytics Dashboard v2.1", user: "System", time: "30 min ago", icon: "rocket" },
  { _id: "a4", type: "task", title: "Aman completed task: Setup Redis caching", user: "Aman Chaudhary", time: "1 hour ago", icon: "check-circle" },
  { _id: "a5", type: "file", title: "Priya uploaded design-system.fig", user: "Priya Sharma", time: "2 hours ago", icon: "upload" },
  { _id: "a6", type: "team", title: "Arjun Mehta joined Mobile Banking App", user: "Arjun Mehta", time: "3 hours ago", icon: "user-plus" },
  { _id: "a7", type: "ai", title: "AI reviewed 3 files in AI Code Review", user: "AI Assistant", time: "4 hours ago", icon: "bot" },
  { _id: "a8", type: "git", title: "Neha pushed 4 commits to main", user: "Neha Gupta", time: "5 hours ago", icon: "git-commit" }
];

export const mockNotifications = [
  { _id: "n1", title: "PR #42 needs your review", desc: "Rahul Singh requested a review on AI Code Review", time: "5 min ago", read: false, type: "review" },
  { _id: "n2", title: "Deployment failed", desc: "AI Code Review staging deployment failed", time: "1 hour ago", read: false, type: "error" },
  { _id: "n3", title: "Task overdue", desc: "Fix payment gateway bug is 1 day overdue", time: "2 hours ago", read: false, type: "warning" },
  { _id: "n4", title: "New team member", desc: "Arjun Mehta joined Mobile Banking App", time: "3 hours ago", read: true, type: "info" },
  { _id: "n5", title: "AI usage at 80%", desc: "You have used 110 of 138 AI requests this month", time: "Yesterday", read: true, type: "warning" },
  { _id: "n6", title: "Deployment successful", desc: "Analytics Dashboard v2.1 deployed to production", time: "Yesterday", read: true, type: "success" }
];

export const mockTeamMembers = [
  { _id: "u1", name: "Aman Chaudhary", email: "aman@devflow.ai", role: "Admin", status: "online", joined: "Jan 10, 2026", color: "#3b82f6", tasks: 24, commits: 187 },
  { _id: "u2", name: "Rahul Singh", email: "rahul@devflow.ai", role: "Developer", status: "online", joined: "Feb 14, 2026", color: "#8b5cf6", tasks: 18, commits: 142 },
  { _id: "u3", name: "Priya Sharma", email: "priya@devflow.ai", role: "Developer", status: "away", joined: "Mar 01, 2026", color: "#ec4899", tasks: 15, commits: 98 },
  { _id: "u4", name: "Neha Gupta", email: "neha@devflow.ai", role: "Viewer", status: "offline", joined: "Apr 20, 2026", color: "#f59e0b", tasks: 8, commits: 34 },
  { _id: "u5", name: "Arjun Mehta", email: "arjun@devflow.ai", role: "Developer", status: "online", joined: "Jun 15, 2026", color: "#06b6d4", tasks: 11, commits: 67 }
];

export const mockFiles = [
  { _id: "f1", name: "design-system.fig", type: "figma", size: "24.3 MB", owner: "Priya Sharma", updatedAt: "2 hours ago", folder: "Design" },
  { _id: "f2", name: "api-docs.md", type: "markdown", size: "128 KB", owner: "Aman Chaudhary", updatedAt: "1 day ago", folder: "Docs" },
  { _id: "f3", name: "architecture.png", type: "image", size: "2.1 MB", owner: "Rahul Singh", updatedAt: "2 days ago", folder: "Design" },
  { _id: "f4", name: "database-schema.sql", type: "code", size: "48 KB", owner: "Aman Chaudhary", updatedAt: "3 days ago", folder: "Database" },
  { _id: "f5", name: "deployment-guide.pdf", type: "pdf", size: "1.8 MB", owner: "Arjun Mehta", updatedAt: "1 week ago", folder: "Docs" },
  { _id: "f6", name: "logo-assets.zip", type: "archive", size: "8.4 MB", owner: "Priya Sharma", updatedAt: "1 week ago", folder: "Assets" }
];

// 20 words: mockAnalytics provides a set of mock data representing various analytics metrics for a developer dashboard. It includes information on tasks completed, commits, deployments, AI requests, storage usage, productivity scores, weekly trends, programming languages used, deployment statistics, and AI model performance. 
export const mockAnalytics = {
  tasksCompleted: { value: 142, delta: "+18%", trend: "up" },
  commits: { value: 728, delta: "+12%", trend: "up" },
  deployments: { value: 34, delta: "-3%", trend: "down" },
  aiRequests: { value: 1240, delta: "+42%", trend: "up" },
  storage: { used: 4.3, total: 10, unit: "GB" },
  productivity: { value: 84, delta: "+6%", trend: "up" },
  weeklyTasks: [12, 18, 14, 22, 19, 28, 24],
  weeklyCommits: [34, 28, 42, 38, 51, 44, 48],
  weeklyDeploys: [2, 4, 3, 6, 4, 8, 5],
  languages: [
    { name: "JavaScript", pct: 42, color: "#f59e0b" },
    { name: "TypeScript", pct: 28, color: "#3b82f6" },
    { name: "Python", pct: 18, color: "#22c55e" },
    { name: "CSS", pct: 12, color: "#8b5cf6" }
  ],
  deployStats: { successful: 28, failed: 6, avgBuildTime: "1m 42s" },
  aiStats: { tokensUsed: 84200, avgResponse: "1.2s", successRate: "98.4%", model: "GPT-4o" }
};

export const mockDocs = [
  { _id: "d1", title: "README", content: "# Devflow AI\n\nAI-powered developer workspace.\n\n## Getting Started\n\nClone the repository and run `npm install`.\n\n## Features\n\n- AI Chat\n- Project Management\n- Analytics\n- Team Collaboration", updatedAt: "1 day ago" },
  { _id: "d2", title: "API Reference", content: "# API Reference\n\n## Authentication\n\n`POST /api/auth/login`\n\nReturns JWT access token.\n\n## Projects\n\n`GET /api/projects` — List all projects\n\n`POST /api/projects` — Create project", updatedAt: "2 days ago" },
  { _id: "d3", title: "Database Schema", content: "# Database Schema\n\n## Users\n\n- _id, name, email, password, role\n\n## Projects\n\n- _id, name, slug, description, members", updatedAt: "3 days ago" },
  { _id: "d4", title: "Deployment Guide", content: "# Deployment Guide\n\n## Prerequisites\n\n- Node.js 20+\n- MongoDB Atlas\n- Redis\n\n## Steps\n\n1. Set environment variables\n2. Run `npm run build`\n3. Deploy to Vercel", updatedAt: "1 week ago" }
];

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getAvatarColor(name) {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#22c55e", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
