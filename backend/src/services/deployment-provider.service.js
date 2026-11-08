import { ProviderConfigurationError, ProviderRequestError } from "../providers/deployment-provider.interface.js";
import { VercelDeploymentProvider } from "../providers/vercel/vercel.deployment.js";
import { VercelDomainProvider } from "../providers/vercel/vercel.domain.js";

export { ProviderConfigurationError, ProviderRequestError };

function providerName() {
  return String(process.env.DEPLOYMENT_PROVIDER || "vercel").trim().toLowerCase();
}

export function getDeploymentProvider() {
  const provider = providerName();
  if (provider === "vercel") {
    return new VercelDeploymentProvider();
  }
  throw new ProviderConfigurationError(`Unsupported deployment provider: ${provider}`);
}

export function getDomainProvider() {
  const provider = providerName();
  if (provider === "vercel") {
    return new VercelDomainProvider();
  }
  throw new ProviderConfigurationError(`Unsupported deployment provider: ${provider}`);
}

export function getProviderName() {
  return providerName();
}
