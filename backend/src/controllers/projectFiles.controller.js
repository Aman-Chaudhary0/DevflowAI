import Document from "../models/Document.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createProjectDocumentForUser,
  deleteProjectDocumentForUser,
  deleteProjectFileForUser,
  getFileDownloadUrlForUser,
  getProjectDocumentForUser,
  getProjectFileForUser,
  listProjectDocumentsForUser,
  listProjectFilesForUser,
  listWorkspaceFilesForUser,
  renameProjectFileForUser,
  updateProjectDocumentForUser,
  uploadProjectFileForUser
} from "../services/projectFiles.service.js";

export const listWorkspaceFiles = asyncHandler(async (req, res) => {
  const result = await listWorkspaceFilesForUser(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, result, "Workspace files fetched successfully"));
});

export const listProjectFiles = asyncHandler(async (req, res) => {
  const result = await listProjectFilesForUser(req.user._id, req.params.projectId, req.query);
  res.status(200).json(new ApiResponse(200, result, "Project files fetched successfully"));
});

export const getProjectFile = asyncHandler(async (req, res) => {
  const result = await getProjectFileForUser(req.user._id, req.params.projectId, req.params.fileId);
  res.status(200).json(new ApiResponse(200, { file: result }, "File fetched successfully"));
});

export const uploadProjectFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "A file is required");
  }

  const result = await uploadProjectFileForUser(req.user._id, req.params.projectId, {
    file: req.file,
    folder: req.body.folder || "/"
  });

  res.status(201).json(new ApiResponse(201, { file: result }, "File uploaded successfully"));
});

export const downloadProjectFile = asyncHandler(async (req, res) => {
  const result = await getFileDownloadUrlForUser(req.user._id, req.params.projectId, req.params.fileId);
  res.status(200).json(new ApiResponse(200, result, "File download URL fetched successfully"));
});

export const renameProjectFile = asyncHandler(async (req, res) => {
  const result = await renameProjectFileForUser(req.user._id, req.params.projectId, req.params.fileId, req.body);
  res.status(200).json(new ApiResponse(200, { file: result }, "File updated successfully"));
});

export const deleteProjectFile = asyncHandler(async (req, res) => {
  const result = await deleteProjectFileForUser(req.user._id, req.params.projectId, req.params.fileId);
  res.status(200).json(new ApiResponse(200, result, "File deleted successfully"));
});

export const listProjectDocuments = asyncHandler(async (req, res) => {
  const result = await listProjectDocumentsForUser(req.user._id, req.params.projectId, req.query);
  res.status(200).json(new ApiResponse(200, result, "Documents fetched successfully"));
});

export const getProjectDocument = asyncHandler(async (req, res) => {
  const result = await getProjectDocumentForUser(req.user._id, req.params.projectId, req.params.documentId);
  res.status(200).json(new ApiResponse(200, { document: result }, "Document fetched successfully"));
});

export const createProjectDocument = asyncHandler(async (req, res) => {
  const result = await createProjectDocumentForUser(req.user, req.params.projectId, req.body);
  res.status(201).json(new ApiResponse(201, { document: result }, "Document created successfully"));
});

export const updateProjectDocument = asyncHandler(async (req, res) => {
  const result = await updateProjectDocumentForUser(req.user, req.params.projectId, req.params.documentId, req.body);
  res.status(200).json(new ApiResponse(200, { document: result }, "Document updated successfully"));
});

export const deleteProjectDocument = asyncHandler(async (req, res) => {
  const result = await deleteProjectDocumentForUser(req.user, req.params.projectId, req.params.documentId);
  res.status(200).json(new ApiResponse(200, result, "Document deleted successfully"));
});
