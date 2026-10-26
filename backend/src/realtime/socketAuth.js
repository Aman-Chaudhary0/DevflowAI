import mongoose from "mongoose";
import { User } from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { REALTIME_EVENTS, projectRoom, userRoom, workspaceRoom } from "./events.js";

function getCookie(cookieHeader, name) {
  const token = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!token) return null;
  try { return decodeURIComponent(token.slice(name.length + 1)); } catch { return null; }
}

export function configureSocketAuth(io) {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
  io.use(async (socket, next) => {
    try {
      const origin = socket.handshake.headers.origin;
      if (origin && origin !== allowedOrigin) return next(new Error("Origin not allowed"));

      // Cookies are the only supported credential; query strings and client IDs are ignored.
      const token = getCookie(socket.handshake.headers.cookie, "accessToken");
      if (!token) return next(new Error("Authentication required"));
      const claims = verifyAccessToken(token);
      if (!claims?.sub || !mongoose.isValidObjectId(claims.sub)) return next(new Error("Invalid session"));
      const user = await User.findById(claims.sub).select("_id").lean();
      if (!user) return next(new Error("Invalid session"));
      socket.data.userId = user._id.toString();
      socket.data.expiresAt = claims.exp ? claims.exp * 1000 : null;
      next();
    } catch {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    socket.join(userRoom(userId));
    try {
      const [workspaceRows, ownedWorkspaces, memberProjects, ownedProjects] = await Promise.all([
        WorkspaceMember.find({ user: userId, status: "active" }, { workspace: 1 }).lean(),
        Workspace.find({ owner: userId }, { _id: 1 }).lean(),
        ProjectMember.find({ user: userId }, { project: 1 }).lean(),
        Project.find({ owner: userId }, { _id: 1 }).lean()
      ]);
      const workspaceIds = new Set([...workspaceRows, ...ownedWorkspaces].map((row) => row.workspace || row._id).map(String));
      const projectIds = new Set([...memberProjects, ...ownedProjects].map((row) => row.project || row._id).map(String));
      for (const id of workspaceIds) socket.join(workspaceRoom(id));
      for (const id of projectIds) socket.join(projectRoom(id));

      if (socket.data.expiresAt) {
        const delay = Math.max(0, socket.data.expiresAt - Date.now());
        const expiryTimer = setTimeout(() => socket.disconnect(true), delay);
        expiryTimer.unref?.();
        socket.on("disconnect", () => clearTimeout(expiryTimer));
      }
      socket.emit(REALTIME_EVENTS.connectionReady, { userId, connectedAt: new Date().toISOString() });

      // Reconcile room access periodically so removed members stop receiving protected events.
      const accessTimer = setInterval(async () => {
        try {
          const [activeWorkspaces, owned, projectMembers, projectOwners] = await Promise.all([
            WorkspaceMember.find({ user: userId, status: "active" }, { workspace: 1 }).lean(),
            Workspace.find({ owner: userId }, { _id: 1 }).lean(),
            ProjectMember.find({ user: userId }, { project: 1 }).lean(),
            Project.find({ owner: userId }, { _id: 1 }).lean()
          ]);
          const nextWorkspaceIds = new Set([...activeWorkspaces, ...owned].map((row) => row.workspace || row._id).map(String));
          const nextProjectIds = new Set([...projectMembers, ...projectOwners].map((row) => row.project || row._id).map(String));
          for (const room of socket.rooms) {
            if (room.startsWith("workspace:") && !nextWorkspaceIds.has(room.slice(10))) socket.leave(room);
            if (room.startsWith("project:") && !nextProjectIds.has(room.slice(8))) socket.leave(room);
          }
        } catch {
          socket.disconnect(true);
        }
      }, 30000);
      accessTimer.unref?.();
      socket.on("disconnect", () => clearInterval(accessTimer));
    } catch {
      socket.disconnect(true);
    }
  });
}
