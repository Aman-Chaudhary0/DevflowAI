import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getAnalyticsSummaryForUser } from "../services/analytics.service.js";

export const analyticsSummary = asyncHandler(async (req, res) => {
  const summary = await getAnalyticsSummaryForUser(req.user, req.query);
  res.status(200).json(new ApiResponse(200, summary, "Analytics summary fetched successfully"));
});
