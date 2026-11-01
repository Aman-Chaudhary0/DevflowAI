import mongoose from "mongoose";
import EditorFile from "../models/EditorFile.js";
import { ApiError } from "../utils/ApiError.js";

function detectLanguage(path = "") {
  const ext = path.split(".").pop()?.toLowerCase();
  const map = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    py: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
    cs: "csharp", cpp: "cpp", c: "c", php: "php", swift: "swift",
    html: "html", css: "css", scss: "scss", json: "json",
    md: "markdown", yml: "yaml", yaml: "yaml", sh: "shell",
    sql: "sql", xml: "xml", kt: "kotlin"
  };
  return map[ext] || "plaintext";
}

export async function listFiles(userId, query = {}) {
  const filter = { owner: userId };
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { path: { $regex: query.search, $options: "i" } }
    ];
  }
  if (query.language) filter.language = query.language;

  const files = await EditorFile.find(filter)
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
  return files;
}

export async function getFile(userId, fileId) {
  if (!mongoose.isValidObjectId(fileId)) throw new ApiError(400, "Invalid file id");
  const file = await EditorFile.findOne({ _id: fileId, owner: userId });
  if (!file) throw new ApiError(404, "File not found");
  return file;
}

export async function createFile(userId, input) {
  const path = String(input.path || "").trim();
  if (!path) throw new ApiError(400, "File path is required");
  if (path.includes("..") || path.startsWith("/")) throw new ApiError(400, "Invalid file path");

  const language = input.language || detectLanguage(path);
  try {
    const file = await EditorFile.create({
      owner: userId,
      project: input.project || null,
      title: input.title,
      path,
      language,
      content: input.content || ""
    });
    return file;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "A file with this path already exists");
    throw err;
  }
}

export async function updateFile(userId, fileId, input) {
  if (!mongoose.isValidObjectId(fileId)) throw new ApiError(400, "Invalid file id");
  const file = await EditorFile.findOne({ _id: fileId, owner: userId });
  if (!file) throw new ApiError(404, "File not found");

  const update = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.content !== undefined) update.content = input.content;
  if (input.language !== undefined) update.language = input.language;
  if (input.path !== undefined) {
    const newPath = String(input.path).trim();
    if (newPath.includes("..") || newPath.startsWith("/")) throw new ApiError(400, "Invalid file path");
    update.path = newPath;
    if (!input.language) update.language = detectLanguage(newPath);
  }

  try {
    const updated = await EditorFile.findByIdAndUpdate(
      fileId,
      { $set: update },
      { new: true, runValidators: true }
    );
    return updated;
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, "A file with this path already exists");
    throw err;
  }
}

export async function deleteFile(userId, fileId) {
  if (!mongoose.isValidObjectId(fileId)) throw new ApiError(400, "Invalid file id");
  const file = await EditorFile.findOneAndDelete({ _id: fileId, owner: userId });
  if (!file) throw new ApiError(404, "File not found");
  return { deleted: true, fileId };
}
