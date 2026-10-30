import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { runAITool } from "../services/ai-tools.service.js";

export const postAITool = (tool) => asyncHandler(async (req, res) => {
  const controller = new AbortController();
  req.on("aborted", () => controller.abort());
  res.on("close", () => { if (!res.writableEnded) controller.abort(); });
  try {
    const output = await runAITool(tool, req.body, req.user._id, controller.signal);
    res.status(200).json(new ApiResponse(200, output, "AI tool completed"));
  } catch (error) {
    if (controller.signal.aborted) return;
    throw error;
  }
});
