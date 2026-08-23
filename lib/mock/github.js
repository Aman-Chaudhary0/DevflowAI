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
