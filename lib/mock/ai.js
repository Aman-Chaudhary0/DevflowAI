export const backendGeneratorExamples = [
  {
    id: "bg_1",
    title: "Appointment booking backend (Healthcare)",
    prompt: "Build an appointment booking backend for a healthcare platform with patients, doctors, appointments, authentication, and a live queue.",
    createdAt: "2026-08-22T10:12:00.000Z",
    model: "gpt-4o",
    usage: 123
  },
  {
    id: "bg_2",
    title: "Task management API (SaaS)",
    prompt: "Task management API with projects, tasks, users, permissions, webhooks, and audit logs.",
    createdAt: "2026-08-20T13:22:00.000Z",
    model: "claude-2",
    usage: 87
  }
];

export const aiHistory = [
  { id: "h1", tool: "Code Generator", title: "Create JWT Auth", project: "DevFlow AI", status: "Completed", createdAt: "2026-08-23T07:12:00.000Z", model: "gpt-4o", tokens: 340 },
  { id: "h2", tool: "Chat", title: "Refactor pagination", project: "MediQueue", status: "Completed", createdAt: "2026-08-22T21:02:00.000Z", model: "claude-2", tokens: 120 },
  { id: "h3", tool: "Backend Generator", title: "Appointment booking backend (Healthcare)", project: "MediQueue", status: "In Progress", createdAt: "2026-08-22T10:12:00.000Z", model: "gpt-4o", tokens: 0 }
];
