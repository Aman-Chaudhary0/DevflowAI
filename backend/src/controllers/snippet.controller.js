import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as snippetService from "../services/snippet.service.js";

export const listSnippets = asyncHandler(async (req, res) => {
  const result = await snippetService.listSnippets(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, "Snippets retrieved"));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await snippetService.getSnippetStats(req.user._id);
  res.status(200).json(new ApiResponse(200, stats, "Stats retrieved"));
});

export const getSnippet = asyncHandler(async (req, res) => {
  const snippet = await snippetService.getSnippet(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, { snippet }, "Snippet retrieved"));
});

export const createSnippet = asyncHandler(async (req, res) => {
  const snippet = await snippetService.createSnippet(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, { snippet }, "Snippet created"));
});

export const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await snippetService.updateSnippet(req.user._id, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { snippet }, "Snippet updated"));
});

export const deleteSnippet = asyncHandler(async (req, res) => {
  const result = await snippetService.deleteSnippet(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, result, "Snippet deleted"));
});

export const setFavorite = asyncHandler(async (req, res) => {
  const snippet = await snippetService.setFavorite(req.user._id, req.params.id, req.body.isFavorite);
  res.status(200).json(new ApiResponse(200, { snippet }, "Favorite updated"));
});
