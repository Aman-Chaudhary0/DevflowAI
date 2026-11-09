import { integrationService } from "../services/integration.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCatalog = asyncHandler(async (req, res) => {
  const catalog = await integrationService.getCatalog();
  res.status(200).json(
    new ApiResponse(200, catalog, "Integration catalog retrieved successfully")
  );
});

export const listIntegrations = asyncHandler(async (req, res) => {
  const { provider } = req.query;
  const integrations = await integrationService.listIntegrations(req.user._id, { provider });

  res.status(200).json(
    new ApiResponse(200, integrations, "Integrations retrieved successfully")
  );
});

export const getIntegration = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const integration = await integrationService.getIntegration(req.user._id, provider);

  if (!integration) {
    return res.status(200).json(
      new ApiResponse(200, null, "Integration not connected")
    );
  }

  res.status(200).json(
    new ApiResponse(200, integration, "Integration retrieved successfully")
  );
});

export const createIntegration = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { credentials, scopes, externalAccountId, externalAccountName, settings } = req.body;

  const integration = await integrationService.createIntegration(
    req.user._id,
    provider,
    {
      credentials,
      scopes,
      externalAccountId,
      externalAccountName,
      settings
    }
  );

  res.status(201).json(
    new ApiResponse(201, integration, "Integration created successfully")
  );
});

export const updateIntegration = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { credentials, scopes, settings } = req.body;

  const integration = await integrationService.updateIntegration(
    req.user._id,
    provider,
    {
      credentials,
      scopes,
      settings
    }
  );

  res.status(200).json(
    new ApiResponse(200, integration, "Integration updated successfully")
  );
});

export const disconnectIntegration = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  await integrationService.disconnectIntegration(req.user._id, provider);

  res.status(200).json(
    new ApiResponse(200, { success: true }, "Integration disconnected successfully")
  );
});
