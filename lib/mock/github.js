export const repositories = [
  { id: "r1", name: "devflow-ai", fullName: "aman/devflow-ai", description: "AI-powered developer workspace", stars: 128, forks: 34, language: "JavaScript", languageColor: "#f59e0b", visibility: "private", defaultBranch: "main", openPRs: 3, lastCommit: "2 hours ago", status: "active" },
  { id: "r2", name: "ecommerce-platform", fullName: "aman/ecommerce-platform", description: "Full-stack e-commerce solution", stars: 64, forks: 12, language: "TypeScript", languageColor: "#3b82f6", visibility: "private", defaultBranch: "main", openPRs: 1, lastCommit: "1 day ago", status: "active" },
  { id: "r3", name: "mobile-banking", fullName: "aman/mobile-banking", description: "Secure mobile banking app", stars: 32, forks: 8, language: "React Native", languageColor: "#06b6d4", visibility: "team", defaultBranch: "develop", openPRs: 2, lastCommit: "3 days ago", status: "active" },
  { id: "r4", name: "analytics-dashboard", fullName: "aman/analytics-dashboard", description: "Real-time analytics platform", stars: 256, forks: 67, language: "Vue.js", languageColor: "#22c55e", visibility: "public", defaultBranch: "main", openPRs: 0, lastCommit: "30 min ago", status: "active" }
];

export function getRepositoryById(repoId) {
  if (!repoId) return null;
  return repositories.find((repo) => repo.id === repoId || repo.name === repoId) || null;
}

export const branches = [
  { id: "b1", name: "main", repo: "devflow-ai", lastCommit: "Add AI usage dashboard", author: "Aman", updated: "12 minutes ago", protected: true, type: "main" },
  { id: "b2", name: "develop", repo: "devflow-ai", lastCommit: "Update CI", author: "Priya Sharma", updated: "2 hours ago", protected: false, type: "develop" },
  { id: "b3", name: "feature/ai-backend-generator", repo: "devflow-ai", lastCommit: "Implement backend generator UI", author: "Rahul Verma", updated: "1 day ago", protected: false, type: "feature" }
];

export const releases = [
  { id: "r1", version: "v2.4.0", title: "AI Workspace Improvements", repo: "devflow-ai", date: "2026-08-20", author: "Aman", status: "Published", notes: "## What's New\n* Added AI Backend Generator\n* Improved code review interface" },
  { id: "r2", version: "v2.3.1", title: "Bug fixes", repo: "devflow-ai", date: "2026-07-10", author: "Priya Sharma", status: "Published", notes: "Minor fixes" }
];

export const issues = [
  { id: 142, title: "JWT refresh token fails after session expiry", repo: "devflow-ai", labels: ["bug","security"], priority: "High", assignee: "Aman", status: "Open", updated: "3 hours ago", number: 142, description: "Refresh token errors after sleep" },
  { id: 150, title: "Mobile sidebar closes unexpectedly", repo: "devflow-ai", labels: ["bug","ui"], priority: "Medium", assignee: "Neha Singh", status: "In Progress", updated: "1 day ago", number: 150, description: "Sidebar state lost on route change" }
];
