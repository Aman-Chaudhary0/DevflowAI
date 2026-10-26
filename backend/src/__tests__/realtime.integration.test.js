import http from "node:http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { Server } from "socket.io";
import { io as socketClient } from "socket.io-client";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app.js";
import { configureSocketAuth } from "../realtime/socketAuth.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";

jest.setTimeout(60000);

describe("authenticated realtime collaboration integration", () => {
  let mongoServer;
  let server;
  let ioServer;
  let baseUrl;
  let owner;
  let recipient;
  let outsider;
  let workspace;
  let project;
  let ownerToken;
  let recipientToken;
  let outsiderToken;
  let ownerSocket;
  let recipientSocket;
  let outsiderSocket;

  const origin = "http://localhost:3000";

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = "realtime-integration-access-secret";
    process.env.FRONTEND_URL = origin;
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "devflowai-realtime-integration-test" });
    server = http.createServer(app);
    ioServer = new Server(server, {
      cors: { origin, credentials: true },
      allowRequest: (request, callback) => callback(null, request.headers.origin === origin)
    });
    configureSocketAuth(ioServer);
    app.set("io", ioServer);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterAll(async () => {
    ownerSocket?.disconnect();
    recipientSocket?.disconnect();
    outsiderSocket?.disconnect();
    if (ioServer) await new Promise((resolve) => ioServer.close(resolve));
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}), Workspace.deleteMany({}), WorkspaceMember.deleteMany({}),
      Project.deleteMany({}), ProjectMember.deleteMany({}), Task.deleteMany({}),
      Activity.deleteMany({}), Notification.deleteMany({})
    ]);
    ownerSocket?.disconnect();
    recipientSocket?.disconnect();
    outsiderSocket?.disconnect();

    [owner, recipient, outsider] = await User.create([
      { name: "Workspace Owner", email: "owner-realtime@example.com", password: "StrongPass123!", isVerified: true },
      { name: "Project Member", email: "member-realtime@example.com", password: "StrongPass123!", isVerified: true },
      { name: "Outside User", email: "outsider-realtime@example.com", password: "StrongPass123!", isVerified: true }
    ]);
    ownerToken = jwt.sign({ sub: owner._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    recipientToken = jwt.sign({ sub: recipient._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
    outsiderToken = jwt.sign({ sub: outsider._id.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: "5m" });

    workspace = await Workspace.create({ name: "Realtime Workspace", slug: "realtime-workspace", owner: owner._id });
    project = await Project.create({ name: "Realtime Project", slug: "realtime-project", owner: owner._id, workspace: workspace._id });
    await Promise.all([
      WorkspaceMember.create({ workspace: workspace._id, user: owner._id, role: "owner", status: "active" }),
      WorkspaceMember.create({ workspace: workspace._id, user: recipient._id, role: "member", status: "active" }),
      ProjectMember.create({ project: project._id, user: owner._id, role: "owner" }),
      ProjectMember.create({ project: project._id, user: recipient._id, role: "editor" })
    ]);

    ownerSocket = await connectSocket(ownerToken);
    recipientSocket = await connectSocket(recipientToken);
    outsiderSocket = await connectSocket(outsiderToken);
  });

  async function connectSocket(token) {
    const socket = socketClient(baseUrl, {
      transports: ["polling"],
      withCredentials: true,
      extraHeaders: { Cookie: `accessToken=${token}`, Origin: origin }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Socket connection timed out")), 5000);
      socket.once("connect", () => { clearTimeout(timer); resolve(); });
      socket.once("connect_error", (error) => { clearTimeout(timer); reject(error); });
    });
    await waitForEvent(socket, "connection.ready");
    return socket;
  }

  function waitForEvent(socket, event) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), 5000);
      socket.once(event, (payload) => { clearTimeout(timer); resolve(payload); });
    });
  }

  async function rest(path, token, method = "GET", body) {
    return fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Origin: origin,
        Cookie: `accessToken=${token}`,
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  }

  it("delivers only authorized task events and persists activity and assignment notifications", async () => {
    const createdEvents = [];
    recipientSocket.on("task.created", (event) => createdEvents.push(event));
    const ownerTask = waitForEvent(ownerSocket, "task.created");
    const memberTask = waitForEvent(recipientSocket, "task.created");
    const memberNotification = waitForEvent(recipientSocket, "notification.created");
    const ownerActivity = waitForEvent(ownerSocket, "activity.created");
    const createResponse = await rest("/api/tasks", ownerToken, "POST", {
      title: "Realtime assignment", description: "Sensitive task detail", projectId: String(project._id), assigneeId: String(recipient._id)
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).data.task;
    expect((await ownerTask).resource.id).toBe(String(created._id));
    const deliveredTask = await memberTask;
    expect(deliveredTask.resource.id).toBe(String(created._id));
    expect(deliveredTask.data.task.description).toBeUndefined();
    expect(deliveredTask.actor.email).toBeUndefined();
    expect((await ownerActivity).data.activity.action).toBe("created_task");
    const notificationPayload = await memberNotification;
    expect(notificationPayload.data.notification.recipient).toBe(String(recipient._id));

    const outsiderEvents = [];
    outsiderSocket.on("task.created", (event) => outsiderEvents.push(event));
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(outsiderEvents).toHaveLength(0);
    expect(createdEvents).toHaveLength(1);

    const updatedEvent = waitForEvent(recipientSocket, "task.updated");
    const updatedResponse = await rest(`/api/tasks/${created._id}`, ownerToken, "PATCH", { status: "in_progress" });
    expect(updatedResponse.status).toBe(200);
    expect((await updatedEvent).data.task.status).toBe("in_progress");

    const notificationCount = await Notification.countDocuments({ "metadata.taskId": String(created._id) });
    const unchangedAssignment = await rest(`/api/tasks/${created._id}`, ownerToken, "PATCH", { assigneeId: String(recipient._id) });
    expect(unchangedAssignment.status).toBe(200);
    expect(await Notification.countDocuments({ "metadata.taskId": String(created._id) })).toBe(notificationCount);

    const commentEvent = waitForEvent(recipientSocket, "task.comment.created");
    const commentNotification = waitForEvent(recipientSocket, "notification.created");
    const commentResponse = await rest(`/api/tasks/${created._id}/comments`, ownerToken, "POST", { content: "Persisted comment" });
    expect(commentResponse.status).toBe(201);
    expect((await commentEvent).data.comment.content).toBe("Persisted comment");
    expect((await commentNotification).data.notification.type).toBe("comment");

    const deleteEvent = waitForEvent(recipientSocket, "task.deleted");
    const deleteResponse = await rest(`/api/tasks/${created._id}`, ownerToken, "DELETE");
    expect(deleteResponse.status).toBe(200);
    expect((await deleteEvent).resource.id).toBe(String(created._id));
    expect(await Activity.countDocuments({ entityId: String(created._id), action: "deleted_task" })).toBe(1);
  });

  it("restores offline notifications from REST and leaves mutations successful when notification persistence fails", async () => {
    recipientSocket.disconnect();
    recipientSocket = null;
    const createResponse = await rest("/api/tasks", ownerToken, "POST", {
      title: "Offline assignment", projectId: String(project._id), assigneeId: String(recipient._id)
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).data.task;
    const offlineList = await rest("/api/notifications", recipientToken);
    const offlineNotifications = (await offlineList.json()).data.notifications;
    const offlineNotification = offlineNotifications.find((item) => String(item.metadata.taskId) === String(created._id));
    expect(offlineNotification).toBeDefined();

    recipientSocket = await connectSocket(recipientToken);
    const reconnectList = await rest("/api/notifications", recipientToken);
    expect((await reconnectList.json()).data.notifications.some((item) => String(item._id) === String(offlineNotification._id))).toBe(true);
    const reconciledTasks = await rest(`/api/tasks?projectId=${project._id}&limit=100`, recipientToken);
    expect((await reconciledTasks.json()).data.tasks.some((task) => String(task._id) === String(created._id))).toBe(true);

    const notificationEvents = [];
    recipientSocket.on("notification.created", (event) => notificationEvents.push(event));
    const createNotification = jest.spyOn(Notification, "create").mockRejectedValueOnce(new Error("simulated notification write failure"));
    const failedFollowupResponse = await rest("/api/tasks", ownerToken, "POST", {
      title: "Task survives notification failure", projectId: String(project._id), assigneeId: String(recipient._id)
    });
    createNotification.mockRestore();
    expect(failedFollowupResponse.status).toBe(201);
    const persistedTask = (await failedFollowupResponse.json()).data.task;
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(await Task.exists({ _id: persistedTask._id })).toBeTruthy();
    expect(await Notification.countDocuments({ "metadata.taskId": String(persistedTask._id) })).toBe(0);
    expect(notificationEvents).toHaveLength(0);
  });

  it("requires workspace authorization for the workspace activity feed", async () => {
    const authorized = await rest(`/api/tasks/workspace/${workspace._id}/activity`, ownerToken);
    const denied = await rest(`/api/tasks/workspace/${workspace._id}/activity`, outsiderToken);
    const members = await rest(`/api/tasks/workspace/${workspace._id}/members`, ownerToken);
    expect(authorized.status).toBe(200);
    expect(denied.status).toBe(403);
    const memberRows = (await members.json()).data.members;
    expect(memberRows.find((item) => String(item.user._id) === String(recipient._id)).projectCount).toBe(1);
  });
});
