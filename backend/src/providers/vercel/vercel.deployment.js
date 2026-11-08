import { DeploymentProvider, ProviderRequestError } from "../deployment-provider.interface.js";
import { VercelClient } from "./vercel.client.js";

function toStatus(value) {
  const state = String(value || "").toLowerCase();
  if (["queued", "pending"].includes(state)) return "queued";
  if (["initializing"].includes(state)) return "initializing";
  if (["building"].includes(state)) return "building";
  if (["deploying"].includes(state)) return "deploying";
  if (["ready", "live"].includes(state)) return "ready";
  if (["canceled", "cancelled"].includes(state)) return "cancelled";
  if (["error", "failed"].includes(state)) return "failed";
  return "initializing";
}

function toLogLines(events = []) {
  return events
    .map((event) => {
      const message = event?.text || event?.payload?.text || event?.name || "";
      if (!message) return null;
      return {
        timestamp: event?.createdAt ? new Date(event.createdAt) : new Date(),
        level: event?.type === "error" ? "error" : "info",
        source: "provider",
        message: String(message)
      };
    })
    .filter(Boolean);
}

export class VercelDeploymentProvider extends DeploymentProvider {
  constructor(options = {}) {
    super();
    this.client = options.client || new VercelClient(options);
  }

  async createDeployment(payload = {}) {
    const repository = String(payload.repository || "").trim();
    const branch = String(payload.branch || "").trim();
    const environment = String(payload.environment || "preview").toLowerCase();
    const projectName = String(payload.projectName || "").trim();

    if (!repository || !branch || !projectName) {
      throw new ProviderRequestError("Repository, branch, and project name are required for Vercel deployments", {
        statusCode: 400,
        retryable: false,
        permanent: true
      });
    }

    const body = {
      name: projectName,
      target: environment === "production" ? "production" : "preview",
      gitSource: {
        type: "github",
        repo: repository,
        ref: branch,
        ...(payload.commitSha ? { sha: String(payload.commitSha) } : {})
      },
      ...(payload.projectSettings || {})
    };

    const response = await this.client.request("POST", "/v13/deployments", { body });
    return {
      providerDeploymentId: response.id,
      url: response.url ? `https://${response.url}` : "",
      status: toStatus(response.readyState || response.state),
      raw: response
    };
  }

  async redeploy(payload = {}) {
    return this.createDeployment(payload);
  }

  async getDeployment(providerDeploymentId) {
    const response = await this.client.request("GET", `/v13/deployments/${encodeURIComponent(providerDeploymentId)}`);
    return {
      providerDeploymentId: response.id,
      url: response.url ? `https://${response.url}` : "",
      status: toStatus(response.readyState || response.state),
      startedAt: response.createdAt ? new Date(response.createdAt) : null,
      completedAt: response.ready ? new Date(response.ready) : null,
      raw: response
    };
  }

  async listDeployments(payload = {}) {
    const response = await this.client.request("GET", "/v6/deployments", {
      query: {
        projectId: payload.projectId || undefined,
        limit: payload.limit || 20,
        since: payload.since || undefined
      }
    });

    return {
      deployments: Array.isArray(response.deployments)
        ? response.deployments.map((item) => ({
            providerDeploymentId: item.id,
            url: item.url ? `https://${item.url}` : "",
            status: toStatus(item.readyState || item.state),
            raw: item
          }))
        : []
    };
  }

  async getDeploymentLogs(payload = {}) {
    const deploymentId = encodeURIComponent(payload.providerDeploymentId);
    const response = await this.client.request("GET", `/v2/deployments/${deploymentId}/events`, {
      query: {
        ...(payload.cursor ? { since: payload.cursor } : {})
      }
    });

    const events = Array.isArray(response) ? response : Array.isArray(response.events) ? response.events : [];
    return {
      lines: toLogLines(events),
      cursor: events.length ? String(events[events.length - 1].created || events[events.length - 1].createdAt || "") : payload.cursor || ""
    };
  }

  async cancelDeployment(providerDeploymentId) {
    const response = await this.client.request("PATCH", `/v12/deployments/${encodeURIComponent(providerDeploymentId)}/cancel`);
    return {
      providerDeploymentId: response.id || providerDeploymentId,
      status: toStatus(response.readyState || response.state || "cancelled"),
      raw: response
    };
  }

  async promoteDeployment(providerDeploymentId) {
    const response = await this.client.request("POST", `/v13/deployments/${encodeURIComponent(providerDeploymentId)}/promote`);
    return {
      providerDeploymentId: response.id || providerDeploymentId,
      url: response.url ? `https://${response.url}` : "",
      status: toStatus(response.readyState || response.state || "ready"),
      raw: response
    };
  }
}
