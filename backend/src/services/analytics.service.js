import Activity from "../models/Activity.js";
import AIExecution from "../models/AIExecution.js";
import Deployment from "../models/Deployment.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { getGitHubCommitCountForUser } from "./github.service.js";
import { getAuthorizedProjectIdsForUser, getProjectForUser } from "./project.service.js";

function periodFilter(projectIds, from, to) {
  return {
    project: { $in: projectIds },
    createdAt: { $gte: new Date(from), $lt: new Date(to) }
  };
}

async function countCompletedTasks(projectIds, from, to) {
  if (!projectIds.length) return 0;
  return Activity.countDocuments({
    ...periodFilter(projectIds, from, to),
    entityType: "task",
    $or: [
      { action: "updated_task_status", "metadata.status.to": "done" },
      { action: "created_task", "metadata.status": "done" }
    ]
  });
}

async function countDeployments(projectIds, from, to) {
  if (!projectIds.length) return 0;
  return Deployment.countDocuments(periodFilter(projectIds, from, to));
}

export async function getAnalyticsSummaryForUser(user, query) {
  const authorizedIds = await getAuthorizedProjectIdsForUser(user._id);
  let projectIds = authorizedIds.map(String);
  let repository = null;

  if (query.projectId) {
    const project = await getProjectForUser(user._id, query.projectId);
    projectIds = [String(project._id)];
    if (project.repository?.provider === "github") repository = project.repository.url || "";
  }

  const [tasksCurrent, tasksPrevious, deploymentsCurrent, deploymentsPrevious, commits] = await Promise.all([
    countCompletedTasks(projectIds, query.from, query.to),
    countCompletedTasks(projectIds, query.previousFrom, query.previousTo),
    countDeployments(projectIds, query.from, query.to),
    countDeployments(projectIds, query.previousFrom, query.previousTo),
    getGitHubCommitCountForUser(user._id, {
      from: query.from,
      to: query.to,
      repository,
      projectFiltered: Boolean(query.projectId)
    }).catch(() => ({ connected: true, available: false, count: null, reason: "unavailable" }))
  ]);

  return {
    tasksCompleted: { current: tasksCurrent, previous: tasksPrevious },
    deployments: { current: deploymentsCurrent, previous: deploymentsPrevious },
    commits
  };
}

export async function getAnalyticsLeaderboardForUser(user, query) {
  const authorizedIds = await getAuthorizedProjectIdsForUser(user._id);
  let projectIds = authorizedIds;

  if (query.projectId) {
    const project = await getProjectForUser(user._id, query.projectId);
    projectIds = [project._id];
  }
  if (!projectIds.length) return [];

  const [projects, memberships, taskStats, aiStats] = await Promise.all([
    Project.find({ _id: { $in: projectIds } }).select("owner").lean(),
    ProjectMember.find({ project: { $in: projectIds } }).distinct("user"),
    Task.aggregate([
      { $match: { project: { $in: projectIds }, updatedAt: { $gte: new Date(query.from), $lt: new Date(query.to) }, assignee: { $ne: null } } },
      { $group: { _id: "$assignee", tasks: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } } } }
    ]),
    AIExecution.aggregate([
      { $match: { project: { $in: projectIds }, createdAt: { $gte: new Date(query.from), $lt: new Date(query.to) } } },
      { $group: { _id: "$owner", requests: { $sum: 1 } } }
    ])
  ]);

  const memberIds = [...new Set([
    ...projects.map((project) => String(project.owner)),
    ...memberships.map(String),
    ...taskStats.map((row) => String(row._id)),
    ...aiStats.map((row) => String(row._id))
  ])];
  if (!memberIds.length) return [];

  const users = await User.find({ _id: { $in: memberIds } }).select("_id name avatar").lean();
  const taskByUser = new Map(taskStats.map((row) => [String(row._id), row]));
  const aiByUser = new Map(aiStats.map((row) => [String(row._id), row.requests]));

  return users.map((member) => {
    const tasks = taskByUser.get(String(member._id));
    const totalTasks = tasks?.tasks || 0;
    const completedTasks = tasks?.completed || 0;
    return {
      _id: member._id,
      name: member.name,
      avatar: member.avatar || "",
      tasks: completedTasks,
      aiRequests: aiByUser.get(String(member._id)) || 0,
      efficiency: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }).sort((a, b) => b.tasks - a.tasks || b.aiRequests - a.aiRequests || a.name.localeCompare(b.name)).slice(0, 5);
}
