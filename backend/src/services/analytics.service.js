import Activity from "../models/Activity.js";
import Deployment from "../models/Deployment.js";
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
