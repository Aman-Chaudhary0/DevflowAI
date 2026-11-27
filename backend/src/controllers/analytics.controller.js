import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAnalyticsLeaderboardForUser, getAnalyticsSummaryForUser } from "../services/analytics.service.js";

export const analyticsSummary = asyncHandler(async (req, res) => {
  const summary = await getAnalyticsSummaryForUser(req.user, req.query);
  res.status(200).json(new ApiResponse(200, summary, "Analytics summary fetched successfully"));
});

export const analyticsLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await getAnalyticsLeaderboardForUser(req.user, req.query);
  res.status(200).json(new ApiResponse(200, { members: leaderboard }, "Analytics leaderboard fetched successfully"));
});
