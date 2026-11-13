import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { z } from "zod";
import {
  getAdminOverview,
  listAdminUsers,
  getAdminUserDetail,
  getAdminAIUsage,
  getAdminSubscriptions,
  getAdminReports,
  getAdminAuditLogs,
  suspendUser,
  activateUser
} from "../services/admin.service.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const getOverview = asyncHandler(async (req, res) => {
  const overview = await getAdminOverview();
  res.status(200).json(new ApiResponse(200, overview, "Admin overview fetched"));
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, status } = paginationSchema.merge(
    z.object({
      search: z.string().default(""),
      status: z.enum(["all", "verified", "unverified"]).default("all")
    })
  ).parse(req.query);

  const result = await listAdminUsers({ page, limit, search, status });
  res.status(200).json(new ApiResponse(200, result, "Users fetched"));
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const { userId } = z.object({ userId: z.string() }).parse(req.params);
  const user = await getAdminUserDetail(userId);
  res.status(200).json(new ApiResponse(200, user, "User detail fetched"));
});

export const getAIUsage = asyncHandler(async (req, res) => {
  const { from, to, tool } = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    tool: z.string().optional()
  }).parse(req.query);

  const usage = await getAdminAIUsage({ from, to, tool });
  res.status(200).json(new ApiResponse(200, usage, "AI usage fetched"));
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, status } = paginationSchema.merge(
    z.object({
      status: z.enum(["all", "active", "canceled", "past_due"]).default("all")
    })
  ).parse(req.query);

  const result = await getAdminSubscriptions({ page, limit, status });
  res.status(200).json(new ApiResponse(200, result, "Subscriptions fetched"));
});

export const getReports = asyncHandler(async (req, res) => {
  const { from, to } = z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).parse(req.query);

  const reports = await getAdminReports({ from, to });
  res.status(200).json(new ApiResponse(200, reports, "Reports generated"));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, actor, action } = paginationSchema.merge(
    z.object({
      actor: z.string().optional(),
      action: z.string().optional()
    })
  ).parse(req.query);

  const result = await getAdminAuditLogs({ page, limit, actor, action });
  res.status(200).json(new ApiResponse(200, result, "Audit logs fetched"));
});

export const suspendUserAction = asyncHandler(async (req, res) => {
  const { userId } = z.object({ userId: z.string() }).parse(req.params);
  const user = await suspendUser(userId);
  res.status(200).json(new ApiResponse(200, user, "User suspended"));
});

export const activateUserAction = asyncHandler(async (req, res) => {
  const { userId } = z.object({ userId: z.string() }).parse(req.params);
  const user = await activateUser(userId);
  res.status(200).json(new ApiResponse(200, user, "User activated"));
});
