import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createDomainForUser,
  getDomainForUser,
  listDomainsForUser,
  removeDomainForUser,
  verifyDomainForUser
} from "../services/domain.service.js";

export const createDomain = asyncHandler(async (req, res) => {
  const result = await createDomainForUser(req.user, req.body || {});
  res.status(201).json(new ApiResponse(201, result, "Domain created successfully"));
});

export const listDomains = asyncHandler(async (req, res) => {
  const result = await listDomainsForUser(req.user._id, req.query || {});
  res.status(200).json(new ApiResponse(200, result, "Domains fetched successfully"));
});

export const getDomain = asyncHandler(async (req, res) => {
  const result = await getDomainForUser(req.user._id, req.params.domainId);
  res.status(200).json(new ApiResponse(200, result, "Domain fetched successfully"));
});

export const verifyDomain = asyncHandler(async (req, res) => {
  const result = await verifyDomainForUser(req.user._id, req.params.domainId);
  res.status(200).json(new ApiResponse(200, result, "Domain verification refreshed successfully"));
});

export const deleteDomain = asyncHandler(async (req, res) => {
  const result = await removeDomainForUser(req.user._id, req.params.domainId);
  res.status(200).json(new ApiResponse(200, result, "Domain removed successfully"));
});
