import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Deployment from "../models/Deployment.js";
import ProjectFile from "../models/ProjectFile.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import { ApiError } from "../utils/ApiError.js";

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugifyName(value) {
  const base = normalizeSlug(value);
  return base || "project";
}

function safeProjectObject(project) {
  const payload = project.toObject ? project.toObject() : { ...project };

  if (payload.owner && typeof payload.owner === "object") {
    payload.owner = {
      _id: payload.owner._id,
      name: payload.owner.name,
      avatar: payload.owner.avatar || ""
    };
  }

  if (payload.workspace && typeof payload.workspace === "object") {
    payload.workspace = {
      _id: payload.workspace._id,
      name: payload.workspace.name,
      slug: payload.workspace.slug
    };
  }

  return payload;
}

export async function ensureDefaultWorkspaceForUser(user) {
  const baseName = String(user?.name || "Workspace").trim() || "Workspace";
  const baseSlug = slugifyName(baseName);
  let workspace = await Workspace.findOne({ owner: user._id }).sort({ createdAt: 1 }).lean();
  if (workspace) {
    return await Workspace.findById(workspace._id);
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Workspace.findOne({ slug });
    if (!existing) {
      try {
        const created = await Workspace.create({
          name: `${baseName.split(" ")[0]}'s Workspace`,
          slug,
          owner: user._id,
          description: "Default workspace"
        });

        await WorkspaceMember.findOneAndUpdate(
          { workspace: created._id, user: user._id },
          {
            $setOnInsert: {
              workspace: created._id,
              user: user._id,
              role: "owner",
              status: "active",
              invitedBy: user._id
            }
          },
          { upsert: true, new: true }
        );

        return created;
      } catch (error) {
        if (error.code !== 11000) throw error;
        slug = `${baseSlug}-${counter}`;
        counter += 1;
        continue;
      }
    }

    if (existing.owner && existing.owner.toString() === user._id.toString()) {
      return existing;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function getAuthorizedProjectIdsForUser(userId) {
  const owned = await Project.find({ owner: userId }, { _id: 1 }).lean();
  const memberProjects = await ProjectMember.find({ user: userId }, { project: 1 }).lean();
  const ids = [
    ...owned.map((project) => project._id),
    ...memberProjects.map((member) => member.project)
  ];

  return ids;
}

export async function getProjectAccessRole(userId, project) {
  if (!project) return null;
  if (project.owner && project.owner.toString() === userId.toString()) {
    return "owner";
  }

  const membership = await ProjectMember.findOne({
    project: project._id,
    user: userId
  });

  return membership?.role || null;
}

export async function assertProjectAccess(userId, projectId) {
  const project = await Project.findById(projectId).populate("owner", "name avatar").populate("workspace", "name slug");
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const role = await getProjectAccessRole(userId, project);
  if (!role) {
    throw new ApiError(404, "Project not found or access denied");
  }

  return { project, role };
}

export async function getProjectForUser(userId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const projectIds = await getAuthorizedProjectIdsForUser(userId);
  const project = await Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { _id: { $in: projectIds } }]
  }).populate("owner", "name avatar").populate("workspace", "name slug");

  if (!project) {
    throw new ApiError(404, "Project not found or access denied");
  }

  return project;
}

export async function listProjectsForUser(user, options = {}) {
  const { page = 1, limit = 20, search, status, visibility, sortBy = "updatedAt", sortOrder = "desc" } = options;
  const projectIds = await getAuthorizedProjectIdsForUser(user._id);

  const filter = {
    _id: { $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")] },
    ...(status ? { status } : {}),
    ...(visibility ? { visibility } : {}),
    ...(search ? {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    } : {})
  };

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate("owner", "name avatar")
      .populate("workspace", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter)
  ]);

  return {
    projects: projects.map((project) => safeProjectObject(project)),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

export async function createProjectForUser(user, input) {
  const workspace = await ensureDefaultWorkspaceForUser(user);
  const name = String(input.name || "").trim();
  if (!name) {
    throw new ApiError(400, "Project name is required");
  }

  const rawSlug = normalizeSlug(input.slug || name);
  if (!rawSlug) {
    throw new ApiError(400, "Project slug is invalid");
  }

  const description = String(input.description || "").trim();
  const visibility = input.visibility || "private";
  const status = input.status || "active";
  const settings = { ...(input.settings || {}), ...((input.color ? { color: input.color } : {})), ...((input.tech ? { techStack: input.tech } : {})) };

  try {
    const project = await Project.create({
      name,
      slug: rawSlug,
      description,
      workspace: workspace._id,
      owner: user._id,
      status,
      visibility,
      repository: {
        provider: input.repository?.provider || "none",
        name: input.repository?.name || "",
        url: input.repository?.url || "",
        defaultBranch: input.repository?.defaultBranch || "main"
      },
      settings
    });

    await ProjectMember.findOneAndUpdate(
      { project: project._id, user: user._id },
      {
        $setOnInsert: {
          project: project._id,
          user: user._id,
          role: "owner"
        }
      },
      { upsert: true, new: true }
    );

    return await Project.findById(project._id).populate("owner", "name avatar").populate("workspace", "name slug");
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A project with this slug already exists in this workspace");
    }
    throw error;
  }
}

export async function updateProjectForUser(user, projectId, input) {
  const { project, role } = await assertProjectAccess(user._id, projectId);

  if (!role || !["owner", "admin"].includes(role)) {
    throw new ApiError(403, "You do not have permission to update this project");
  }

  const nextData = {};
  if (input.name !== undefined) {
    const nextName = String(input.name).trim();
    if (!nextName) throw new ApiError(400, "Project name is required");
    nextData.name = nextName;
  }

  if (input.slug !== undefined) {
    const nextSlug = normalizeSlug(input.slug);
    if (!nextSlug) {
      throw new ApiError(400, "Project slug is invalid");
    }
    nextData.slug = nextSlug;
  }

  if (input.description !== undefined) {
    nextData.description = String(input.description).trim();
  }

  if (input.visibility !== undefined) nextData.visibility = input.visibility;
  if (input.status !== undefined) nextData.status = input.status;

  if (input.repository !== undefined) {
    nextData.repository = {
      ...project.repository,
      ...input.repository,
      provider: input.repository.provider || project.repository?.provider || "none",
      defaultBranch: input.repository.defaultBranch || project.repository?.defaultBranch || "main"
    };
  }

  if (input.settings !== undefined) {
    nextData.settings = {
      ...(project.settings || {}),
      ...(input.settings || {})
    };
  }

  if (Object.keys(nextData).length === 0) {
    throw new ApiError(400, "No valid project fields were provided");
  }

  try {
    const updated = await Project.findByIdAndUpdate(
      project._id,
      { $set: nextData },
      { new: true, runValidators: true }
    ).populate("owner", "name avatar").populate("workspace", "name slug");

    return updated;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "A project with this slug already exists in this workspace");
    }
    throw error;
  }
}

export async function deleteProjectForUser(user, projectId) {
  const { project, role } = await assertProjectAccess(user._id, projectId);

  if (role !== "owner") {
    throw new ApiError(403, "Only the project owner can delete a project");
  }

  await ProjectMember.deleteMany({ project: project._id });
  await Project.findByIdAndDelete(project._id);

  return { deleted: true, projectId: project._id.toString() };
}

export async function getDashboardSummaryForUser(userId) {
  const [projectIds, ownedWorkspaces, workspaceMemberships] = await Promise.all([
    getAuthorizedProjectIdsForUser(userId),
    Workspace.find({ owner: userId }, { _id: 1, owner: 1 }).lean(),
    WorkspaceMember.find({ user: userId, status: "active" }, { workspace: 1 }).lean()
  ]);
  const workspaceIds = [...new Set([
    ...ownedWorkspaces.map((workspace) => String(workspace._id)),
    ...workspaceMemberships.map((membership) => String(membership.workspace))
  ])].map((id) => new mongoose.Types.ObjectId(id));
  const query = {
    _id: { $in: projectIds.length ? projectIds : [new mongoose.Types.ObjectId("000000000000000000000000")] }
  };
  const activityScopes = [];
  if (projectIds.length) activityScopes.push({ project: { $in: projectIds } });
  if (workspaceIds.length) activityScopes.push({ workspace: { $in: workspaceIds } });
  const activityQuery = activityScopes.length ? { $or: activityScopes } : { _id: { $exists: false } };

  const [totalProjects, activeProjects, archivedProjects, taskCount, openTaskCount, deploymentCount, latestDeployment, storageAgg, recentProjects, recentActivity, workspaceMemberIds] = await Promise.all([
    Project.countDocuments(query),
    Project.countDocuments({ ...query, status: "active" }),
    Project.countDocuments({ ...query, status: "archived" }),
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: { $ne: "done" } }),
    Deployment.countDocuments({ project: { $in: projectIds } }),
    Deployment.findOne({ project: { $in: projectIds } }).sort({ createdAt: -1 }).select("createdAt").lean(),
    ProjectFile.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: null, totalBytes: { $sum: "$size" } } }
    ]),
    Project.find(query)
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name status visibility updatedAt createdAt settings owner slug")
      .populate("owner", "name avatar")
      .lean(),
    Activity.find(activityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("actor project entityType entityId action metadata createdAt")
      .populate("actor", "_id name avatar")
      .populate("project", "_id name")
      .lean(),
    workspaceIds.length
      ? WorkspaceMember.distinct("user", { workspace: { $in: workspaceIds }, status: "active" })
      : Promise.resolve([])
  ]);

  const teamMemberIds = [...new Set([
    String(userId),
    ...ownedWorkspaces.map((workspace) => workspace.owner ? String(workspace.owner) : null),
    ...workspaceMemberIds.map(String)
  ].filter(Boolean))];
  const teamMembers = await User.find({ _id: { $in: teamMemberIds } })
    .select("_id name avatar")
    .sort({ name: 1 })
    .limit(10)
    .lean();

  return {
    totalProjects,
    activeProjects,
    archivedProjects,
    taskCount,
    openTaskCount,
    deploymentCount,
    latestDeploymentAt: latestDeployment?.createdAt || null,
    storageBytes: storageAgg[0]?.totalBytes || 0,
    teamMemberCount: teamMemberIds.length,
    teamMembers,
    recentProjects: recentProjects.map((project) => safeProjectObject(project)),
    recentActivity
  };
}
