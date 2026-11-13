import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Subscription from "../models/Subscription.js";
import AIExecution from "../models/AIExecution.js";
import Activity from "../models/Activity.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Admin service for platform-wide statistics and management
 */

export async function getAdminOverview() {
  const [totalUsers, activeUsers, totalWorkspaces, totalProjects, totalSubscriptions, aiRequestsToday] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    Workspace.countDocuments(),
    Project.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    AIExecution.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: "completed"
    })
  ]);

  return {
    totalUsers,
    activeUsers,
    totalWorkspaces,
    totalProjects,
    totalSubscriptions,
    aiRequestsToday
  };
}

export async function listAdminUsers(filters = {}) {
  const { page = 1, limit = 20, search = "", status = "all" } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (status === "verified") query.isVerified = true;
  if (status === "unverified") query.isVerified = false;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("_id name email avatar role isVerified provider createdAt updatedAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getAdminUserDetail(userId) {
  const user = await User.findById(userId)
    .select("_id name email avatar role isVerified provider createdAt updatedAt")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  const workspaceCount = await Workspace.countDocuments({ owner: userId });
  const projectCount = await Project.countDocuments({ owner: userId });

  return {
    ...user,
    workspaceCount,
    projectCount
  };
}

export async function getAdminAIUsage(filters = {}) {
  const { from, to, tool = null } = filters;

  const query = { status: "completed" };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (tool) query.tool = tool;

  const [totalRequests, totalTokens, byTool, byModel] = await Promise.all([
    AIExecution.countDocuments(query),
    AIExecution.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: { $add: ["$inputTokens", "$outputTokens"] } }
        }
      }
    ]),
    AIExecution.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$tool",
          count: { $sum: 1 },
          tokens: { $sum: { $add: ["$inputTokens", "$outputTokens"] } }
        }
      }
    ]),
    AIExecution.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$model",
          count: { $sum: 1 },
          tokens: { $sum: { $add: ["$inputTokens", "$outputTokens"] } }
        }
      }
    ])
  ]);

  return {
    totalRequests,
    totalTokens: totalTokens[0]?.total || 0,
    byTool,
    byModel
  };
}

export async function getAdminSubscriptions(filters = {}) {
  const { page = 1, limit = 20, status = "all" } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (status !== "all") query.status = status;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate("workspace", "_id name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Subscription.countDocuments(query)
  ]);

  return {
    subscriptions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getAdminReports(filters = {}) {
  const { from, to } = filters;

  const dateQuery = {};
  if (from || to) {
    dateQuery.createdAt = {};
    if (from) dateQuery.createdAt.$gte = new Date(from);
    if (to) dateQuery.createdAt.$lte = new Date(to);
  }

  const [userGrowth, workspaceGrowth, subscriptionDistribution, aiUsage] = await Promise.all([
    User.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Workspace.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Subscription.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 }
        }
      }
    ]),
    AIExecution.aggregate([
      { $match: { ...dateQuery, status: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          requests: { $sum: 1 },
          tokens: { $sum: { $add: ["$inputTokens", "$outputTokens"] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  return {
    userGrowth,
    workspaceGrowth,
    subscriptionDistribution,
    aiUsage
  };
}

export async function getAdminAuditLogs(filters = {}) {
  const { page = 1, limit = 20, actor = null, action = null } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (actor) query.actor = actor;
  if (action) query.action = { $regex: action, $options: "i" };

  const [logs, total] = await Promise.all([
    Activity.find(query)
      .populate("actor", "_id name email")
      .populate("workspace", "_id name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Activity.countDocuments(query)
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function suspendUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: "user", isVerified: false },
    { new: true }
  ).select("_id name email role isVerified");

  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export async function activateUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true }
  ).select("_id name email role isVerified");

  if (!user) throw new ApiError(404, "User not found");
  return user;
}
