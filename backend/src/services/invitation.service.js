import crypto from "crypto";
import Invitation from "../models/Invitation.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/sendEmail.js";

const INVITE_TTL_MS = Math.max(1, Number(process.env.INVITATION_EXPIRY_DAYS) || 7) * 24 * 60 * 60 * 1000;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const sameId = (a, b) => String(a) === String(b);

function safeInvitation(invite) {
  const item = invite.toObject ? invite.toObject() : invite;
  delete item.tokenHash;
  return item;
}

function frontendUrl(path) {
  let base;
  try { base = new URL(process.env.FRONTEND_URL || "http://localhost:3000"); }
  catch { throw new ApiError(503, "Invitation links are not configured"); }
  if (!/^https?:$/.test(base.protocol) || base.username || base.password) throw new ApiError(503, "Invitation links are not configured");
  return `${base.origin}${path}`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

async function canManageWorkspace(userId, workspace) {
  if (sameId(workspace.owner, userId)) return true;
  const membership = await WorkspaceMember.findOne({ workspace: workspace._id, user: userId, status: "active" }).lean();
  return Boolean(membership && ["owner", "admin"].includes(membership.role));
}

async function canManageProject(userId, project) {
  if (sameId(project.owner, userId)) return true;
  const membership = await ProjectMember.findOne({ project: project._id, user: userId }).lean();
  return Boolean(membership && ["owner", "admin"].includes(membership.role));
}

async function deliverInvitation(invite, rawToken, { scopeName, inviterName }) {
  const url = new URL(frontendUrl("/login"));
  url.hash = new URLSearchParams({ invite: rawToken }).toString();
  const roleLabel = invite.role;
  const scopeLabel = invite.scope === "project" ? "project" : "workspace";
  const message = invite.message ? `\n\nPersonal message from ${inviterName}:\n${invite.message}` : "";
  const text = `Hi,\n\n${inviterName} invited you to join ${scopeName} on DevFlow AI as ${roleLabel} (${scopeLabel}). Sign in or register, then explicitly accept the invitation here:\n${url}\n\nThis invitation expires on ${invite.expiresAt.toISOString()}.${message}\n\nIf you were not expecting this invitation, you can ignore this email.`;
  const htmlMessage = invite.message ? `<p style="color:#cbd5e1">${escapeHtml(invite.message)}</p>` : "";
  const safeName = escapeHtml(inviterName);
  const safeScopeName = escapeHtml(scopeName);
  const result = await sendEmail({
    to: invite.email,
    subject: `Invitation to ${scopeName} on DevFlow AI`,
    text,
    html: `<!doctype html><html><body style="font-family:Inter,sans-serif;background:#0b0f19;color:#f8fafc;padding:40px 20px"><main style="max-width:520px;margin:auto;background:#1a2235;border:1px solid #273244;border-radius:18px;padding:32px"><h1 style="font-size:22px">DevFlow AI</h1><p>${safeName} invited you to join <strong>${safeScopeName}</strong> as <strong>${escapeHtml(roleLabel)}</strong>.</p>${htmlMessage}<p>This link expires ${invite.expiresAt.toLocaleDateString("en-US", { timeZone: "UTC" })}. Sign in or register, then explicitly accept the invitation.</p><a href="${url.toString()}" style="display:inline-block;background:#3b82f6;color:white;text-decoration:none;padding:12px 20px;border-radius:10px">Review invitation</a><p style="color:#94a3b8;font-size:12px">If you were not expecting this, ignore this email.</p></main></body></html>`
  });
  if (!result?.sent) throw new ApiError(503, "Invitation email could not be delivered. Configure SMTP and try again.");
}

async function createInvitation({ actor, email, role, message = "", scope, workspace, project = null }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (normalizedEmail === String(actor.email).trim().toLowerCase()) throw new ApiError(400, "You cannot invite your own account");
  const recipient = await User.findOne({ email: normalizedEmail }).select("_id").lean();
  if (recipient) {
    const existing = scope === "workspace"
      ? await WorkspaceMember.exists({ workspace: workspace._id, user: recipient._id })
      : await ProjectMember.exists({ project: project._id, user: recipient._id });
    if (existing) throw new ApiError(409, "This user is already a member");
  }
  await Invitation.updateMany({ scope, workspace: workspace._id, project: project?._id || null, email: normalizedEmail, status: "pending", expiresAt: { $lte: new Date() } }, { $set: { status: "expired" } });
  const rawToken = crypto.randomBytes(32).toString("hex");
  let invite;
  try {
    invite = await Invitation.create({ scope, workspace: workspace._id, project: project?._id || null, email: normalizedEmail, inviter: actor._id, role, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + INVITE_TTL_MS), message });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, "A pending invitation already exists for this email");
    throw error;
  }
  try {
    await deliverInvitation(invite, rawToken, { scopeName: project?.name || workspace.name, inviterName: actor.name || "A DevFlow AI member" });
  } catch (error) {
    await Invitation.deleteOne({ _id: invite._id, status: "pending" });
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, "Invitation email could not be delivered. Please try again.");
  }
  return safeInvitation(invite);
}

export async function createWorkspaceInvitation(actor, workspaceId, body) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new ApiError(404, "Workspace not found");
  if (!await canManageWorkspace(actor._id, workspace)) throw new ApiError(403, "You cannot manage this workspace's members");
  return createInvitation({ actor, ...body, scope: "workspace", workspace });
}

export async function createProjectInvitation(actor, projectId, body) {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (!await canManageProject(actor._id, project)) throw new ApiError(403, "You cannot manage this project's members");
  const workspace = await Workspace.findById(project.workspace);
  if (!workspace) throw new ApiError(404, "Project workspace not found");
  return createInvitation({ actor, ...body, scope: "project", workspace, project });
}

export async function listWorkspaceInvitations(actor, workspaceId) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new ApiError(404, "Workspace not found");
  if (!await canManageWorkspace(actor._id, workspace)) throw new ApiError(403, "You cannot manage this workspace's members");
  await Invitation.updateMany({ scope: "workspace", workspace: workspaceId, status: "pending", expiresAt: { $lte: new Date() } }, { $set: { status: "expired" } });
  return (await Invitation.find({ scope: "workspace", workspace: workspaceId }).populate("inviter", "name").sort({ createdAt: -1 })).map(safeInvitation);
}

export async function listProjectInvitations(actor, projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  if (!await canManageProject(actor._id, project)) throw new ApiError(403, "You cannot manage this project's members");
  await Invitation.updateMany({ scope: "project", project: projectId, status: "pending", expiresAt: { $lte: new Date() } }, { $set: { status: "expired" } });
  return (await Invitation.find({ scope: "project", project: projectId }).populate("inviter", "name").sort({ createdAt: -1 })).map(safeInvitation);
}

export async function revokeInvitation(actor, invitationId) {
  const invite = await Invitation.findById(invitationId);
  if (!invite) throw new ApiError(404, "Invitation not found");
  const allowed = invite.scope === "workspace"
    ? await Workspace.findById(invite.workspace).then((w) => w && canManageWorkspace(actor._id, w))
    : await Project.findById(invite.project).then((p) => p && canManageProject(actor._id, p));
  if (!allowed) throw new ApiError(403, "You cannot revoke this invitation");
  const updated = await Invitation.findOneAndUpdate({ _id: invite._id, status: "pending", expiresAt: { $gt: new Date() } }, { $set: { status: "revoked" } }, { new: true });
  if (!updated) throw new ApiError(409, "Invitation is no longer pending");
  return safeInvitation(updated);
}

async function findRecipientInvitation(user, rawToken) {
  const invite = await Invitation.findOne({ tokenHash: hashToken(rawToken) }).select("+tokenHash").populate("workspace", "name").populate("project", "name").populate("inviter", "name");
  if (!invite) throw new ApiError(404, "Invitation is invalid or unavailable");
  if (String(user.email).trim().toLowerCase() !== invite.email) throw new ApiError(403, "Sign in with the email address invited");
  return invite;
}

export async function getInvitationDetails(user, rawToken) {
  const invite = await findRecipientInvitation(user, rawToken);
  if (invite.status !== "pending" || invite.expiresAt <= new Date()) throw new ApiError(410, "Invitation is expired or no longer available");
  return { scope: invite.scope, role: invite.role, email: invite.email, workspace: invite.workspace, project: invite.project, inviter: invite.inviter, expiresAt: invite.expiresAt, message: invite.message };
}

export async function acceptInvitation(user, rawToken) {
  if (!user.isVerified && user.provider === "local") throw new ApiError(403, "Verify your email before accepting an invitation");
  const invite = await findRecipientInvitation(user, rawToken);
  if (invite.status !== "pending" || invite.expiresAt <= new Date()) throw new ApiError(410, "Invitation is expired or no longer available");
  if (invite.scope === "workspace") {
    const existingMembership = await WorkspaceMember.findOne({ workspace: invite.workspace._id || invite.workspace, user: user._id });
    if (existingMembership?.status === "blocked") throw new ApiError(403, "You cannot join this workspace");
    if (existingMembership?.status === "active") throw new ApiError(409, "You are already a workspace member");
  } else if (await ProjectMember.exists({ project: invite.project._id || invite.project, user: user._id })) {
    throw new ApiError(409, "You are already a project member");
  }
  const claimed = await Invitation.findOneAndUpdate({ _id: invite._id, status: "pending", expiresAt: { $gt: new Date() } }, { $set: { status: "accepted", acceptedAt: new Date(), acceptedBy: user._id } }, { new: true });
  if (!claimed) throw new ApiError(409, "Invitation has already been used");
  try {
    if (invite.scope === "workspace") {
      const workspaceId = invite.workspace._id || invite.workspace;
      const updated = await WorkspaceMember.updateOne(
        { workspace: workspaceId, user: user._id, status: { $in: ["pending", "invited"] } },
        { $set: { role: invite.role, status: "active", invitedBy: invite.inviter._id || invite.inviter, joinedAt: new Date() } }
      );
      if (!updated.matchedCount) await WorkspaceMember.create({ workspace: workspaceId, user: user._id, role: invite.role, status: "active", invitedBy: invite.inviter._id || invite.inviter });
    } else {
      await ProjectMember.create({ project: invite.project._id || invite.project, user: user._id, role: invite.role, addedBy: invite.inviter._id || invite.inviter });
    }
  } catch (error) {
    if (error.code === 11000) {
      await Invitation.updateOne({ _id: invite._id, status: "accepted", acceptedBy: user._id }, { $set: { status: "declined" } });
      throw new ApiError(409, "You are already a member");
    }
    await Invitation.updateOne({ _id: invite._id, status: "accepted", acceptedBy: user._id }, { $set: { status: "pending" }, $unset: { acceptedAt: 1, acceptedBy: 1 } });
    throw error;
  }
  try {
    await Notification.create({
      recipient: invite.inviter._id || invite.inviter,
      actor: user._id,
      workspace: invite.workspace._id || invite.workspace,
      project: invite.project?._id || invite.project || null,
      type: invite.scope,
      title: "Invitation accepted",
      message: `${user.name || user.email} accepted your invitation to ${invite.project?.name || invite.workspace?.name || "a team"}.`,
      targetUrl: invite.project ? `/dashboard/projects/${invite.project._id || invite.project}/team` : "/dashboard/team/members"
    });
  } catch {
    // Notification delivery is secondary to the persisted membership and invite state.
  }
  return { scope: invite.scope, role: invite.role, workspaceId: String(invite.workspace._id || invite.workspace), projectId: invite.project ? String(invite.project._id || invite.project) : null };
}

export async function declineInvitation(user, rawToken) {
  const invite = await findRecipientInvitation(user, rawToken);
  const updated = await Invitation.findOneAndUpdate({ _id: invite._id, status: "pending", expiresAt: { $gt: new Date() } }, { $set: { status: "declined" } }, { new: true });
  if (!updated) throw new ApiError(410, "Invitation is expired or no longer available");
  return safeInvitation(updated);
}
