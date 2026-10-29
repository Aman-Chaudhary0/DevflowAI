import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { once } from "node:events";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import { AIConversation } from "../models/AIConversation.js";
import { AIMessage } from "../models/AIMessage.js";
import { createConversation, deleteConversation, listConversations, listMessages, ownedConversation, regenerateMessage, sendChatMessage, validateChatModel } from "../services/ai-chat.service.js";
import { listMessagesSchema, sendMessageSchema } from "../validators/aiChat.validator.js";

jest.setTimeout(30000);

describe("AI chat persistence and service", () => {
  let mongo;
  let owner;
  let outsider;
  let originalFetch;
  let server;
  let baseUrl;
  const originalAI = {};

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "ai-chat-test" });
    for (const key of ["AI_API_KEY", "AI_MODEL", "AI_PROVIDER", "JWT_ACCESS_SECRET", "FRONTEND_URL"]) originalAI[key] = process.env[key];
    process.env.AI_API_KEY = "test-secret-key";
    process.env.AI_MODEL = "gpt-test";
    process.env.AI_PROVIDER = "openai";
    process.env.JWT_ACCESS_SECRET = "ai-chat-test-access-secret";
    process.env.FRONTEND_URL = "http://localhost:3000";
    await AIConversation.syncIndexes();
    await AIMessage.syncIndexes();
    const { app } = await import("../app.js");
    server = app.listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
    for (const [key, value] of Object.entries(originalAI)) value === undefined ? delete process.env[key] : process.env[key] = value;
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), AIConversation.deleteMany({}), AIMessage.deleteMany({})]);
    owner = await User.create({ name: "Chat Owner", email: "chat-owner@example.com", password: "StrongPass123!", isVerified: true });
    outsider = await User.create({ name: "Other User", email: "chat-other@example.com", password: "StrongPass123!", isVerified: true });
    originalFetch = global.fetch;
  });

  afterEach(() => { global.fetch = originalFetch; });

  it("creates owner-scoped conversations, lists searches, and blocks cross-user reads and deletion", async () => {
    const conversation = await createConversation(owner._id, "gpt-test");
    await createConversation(outsider._id, "gpt-test");
    expect((await listConversations(owner._id)).map((item) => String(item._id))).toEqual([String(conversation._id)]);
    expect((await listConversations(owner._id, "new chat"))).toHaveLength(1);
    await expect(ownedConversation(outsider._id, conversation._id)).rejects.toMatchObject({ statusCode: 404 });
    await expect(deleteConversation(outsider._id, conversation._id)).rejects.toMatchObject({ statusCode: 404 });
    expect(await AIConversation.countDocuments()).toBe(2);
  });

  it("requires authentication and applies ownership checks through the HTTP API", async () => {
    const unauthenticated = await fetch(`${baseUrl}/api/ai/conversations`);
    expect(unauthenticated.status).toBe(401);
    const conversation = await createConversation(owner._id, "gpt-test");
    const token = jwt.sign({ sub: outsider._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    const denied = await fetch(`${baseUrl}/api/ai/conversations/${conversation._id}`, { headers: { Cookie: `accessToken=${token}` } });
    expect(denied.status).toBe(404);
    const acceptedToken = jwt.sign({ sub: owner._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    const accepted = await fetch(`${baseUrl}/api/ai/conversations/${conversation._id}`, { headers: { Cookie: `accessToken=${acceptedToken}` } });
    expect(accepted.status).toBe(200);
    expect((await accepted.json()).data.conversation.title).toBe("New chat");
  });

  it("persists provider output in order and makes duplicate request IDs idempotent", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ model: "gpt-test", choices: [{ message: { content: "A real mocked provider answer." }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 7, total_tokens: 17 } })
    });
    const conversation = await createConversation(owner._id, "gpt-test");
    const request = { conversationId: conversation._id, content: "How do I validate input?", model: "gpt-test", requestId: "7a6804e2-1cd9-4ce0-9f83-4ef9eeaf746d" };
    const first = await sendChatMessage(owner._id, request);
    const retry = await sendChatMessage(owner._id, request);
    const { messages } = await listMessages(owner._id, conversation._id, 20);
    expect(messages.map(({ role }) => role)).toEqual(["user", "assistant"]);
    expect(first.assistant.content).toBe("A real mocked provider answer.");
    expect(String(retry.assistant._id)).toBe(String(first.assistant._id));
    expect(await AIMessage.countDocuments({ conversation: conversation._id })).toBe(2);
    expect(JSON.stringify(first)).not.toContain("test-secret-key");
    expect(first.conversation.title).toBe("How do I validate input?");
  });

  it("keeps the submitted user message but returns a safe error when the provider fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("secret upstream details"));
    const conversation = await createConversation(owner._id, "gpt-test");
    await expect(sendChatMessage(owner._id, { conversationId: conversation._id, content: "Try this", model: "gpt-test", requestId: "f7ed291f-8c19-49d5-aa7a-b01ddcc9689a" })).rejects.toMatchObject({ statusCode: 503, message: "AI provider is temporarily unavailable" });
    expect(await AIMessage.countDocuments({ conversation: conversation._id, role: "user" })).toBe(1);
    expect(await AIMessage.countDocuments({ conversation: conversation._id, role: "assistant" })).toBe(0);
  });

  it("regenerates an assistant response using only its preceding conversation context", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: "Original response" }, finish_reason: "stop" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: "Replacement response" }, finish_reason: "stop" }] }) });
    const conversation = await createConversation(owner._id, "gpt-test");
    const first = await sendChatMessage(owner._id, { conversationId: conversation._id, content: "Explain this function", model: "gpt-test", requestId: "c436803e-5b02-4448-aeb2-4b4512f40c7f" });
    const regenerated = await regenerateMessage(owner._id, conversation._id, first.assistant._id, "gpt-test");
    const providerMessages = JSON.parse(global.fetch.mock.calls[1][1].body).messages;
    const { messages: persisted } = await listMessages(owner._id, conversation._id, 20);
    expect(providerMessages.map(({ role }) => role)).toEqual(["system", "user"]);
    expect(regenerated.assistant.content).toBe("Replacement response");
    expect(String(regenerated.assistant._id)).toBe(String(first.assistant._id));
    expect(persisted.map(({ content }) => content)).toEqual(["Explain this function", "Replacement response"]);
  });

  it("does not persist a response when the caller cancels even if the provider resolves late", async () => {
    let resolveProvider;
    global.fetch = jest.fn(() => new Promise((resolve) => { resolveProvider = resolve; }));
    const conversation = await createConversation(owner._id, "gpt-test");
    const controller = new AbortController();
    const request = sendChatMessage(owner._id, { conversationId: conversation._id, content: "Cancel this", model: "gpt-test", requestId: "a41a46c3-53cb-4f7b-8aa9-6bf649ea48e4", signal: controller.signal });
    while (!resolveProvider) await new Promise((resolve) => setTimeout(resolve, 0));
    controller.abort();
    resolveProvider({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: "Late answer" }, finish_reason: "stop" }] }) });
    await expect(request).rejects.toMatchObject({ statusCode: 499, message: "AI request was cancelled" });
    expect(await AIMessage.countDocuments({ conversation: conversation._id, role: "assistant" })).toBe(0);
  });

  it("rejects unsupported model IDs and malformed message/pagination payloads", async () => {
    expect(() => validateChatModel("arbitrary-provider-model")).toThrow("selected AI model is unavailable");
    expect(sendMessageSchema.safeParse({ body: { conversationId: "bad", content: " ", model: "gpt-test", requestId: "bad" }, query: {}, params: {} }).success).toBe(false);
    expect(listMessagesSchema.safeParse({ params: { conversationId: new mongoose.Types.ObjectId().toString() }, query: { limit: "101" }, body: {} }).success).toBe(false);
    expect(listMessagesSchema.safeParse({ params: { conversationId: new mongoose.Types.ObjectId().toString() }, query: { limit: "20", before: "tomorrow" }, body: {} }).success).toBe(false);
  });
});
