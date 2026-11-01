import mongoose from "mongoose";
import Playground from "../models/Playground.js";
import { ApiError } from "../utils/ApiError.js";

export async function listPlaygrounds(userId, query = {}) {
  const { search, page = 1, limit = 50 } = query;
  const filter = { owner: userId };
  if (search) filter.title = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;
  const [playgrounds, total] = await Promise.all([
    Playground.find(filter).select("-html -css -javascript").sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Playground.countDocuments(filter)
  ]);
  return { playgrounds, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getPlayground(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid playground id");
  const pg = await Playground.findOne({ _id: id, owner: userId });
  if (!pg) throw new ApiError(404, "Playground not found");
  return pg;
}

export async function createPlayground(userId, input) {
  const pg = await Playground.create({
    owner: userId,
    title: input.title,
    description: input.description || "",
    html: input.html || "",
    css: input.css || "",
    javascript: input.javascript || ""
  });
  return pg;
}

export async function updatePlayground(userId, id, input) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid playground id");
  const pg = await Playground.findOne({ _id: id, owner: userId });
  if (!pg) throw new ApiError(404, "Playground not found");

  const update = {};
  const fields = ["title", "description", "html", "css", "javascript"];
  for (const f of fields) {
    if (input[f] !== undefined) update[f] = input[f];
  }

  const updated = await Playground.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  return updated;
}

export async function deletePlayground(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid playground id");
  const pg = await Playground.findOneAndDelete({ _id: id, owner: userId });
  if (!pg) throw new ApiError(404, "Playground not found");
  return { deleted: true, id };
}
