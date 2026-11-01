import mongoose from "mongoose";
import Snippet from "../models/Snippet.js";
import { ApiError } from "../utils/ApiError.js";

export async function listSnippets(userId, query = {}) {
  const { search, language, tag, favorites, sort = "createdAt", order = "desc", page = 1, limit = 50 } = query;
  const filter = { owner: userId };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } }
    ];
  }
  if (language) filter.language = { $regex: `^${language}$`, $options: "i" };
  if (tag) filter.tags = tag;
  if (favorites === "true") filter.isFavorite = true;

  const sortDir = order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [snippets, total] = await Promise.all([
    Snippet.find(filter).sort({ [sort]: sortDir }).skip(skip).limit(limit).lean(),
    Snippet.countDocuments(filter)
  ]);

  return { snippets, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getSnippetStats(userId) {
  const [total, favorites, languages] = await Promise.all([
    Snippet.countDocuments({ owner: userId }),
    Snippet.countDocuments({ owner: userId, isFavorite: true }),
    Snippet.distinct("language", { owner: userId })
  ]);
  const recent = await Snippet.countDocuments({
    owner: userId,
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  return { total, favorites, languages: languages.length, recentlyUsed: recent };
}

export async function getSnippet(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid snippet id");
  const snippet = await Snippet.findOne({ _id: id, owner: userId });
  if (!snippet) throw new ApiError(404, "Snippet not found");
  return snippet;
}

export async function createSnippet(userId, input) {
  const snippet = await Snippet.create({
    owner: userId,
    title: input.title,
    description: input.description || "",
    code: input.code,
    language: input.language || "javascript",
    framework: input.framework || "",
    tags: input.tags || []
  });
  return snippet;
}

export async function updateSnippet(userId, id, input) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid snippet id");
  const snippet = await Snippet.findOne({ _id: id, owner: userId });
  if (!snippet) throw new ApiError(404, "Snippet not found");

  const update = {};
  const fields = ["title", "description", "code", "language", "framework", "tags"];
  for (const f of fields) {
    if (input[f] !== undefined) update[f] = input[f];
  }

  const updated = await Snippet.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  return updated;
}

export async function deleteSnippet(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid snippet id");
  const snippet = await Snippet.findOneAndDelete({ _id: id, owner: userId });
  if (!snippet) throw new ApiError(404, "Snippet not found");
  return { deleted: true, id };
}

export async function setFavorite(userId, id, isFavorite) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid snippet id");
  const snippet = await Snippet.findOneAndUpdate(
    { _id: id, owner: userId },
    { $set: { isFavorite } },
    { new: true }
  );
  if (!snippet) throw new ApiError(404, "Snippet not found");
  return snippet;
}
