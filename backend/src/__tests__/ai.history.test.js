import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { once } from "node:events";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import { AIExecution } from "../models/AIExecution.js";
import { AIConversation } from "../models/AIConversation.js";
import { AIMessage } from "../models/AIMessage.js";
import { recordExecution } from "../services/ai-execution.service.js";

jest.setTimeout(30000);

describe("AI History, Usage Tracking & Analytics", () => {
  let mongo;
  let userA;
  let userB;
  let server;
  let baseUrl;
  let tokenA;
  let tokenB;
  const env = {};

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "ai-history-test" });
    for (const k of ["AI_API_KEY", "AI_MODEL", "AI_PROVIDER", "JWT_ACCESS_SECRET", "FRONTEND_URL"]) env[k] = process.env[k];
    process.env.AI_API_KEY = "test-key";
    process.env.AI_MODEL = "gpt-test";
    process.env.AI_PROVIDER = "openai";
    process.env.JWT_ACCESS_SECRET = "ai-history-test-secret";
    process.env.FRONTEND_URL = "http://localhost:3000";
    await AIExecution.syncIndexes();
    const { app } = await import("../app.js");
    server = app.listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
    for (const [k, v] of Object.entries(env)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), AIExecution.deleteMany({}), AIConversation.deleteMany({}), AIMessage.deleteMany({})]);
    userA = await User.create({ name: "User A", email: "usera@example.com", password: "StrongPass123!", isVerified: true });
    userB = await User.create({ name: "User B", email: "userb@example.com", password: "StrongPass123!", isVerified: true });
    tokenA = jwt.sign({ sub: userA._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    tokenB = jwt.sign({ sub: userB._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
  });

  // ─── Model tests ────────────────────────────────────────────────────────────

  describe("AIExecution model", () => {
    it("creates a valid execution record", async () => {
      const doc = await AIExecution.create({ owner: userA._id, tool: "chat", status: "completed", provider: "openai", model: "gpt-test", inputTokens: 10, outputTokens: 20, totalTokens: 30, usageSource: "provider", requestDurationMs: 1200 });
      expect(doc._id).toBeDefined();
      expect(doc.tool).toBe("chat");
      expect(doc.status).toBe("completed");
      expect(doc.totalTokens).toBe(30);
    });

    it("rejects invalid tool enum", async () => {
      await expect(AIExecution.create({ owner: userA._id, tool: "invalid-tool", status: "completed" })).rejects.toThrow();
    });

    it("rejects invalid status enum", async () => {
      await expect(AIExecution.create({ owner: userA._id, tool: "chat", status: "unknown" })).rejects.toThrow();
    });

    it("rejects negative token counts", async () => {
      await expect(AIExecution.create({ owner: userA._id, tool: "chat", status: "completed", inputTokens: -1 })).rejects.toThrow();
    });

    it("allows null token counts when usage is unavailable", async () => {
      const doc = await AIExecution.create({ owner: userA._id, tool: "code-generator", status: "completed", inputTokens: null, outputTokens: null, totalTokens: null, usageSource: "unavailable" });
      expect(doc.inputTokens).toBeNull();
      expect(doc.usageSource).toBe("unavailable");
    });

    it("allows optional conversation and project references", async () => {
      const conv = await AIConversation.create({ owner: userA._id, model: "gpt-test", title: "Test" });
      const doc = await AIExecution.create({ owner: userA._id, tool: "chat", status: "completed", conversation: conv._id });
      expect(String(doc.conversation)).toBe(String(conv._id));
      expect(doc.project).toBeNull();
    });
  });

  // ─── recordExecution service tests ──────────────────────────────────────────

  describe("recordExecution service", () => {
    it("persists a completed execution with provider usage", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed", provider: "openai", model: "gpt-test", usage: { source: "provider", inputTokens: 50, outputTokens: 80, totalTokens: 130 }, requestDurationMs: 2000, startedAt: new Date(), completedAt: new Date() });
      expect(doc).not.toBeNull();
      expect(doc.inputTokens).toBe(50);
      expect(doc.outputTokens).toBe(80);
      expect(doc.totalTokens).toBe(130);
      expect(doc.usageSource).toBe("provider");
    });

    it("stores null tokens when usage source is unavailable", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "sql-generator", status: "completed", usage: { source: "unavailable" } });
      expect(doc.inputTokens).toBeNull();
      expect(doc.totalTokens).toBeNull();
      expect(doc.usageSource).toBe("unavailable");
    });

    it("records failed executions with errorCode", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "bug-fixer", status: "failed", errorCode: "AI_PROVIDER_UNAVAILABLE" });
      expect(doc.status).toBe("failed");
      expect(doc.errorCode).toBe("AI_PROVIDER_UNAVAILABLE");
    });

    it("records cancelled executions", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "chat", status: "cancelled" });
      expect(doc.status).toBe("cancelled");
    });

    it("returns null and does not throw when owner is missing", async () => {
      const result = await recordExecution({ tool: "chat", status: "completed" });
      expect(result).toBeNull();
    });

    it("computes totalTokens from input+output when both are present", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "documentation", status: "completed", usage: { source: "provider", inputTokens: 40, outputTokens: 60 } });
      expect(doc.totalTokens).toBe(100);
    });

    it("does not fabricate totalTokens when only one component is available", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "code-review", status: "completed", usage: { source: "provider", inputTokens: 40, outputTokens: null } });
      expect(doc.totalTokens).toBeNull();
    });
  });

  // ─── HTTP API — authentication ───────────────────────────────────────────────

  describe("HTTP API — unauthenticated access", () => {
    it("returns 401 for GET /api/ai/history without auth", async () => {
      const res = await fetch(`${baseUrl}/api/ai/history`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for GET /api/ai/usage/summary without auth", async () => {
      const res = await fetch(`${baseUrl}/api/ai/usage/summary`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for GET /api/ai/usage/by-tool without auth", async () => {
      const res = await fetch(`${baseUrl}/api/ai/usage/by-tool`);
      expect(res.status).toBe(401);
    });

    it("returns 401 for DELETE /api/ai/history/:id without auth", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/ai/history/${fakeId}`, { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  // ─── HTTP API — cross-user isolation ────────────────────────────────────────

  describe("HTTP API — cross-user isolation", () => {
    it("user B cannot read user A's history", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/history`, { headers: { Cookie: `accessToken=${tokenB}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.executions).toHaveLength(0);
    });

    it("user B cannot delete user A's execution record", async () => {
      const doc = await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/history/${doc._id}`, { method: "DELETE", headers: { Cookie: `accessToken=${tokenB}` } });
      expect(res.status).toBe(404);
      expect(await AIExecution.countDocuments({ _id: doc._id })).toBe(1);
    });

    it("usage summary only counts the authenticated user's executions", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed" });
      await recordExecution({ owner: userB._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/usage/summary`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.total).toBe(2);
    });
  });

  // ─── HTTP API — history CRUD ─────────────────────────────────────────────────

  describe("HTTP API — history list and detail", () => {
    it("lists executions with pagination", async () => {
      for (let i = 0; i < 5; i++) await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/history?limit=3&page=1`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.executions).toHaveLength(3);
      expect(body.data.pagination.total).toBe(5);
      expect(body.data.pagination.pages).toBe(2);
    });

    it("filters by tool", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/history?tool=chat`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.executions.every((e) => e.tool === "chat")).toBe(true);
    });

    it("filters by status", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "chat", status: "failed" });
      const res = await fetch(`${baseUrl}/api/ai/history?status=failed`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.executions.every((e) => e.status === "failed")).toBe(true);
    });

    it("returns 400 for invalid tool filter", async () => {
      const res = await fetch(`${baseUrl}/api/ai/history?tool=invalid-tool`, { headers: { Cookie: `accessToken=${tokenA}` } });
      expect(res.status).toBe(400);
    });

    it("returns 404 for a non-existent history item", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/api/ai/history/${fakeId}`, { headers: { Cookie: `accessToken=${tokenA}` } });
      expect(res.status).toBe(404);
    });

    it("deletes an owned execution record without touching conversations", async () => {
      const conv = await AIConversation.create({ owner: userA._id, model: "gpt-test", title: "Keep me" });
      const doc = await recordExecution({ owner: userA._id, tool: "chat", status: "completed", conversation: conv._id });
      const res = await fetch(`${baseUrl}/api/ai/history/${doc._id}`, { method: "DELETE", headers: { Cookie: `accessToken=${tokenA}` } });
      expect(res.status).toBe(200);
      expect(await AIExecution.countDocuments({ _id: doc._id })).toBe(0);
      // Conversation must NOT be deleted
      expect(await AIConversation.countDocuments({ _id: conv._id })).toBe(1);
    });

    it("returns empty list for a user with no executions", async () => {
      const res = await fetch(`${baseUrl}/api/ai/history`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.executions).toHaveLength(0);
      expect(body.data.pagination.total).toBe(0);
    });
  });

  // ─── HTTP API — usage summary ────────────────────────────────────────────────

  describe("HTTP API — usage summary", () => {
    it("returns correct aggregated counts", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed", usage: { source: "provider", inputTokens: 10, outputTokens: 20 } });
      await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed", usage: { source: "provider", inputTokens: 30, outputTokens: 40 } });
      await recordExecution({ owner: userA._id, tool: "bug-fixer", status: "failed" });
      await recordExecution({ owner: userA._id, tool: "sql-generator", status: "cancelled" });
      const res = await fetch(`${baseUrl}/api/ai/usage/summary`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.total).toBe(4);
      expect(body.data.completed).toBe(2);
      expect(body.data.failed).toBe(1);
      expect(body.data.cancelled).toBe(1);
      expect(body.data.tokensAvailable).toBe(true);
      expect(body.data.totalTokens).toBe(100);
    });

    it("returns zero counts for empty dataset", async () => {
      const res = await fetch(`${baseUrl}/api/ai/usage/summary`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.total).toBe(0);
      expect(body.data.tokensAvailable).toBe(false);
    });

    it("reports mostUsedTool correctly", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/usage/summary`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(body.data.mostUsedTool).toBe("chat");
    });
  });

  // ─── HTTP API — usage by-tool ────────────────────────────────────────────────

  describe("HTTP API — usage by-tool", () => {
    it("groups executions by tool correctly", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userA._id, tool: "chat", status: "failed" });
      await recordExecution({ owner: userA._id, tool: "code-generator", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/usage/by-tool`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      const chatRow = body.data.byTool.find((r) => r._id === "chat");
      expect(chatRow.total).toBe(2);
      expect(chatRow.failed).toBe(1);
    });

    it("does not mix users in by-tool aggregation", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      await recordExecution({ owner: userB._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/usage/by-tool`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      const chatRow = body.data.byTool.find((r) => r._id === "chat");
      expect(chatRow.total).toBe(1);
    });
  });

  // ─── HTTP API — timeseries ───────────────────────────────────────────────────

  describe("HTTP API — usage timeseries", () => {
    it("returns timeseries rows for the date range", async () => {
      await recordExecution({ owner: userA._id, tool: "chat", status: "completed" });
      const res = await fetch(`${baseUrl}/api/ai/usage/timeseries?interval=day`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(body.data.timeseries)).toBe(true);
      expect(body.data.timeseries.length).toBeGreaterThan(0);
    });

    it("returns empty timeseries for no data", async () => {
      const res = await fetch(`${baseUrl}/api/ai/usage/timeseries`, { headers: { Cookie: `accessToken=${tokenA}` } });
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body.data.timeseries).toHaveLength(0);
    });
  });

  // ─── Chat integration tracking ───────────────────────────────────────────────

  describe("Chat execution tracking integration", () => {
    it("records a completed execution after a successful chat message", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ model: "gpt-test", choices: [{ message: { content: "Hello" }, finish_reason: "stop" }], usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 } })
      });
      const conv = await AIConversation.create({ owner: userA._id, model: "gpt-test", title: "New chat" });
      const { sendChatMessage } = await import("../services/ai-chat.service.js");
      await sendChatMessage(userA._id, { conversationId: conv._id, content: "Hi", model: "gpt-test", requestId: "11111111-1111-1111-1111-111111111111" });
      // Give async recordExecution a tick to complete
      await new Promise((r) => setTimeout(r, 50));
      const execs = await AIExecution.find({ owner: userA._id, tool: "chat" });
      expect(execs.length).toBeGreaterThanOrEqual(1);
      expect(execs[0].status).toBe("completed");
    });

    it("records a failed execution when the provider fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("network error"));
      const conv = await AIConversation.create({ owner: userA._id, model: "gpt-test", title: "New chat" });
      const { sendChatMessage } = await import("../services/ai-chat.service.js");
      await expect(sendChatMessage(userA._id, { conversationId: conv._id, content: "Hi", model: "gpt-test", requestId: "22222222-2222-2222-2222-222222222222" })).rejects.toBeDefined();
      await new Promise((r) => setTimeout(r, 50));
      const execs = await AIExecution.find({ owner: userA._id, tool: "chat", status: "failed" });
      expect(execs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
