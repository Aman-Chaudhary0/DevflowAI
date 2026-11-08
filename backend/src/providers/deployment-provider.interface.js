export class ProviderConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderConfigurationError";
    this.permanent = true;
  }
}

export class ProviderRequestError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ProviderRequestError";
    this.statusCode = options.statusCode || 502;
    this.retryable = options.retryable !== false;
    this.permanent = options.permanent === true;
    this.details = options.details || null;
  }
}

export class DeploymentProvider {
  async createDeployment(_payload) {
    throw new Error("createDeployment() not implemented");
  }

  async getDeployment(_providerDeploymentId) {
    throw new Error("getDeployment() not implemented");
  }

  async listDeployments(_payload) {
    throw new Error("listDeployments() not implemented");
  }

  async getDeploymentLogs(_payload) {
    throw new Error("getDeploymentLogs() not implemented");
  }

  async redeploy(_payload) {
    throw new Error("redeploy() not implemented");
  }

  async cancelDeployment(_providerDeploymentId) {
    throw new Error("cancelDeployment() not implemented");
  }

  async promoteDeployment(_providerDeploymentId) {
    throw new Error("promoteDeployment() not implemented");
  }

  async addDomain(_payload) {
    throw new Error("addDomain() not implemented");
  }

  async removeDomain(_payload) {
    throw new Error("removeDomain() not implemented");
  }

  async verifyDomain(_payload) {
    throw new Error("verifyDomain() not implemented");
  }

  async getDomainConfiguration(_payload) {
    throw new Error("getDomainConfiguration() not implemented");
  }
}
