import mongoose from "mongoose";
import { AIExecution } from "../models/AIExecution.js";

/**
 * Record a completed or failed AI execution.
 * Never throws — analytics failures must not block AI responses.
 * Returns the saved document or null on failure.
 */
export async function recordExecution({
  owner,
  tool,
  status,
  provider = null,
  model = null,
  usage = null,
  requestDurationMs = null,
  errorCode = null,
  startedAt = null,
  completedAt = null,
  conversation = null,
  message = null,
  project = null
}) {
  try {
    if (!owner || !tool || !status) return null;

    // Coerce owner to ObjectId — skip silently if the value is not a valid ObjectId
    // (e.g. plain test strings like "user" passed from service-layer unit tests)
    let ownerId;
    try {
      ownerId = owner instanceof mongoose.Types.ObjectId ? owner : new mongoose.Types.ObjectId(String(owner));
    } catch {
      return null;
    }

    // Derive token fields honestly — never fabricate
    let inputTokens = null;
    let outputTokens = null;
    let totalTokens = null;
    let usageSource = "unavailable";

    if (usage && usage.source === "provider") {
      inputTokens = typeof usage.inputTokens === "number" && usage.inputTokens >= 0 ? usage.inputTokens : null;
      outputTokens = typeof usage.outputTokens === "number" && usage.outputTokens >= 0 ? usage.outputTokens : null;
      // Only compute total when both components are available
      if (inputTokens !== null && outputTokens !== null) {
        totalTokens = inputTokens + outputTokens;
      } else if (typeof usage.totalTokens === "number" && usage.totalTokens >= 0) {
        totalTokens = usage.totalTokens;
      }
      usageSource = "provider";
    }

    const doc = await AIExecution.create({
      owner: ownerId,
      tool,
      status,
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      usageSource,
      requestDurationMs: typeof requestDurationMs === "number" && requestDurationMs >= 0 ? Math.round(requestDurationMs) : null,
      errorCode,
      startedAt,
      completedAt,
      conversation: conversation || null,
      message: message || null,
      project: project || null
    });

    return doc;
  } catch (err) {
    // Log safely — never expose secrets or full prompts
    console.error("[AIExecution] Failed to persist execution record:", err?.name || "UnknownError");
    return null;
  }
}
