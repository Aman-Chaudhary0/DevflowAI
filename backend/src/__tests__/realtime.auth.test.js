import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import { configureSocketAuth } from "../realtime/socketAuth.js";

jest.setTimeout(30000);

describe("Socket.IO access-token authentication", () => {
  let mongoServer;
  let middleware;
  let connectionHandler;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = "realtime-test-access-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "devflowai-realtime-auth-test" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), WorkspaceMember.deleteMany({}), Project.deleteMany({}), ProjectMember.deleteMany({})]);
    const io = { use(handler) { middleware = handler; }, on(event, handler) { if (event === "connection") connectionHandler = handler; } };
    configureSocketAuth(io);
  });

  async function authenticate(socket) {
    return new Promise((resolve) => middleware(socket, (error) => resolve(error || null)));
  }

  it("rejects missing credentials and ignores query-string tokens", async () => {
    const missingCookie = await authenticate({ handshake: { headers: {}, auth: { token: "ignored" }, query: { token: "ignored" } }, data: {} });
    expect(missingCookie).toBeInstanceOf(Error);
    expect(missingCookie.message).toBe("Authentication required");
  });

  it("rejects a handshake from an unconfigured origin", async () => {
    const rejected = await authenticate({ handshake: { headers: { origin: "https://untrusted.example" } }, data: {} });
    expect(rejected).toBeInstanceOf(Error);
    expect(rejected.message).toBe("Origin not allowed");
  });

  it("rejects invalid and expired access cookies", async () => {
    const invalid = await authenticate({ handshake: { headers: { cookie: "accessToken=not-a-jwt" } }, data: {} });
    expect(invalid).toBeInstanceOf(Error);

    const expiredToken = jwt.sign({ sub: new mongoose.Types.ObjectId().toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: -1 });
    const expired = await authenticate({ handshake: { headers: { cookie: `accessToken=${expiredToken}` } }, data: {} });
    expect(expired).toBeInstanceOf(Error);
  });

  it("loads the identity from the verified cookie and ignores client identity claims", async () => {
    const user = await User.create({ name: "Socket User", email: "socket@example.com", password: "StrongPass123!", isVerified: true });
    const token = jwt.sign({ sub: user._id.toString(), role: "admin" }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    const socket = {
      handshake: { headers: { cookie: `accessToken=${token}` } },
      data: {},
      userId: "client-controlled"
    };

    expect(await authenticate(socket)).toBeNull();
    expect(socket.data.userId).toBe(user._id.toString());
    expect(socket.data.userId).not.toBe(socket.userId);
  });

  it("joins only rooms backed by the authenticated user's membership records", async () => {
    const user = await User.create({ name: "Room User", email: "room-user@example.com", password: "StrongPass123!", isVerified: true });
    const outsider = await User.create({ name: "Outsider", email: "room-outsider@example.com", password: "StrongPass123!", isVerified: true });
    const ownWorkspace = await Workspace.create({ name: "Owned Workspace", slug: "owned-workspace", owner: user._id });
    const memberWorkspace = await Workspace.create({ name: "Member Workspace", slug: "member-workspace", owner: outsider._id });
    const privateWorkspace = await Workspace.create({ name: "Private Workspace", slug: "private-workspace", owner: outsider._id });
    await WorkspaceMember.create({ workspace: memberWorkspace._id, user: user._id, role: "member", status: "active" });
    const memberProject = await Project.create({ name: "Member Project", slug: "member-project", workspace: privateWorkspace._id, owner: outsider._id });
    const privateProject = await Project.create({ name: "Private Project", slug: "private-project", workspace: privateWorkspace._id, owner: outsider._id });
    await ProjectMember.create({ project: memberProject._id, user: user._id, role: "viewer" });

    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    const socket = {
      data: { userId: user._id.toString() },
      rooms: new Set(),
      listeners: {},
      join(room) { this.rooms.add(room); },
      leave(room) { this.rooms.delete(room); },
      on(event, handler) { this.listeners[event] = handler; },
      emit() {},
      disconnect() { this.connected = false; this.listeners.disconnect?.(); }
    };
    expect(await authenticate({ ...socket, handshake: { headers: { cookie: `accessToken=${token}` } }, data: socket.data })).toBeNull();
    await connectionHandler(socket);

    expect(socket.rooms.has(`workspace:${ownWorkspace._id}`)).toBe(true);
    expect(socket.rooms.has(`workspace:${memberWorkspace._id}`)).toBe(true);
    expect(socket.rooms.has(`project:${memberProject._id}`)).toBe(true);
    expect(socket.rooms.has(`workspace:${privateWorkspace._id}`)).toBe(false);
    expect(socket.rooms.has(`project:${privateProject._id}`)).toBe(false);
    socket.disconnect();
  });
});
