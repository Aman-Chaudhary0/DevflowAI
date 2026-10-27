import { jest } from "@jest/globals";
import mongoose from "mongoose";
import crypto from "crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Invitation from "../models/Invitation.js";
import Notification from "../models/Notification.js";

jest.unstable_mockModule("../utils/sendEmail.js", () => ({ sendEmail: jest.fn() }));
const { sendEmail } = await import("../utils/sendEmail.js");
const service = await import("../services/invitation.service.js");

jest.setTimeout(30000);

describe("invitation lifecycle", () => {
  let mongo;
  let inviter;
  let recipient;
  let outsider;
  let workspace;
  let project;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: "invitation-test" });
    await Invitation.syncIndexes();
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Workspace.deleteMany({}), WorkspaceMember.deleteMany({}), Project.deleteMany({}), ProjectMember.deleteMany({}), Invitation.deleteMany({}), Notification.deleteMany({})]);
    sendEmail.mockReset().mockResolvedValue({ sent: true });
    inviter = await User.create({ name: "Owner", email: "owner@example.com", password: "StrongPass123!", isVerified: true });
    recipient = await User.create({ name: "Invitee", email: "Invitee@Example.com", password: "StrongPass123!", isVerified: true });
    outsider = await User.create({ name: "Outsider", email: "outsider@example.com", password: "StrongPass123!", isVerified: true });
    workspace = await Workspace.create({ name: "Alpha Workspace", slug: "alpha-workspace", owner: inviter._id });
    await WorkspaceMember.create({ workspace: workspace._id, user: inviter._id, role: "owner", status: "active" });
    project = await Project.create({ name: "Alpha Project", slug: "alpha-project", workspace: workspace._id, owner: inviter._id });
  });

  function tokenFromEmail() {
    const text = sendEmail.mock.calls[0][0].text;
    return new URLSearchParams(new URL(text.match(/https?:\/\/[^\s]+/)[0]).hash.slice(1)).get("invite");
  }

  it("creates a normalized invitation with only a token hash persisted", async () => {
    const invite = await service.createWorkspaceInvitation(inviter, String(workspace._id), { email: "  Invitee@Example.com ", role: "viewer", message: "Hello" });
    const raw = tokenFromEmail();
    const stored = await Invitation.findById(invite._id).select("+tokenHash");
    expect(invite.email).toBe("invitee@example.com");
    expect(invite.role).toBe("viewer");
    expect(invite.status).toBe("pending");
    expect(invite.expiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000);
    expect(stored.tokenHash).toBe(crypto.createHash("sha256").update(raw).digest("hex"));
    expect(stored.tokenHash).not.toBe(raw);
    expect(sendEmail.mock.calls[0][0].to).toBe("invitee@example.com");
  });

  it("requires workspace manager permissions and refuses owner role assignment", async () => {
    await expect(service.createWorkspaceInvitation(outsider, String(workspace._id), { email: "new@example.com", role: "member" })).rejects.toMatchObject({ statusCode: 403 });
    await expect(service.createWorkspaceInvitation(inviter, String(workspace._id), { email: "new@example.com", role: "owner" })).rejects.toBeTruthy();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing SMTP delivery and removes the unsent pending record", async () => {
    sendEmail.mockResolvedValue({ sent: false, reason: "smtp_not_configured" });
    await expect(service.createWorkspaceInvitation(inviter, String(workspace._id), { email: "new@example.com", role: "member" })).rejects.toMatchObject({ statusCode: 503 });
    expect(await Invitation.countDocuments({})).toBe(0);
  });

  it("prevents duplicate pending invitations for the same scope and email", async () => {
    await service.createWorkspaceInvitation(inviter, String(workspace._id), { email: "new@example.com", role: "member" });
    await expect(service.createWorkspaceInvitation(inviter, String(workspace._id), { email: "NEW@example.com", role: "viewer" })).rejects.toMatchObject({ statusCode: 409 });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(await Invitation.countDocuments({ scope: "workspace", workspace: workspace._id, status: "pending" })).toBe(1);
  });

  it("accepts once for the matching verified recipient and creates the requested membership", async () => {
    await service.createWorkspaceInvitation(inviter, String(workspace._id), { email: recipient.email, role: "member" });
    const raw = tokenFromEmail();
    await expect(service.getInvitationDetails(outsider, raw)).rejects.toMatchObject({ statusCode: 403 });
    const membership = await service.acceptInvitation(recipient, raw);
    expect(membership).toMatchObject({ scope: "workspace", role: "member" });
    expect(await WorkspaceMember.exists({ workspace: workspace._id, user: recipient._id, role: "member", status: "active" })).toBeTruthy();
    expect((await Invitation.findOne({ email: recipient.email })).status).toBe("accepted");
    await expect(service.acceptInvitation(recipient, raw)).rejects.toMatchObject({ statusCode: 410 });
    expect(await WorkspaceMember.countDocuments({ workspace: workspace._id, user: recipient._id })).toBe(1);
  });

  it("creates project membership without adding workspace membership and maps editor role", async () => {
    await service.createProjectInvitation(inviter, String(project._id), { email: recipient.email, role: "editor" });
    const result = await service.acceptInvitation(recipient, tokenFromEmail());
    expect(result).toMatchObject({ scope: "project", role: "editor", projectId: String(project._id) });
    expect(await ProjectMember.exists({ project: project._id, user: recipient._id, role: "editor" })).toBeTruthy();
    expect(await WorkspaceMember.exists({ workspace: workspace._id, user: recipient._id })).toBeFalsy();
    expect(await Notification.exists({ recipient: inviter._id, title: "Invitation accepted" })).toBeTruthy();
  });

  it("requires local account email verification before acceptance", async () => {
    await service.createWorkspaceInvitation(inviter, String(workspace._id), { email: recipient.email, role: "viewer" });
    recipient.isVerified = false;
    await expect(service.acceptInvitation(recipient, tokenFromEmail())).rejects.toMatchObject({ statusCode: 403 });
    expect(await WorkspaceMember.exists({ workspace: workspace._id, user: recipient._id })).toBeFalsy();
  });

  it("revokes pending invitations and blocks acceptance; expired invitations cannot be accepted", async () => {
    const invite = await service.createWorkspaceInvitation(inviter, String(workspace._id), { email: recipient.email, role: "viewer" });
    const raw = tokenFromEmail();
    await service.revokeInvitation(inviter, String(invite._id));
    await expect(service.acceptInvitation(recipient, raw)).rejects.toMatchObject({ statusCode: 410 });

    const expired = await Invitation.create({ scope: "workspace", workspace: workspace._id, email: recipient.email, inviter: inviter._id, role: "member", tokenHash: crypto.randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() - 1000), status: "pending" });
    const expiredRaw = crypto.randomBytes(32).toString("hex");
    expired.tokenHash = crypto.createHash("sha256").update(expiredRaw).digest("hex");
    await expired.save();
    await expect(service.acceptInvitation(recipient, expiredRaw)).rejects.toMatchObject({ statusCode: 410 });
  });
});
