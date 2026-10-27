const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(data) {
  if (!data) return "Something went wrong";

  if (typeof data.message === "string" && data.message && data.message !== "Validation failed") {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        const path = item?.path ? String(item.path) : "field";
        const message = item?.message ? String(item.message) : "Invalid value";
        return `${path}: ${message}`;
      })
      .join("; ");
  }

  if (typeof data.message === "string" && data.message) {
    return data.message;
  }

  return "Something went wrong";
}

async function request(path, options = {}, retryCount = 0) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await parseJsonSafely(res) : null;

  if (res.status === 401 && retryCount === 0 && !path.startsWith("/api/auth")) {
    try {
      const refreshRes = await fetch(`${BASE}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (refreshRes.ok) {
        return request(path, options, 1);
      }
    } catch {
      // ignore and fall through to the normal error handling below
    }
  }

  if (!res.ok) {
    const message = getErrorMessage(data);
    throw new Error(message);
  }

  return data || {};
}

async function requestFormData(path, options = {}, retryCount = 0) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...options
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await parseJsonSafely(res) : null;

  if (res.status === 401 && retryCount === 0 && !path.startsWith("/api/auth")) {
    try {
      const refreshRes = await fetch(`${BASE}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (refreshRes.ok) {
        return requestFormData(path, options, 1);
      }
    } catch {
      // ignore and fall through to the normal error handling below
    }
  }

  if (!res.ok) {
    const message = getErrorMessage(data);
    throw new Error(message);
  }

  return data || {};
}

function buildQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),
  forgotPassword: (email) => request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (body) => request("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  verifyEmail: (token) => request("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),
  resendVerification: (email, invitationToken) => request("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email, ...(invitationToken ? { invitationToken } : {}) }) }),
  projects: {
    list: (params = {}) => {
      return request(`/api/projects${buildQueryString(params)}`);
    },
    get: (projectId) => request(`/api/projects/${projectId}`),
    activity: (projectId) => request(`/api/projects/${projectId}/activity`),
    create: (payload) => request("/api/projects", { method: "POST", body: JSON.stringify(payload) }),
    update: (projectId, payload) => request(`/api/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(payload) }),
    archive: (projectId) => request(`/api/projects/${projectId}/archive`, { method: "POST" }),
    restore: (projectId) => request(`/api/projects/${projectId}/restore`, { method: "POST" }),
    delete: (projectId) => request(`/api/projects/${projectId}`, { method: "DELETE" })
  },
  tasks: {
    list: (params = {}) => request(`/api/tasks${buildQueryString(params)}`),
    get: (taskId) => request(`/api/tasks/${taskId}`),
    create: (payload) => request("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),
    update: (taskId, payload) => request(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) }),
    delete: (taskId) => request(`/api/tasks/${taskId}`, { method: "DELETE" }),
    comments: {
      list: (taskId) => request(`/api/tasks/${taskId}/comments`),
      create: (taskId, payload) => request(`/api/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(payload) })
    },
    activity: (taskId) => request(`/api/tasks/${taskId}/activity`),
    activityWorkspace: (workspaceId) => request(`/api/tasks/workspace/${workspaceId}/activity`),
    members: {
      workspace: (workspaceId) => request(`/api/tasks/workspace/${workspaceId}/members`),
      project: (projectId) => request(`/api/tasks/project/${projectId}/members`)
    }
  },
  notifications: {
    list: () => request("/api/notifications"),
    markRead: (notificationId) => request(`/api/notifications/${notificationId}/read`, { method: "PATCH" }),
    markUnread: (notificationId) => request(`/api/notifications/${notificationId}/unread`, { method: "PATCH" }),
    markAllRead: () => request("/api/notifications/read-all", { method: "PATCH" }),
    delete: (notificationId) => request(`/api/notifications/${notificationId}`, { method: "DELETE" })
  },
  invitations: {
    createWorkspace: (workspaceId, payload) => request(`/api/invitations/workspaces/${workspaceId}`, { method: "POST", body: JSON.stringify(payload) }),
    listWorkspace: (workspaceId) => request(`/api/invitations/workspaces/${workspaceId}`),
    createProject: (projectId, payload) => request(`/api/invitations/projects/${projectId}`, { method: "POST", body: JSON.stringify(payload) }),
    listProject: (projectId) => request(`/api/invitations/projects/${projectId}`),
    revoke: (invitationId) => request(`/api/invitations/${invitationId}`, { method: "DELETE" }),
    details: (token) => request("/api/invitations/details", { method: "POST", body: JSON.stringify({ token }) }),
    accept: (token) => request("/api/invitations/accept", { method: "POST", body: JSON.stringify({ token }) }),
    decline: (token) => request("/api/invitations/decline", { method: "POST", body: JSON.stringify({ token }) })
  },
  files: {
    listWorkspace: (params = {}) => request(`/api/files/workspace${buildQueryString(params)}`),
    listProject: (projectId, params = {}) => request(`/api/files/projects/${projectId}/files${buildQueryString(params)}`),
    getProject: (projectId, fileId) => request(`/api/files/projects/${projectId}/files/${fileId}`),
    uploadProject: (projectId, formData) => requestFormData(`/api/files/projects/${projectId}/files/upload`, { method: "POST", body: formData }),
    downloadProject: (projectId, fileId) => request(`/api/files/projects/${projectId}/files/${fileId}/download`),
    renameProject: (projectId, fileId, payload) => request(`/api/files/projects/${projectId}/files/${fileId}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteProject: (projectId, fileId) => request(`/api/files/projects/${projectId}/files/${fileId}`, { method: "DELETE" }),
    docs: {
      list: (projectId, params = {}) => request(`/api/files/projects/${projectId}/docs${buildQueryString(params)}`),
      get: (projectId, documentId) => request(`/api/files/projects/${projectId}/docs/${documentId}`),
      create: (projectId, payload) => request(`/api/files/projects/${projectId}/docs`, { method: "POST", body: JSON.stringify(payload) }),
      update: (projectId, documentId, payload) => request(`/api/files/projects/${projectId}/docs/${documentId}`, { method: "PATCH", body: JSON.stringify(payload) }),
      delete: (projectId, documentId) => request(`/api/files/projects/${projectId}/docs/${documentId}`, { method: "DELETE" })
    }
  },
  dashboard: {
    summary: () => request("/api/dashboard/summary")
  }
};

// --- Mock API helpers for frontend-only features ---
import * as mockAi from "./mock/ai";
import * as mockGithub from "./mock/github";
import * as mockTasks from "./mock/tasks";
import * as mockAnalytics from "./mock/analytics";
import * as mockDeployments from "./mock/deployments";
import * as mockDomains from "./mock/domains";
import { mockProjects } from "./dashboard-data";

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
    tasks: (projectId) => {
      // Try direct lookup by key (slug-like)
      if (mockTasks.projectTasks && mockTasks.projectTasks[projectId]) return withDelay(mockTasks.projectTasks[projectId], 300);
      // Try resolving from mockProjects by _id or slug
      const proj = mockProjects.find((p) => p._id === projectId || p.slug === projectId);
      if (proj && mockTasks.projectTasks && mockTasks.projectTasks[proj.slug]) return withDelay(mockTasks.projectTasks[proj.slug], 300);
      // Fallbacks
      return withDelay((mockTasks.projectTasks && (mockTasks.projectTasks.mediqueue || mockTasks.projectTasks["devflow-ai"])) || [], 300);
    },
    analytics: (projectId) => {
      if (mockAnalytics.projectAnalytics && mockAnalytics.projectAnalytics[projectId]) return withDelay(mockAnalytics.projectAnalytics[projectId], 400);
      const proj = mockProjects.find((p) => p._id === projectId || p.slug === projectId);
      if (proj && mockAnalytics.projectAnalytics && mockAnalytics.projectAnalytics[proj.slug]) return withDelay(mockAnalytics.projectAnalytics[proj.slug], 400);
      return withDelay(null, 400);
    }
  },
  deployments: {
    list: () => withDelay(mockDeployments.deployments, 300),
    get: (id) => withDelay(mockDeployments.deploymentDetails[id] || null, 400)
  },
  domains: {
    list: () => withDelay(mockDomains.domains, 300)
  }
};
