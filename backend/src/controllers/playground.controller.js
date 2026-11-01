import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as playgroundService from "../services/playground.service.js";

export const listPlaygrounds = asyncHandler(async (req, res) => {
  const result = await playgroundService.listPlaygrounds(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, "Playgrounds retrieved"));
});

export const getPlayground = asyncHandler(async (req, res) => {
  const playground = await playgroundService.getPlayground(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, { playground }, "Playground retrieved"));
});

export const createPlayground = asyncHandler(async (req, res) => {
  const playground = await playgroundService.createPlayground(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, { playground }, "Playground created"));
});

export const updatePlayground = asyncHandler(async (req, res) => {
  const playground = await playgroundService.updatePlayground(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { playground }, "Playground updated"));
});

export const deletePlayground = asyncHandler(async (req, res) => {
  const result = await playgroundService.deletePlayground(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, "Playground deleted"));
});
