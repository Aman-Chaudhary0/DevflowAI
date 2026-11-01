import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { once } from "node:events";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import EditorFile from "../models/EditorFile.js";

jest.setTimeout(30000);

describe("Editor File API", () => {
  let mongo, server, baseUrl;
  let userA, userB, tokenA, tokenB;
  const env = {};

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "editor-test" });
    for (const k of ["JWT_ACCESS_SECRET", "FRONTEND_URL"]) env[k] = process.env[k];
    process.env.JWT_ACCESS_SECRET = "editor-test-secret";
    process.env.FRONTEND_URL = "http://localhost:3000";
    await EditorFile.syncIndexes();
    const { app } = await import("../app.js");
    server = app.listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    await new Promise((r) => server.close(r));
    await mongoose.disconnect();
    await mongo.stop();
    for (const [k, v] of Object.entries(env)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), EditorFile.deleteMany({})]);
    userA = await User.create({ name: "User A", email: "a@test.com", password: "StrongPass123!", isVerified: true });
    userB = await User.create({ name: "User B", email: "b@test.com", password: "StrongPass123!", isVerified: true });
    tokenA = jwt.sign({ sub: userA._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    tokenB = jwt.sign({ sub: userB._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
  });

  const auth = (token) => ({ Cookie: `accessToken=${token}` });
  const json = (body) => ({ "Content-Type": "application/json", ...auth(tokenA) });

  // ─── Authentication ──────────────────────────────────────────────────────────

  it("returns 401 for unauthenticated GET /api/editor/files", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files`);
    expect(res.status).toBe(401);
  });

  it("returns 401 for unauthenticated POST /api/editor/files", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "t", path: "a.js" }) });
    expect(res.status).toBe(401);
  });

  // ─── Create ──────────────────────────────────────────────────────────────────

  it("creates a file", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth(tokenA) },
      body: JSON.stringify({ title: "App", path: "app/page.jsx", content: "export default function Page() {}" })
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.file.path).toBe("app/page.jsx");
    expect(body.data.file.language).toBe("javascript");
  });

  it("rejects path traversal", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth(tokenA) },
      body: JSON.stringify({ title: "Bad", path: "../etc/passwd" })
    });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate path for same owner", async () => {
    const payload = { title: "A", path: "lib/utils.js" };
    await fetch(`${baseUrl}/api/editor/files`, { method: "POST", headers: { "Content-Type": "application/json", ...auth(tokenA) }, body: JSON.stringify(payload) });
    const res = await fetch(`${baseUrl}/api/editor/files`, { method: "POST", headers: { "Content-Type": "application/json", ...auth(tokenA) }, body: JSON.stringify(payload) });
    expect(res.status).toBe(409);
  });

  it("allows same path for different owners", async () => {
    const payload = { title: "A", path: "lib/utils.js" };
    await fetch(`${baseUrl}/api/editor/files`, { method: "POST", headers: { "Content-Type": "application/json", ...auth(tokenA) }, body: JSON.stringify(payload) });
    const res = await fetch(`${baseUrl}/api/editor/files`, { method: "POST", headers: { "Content-Type": "application/json", ...auth(tokenB) }, body: JSON.stringify(payload) });
    expect(res.status).toBe(201);
  });

  it("rejects missing title", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth(tokenA) },
      body: JSON.stringify({ path: "a.js" })
    });
    expect(res.status).toBe(400);
  });

  // ─── List ────────────────────────────────────────────────────────────────────

  it("lists only the authenticated user's files", async () => {
    await EditorFile.create({ owner: userA._id, title: "A", path: "a.js" });
    await EditorFile.create({ owner: userB._id, title: "B", path: "b.js" });
    const res = await fetch(`${baseUrl}/api/editor/files`, { headers: auth(tokenA) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.files).toHaveLength(1);
    expect(body.data.files[0].path).toBe("a.js");
  });

  it("searches files by path", async () => {
    await EditorFile.create({ owner: userA._id, title: "A", path: "app/page.jsx" });
    await EditorFile.create({ owner: userA._id, title: "B", path: "lib/utils.js" });
    const res = await fetch(`${baseUrl}/api/editor/files?search=app`, { headers: auth(tokenA) });
    const body = await res.json();
    expect(body.data.files).toHaveLength(1);
  });

  // ─── Get ─────────────────────────────────────────────────────────────────────

  it("retrieves a file with content", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js", content: "const x = 1;" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, { headers: auth(tokenA) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.file.content).toBe("const x = 1;");
  });

  it("returns 404 for another user's file", async () => {
    const file = await EditorFile.create({ owner: userB._id, title: "B", path: "b.js" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, { headers: auth(tokenA) });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid file id", async () => {
    const res = await fetch(`${baseUrl}/api/editor/files/not-an-id`, { headers: auth(tokenA) });
    expect(res.status).toBe(400);
  });

  // ─── Update ──────────────────────────────────────────────────────────────────

  it("updates file content", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js", content: "old" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth(tokenA) },
      body: JSON.stringify({ content: "new content" })
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.file.content).toBe("new content");
  });

  it("renames a file and updates language", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth(tokenA) },
      body: JSON.stringify({ path: "a.py" })
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.file.language).toBe("python");
  });

  it("user B cannot update user A's file", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...auth(tokenB) },
      body: JSON.stringify({ content: "hacked" })
    });
    expect(res.status).toBe(404);
  });

  // ─── Delete ──────────────────────────────────────────────────────────────────

  it("deletes an owned file", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, { method: "DELETE", headers: auth(tokenA) });
    expect(res.status).toBe(200);
    expect(await EditorFile.countDocuments({ _id: file._id })).toBe(0);
  });

  it("user B cannot delete user A's file", async () => {
    const file = await EditorFile.create({ owner: userA._id, title: "A", path: "a.js" });
    const res = await fetch(`${baseUrl}/api/editor/files/${file._id}`, { method: "DELETE", headers: auth(tokenB) });
    expect(res.status).toBe(404);
    expect(await EditorFile.countDocuments({ _id: file._id })).toBe(1);
  });
});
