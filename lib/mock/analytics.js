export const projectAnalytics = {
  mediqueue: {
    progress: 72,
    tasksCompleted: { done: 48, total: 67 },
    commits: 186,
    aiRequests: 342,
    daily: {
      commits: [2,4,6,3,8,5,6],
      tasks: [1,2,0,3,1,4,2],
      ai: [3,8,5,6,7,4,9]
    }
  }
};

// Provide a friendly alias for the demo project slug used elsewhere in the mock data
projectAnalytics["devflow-ai"] = projectAnalytics.mediqueue;
