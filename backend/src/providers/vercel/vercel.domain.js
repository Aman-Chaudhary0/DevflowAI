import { DeploymentProvider } from "../deployment-provider.interface.js";
import { VercelClient } from "./vercel.client.js";

function mapDnsStatus(configured, acceptedChallenges) {
  if (configured === true) return "configured";
  if (configured === false && acceptedChallenges === false) return "misconfigured";
  return "pending";
}

function mapSslStatus(value) {
  const state = String(value || "").toLowerCase();
  if (["valid", "issued", "ready"].includes(state)) return "issued";
  if (["failed", "error", "invalid"].includes(state)) return "failed";
  if (["pending", "initializing", "provisioning"].includes(state)) return "pending";
  return "unknown";
}

function recordsFromConfig(config) {
  if (!Array.isArray(config)) return [];
  return config.map((entry) => ({
    type: String(entry.type || ""),
    name: String(entry.name || ""),
    value: String(entry.value || ""),
    reason: String(entry.reason || "")
  }));
}

export class VercelDomainProvider extends DeploymentProvider {
  constructor(options = {}) {
    super();
    this.client = options.client || new VercelClient(options);
  }

  async addDomain(payload = {}) {
    const response = await this.client.request("POST", `/v10/projects/${encodeURIComponent(payload.providerProjectId)}/domains`, {
      body: {
        name: payload.domain,
        ...(payload.environment ? { gitBranch: payload.environment === "production" ? undefined : payload.environment } : {})
      }
    });

    return {
      providerDomainId: response?.name || payload.domain,
      domain: response?.name || payload.domain,
      dnsStatus: mapDnsStatus(response?.configured, response?.acceptedChallenges),
      verificationStatus: response?.verified ? "verified" : "pending",
      sslStatus: mapSslStatus(response?.certStatus),
      verificationRecords: recordsFromConfig(response?.verification || response?.config),
      raw: response
    };
  }

  async removeDomain(payload = {}) {
    await this.client.request("DELETE", `/v9/projects/${encodeURIComponent(payload.providerProjectId)}/domains/${encodeURIComponent(payload.domain)}`);
    return { removed: true };
  }

  async verifyDomain(payload = {}) {
    const response = await this.client.request("POST", `/v9/projects/${encodeURIComponent(payload.providerProjectId)}/domains/${encodeURIComponent(payload.domain)}/verify`);
    return {
      dnsStatus: mapDnsStatus(response?.configured, response?.acceptedChallenges),
      verificationStatus: response?.verified ? "verified" : response?.error ? "failed" : "pending",
      sslStatus: mapSslStatus(response?.certStatus),
      verificationRecords: recordsFromConfig(response?.verification || response?.config),
      raw: response
    };
  }

  async getDomainConfiguration(payload = {}) {
    const config = await this.client.request("GET", `/v6/domains/${encodeURIComponent(payload.domain)}/config`);
    const details = await this.client.request("GET", `/v9/projects/${encodeURIComponent(payload.providerProjectId)}/domains/${encodeURIComponent(payload.domain)}`);

    return {
      dnsStatus: mapDnsStatus(config?.configured, details?.acceptedChallenges),
      verificationStatus: details?.verified ? "verified" : "pending",
      sslStatus: mapSslStatus(details?.certStatus),
      verificationRecords: recordsFromConfig(config?.misconfigured ? config?.suggestedConfig : config?.configuredBy ? [] : config?.config || []),
      raw: { config, details }
    };
  }
}
