import crypto from "crypto";
import mongoose from "mongoose";
import APIKey from "../models/APIKey.js";
import { ApiError } from "../utils/ApiError.js";

const PEPPER = process.env.API_KEY_HASH_PEPPER || "default-pepper-change-in-production";

function generateApiKey(environment) {
  const prefix = environment === "live" ? "df_live" : "df_test";
  const randomBytes = crypto.randomBytes(24).toString("hex");
  return `${prefix}_${randomBytes}`;
}

function hashApiKey(key) {
  return crypto
    .createHash("sha256")
    .update(key + PEPPER)
    .digest("hex");
}

function getKeyLastFour(key) {
  return key.slice(-4);
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const apiKeyService = {
  async createKey(userId, payload) {
    const { name, environment, permissions, expiresAt } = payload;

    if (!name || !environment) {
      throw new ApiError(400, "Name and environment are required");
    }

    if (!["test", "live"].includes(environment)) {
      throw new ApiError(400, "Environment must be 'test' or 'live'");
    }

    const plainKey = generateApiKey(environment);
    const keyHash = hashApiKey(plainKey);
    const keyLastFour = getKeyLastFour(plainKey);
    const keyPrefix = environment === "live" ? "df_live" : "df_test";

    const apiKey = new APIKey({
      owner: userId,
      name,
      keyPrefix,
      keyHash,
      keyLastFour,
      environment,
      permissions: permissions || [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: "active"
    });

    await apiKey.save();

    return {
      id: apiKey._id,
      name: apiKey.name,
      plainKey,
      environment: apiKey.environment,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt
    };
  },

  async listKeys(userId, filters = {}) {
    const query = { owner: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const keys = await APIKey.find(query)
      .select("-keyHash")
      .sort({ createdAt: -1 })
      .lean();

    return keys.map((key) => ({
      ...key,
      key: `${key.keyPrefix}_••••••••••••${key.keyLastFour}`
    }));
  },

  async getKey(userId, keyId) {
    if (!isValidObjectId(keyId)) {
      throw new ApiError(400, "Invalid resource ID");
    }

    const key = await APIKey.findOne({
      _id: keyId,
      owner: userId
    }).select("-keyHash");

    if (!key) {
      throw new ApiError(404, "API key not found");
    }

    return {
      ...key.toObject(),
      key: `${key.keyPrefix}_••••••••••••${key.keyLastFour}`
    };
  },

  async updateKey(userId, keyId, payload) {
    if (!isValidObjectId(keyId)) {
      throw new ApiError(400, "Invalid resource ID");
    }

    const { name, expiresAt } = payload;

    const key = await APIKey.findOne({
      _id: keyId,
      owner: userId
    });

    if (!key) {
      throw new ApiError(404, "API key not found");
    }

    if (name) {
      key.name = name;
    }

    if (expiresAt !== undefined) {
      key.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await key.save();

    return {
      ...key.toObject(),
      key: `${key.keyPrefix}_••••••••••••${key.keyLastFour}`
    };
  },

  async revokeKey(userId, keyId) {
    if (!isValidObjectId(keyId)) {
      throw new ApiError(400, "Invalid resource ID");
    }

    const key = await APIKey.findOne({
      _id: keyId,
      owner: userId
    });

    if (!key) {
      throw new ApiError(404, "API key not found");
    }

    key.status = "revoked";
    key.revokedAt = new Date();
    await key.save();

    return { success: true };
  },

  async getKeyUsage(userId, keyId) {
    if (!isValidObjectId(keyId)) {
      throw new ApiError(400, "Invalid resource ID");
    }

    const key = await APIKey.findOne({
      _id: keyId,
      owner: userId
    }).select("usageCount lastUsedAt createdAt");

    if (!key) {
      throw new ApiError(404, "API key not found");
    }

    return {
      usageCount: key.usageCount,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt
    };
  },

  async validateAndUseKey(plainKey) {
    const keyHash = hashApiKey(plainKey);

    const key = await APIKey.findOne({
      keyHash,
      status: "active"
    });

    if (!key) {
      throw new ApiError(401, "Invalid API key");
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      key.status = "expired";
      await key.save();
      throw new ApiError(401, "API key has expired");
    }

    key.usageCount += 1;
    key.lastUsedAt = new Date();
    await key.save();

    return {
      userId: key.owner,
      permissions: key.permissions,
      environment: key.environment
    };
  }
};
