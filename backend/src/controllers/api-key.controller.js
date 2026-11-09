import { apiKeyService } from "../services/api-key.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createApiKey = asyncHandler(async (req, res) => {
  const { name, environment, permissions, expiresAt } = req.body;

  const result = await apiKeyService.createKey(req.user._id, {
    name,
    environment,
    permissions,
    expiresAt
  });

  res.status(201).json(
    new ApiResponse(201, result, "API key created successfully")
  );
});

export const listApiKeys = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const keys = await apiKeyService.listKeys(req.user._id, { status });

  res.status(200).json(
    new ApiResponse(200, keys, "API keys retrieved successfully")
  );
});

export const getApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const key = await apiKeyService.getKey(req.user._id, id);

  res.status(200).json(
    new ApiResponse(200, key, "API key retrieved successfully")
  );
});

export const updateApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, expiresAt } = req.body;

  const key = await apiKeyService.updateKey(req.user._id, id, {
    name,
    expiresAt
  });

  res.status(200).json(
    new ApiResponse(200, key, "API key updated successfully")
  );
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await apiKeyService.revokeKey(req.user._id, id);

  res.status(200).json(
    new ApiResponse(200, { success: true }, "API key revoked successfully")
  );
});

export const getApiKeyUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usage = await apiKeyService.getKeyUsage(req.user._id, id);

  res.status(200).json(
    new ApiResponse(200, usage, "API key usage retrieved successfully")
  );
});
