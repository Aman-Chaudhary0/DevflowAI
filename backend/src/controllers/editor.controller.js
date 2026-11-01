import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as editorService from "../services/editor.service.js";

export const listFiles = asyncHandler(async (req, res) => {
  const files = await editorService.listFiles(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, { files }, "Files retrieved"));
});

export const getFile = asyncHandler(async (req, res) => {
  const file = await editorService.getFile(req.user._id, req.params.fileId);
  res.status(200).json(new ApiResponse(200, { file }, "File retrieved"));
});

export const createFile = asyncHandler(async (req, res) => {
  const file = await editorService.createFile(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, { file }, "File created"));
});

export const updateFile = asyncHandler(async (req, res) => {
  const file = await editorService.updateFile(req.user._id, req.params.fileId, req.body);
  res.status(200).json(new ApiResponse(200, { file }, "File updated"));
});

export const deleteFile = asyncHandler(async (req, res) => {
  const result = await editorService.deleteFile(req.user._id, req.params.fileId);
  res.status(200).json(new ApiResponse(200, result, "File deleted"));
});
