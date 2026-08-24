export const sqlTables = [
  { name: "users", fields: ["id UUID", "name VARCHAR", "email VARCHAR", "created_at TIMESTAMP"] },
  { name: "orders", fields: ["id UUID", "user_id UUID", "total DECIMAL", "created_at TIMESTAMP"] },
  { name: "products", fields: ["id UUID", "name VARCHAR", "price DECIMAL", "stock INTEGER"] },
  { name: "payments", fields: ["id UUID", "order_id UUID", "status VARCHAR", "paid_at TIMESTAMP"] },
  { name: "subscriptions", fields: ["id UUID", "user_id UUID", "plan VARCHAR", "status VARCHAR"] },
  { name: "teams", fields: ["id UUID", "name VARCHAR", "owner_id UUID", "created_at TIMESTAMP"] },
];

export const sqlHistory = [
  ["Top customers this month", "PostgreSQL", "2 min ago"], ["Failed payments by plan", "PostgreSQL", "18 min ago"],
  ["Weekly active subscribers", "MySQL", "Yesterday"], ["Products below reorder level", "SQLite", "Yesterday"],
  ["Revenue by acquisition channel", "PostgreSQL", "Aug 20"], ["New team members", "SQL Server", "Aug 19"],
];

export const integrationData = [
  ["GitHub", "Development", "Connected", "Sync repositories, commits, branches, issues and pull requests."],
  ["Vercel", "Deployment", "Connected", "Connect deployments and project environments."],
  ["Google", "Productivity", "Connected", "Connect Google authentication and workspace services."],
  ["Slack", "Communication", "Available", "Send workspace notifications to Slack."],
  ["Discord", "Communication", "Available", "Push development activity into Discord channels."],
  ["Docker", "Development", "Available", "Connect images and container build activity."],
  ["OpenAI", "AI", "Available", "Power AI workflows with OpenAI models."],
  ["Gemini", "AI", "Available", "Use Gemini models in AI-assisted workflows."],
  ["MongoDB", "Storage", "Available", "View database health and project data context."],
  ["Redis", "Storage", "Available", "Monitor cache and queue operations."],
  ["ImageKit", "Storage", "Coming soon", "Manage media assets alongside projects."],
  ["Figma", "Productivity", "Coming soon", "Bring design context into delivery workflows."],
].map(([name, category, status, description]) => ({ name, category, status, description }));

export const helpArticles = [
  ["Create your workspace", "Getting Started", "Set up a focused home for your team."], ["Create your first project", "Getting Started", "Organize code, tasks, and docs in one place."],
  ["Invite team members", "Getting Started", "Give collaborators the right workspace access."], ["Configure notifications", "Getting Started", "Choose the updates that matter to you."],
  ["Using AI Chat", "AI", "Ask questions with project-aware context."], ["Code generation", "AI", "Turn prompts into maintainable starting points."],
  ["Code reviews", "AI", "Review changes before they reach production."], ["Documentation generation", "AI", "Create useful docs from your codebase."],
  ["Bug fixing", "AI", "Diagnose and work through application errors."], ["Connect GitHub", "GitHub", "Authorize repository synchronization."],
  ["Sync repositories", "GitHub", "Keep branches, commits, and pull requests current."], ["Manage branches", "GitHub", "Understand branch activity and protection."],
  ["Review pull requests", "GitHub", "Use Devflow AI in your review workflow."], ["Create deployment", "Deployments", "Ship a project environment."],
  ["Understand build logs", "Deployments", "Find build failures quickly."], ["Add a domain", "Deployments", "Attach a custom domain to a deployment."],
  ["SSL verification", "Deployments", "Confirm secure domain configuration."], ["Manage your plan", "Billing", "Change plan and monitor usage."],
  ["Secure your workspace", "Security", "Review access and security defaults."],
].map(([title, category, description], i) => ({ id: i + 1, title, category, description, updated: i < 6 ? "Updated today" : "Updated 3 days ago" }));

export const searchItems = [
  ["Projects", "Devflow AI", "Developer workspace platform", "Updated 2 hours ago"], ["Projects", "MediQueue", "Healthcare delivery workspace", "Updated yesterday"],
  ["AI", "Code review for authentication middleware", "AI Session · 7 findings", "Yesterday"], ["AI", "Release notes draft", "AI documentation session", "Aug 21"],
  ["Files", "auth.controller.js", "backend/src/controllers/auth", "Modified 3 hours ago"], ["Files", "deployment.config.js", "apps/web/config", "Modified yesterday"],
  ["GitHub", "fix: refresh token rotation", "Commit · devflow-ai/api", "Yesterday"], ["GitHub", "feat: add staging environment", "Pull request #184", "Aug 22"],
  ["Tasks", "Implement Redis queue", "In Progress · Due tomorrow", "Today"], ["Tasks", "Audit deployment permissions", "In Review · Platform", "Yesterday"],
  ["Docs", "Authentication Architecture", "Project documentation", "Updated 3 hours ago"], ["Docs", "Production runbook", "Deployment documentation", "Updated Aug 20"],
  ["People", "Rahul Sharma", "Frontend Developer · Online", "Active now"], ["People", "Maya Chen", "Product Engineer · Away", "Active 24 min ago"],
].map(([type, title, description, time], i) => ({ id: i + 1, type, title, description, time }));
