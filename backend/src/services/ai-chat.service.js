import { AIConversation } from "../models/AIConversation.js";
import { AIMessage } from "../models/AIMessage.js";
import aiService from "./ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { getAIConfig } from "../config/ai.js";

const SYSTEM_INSTRUCTION = "You are DevFlow AI, a helpful development assistant. Provide accurate, concise explanations and code examples. You do not have access to the user's repository unless they include its contents in the conversation.";
export function validateChatModel(model) {
  let configuredModel;
  try { configuredModel = getAIConfig().model; }
  catch { throw new ApiError(503, "AI provider is not configured on the server"); }
  if (model !== configuredModel) throw new ApiError(400, "The selected AI model is unavailable");
  return model;
}

export async function listConversations(owner, search) {
  return AIConversation.find({ owner, ...(search ? { title: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } } : {}) })
    .sort({ pinned: -1, updatedAt: -1 }).limit(100).lean();
}

export async function createConversation(owner, model) {
  const selectedModel = model || (() => {
    try { return getAIConfig().model; }
    catch { throw new ApiError(503, "AI provider is not configured on the server"); }
  })();
  validateChatModel(selectedModel);
  return AIConversation.create({ owner, model: selectedModel, title: "New chat" });
}

export async function ownedConversation(owner, conversationId) {
  const conversation = await AIConversation.findOne({ _id: conversationId, owner });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  return conversation;
}

export async function listMessages(owner, conversationId, limit, before) {
  await ownedConversation(owner, conversationId);
  const query = { conversation: conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };
  const rows = await AIMessage.find(query).sort({ createdAt: -1, _id: -1 }).limit(limit + 1).lean();
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();
  rows.reverse();
  return { messages: rows, hasMore, nextBefore: hasMore && rows.length ? rows[0].createdAt.toISOString() : null };
}

async function generateForUserMessage(conversation, userMessage, owner, model, signal, { before, excludeMessageId, replaceMessageId } = {}) {
  validateChatModel(model);
  const history = await AIMessage.find({ conversation: conversation._id, ...(before ? { createdAt: { $lte: before } } : {}), ...(excludeMessageId ? { _id: { $ne: excludeMessageId } } : {}), $or: [{ createdAt: { $lt: userMessage.createdAt } }, { _id: userMessage._id }] })
    .sort({ createdAt: -1, _id: -1 }).limit(20).lean();
  const messages = [
    { role: "system", content: SYSTEM_INSTRUCTION },
    ...history.reverse().map(({ role, content }) => ({ role, content }))
  ];
  const result = await aiService.generate({ userId: owner, messages, signal });
  if (signal?.aborted) throw new ApiError(499, "AI request was cancelled");
  const assistant = replaceMessageId
    ? await AIMessage.findOneAndUpdate({ _id: replaceMessageId, conversation: conversation._id, role: "assistant" }, { content: result.content, model: result.model, parentMessage: userMessage._id }, { new: true })
    : await AIMessage.create({ conversation: conversation._id, role: "assistant", content: result.content, model: result.model, parentMessage: userMessage._id });
  if (!assistant) throw new ApiError(404, "Assistant message not found");
  if (conversation.title === "New chat" && userMessage) {
    conversation.title = userMessage.content.replace(/\s+/g, " ").trim().slice(0, 56) || "New chat";
  }
  conversation.model = result.model;
  await conversation.save();
  const usage = result.usage.source === "unavailable" ? null : {
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
    totalTokens: result.usage.totalTokens,
    source: "provider"
  };
  return { conversation, userMessage, assistant, provider: result.provider, model: result.model, usage };
}

export async function sendChatMessage(owner, { conversationId, content, model, requestId, signal }) {
  const conversation = await ownedConversation(owner, conversationId);
  validateChatModel(model);
  let userMessage = await AIMessage.findOne({ conversation: conversationId, requestId });
  if (userMessage) {
    const existingAssistant = await AIMessage.findOne({ conversation: conversationId, role: "assistant", parentMessage: userMessage._id });
    if (existingAssistant) return { conversation, userMessage, assistant: existingAssistant, model: existingAssistant.model, provider: getAIConfig().provider, usage: null };
    if (userMessage.content !== content) throw new ApiError(409, "Request id was already used for a different message");
  } else {
    userMessage = await AIMessage.create({ conversation: conversationId, role: "user", content, requestId });
  }
  return generateForUserMessage(conversation, userMessage, owner, model, signal);
}

export async function regenerateMessage(owner, conversationId, messageId, model, signal) {
  const conversation = await ownedConversation(owner, conversationId);
  const target = await AIMessage.findOne({ _id: messageId, conversation: conversationId, role: "assistant" });
  if (!target) throw new ApiError(404, "Assistant message not found");
  const userMessage = await AIMessage.findOne({ conversation: conversationId, role: "user", createdAt: { $lte: target.createdAt } }).sort({ createdAt: -1 });
  if (!userMessage) throw new ApiError(400, "No user message is available to regenerate");
  validateChatModel(model);
  return generateForUserMessage(conversation, userMessage, owner, model, signal, { before: target.createdAt, excludeMessageId: target._id, replaceMessageId: target._id });
}

export async function deleteConversation(owner, conversationId) {
  const conversation = await ownedConversation(owner, conversationId);
  await AIMessage.deleteMany({ conversation: conversation._id });
  await conversation.deleteOne();
}
