import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createConversation, deleteConversation, listConversations, listMessages, ownedConversation, regenerateMessage, sendChatMessage } from "../services/ai-chat.service.js";
import { getAIConfig } from "../config/ai.js";
import { listConfiguredAIModels } from "../services/ai-provider.service.js";

export const getModels = asyncHandler(async (_req, res) => {
  try {
    const config = getAIConfig();
    const models = await listConfiguredAIModels({ config });
    const availabilityMessage = models.length ? null : `Configured model ${config.model} is not installed. Run ollama pull ${config.model}.`;
    res.status(200).json(new ApiResponse(200, { configured: models.length > 0, models, availabilityMessage }, "AI model availability checked"));
  } catch (error) {
    res.status(200).json(new ApiResponse(200, { configured: false, models: [], availabilityMessage: error.message }, "AI provider is unavailable"));
  }
});
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await listConversations(req.user._id, req.query.search);
  res.status(200).json(new ApiResponse(200, { conversations }, "Conversations fetched"));
});
export const postConversation = asyncHandler(async (req, res) => {
  const conversation = await createConversation(req.user._id, req.body.model);
  res.status(201).json(new ApiResponse(201, { conversation }, "Conversation created"));
});
export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await ownedConversation(req.user._id, req.params.conversationId);
  res.status(200).json(new ApiResponse(200, { conversation }, "Conversation fetched"));
});
export const patchConversation = asyncHandler(async (req, res) => {
  const conversation = await ownedConversation(req.user._id, req.params.conversationId);
  if (req.body.title !== undefined) conversation.title = req.body.title;
  if (req.body.pinned !== undefined) conversation.pinned = req.body.pinned;
  await conversation.save();
  res.status(200).json(new ApiResponse(200, { conversation }, "Conversation updated"));
});
export const removeConversation = asyncHandler(async (req, res) => {
  await deleteConversation(req.user._id, req.params.conversationId);
  res.status(200).json(new ApiResponse(200, {}, "Conversation deleted"));
});
export const getMessages = asyncHandler(async (req, res) => {
  const result = await listMessages(req.user._id, req.params.conversationId, req.query.limit, req.query.before);
  res.status(200).json(new ApiResponse(200, result, "Messages fetched"));
});
async function runMessage(req, res, regenerate = false) {
  const controller = new AbortController();
  req.on("aborted", () => controller.abort());
  res.on("close", () => { if (!res.writableEnded) controller.abort(); });
  try {
    const result = regenerate
      ? await regenerateMessage(req.user._id, req.params.conversationId, req.params.messageId, req.body.model, controller.signal)
      : await sendChatMessage(req.user._id, { ...req.body, signal: controller.signal });
    res.status(200).json(new ApiResponse(200, result, "AI response generated"));
  } catch (error) {
    if (controller.signal.aborted) return;
    throw error;
  }
}
export const postMessage = asyncHandler((req, res) => runMessage(req, res));
export const postRegenerate = asyncHandler((req, res) => runMessage(req, res, true));
