import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import APIKey from "../models/APIKey.js";
import Integration from "../models/Integration.js";
import { apiKeyService } from "../services/api-key.service.js";
import { integrationService } from "../services/integration.service.js";
import { User } from "../models/index.js";

let mongoServer;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const user = await User.create({
    email: "test@example.com",
    password: "hashed_password",
    isEmailVerified: true
  });
  testUserId = user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("API Key Service", () => {
  it("should create an API key with secure hashing", async () => {
    const result = await apiKeyService.createKey(testUserId, {
      name: "Test Key",
      environment: "test",
      permissions: ["projects:read", "ai:read"]
    });

    expect(result.plainKey).toBeDefined();
    expect(result.plainKey).toMatch(/^df_test_/);
    expect(result.name).toBe("Test Key");
    expect(result.environment).toBe("test");
    expect(result.permissions).toContain("projects:read");

    const stored = await APIKey.findById(result.id);
    expect(stored.keyHash).toBeDefined();
    expect(stored.keyHash).not.toBe(result.plainKey);
  });

  it("should list API keys for a user", async () => {
    await apiKeyService.createKey(testUserId, {
      name: "Key 1",
      environment: "test"
    });

    await apiKeyService.createKey(testUserId, {
      name: "Key 2",
      environment: "live"
    });

    const keys = await apiKeyService.listKeys(testUserId);
    expect(keys.length).toBe(2);
    expect(keys[0].name).toBeDefined();
    expect(keys[0].key).toMatch(/^df_/);
    expect(keys[0].key).toMatch(/••••••••••••/);
  });

  it("should validate and use an API key", async () => {
    const created = await apiKeyService.createKey(testUserId, {
      name: "Validation Test",
      environment: "test"
    });

    const validated = await apiKeyService.validateAndUseKey(created.plainKey);
    expect(validated.userId.toString()).toBe(testUserId.toString());
    expect(validated.permissions).toBeDefined();

    const updated = await APIKey.findById(created.id);
    expect(updated.usageCount).toBe(1);
    expect(updated.lastUsedAt).toBeDefined();
  });

  it("should reject invalid API keys", async () => {
    try {
      await apiKeyService.validateAndUseKey("invalid_key");
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("Invalid API key");
    }
  });

  it("should revoke API keys", async () => {
    const created = await apiKeyService.createKey(testUserId, {
      name: "Revoke Test",
      environment: "test"
    });

    await apiKeyService.revokeKey(testUserId, created.id);

    const revoked = await APIKey.findById(created.id);
    expect(revoked.status).toBe("revoked");
    expect(revoked.revokedAt).toBeDefined();
  });

  it("should expire API keys", async () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - 1);

    const created = await apiKeyService.createKey(testUserId, {
      name: "Expired Key",
      environment: "test",
      expiresAt: expiryDate.toISOString()
    });

    try {
      await apiKeyService.validateAndUseKey(created.plainKey);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("expired");
    }
  });
});

describe("Integration Service", () => {
  it("should return integration catalog", async () => {
    const catalog = await integrationService.getCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog[0].name).toBeDefined();
    expect(catalog[0].provider).toBeDefined();
    expect(catalog[0].category).toBeDefined();
  });

  it("should create an integration", async () => {
    const integration = await integrationService.createIntegration(
      testUserId,
      "github",
      {
        credentials: { token: "test_token" },
        scopes: ["repo", "user"],
        externalAccountId: "github_123",
        externalAccountName: "testuser"
      }
    );

    expect(integration.provider).toBe("github");
    expect(integration.status).toBe("connected");
    expect(integration.externalAccountName).toBe("testuser");
    expect(integration.encryptedCredentials).toBeUndefined();
  });

  it("should prevent duplicate integrations", async () => {
    await integrationService.createIntegration(testUserId, "slack", {
      credentials: { token: "slack_token" }
    });

    try {
      await integrationService.createIntegration(testUserId, "slack", {
        credentials: { token: "another_token" }
      });
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toContain("already exists");
    }
  });

  it("should list user integrations", async () => {
    await integrationService.createIntegration(testUserId, "discord", {
      credentials: { token: "discord_token" }
    });

    const integrations = await integrationService.listIntegrations(testUserId);
    expect(integrations.length).toBeGreaterThan(0);
    expect(integrations[0].provider).toBeDefined();
    expect(integrations[0].encryptedCredentials).toBeUndefined();
  });

  it("should disconnect integrations", async () => {
    const integration = await integrationService.createIntegration(
      testUserId,
      "vercel",
      { credentials: { token: "vercel_token" } }
    );

    await integrationService.disconnectIntegration(testUserId, "vercel");

    const disconnected = await Integration.findById(integration._id);
    expect(disconnected.status).toBe("disconnected");
    expect(disconnected.encryptedCredentials).toBeNull();
  });

  it("should encrypt and decrypt credentials", async () => {
    const testCreds = { apiKey: "secret123", token: "token456" };

    const integration = await integrationService.createIntegration(
      testUserId,
      "openai",
      { credentials: testCreds }
    );

    const withCreds = await integrationService.getIntegrationWithCredentials(
      testUserId,
      "openai"
    );

    expect(withCreds.credentials).toBeDefined();
    expect(withCreds.credentials.apiKey).toBe("secret123");
  });
});
