const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  forgotPassword: (email) => request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (body) => request("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  verifyEmail: (token) => request("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),
  resendVerification: (email) => request("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) })
};

// --- Mock API helpers for frontend-only features ---
import * as mockAi from "./mock/ai";
import * as mockGithub from "./mock/github";
import * as mockTasks from "./mock/tasks";
import * as mockAnalytics from "./mock/analytics";
import * as mockDeployments from "./mock/deployments";
import * as mockDomains from "./mock/domains";

function withDelay(result, ms = 600) {
  return new Promise((res) => setTimeout(() => res(result), ms));
}

export const mockApi = {
  ai: {
    backendGeneratorExamples: () => withDelay(mockAi.backendGeneratorExamples, 300),
    history: () => withDelay(mockAi.aiHistory, 300),
    generate: (prompt) => withDelay({ id: "gen_" + Date.now(), prompt, status: "generated", artifacts: {} }, 1400)
  },
  github: {
    branches: () => withDelay(mockGithub.branches, 300),
    releases: () => withDelay(mockGithub.releases, 300),
    issues: () => withDelay(mockGithub.issues, 300)
  },
  projects: {
    tasks: (projectId) => withDelay(mockTasks.projectTasks[projectId] || [], 300),
    analytics: (projectId) => withDelay(mockAnalytics.projectAnalytics[projectId] || null, 400)
  },
  deployments: {
    list: () => withDelay(mockDeployments.deployments, 300),
    get: (id) => withDelay(mockDeployments.deploymentDetails[id] || null, 400)
  },
  domains: {
    list: () => withDelay(mockDomains.domains, 300)
  }
};
