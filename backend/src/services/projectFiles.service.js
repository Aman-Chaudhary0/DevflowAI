import mongoose from "mongoose";
import ImageKit, { toFile } from "@imagekit/nodejs";
import Document from "../models/Document.js";
import Project from "../models/Project.js";
import ProjectFile from "../models/ProjectFile.js";
import ProjectMember from "../models/ProjectMember.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function sanitizeFileName(value) {
  const clean = String(value || "file")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return clean || "document";
}

export async function getAuthorizedWorkspaceIdsForUser(userId) {
  const [owned, memberships] = await Promise.all([
    Workspace.find({ owner: userId }, { _id: 1 }).lean(),
    WorkspaceMember.find({ user: userId, status: "active" }, { workspace: 1 }).lean()
  ]);

  return [
    ...owned.map((item) => item._id.toString()),
    ...memberships.map((item) => item.workspace.toString())
  ];
}

export async function getAuthorizedProjectIdsForUser(userId) {
  const [owned, memberships] = await Promise.all([
    Project.find({ owner: userId }, { _id: 1 }).lean(),
    ProjectMember.find({ user: userId }, { project: 1 }).lean()
  ]);

  return [
    ...owned.map((item) => item._id.toString()),
    ...memberships.map((item) => item.project.toString())
  ];
}

export async function resolveProjectContext(userId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId).populate("workspace", "_id name slug owner").lean();
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const isOwner = project.owner?.toString?.() === userId.toString();
  const membership = await ProjectMember.findOne({ project: project._id, user: userId }).lean();
  if (!isOwner && !membership) {
    throw new ApiError(403, "You do not have access to this project");
  }

  if (!project.workspace) {
    throw new ApiError(500, "Project workspace metadata is missing");
  }

  return {
    project,
    workspaceId: project.workspace._id || project.workspace
  };
}

function serializeFileItem(item) {
  return {
    ...item,
    _id: item._id?.toString?.() || item._id,
    project: item.project ? (typeof item.project === "object" ? item.project._id?.toString?.() || item.project.toString() : item.project.toString()) : item.project,
    workspace: item.workspace ? (typeof item.workspace === "object" ? item.workspace._id?.toString?.() || item.workspace.toString() : item.workspace.toString()) : item.workspace,
    uploadedBy: item.uploadedBy ? (typeof item.uploadedBy === "object" ? {
      _id: item.uploadedBy._id?.toString?.() || item.uploadedBy.toString?.() || item.uploadedBy,
      name: item.uploadedBy.name || "",
      email: item.uploadedBy.email || "",
      avatar: item.uploadedBy.avatar || ""
    } : item.uploadedBy.toString()) : null
  };
}

export async function listWorkspaceFilesForUser(userId, query = {}) {
  const workspaceIds = await getAuthorizedWorkspaceIdsForUser(userId);
  const search = String(query.search || "").trim();
  const folder = String(query.folder || "").trim();
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));

  const filter = {
    workspace: { $in: workspaceIds.map((id) => new mongoose.Types.ObjectId(id)) }
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
      { folder: { $regex: search, $options: "i" } }
    ];
  }

  if (folder && folder !== "All" && folder !== "All Files") {
    filter.folder = folder;
  }

  const [items, total, totalSize] = await Promise.all([
    ProjectFile.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("project", "name slug")
      .populate("uploadedBy", "name email avatar")
      .lean(),
    ProjectFile.countDocuments(filter),
    ProjectFile.aggregate([
      { $match: filter },
      { $group: { _id: null, totalBytes: { $sum: "$size" } } }
    ])
  ]);

  return {
    files: items.map((item) => ({
      ...serializeFileItem(item),
      project: item.project ? { _id: item.project._id.toString(), name: item.project.name, slug: item.project.slug } : null,
      workspace: item.workspace.toString(),
      uploadedBy: item.uploadedBy ? {
        _id: item.uploadedBy._id.toString(),
        name: item.uploadedBy.name,
        email: item.uploadedBy.email,
        avatar: item.uploadedBy.avatar || ""
      } : null
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    storage: {
      usedBytes: totalSize[0]?.totalBytes || 0,
      maxBytes: 0,
      availableBytes: 0
    }
  };
}

export async function listProjectFilesForUser(userId, projectId, query = {}) {
  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const search = String(query.search || "").trim();
  const folder = String(query.folder || "").trim();
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));

  const filter = {
    project: project._id,
    workspace: workspaceId
  };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
      { folder: { $regex: search, $options: "i" } }
    ];
  }

  if (folder && folder !== "All" && folder !== "All Files") {
    filter.folder = folder;
  }

  const [items, total] = await Promise.all([
    ProjectFile.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("uploadedBy", "name email avatar")
      .lean(),
    ProjectFile.countDocuments(filter)
  ]);

  return {
    files: items.map((item) => ({
      ...serializeFileItem(item),
      uploadedBy: item.uploadedBy ? {
        _id: item.uploadedBy._id.toString(),
        name: item.uploadedBy.name,
        email: item.uploadedBy.email,
        avatar: item.uploadedBy.avatar || ""
      } : null
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getProjectFileForUser(userId, projectId, fileId) {
  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const file = await ProjectFile.findOne({
    _id: fileId,
    project: project._id,
    workspace: workspaceId
  }).populate("uploadedBy", "name email avatar").lean();

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  return serializeFileItem(file);
}

export async function uploadProjectFileForUser(userId, projectId, input) {
  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const file = input?.file || input;

  if (!file) {
    throw new ApiError(400, "A file is required");
  }

  const mimeType = file.mimetype || file.mimeType || "application/octet-stream";
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, "File exceeds the 25 MB limit");
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ApiError(400, `Unsupported file type: ${mimeType}`);
  }

  const originalName = sanitizeFileName(file.originalname || file.name || "upload");
  const folder = String(input?.folder || "/").trim() || "/";
  const storageProvider = process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT ? "imagekit" : "local";
  const storageKey = `${project._id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${originalName.replace(/\s+/g, "-")}`;

  let uploadedUrl = "";

  if (storageProvider === "imagekit") {
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });

    try {
      const uploadFile = file.buffer && file.buffer.length
        ? await toFile(file.buffer, originalName, { type: mimeType })
        : file;

      const uploadResponse = await imagekit.files.upload({
        file: uploadFile,
        fileName: originalName,
        folder: `/devflow/projects/${project._id}`,
        useUniqueFileName: true,
        tags: [project._id.toString(), workspaceId.toString()]
      });
      uploadedUrl = uploadResponse?.url || uploadResponse?.thumbnailUrl || "";
    } catch (error) {
      const detail = error?.message || "Unknown ImageKit error";
      console.error("ImageKit upload failed:", detail);
      console.error("ImageKit upload details:", error?.response?.data || error?.body || error?.error || error);
      throw new ApiError(500, `ImageKit upload failed: ${detail}`);
    }
  }

  const created = await ProjectFile.create({
    project: project._id,
    workspace: workspaceId,
    uploadedBy: userId,
    name: originalName,
    originalName,
    storageKey,
    storageProvider,
    url: uploadedUrl,
    mimeType,
    size: Number(file.size || 0),
    folder
  });

  return serializeFileItem(created);
}

export async function renameProjectFileForUser(userId, projectId, fileId, input = {}) {
  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const nextName = input.name !== undefined ? String(input.name).trim() : "";
  const nextFolder = input.folder !== undefined ? String(input.folder).trim() || "/" : undefined;

  if (!nextName && nextFolder === undefined) {
    throw new ApiError(400, "A file name or folder is required");
  }

  const patch = {};
  if (nextName) patch.name = sanitizeFileName(nextName);
  if (nextFolder !== undefined) patch.folder = nextFolder;

  const updated = await ProjectFile.findOneAndUpdate(
    { _id: fileId, project: project._id, workspace: workspaceId },
    { $set: patch },
    { new: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "File not found");
  }

  return serializeFileItem(updated);
}

export async function deleteProjectFileForUser(userId, projectId, fileId) {
  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const deleted = await ProjectFile.findOneAndDelete({
    _id: fileId,
    project: project._id,
    workspace: workspaceId
  }).lean();

  if (!deleted) {
    throw new ApiError(404, "File not found");
  }

  return { deleted: true, fileId: fileId.toString() };
}

export async function getFileDownloadUrlForUser(userId, projectId, fileId) {
  if (!mongoose.isValidObjectId(fileId)) {
    throw new ApiError(400, "Invalid file id");
  }

  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const file = await ProjectFile.findOne({
    _id: fileId,
    project: project._id,
    workspace: workspaceId
  }).lean();

  if (!file) {
    throw new ApiError(404, "File not found");
  }

  if (!file.url) {
    throw new ApiError(404, "No file URL is available");
  }

  return { url: file.url, name: file.name };
}

export async function listProjectDocumentsForUser(userId, projectId, query = {}) {
  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const search = String(query.search || "").trim();
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));

  const filter = {
    project: project._id,
    workspace: workspaceId
  };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }

  const [documents, total] = await Promise.all([
    Document.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name email avatar")
      .lean(),
    Document.countDocuments(filter)
  ]);

  return {
    documents: documents.map((item) => ({
      ...item,
      _id: item._id.toString(),
      project: item.project.toString(),
      workspace: item.workspace.toString(),
      createdBy: item.createdBy ? {
        _id: item.createdBy._id.toString(),
        name: item.createdBy.name,
        email: item.createdBy.email,
        avatar: item.createdBy.avatar || ""
      } : null
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function getProjectDocumentForUser(userId, projectId, documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid document id");
  }

  const { project, workspaceId } = await resolveProjectContext(userId, projectId);
  const document = await Document.findOne({
    _id: documentId,
    project: project._id,
    workspace: workspaceId
  }).populate("createdBy", "name email avatar").lean();

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return {
    ...document,
    _id: document._id.toString(),
    project: document.project.toString(),
    workspace: document.workspace.toString(),
    createdBy: document.createdBy ? {
      _id: document.createdBy._id.toString(),
      name: document.createdBy.name,
      email: document.createdBy.email,
      avatar: document.createdBy.avatar || ""
    } : null
  };
}

export async function createProjectDocumentForUser(user, projectId, input) {
  const { project, workspaceId } = await resolveProjectContext(user._id, projectId);
  const title = String(input?.title || "").trim();
  if (!title) {
    throw new ApiError(400, "Document title is required");
  }

  const requestedSlug = input?.slug ? normalizeSlug(input.slug) : normalizeSlug(title);
  if (!requestedSlug) {
    throw new ApiError(400, "Document slug is invalid");
  }

  const content = String(input?.content || "");
  const contentFormat = input?.contentFormat || "markdown";
  const visibility = input?.visibility || "workspace";

  try {
    const document = await Document.create({
      project: project._id,
      workspace: workspaceId,
      createdBy: user._id,
      title,
      slug: requestedSlug,
      content,
      contentFormat,
      visibility
    });

    return await getProjectDocumentForUser(user._id, projectId, document._id.toString());
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A document with this slug already exists in this project");
    }
    throw error;
  }
}

export async function updateProjectDocumentForUser(user, projectId, documentId, input) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid document id");
  }

  const { project, workspaceId } = await resolveProjectContext(user._id, projectId);
  const document = await Document.findOne({
    _id: documentId,
    project: project._id,
    workspace: workspaceId
  });

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const nextData = {};
  if (input.title !== undefined) {
    const nextTitle = String(input.title).trim();
    if (!nextTitle) throw new ApiError(400, "Document title is required");
    nextData.title = nextTitle;
  }

  if (input.slug !== undefined) {
    const nextSlug = normalizeSlug(input.slug);
    if (!nextSlug) throw new ApiError(400, "Document slug is invalid");
    nextData.slug = nextSlug;
  }

  if (input.content !== undefined) nextData.content = String(input.content);
  if (input.contentFormat !== undefined) nextData.contentFormat = input.contentFormat;
  if (input.visibility !== undefined) nextData.visibility = input.visibility;

  if (Object.keys(nextData).length === 0) {
    throw new ApiError(400, "No valid document fields were provided");
  }

  try {
    const updated = await Document.findOneAndUpdate(
      { _id: documentId, project: project._id, workspace: workspaceId },
      { $set: nextData },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email avatar").lean();

    if (!updated) {
      throw new ApiError(404, "Document not found");
    }

    return {
      ...updated,
      _id: updated._id.toString(),
      project: updated.project.toString(),
      workspace: updated.workspace.toString(),
      createdBy: updated.createdBy ? {
        _id: updated.createdBy._id.toString(),
        name: updated.createdBy.name,
        email: updated.createdBy.email,
        avatar: updated.createdBy.avatar || ""
      } : null
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A document with this slug already exists in this project");
    }
    throw error;
  }
}

export async function deleteProjectDocumentForUser(user, projectId, documentId) {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid document id");
  }

  const { project, workspaceId } = await resolveProjectContext(user._id, projectId);
  const deleted = await Document.findOneAndDelete({
    _id: documentId,
    project: project._id,
    workspace: workspaceId
  }).lean();

  if (!deleted) {
    throw new ApiError(404, "Document not found");
  }

  return { deleted: true, documentId: documentId.toString() };
}
