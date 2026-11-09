import Integration from "../models/Integration.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || "0".repeat(64);

function encryptCredentials(credentials) {
  if (!credentials) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(JSON.stringify(credentials), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decryptCredentials(encryptedData) {
  if (!encryptedData) return null;
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

export const integrationService = {
  async getCatalog() {
    return [
      {
        name: "GitHub",
        provider: "github",
        category: "Development",
        description: "Sync repositories, commits, branches, issues and pull requests.",
        icon: "github"
      },
      {
        name: "Slack",
        provider: "slack",
        category: "Communication",
        description: "Send workspace notifications to Slack.",
        icon: "slack"
      },
      {
        name: "Discord",
        provider: "discord",
        category: "Communication",
        description: "Push development activity into Discord channels.",
        icon: "discord"
      },
      {
        name: "Vercel",
        provider: "vercel",
        category: "Deployment",
        description: "Connect deployments and project environments.",
        icon: "vercel"
      },
      {
        name: "OpenAI",
        provider: "openai",
        category: "AI",
        description: "Power AI workflows with OpenAI models.",
        icon: "openai"
      },
      {
        name: "Gemini",
        provider: "gemini",
        category: "AI",
        description: "Use Gemini models in AI-assisted workflows.",
        icon: "gemini"
      },
      {
        name: "Google",
        provider: "google",
        category: "Productivity",
        description: "Connect Google authentication and workspace services.",
        icon: "google"
      },
      {
        name: "ImageKit",
        provider: "imagekit",
        category: "Storage",
        description: "Manage media assets alongside projects.",
        icon: "imagekit"
      },
      {
        name: "Docker",
        provider: "docker",
        category: "Development",
        description: "Connect images and container build activity.",
        icon: "docker"
      },
      {
        name: "MongoDB",
        provider: "mongodb",
        category: "Storage",
        description: "View database health and project data context.",
        icon: "mongodb"
      },
      {
        name: "Redis",
        provider: "redis",
        category: "Storage",
        description: "Monitor cache and queue operations.",
        icon: "redis"
      },
      {
        name: "Figma",
        provider: "figma",
        category: "Productivity",
        description: "Bring design context into delivery workflows.",
        icon: "figma"
      }
    ];
  },

  async listIntegrations(userId, filters = {}) {
    const query = { owner: userId };

    if (filters.provider) {
      query.provider = filters.provider;
    }

    const integrations = await Integration.find(query)
      .select("-encryptedCredentials")
      .sort({ createdAt: -1 })
      .lean();

    return integrations;
  },

  async getIntegration(userId, provider) {
    const integration = await Integration.findOne({
      owner: userId,
      provider
    }).select("-encryptedCredentials");

    if (!integration) {
      return null;
    }

    return integration.toObject();
  },

  async getIntegrationWithCredentials(userId, provider) {
    const integration = await Integration.findOne({
      owner: userId,
      provider
    });

    if (!integration) {
      return null;
    }

    const credentials = decryptCredentials(integration.encryptedCredentials);

    return {
      ...integration.toObject(),
      credentials
    };
  },

  async createIntegration(userId, provider, payload) {
    const { credentials, scopes, externalAccountId, externalAccountName, settings } = payload;

    const existing = await Integration.findOne({
      owner: userId,
      provider
    });

    if (existing) {
      throw new ApiError(409, `${provider} integration already exists`);
    }

    const encryptedCreds = encryptCredentials(credentials);

    const integration = new Integration({
      owner: userId,
      provider,
      status: "connected",
      encryptedCredentials: encryptedCreds,
      scopes: scopes || [],
      externalAccountId,
      externalAccountName,
      connectedAt: new Date(),
      settings: settings || {},
      metadata: {}
    });

    await integration.save();

    return {
      ...integration.toObject(),
      encryptedCredentials: undefined
    };
  },

  async updateIntegration(userId, provider, payload) {
    const { credentials, settings, scopes } = payload;

    const integration = await Integration.findOne({
      owner: userId,
      provider
    });

    if (!integration) {
      throw new ApiError(404, "Integration not found");
    }

    if (credentials) {
      integration.encryptedCredentials = encryptCredentials(credentials);
    }

    if (settings) {
      integration.settings = { ...integration.settings, ...settings };
    }

    if (scopes) {
      integration.scopes = scopes;
    }

    integration.lastSyncedAt = new Date();
    await integration.save();

    return {
      ...integration.toObject(),
      encryptedCredentials: undefined
    };
  },

  async disconnectIntegration(userId, provider) {
    const integration = await Integration.findOne({
      owner: userId,
      provider
    });

    if (!integration) {
      throw new ApiError(404, "Integration not found");
    }

    integration.status = "disconnected";
    integration.encryptedCredentials = null;
    await integration.save();

    return { success: true };
  },

  async setIntegrationError(userId, provider, error) {
    const integration = await Integration.findOne({
      owner: userId,
      provider
    });

    if (!integration) {
      return;
    }

    integration.status = "error";
    integration.lastError = error;
    await integration.save();
  }
};
