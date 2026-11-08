import { ProviderConfigurationError, ProviderRequestError } from "../deployment-provider.interface.js";

const VERCEL_API_BASE = "https://api.vercel.com";

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

export class VercelClient {
  constructor(options = {}) {
    const token = options.token || process.env.VERCEL_ACCESS_TOKEN || "";
    this.token = String(token).trim();
    this.teamId = String(options.teamId || process.env.VERCEL_TEAM_ID || "").trim();
    this.baseUrl = trimSlash(options.baseUrl || VERCEL_API_BASE);

    if (!this.token) {
      throw new ProviderConfigurationError("Vercel integration is not configured. Set VERCEL_ACCESS_TOKEN on the backend.");
    }
  }

  headers(extra = {}) {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      ...extra
    };
  }

  withTeam(query = {}) {
    const next = { ...(query || {}) };
    if (this.teamId) next.teamId = this.teamId;
    return next;
  }

  async request(method, path, options = {}) {
    const query = this.withTeam(options.query || {});
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      search.set(key, String(value));
    }

    const url = `${this.baseUrl}${path}${search.toString() ? `?${search.toString()}` : ""}`;
    let response;
    try {
      response = await fetch(url, {
        method,
        headers: this.headers(options.headers || {}),
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined
      });
    } catch (error) {
      throw new ProviderRequestError("Vercel request failed", { retryable: true, details: { reason: error?.message || "network error" } });
    }

    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const providerMessage = payload?.error?.message || payload?.message || `Vercel request failed with status ${response.status}`;
      const rateLimited = response.status === 429;
      const authOrConfig = response.status === 401 || response.status === 403 || response.status === 400;
      throw new ProviderRequestError(providerMessage, {
        statusCode: response.status,
        retryable: rateLimited || response.status >= 500,
        permanent: authOrConfig,
        details: payload
      });
    }

    return payload || {};
  }
}
