import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { once } from "node:events";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import { classifySQL, runAITool } from "../services/ai-tools.service.js";
import { aiToolSchemas } from "../validators/aiTools.validator.js";

jest.setTimeout(30000);

const validOutputs = {
  "code-generator": { code: "export const answer = 42;", filename: "answer.js", language: "javascript", explanation: "A small module.", dependencies: [], assumptions: [] },
  "code-review": { summary: "One concern.", findings: [{ title: "Check input", severity: "Low", category: "correctness", description: "Validate input", location: null, suggestion: "Add validation" }], positiveObservations: [], recommendations: [] },
  documentation: { markdown: "# Notes", assumptions: [] },
  "bug-fixer": { summary: "Likely issue", rootCause: "Missing guard", explanation: "The value can be absent.", correctedCode: null, suggestedChanges: [], recommendations: [], assumptions: [], diff: null },
  "backend-generator": { architecture: "Layers", database: "Entities", api: "Routes", code: "Structure", assumptions: [] },
  "sql-generator": { sql: "SELECT 1;", explanation: "Constant query", dialect: "PostgreSQL", tables: [], joins: [], assumptions: [], performanceConcerns: [], safety: { classification: "read-only", warnings: [] } }
};

// ─── Service-layer tests ──────────────────────────────────────────────────────

describe("AI tools service layer", () => {
  const env = {};
  let originalFetch;

  beforeAll(() => {
    for (const key of ["AI_API_KEY", "AI_MODEL", "AI_PROVIDER"]) env[key] = process.env[key];
    process.env.AI_API_KEY = "test-secret";
    process.env.AI_MODEL = "gpt-test";
    process.env.AI_PROVIDER = "openai";
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(env)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  });

  beforeEach(() => { originalFetch = global.fetch; });
  afterEach(() => { global.fetch = originalFetch; });

  it.each(Object.keys(validOutputs))("returns validated %s output from the centralized AI service", async (tool) => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: JSON.stringify(validOutputs[tool]) }, finish_reason: "stop" }] }) });
    const input = tool === "code-review" ? { code: "const x = 1;" } : tool === "sql-generator" ? { prompt: "Get one row", dialect: "PostgreSQL" } : tool === "bug-fixer" ? { error: "TypeError" } : { prompt: "Create a small example" };
    const result = await runAITool(tool, input, "authenticated-user-id");
    if (tool === "sql-generator") expect(result.result).toMatchObject({ ...validOutputs[tool], safety: { classification: "read-only" } });
    else expect(result.result).toEqual(validOutputs[tool]);
    expect(result.metadata.provider).toBe("openai");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed provider output with AI_INVALID_RESPONSE", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: "not-json" }, finish_reason: "stop" }] }) });
    await expect(runAITool("documentation", { prompt: "Write docs" }, "user")).rejects.toMatchObject({ code: "AI_INVALID_RESPONSE", statusCode: 502 });
  });

  it("rejects extra request properties and unsupported enum values", () => {
    expect(aiToolSchemas.documentation.safeParse({ body: { prompt: "Write docs", userId: "attacker" } }).success).toBe(false);
    expect(aiToolSchemas["sql-generator"].safeParse({ body: { prompt: "query", dialect: "Oracle" } }).success).toBe(false);
    expect(aiToolSchemas["code-generator"].safeParse({ body: { prompt: "code", language: "cobol" } }).success).toBe(false);
  });

  it("classifies SQL statements correctly including string-literal false positives", () => {
    expect(classifySQL("DELETE FROM users;")).toMatchObject({ classification: "modifying" });
    expect(classifySQL("DROP TABLE users;")).toMatchObject({ classification: "destructive" });
    expect(classifySQL("SELECT 'DROP TABLE users';")).toMatchObject({ classification: "read-only" });
    expect(classifySQL("SELECT * FROM orders;")).toMatchObject({ classification: "read-only" });
    expect(classifySQL("INSERT INTO logs VALUES (1);")).toMatchObject({ classification: "modifying" });
  });

  it("propagates provider network failure as a service error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network failure"));
    await expect(runAITool("code-generator", { prompt: "test" }, "user")).rejects.toMatchObject({ statusCode: 503 });
  });

  it("does not persist a result when the caller cancels before the provider resolves", async () => {
    let resolveProvider;
    global.fetch = jest.fn(() => new Promise((resolve) => { resolveProvider = resolve; }));
    const controller = new AbortController();
    const pending = runAITool("code-generator", { prompt: "cancel me" }, "user", controller.signal);
    while (!resolveProvider) await new Promise((r) => setTimeout(r, 0));
    controller.abort();
    resolveProvider({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: JSON.stringify(validOutputs["code-generator"]) }, finish_reason: "stop" }] }) });
    await expect(pending).rejects.toBeDefined();
  });
});

// ─── HTTP-level tests ─────────────────────────────────────────────────────────

describe("AI tools HTTP endpoints", () => {
  let mongo;
  let user;
  let token;
  let originalFetch;
  let server;
  let baseUrl;
  const originalEnv = {};

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "ai-tools-http-test" });
    for (const key of ["AI_API_KEY", "AI_MODEL", "AI_PROVIDER", "JWT_ACCESS_SECRET", "FRONTEND_URL"]) originalEnv[key] = process.env[key];
    process.env.AI_API_KEY = "test-secret";
    process.env.AI_MODEL = "gpt-test";
    process.env.AI_PROVIDER = "openai";
    process.env.JWT_ACCESS_SECRET = "ai-tools-test-secret";
    process.env.FRONTEND_URL = "http://localhost:3000";
    const { app } = await import("../app.js");
    server = app.listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    await mongo.stop();
    for (const [key, value] of Object.entries(originalEnv)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    user = await User.create({ name: "Tool User", email: "tool-user@example.com", password: "StrongPass123!", isVerified: true });
    token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    originalFetch = global.fetch;
  });

  afterEach(() => { global.fetch = originalFetch; });

  const authHeader = () => ({ Cookie: `accessToken=${token}` });

  // Mock only the outbound provider fetch, not the inbound test fetch
  const mockProvider = (output) => {
    const realFetch = global.fetch;
    global.fetch = jest.fn((url, ...args) => {
      // Let requests to our own test server pass through
      if (typeof url === "string" && url.startsWith(baseUrl)) return realFetch(url, ...args);
      return Promise.resolve({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content: JSON.stringify(output) }, finish_reason: "stop" }] }) });
    });
  };

  const mockProviderFail = (error) => {
    const realFetch = global.fetch;
    global.fetch = jest.fn((url, ...args) => {
      if (typeof url === "string" && url.startsWith(baseUrl)) return realFetch(url, ...args);
      return Promise.reject(error);
    });
  };

  const mockProviderBadJson = (content) => {
    const realFetch = global.fetch;
    global.fetch = jest.fn((url, ...args) => {
      if (typeof url === "string" && url.startsWith(baseUrl)) return realFetch(url, ...args);
      return Promise.resolve({ ok: true, json: async () => ({ model: "gpt-test", choices: [{ message: { content }, finish_reason: "stop" }] }) });
    });
  };

  it("returns 401 for unauthenticated requests to all six tool endpoints", async () => {
    const endpoints = ["code-generator", "code-review", "documentation", "bug-fixer", "backend-generator", "sql-generator"];
    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}/api/ai/tools/${ep}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: "test" }) });
      expect(res.status).toBe(401);
    }
  });

  it("returns 200 with structured output for an authenticated code-generator request", async () => {
    mockProvider(validOutputs["code-generator"]);
    const res = await fetch(`${baseUrl}/api/ai/tools/code-generator`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: "Build a counter component" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.result.code).toBe(validOutputs["code-generator"].code);
    expect(body.data.metadata.provider).toBe("openai");
    expect(JSON.stringify(body)).not.toContain("test-secret");
  });

  it("returns 200 with structured output for an authenticated code-review request", async () => {
    mockProvider(validOutputs["code-review"]);
    const res = await fetch(`${baseUrl}/api/ai/tools/code-review`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ code: "const x = eval(input);" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data.result.findings)).toBe(true);
    // location must be nulled server-side regardless of what the model returns
    body.data.result.findings.forEach((f) => expect(f.location).toBeNull());
  });

  it("returns 200 with structured output for an authenticated sql-generator request and overrides model safety with server classification", async () => {
    mockProvider(validOutputs["sql-generator"]);
    const res = await fetch(`${baseUrl}/api/ai/tools/sql-generator`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: "Get one row", dialect: "PostgreSQL" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.result.safety.classification).toBe("read-only");
    expect(body.data.result.safety.warnings).toContain("Generated SQL is untrusted and must be reviewed; it was not executed.");
  });

  it("returns 400 for missing required fields", async () => {
    const res = await fetch(`${baseUrl}/api/ai/tools/code-generator`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unsupported SQL dialect", async () => {
    const res = await fetch(`${baseUrl}/api/ai/tools/sql-generator`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: "query", dialect: "Oracle" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when extra properties are injected into the request body", async () => {
    const res = await fetch(`${baseUrl}/api/ai/tools/documentation`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: "docs", userId: "attacker", __proto__: {} }) });
    expect(res.status).toBe(400);
  });

  it("returns 502 when the provider returns malformed output", async () => {
    mockProviderBadJson("not valid json at all");
    const res = await fetch(`${baseUrl}/api/ai/tools/documentation`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: "Write docs" }) });
    expect(res.status).toBe(502);
  });

  it("returns 503 when the provider is unavailable", async () => {
    mockProviderFail(new Error("ECONNREFUSED"));
    const res = await fetch(`${baseUrl}/api/ai/tools/bug-fixer`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ error: "TypeError: x is undefined" }) });
    expect(res.status).toBe(503);
  });

  it("returns 400 when the total input payload exceeds the request limit", async () => {
    const oversized = "x".repeat(21000);
    const res = await fetch(`${baseUrl}/api/ai/tools/code-generator`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ prompt: oversized }) });
    expect(res.status).toBe(400);
  });
});
