export const deployments = [
  { id: "dpl_4821", project: "MediQueue", environment: "Production", commit: "a81c92f", branch: "main", status: "Success", duration: "2m 14s", created: "12 minutes ago", author: "Aman" },
  { id: "dpl_4822", project: "MediQueue", environment: "Preview", commit: "b91d21a", branch: "feature/ui-fixes", status: "Building", duration: "--", created: "2 minutes ago", author: "Priya Sharma" }
];

export const deploymentDetails = {
  dpl_4821: {
    id: "dpl_4821",
    project: "MediQueue",
    environment: "Production",
    branch: "main",
    commit: "a81c92f",
    author: "Aman",
    buildTime: "2m 14s",
    created: "12 minutes ago",
    url: "https://mediqueue.devflow.app",
    pipeline: [
      { name: "Queued", status: "done", duration: "5s" },
      { name: "Installing dependencies", status: "done", duration: "34s" },
      { name: "Building", status: "done", duration: "56s" },
      { name: "Running checks", status: "done", duration: "20s" },
      { name: "Deploying", status: "done", duration: "19s" },
      { name: "Live", status: "done", duration: "--" }
    ],
    logs: [
      "$ npm install",
      "Installing dependencies...",
      "added 438 packages",
      "$ npm run build",
      "Creating production build...",
      "✓ Build completed",
      "$ npm run test",
      "✓ 42 tests passed",
      "Deploying...",
      "✓ Deployment successful"
    ]
  }
};
