import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AIExecution } from "../models/AIExecution.js";
import mongoose from "mongoose";

// ─── History ────────────────────────────────────────────────────────────────

export const listHistory = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { page, limit, search, tool, provider, model, status, projectId, from, to, sort } = req.query;

  const filter = { owner };
  if (tool) filter.tool = tool;
  if (provider) filter.provider = provider;
  if (model) filter.model = model;
  if (status) filter.status = status;
  if (projectId) filter.project = new mongoose.Types.ObjectId(projectId);
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    filter.$or = [
      { tool: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { model: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      { provider: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;
  const sortDir = sort === "asc" ? 1 : -1;

  const [executions, total] = await Promise.all([
    AIExecution.find(filter)
      .sort({ createdAt: sortDir })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    AIExecution.countDocuments(filter)
  ]);

  res.status(200).json(new ApiResponse(200, {
    executions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  }, "AI history fetched"));
});

export const getHistoryItem = asyncHandler(async (req, res) => {
  const execution = await AIExecution.findOne({ _id: req.params.id, owner: req.user._id }).select("-__v").lean();
  if (!execution) throw new ApiError(404, "AI execution record not found");
  res.status(200).json(new ApiResponse(200, { execution }, "AI execution fetched"));
});

export const deleteHistoryItem = asyncHandler(async (req, res) => {
  const execution = await AIExecution.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!execution) throw new ApiError(404, "AI execution record not found");
  // Do NOT delete associated conversations or messages
  res.status(200).json(new ApiResponse(200, {}, "AI execution record deleted"));
});

// ─── Usage ───────────────────────────────────────────────────────────────────

function buildDateFilter(from, to) {
  if (!from && !to) return {};
  const f = {};
  if (from) f.$gte = new Date(from);
  if (to) f.$lte = new Date(to);
  return { createdAt: f };
}

export const getUsageSummary = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { from, to, projectId } = req.query;
  const match = { owner, ...buildDateFilter(from, to) };
  if (projectId) match.project = new mongoose.Types.ObjectId(projectId);

  const [agg] = await AIExecution.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
        inputTokens: { $sum: { $ifNull: ["$inputTokens", 0] } },
        outputTokens: { $sum: { $ifNull: ["$outputTokens", 0] } },
        totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } },
        hasAnyTokens: { $sum: { $cond: [{ $eq: ["$usageSource", "provider"] }, 1, 0] } },
        avgDurationMs: { $avg: "$requestDurationMs" }
      }
    }
  ]);

  const toolAgg = await AIExecution.aggregate([
    { $match: match },
    { $group: { _id: "$tool", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  const modelAgg = await AIExecution.aggregate([
    { $match: { ...match, model: { $ne: null } } },
    { $group: { _id: "$model", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  const summary = agg || { total: 0, completed: 0, failed: 0, cancelled: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0, hasAnyTokens: 0, avgDurationMs: null };

  res.status(200).json(new ApiResponse(200, {
    total: summary.total,
    completed: summary.completed,
    failed: summary.failed,
    cancelled: summary.cancelled,
    inputTokens: summary.hasAnyTokens > 0 ? summary.inputTokens : null,
    outputTokens: summary.hasAnyTokens > 0 ? summary.outputTokens : null,
    totalTokens: summary.hasAnyTokens > 0 ? summary.totalTokens : null,
    tokensAvailable: summary.hasAnyTokens > 0,
    avgRequestDurationMs: summary.avgDurationMs ? Math.round(summary.avgDurationMs) : null,
    mostUsedTool: toolAgg[0]?._id || null,
    mostUsedModel: modelAgg[0]?._id || null
  }, "AI usage summary fetched"));
});

export const getUsageTimeseries = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { from, to, interval, projectId } = req.query;
  const match = { owner, ...buildDateFilter(from, to) };
  if (projectId) match.project = new mongoose.Types.ObjectId(projectId);

  const groupId = interval === "month"
    ? { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }
    : interval === "week"
    ? { year: { $isoWeekYear: "$createdAt" }, week: { $isoWeek: "$createdAt" } }
    : { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };

  const rows = await AIExecution.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
  ]);

  res.status(200).json(new ApiResponse(200, { timeseries: rows, interval }, "AI usage timeseries fetched"));
});

export const getUsageByTool = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { from, to, projectId } = req.query;
  const match = { owner, ...buildDateFilter(from, to) };
  if (projectId) match.project = new mongoose.Types.ObjectId(projectId);

  const rows = await AIExecution.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$tool",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } },
        avgDurationMs: { $avg: "$requestDurationMs" }
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json(new ApiResponse(200, { byTool: rows }, "AI usage by tool fetched"));
});

export const getUsageByModel = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { from, to } = req.query;
  const match = { owner, model: { $ne: null }, ...buildDateFilter(from, to) };

  const rows = await AIExecution.aggregate([
    { $match: match },
    {
      $group: {
        _id: { provider: "$provider", model: "$model" },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } },
        avgDurationMs: { $avg: "$requestDurationMs" }
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json(new ApiResponse(200, { byModel: rows }, "AI usage by model fetched"));
});

export const getUsageByProject = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { from, to } = req.query;
  const match = { owner, project: { $ne: null }, ...buildDateFilter(from, to) };

  const rows = await AIExecution.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$project",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        totalTokens: { $sum: { $ifNull: ["$totalTokens", 0] } }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 50 }
  ]);

  res.status(200).json(new ApiResponse(200, { byProject: rows }, "AI usage by project fetched"));
});
