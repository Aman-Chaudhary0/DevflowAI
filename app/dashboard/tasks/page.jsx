"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, CheckCircle2, Clock, AlertCircle, Circle,
  Calendar, User, Tag, ArrowUpDown, ChevronRight, MessageSquare,
  Paperclip, LayoutGrid, List, MoreHorizontal, ArrowRight, Trash2, Check
} from "lucide-react";
import { PageHeader, FilterBar, StatusBadge, Avatar, StatCard, toast } from "@/components/dashboard-ui";

const initialTasks = [
  { id: "task-1", title: "Implement Auth Middleware for Next.js 15", description: "Set up JWT cookie verification and route protection for dashboard routes.", project: "Devflow AI Core", priority: "Urgent", status: "In Progress", dueDate: "2025-03-28", assignee: { name: "Aman Chaudhary", color: "#3b82f6" }, comments: 4, attachments: 2, tags: ["backend", "auth"] },
  { id: "task-2", title: "Design System Dark Theme Refresh", description: "Audit CSS variables and enhance color contrast for dark mode components.", project: "UI Design System", priority: "High", status: "To Do", dueDate: "2025-03-30", assignee: { name: "Sarah Chen", color: "#ec4899" }, comments: 2, attachments: 5, tags: ["design", "ui"] },
  { id: "task-3", title: "AI Streaming Responses with Socket.io", description: "Enable real-time token streaming for AI Chat using WebSockets.", project: "Devflow AI Core", priority: "Urgent", status: "In Review", dueDate: "2025-03-27", assignee: { name: "Alex Rivera", color: "#10b981" }, comments: 8, attachments: 1, tags: ["ai", "websockets"] },
  { id: "task-4", title: "Refactor MongoDB Schema for Team Workspace", description: "Add multi-tenant support and role-based permissions to user schema.", project: "Devflow Backend", priority: "Medium", status: "Done", dueDate: "2025-03-24", assignee: { name: "Marcus Vance", color: "#f59e0b" }, comments: 5, attachments: 0, tags: ["database", "mongo"] },
  { id: "task-5", title: "Set up CI/CD Pipeline on GitHub Actions", description: "Automate build, test, and preview deployment on pull requests.", project: "DevOps Setup", priority: "High", status: "To Do", dueDate: "2025-04-02", assignee: { name: "Elena Rostova", color: "#8b5cf6" }, comments: 1, attachments: 3, tags: ["devops", "github"] },
  { id: "task-6", title: "Monaco Editor Integration for Dashboard", description: "Integrate full VS Code editing experience with syntax highlighting.", project: "Devflow AI Core", priority: "Medium", status: "In Progress", dueDate: "2025-04-05", assignee: { name: "Aman Chaudhary", color: "#3b82f6" }, comments: 3, attachments: 0, tags: ["frontend", "editor"] },
  { id: "task-7", title: "Optimize Bundle Size & Web Vitals", description: "Lazy load heavy dependencies like Recharts and Monaco editor.", project: "Devflow AI Core", priority: "Low", status: "Done", dueDate: "2025-03-22", assignee: { name: "Sarah Chen", color: "#ec4899" }, comments: 6, attachments: 2, tags: ["performance"] },
  { id: "task-8", title: "AI Bug Fixer Stack Trace Parsing", description: "Improve parser accuracy for Node.js and React client stack traces.", project: "AI Engine", priority: "High", status: "In Review", dueDate: "2025-03-29", assignee: { name: "Alex Rivera", color: "#10b981" }, comments: 3, attachments: 1, tags: ["ai", "parser"] }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [viewMode, setViewMode] = useState("kanban"); // kanban or list
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", project: "Devflow AI Core", priority: "Medium", status: "To Do", dueDate: "", tags: "" });

  const columns = [
    { id: "To Do", title: "To Do", color: "#f59e0b", icon: Circle },
    { id: "In Progress", title: "In Progress", color: "#3b82f6", icon: Clock },
    { id: "In Review", title: "In Review", color: "#8b5cf6", icon: AlertCircle },
    { id: "Done", title: "Done", color: "#10b981", icon: CheckCircle2 }
  ];

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    toast(`Task moved to ${newStatus}`, "info");
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    const created = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || "No description provided.",
      project: newTask.project,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      assignee: { name: "Aman Chaudhary", color: "#3b82f6" },
      comments: 0,
      attachments: 0,
      tags: newTask.tags ? newTask.tags.split(",").map(t => t.trim()) : ["general"]
    };
    setTasks([created, ...tasks]);
    setShowCreateModal(false);
    setNewTask({ title: "", description: "", project: "Devflow AI Core", priority: "Medium", status: "To Do", dueDate: "", tags: "" });
    toast("New task created successfully!", "success");
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    toast("Task deleted", "danger");
  };

  const getPriorityBadge = (p) => {
    const map = {
      Urgent: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
      High: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
      Medium: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
      Low: { bg: "rgba(107, 114, 128, 0.15)", color: "#9ca3af", border: "rgba(107, 114, 128, 0.3)" }
    };
    const style = map[p] || map.Medium;
    return (
      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        {p}
      </span>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <PageHeader title="Tasks & Kanban" subtitle="Organize, track, and prioritize workspace deliverables">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Plus size={16} /> New Task
        </button>
      </PageHeader>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={tasks.length} delta="8 active tasks" trend="neutral" icon={Circle} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="In Progress" value={tasks.filter(t => t.status === "In Progress").length} delta="3 in progress" trend="up" icon={Clock} iconBg="rgba(245, 158, 11, 0.15)" />
        <StatCard label="In Review" value={tasks.filter(t => t.status === "In Review").length} delta="2 awaiting PR" trend="up" icon={AlertCircle} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Completed" value={tasks.filter(t => t.status === "Done").length} delta="2 completed this week" trend="up" icon={CheckCircle2} iconBg="rgba(16, 185, 129, 0.15)" />
      </div>

      {/* Filters & Actions Bar */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Filter tasks by title or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setViewMode("kanban")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "kanban" ? "var(--primary)" : "transparent", color: viewMode === "kanban" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            <LayoutGrid size={15} /> Board
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "list" ? "var(--primary)" : "transparent", color: viewMode === "list" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
          {columns.map(col => {
            const ColumnIcon = col.icon;
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} style={{ background: "rgba(26, 34, 53, 0.6)", border: "1px solid var(--border)", borderRadius: 18, padding: 16 }}>
                {/* Column Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ColumnIcon size={16} style={{ color: col.color }} />
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{col.title}</h3>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "var(--muted)", fontWeight: 600 }}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="icon-btn" onClick={() => { setShowCreateModal(true); setNewTask(prev => ({ ...prev, status: col.id })); }} title="Add task to column">
                    <Plus size={15} />
                  </button>
                </div>

                {/* Tasks Stack */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {colTasks.length === 0 ? (
                    <div style={{ padding: "24px 12px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--muted)", fontSize: 13 }}>
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, transition: "transform 0.15s, border-color 0.15s", cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>{task.project}</span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 600, color: "var(--fg)", lineHeight: 1.4 }}>{task.title}</h4>
                        <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {task.description}
                        </p>

                        {/* Tag list */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                          {task.tags.map((tag, idx) => (
                            <span key={idx} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "var(--muted)" }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Task Card Footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {task.dueDate}</span>
                            {task.comments > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={13} /> {task.comments}</span>}
                          </div>
                          <Avatar name={task.assignee.name} size={24} color={task.assignee.color} />
                        </div>

                        {/* Action Move Buttons */}
                        <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 8, borderTop: "1px dashed color-mix(in srgb, var(--border) 40%, transparent)" }}>
                          {columns.filter(c => c.id !== task.status).map(c => (
                            <button
                              key={c.id}
                              onClick={() => moveTask(task.id, c.id)}
                              style={{ flex: 1, padding: "4px 6px", fontSize: 10, borderRadius: 6, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--muted)", cursor: "pointer", textAlign: "center" }}
                            >
                              → {c.title}
                            </button>
                          ))}
                          <button
                            onClick={() => deleteTask(task.id)}
                            style={{ padding: "4px 8px", fontSize: 10, borderRadius: 6, border: "none", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", cursor: "pointer" }}
                            title="Delete Task"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontWeight: 600 }}>
                <th style={{ padding: "14px 20px" }}>Task Title</th>
                <th style={{ padding: "14px 20px" }}>Project</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px" }}>Priority</th>
                <th style={{ padding: "14px 20px" }}>Assignee</th>
                <th style={{ padding: "14px 20px" }}>Due Date</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600 }}>
                    <div style={{ color: "var(--fg)" }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>{task.description}</div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--primary)" }}>{task.project}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <StatusBadge status={task.status === "Done" ? "completed" : task.status === "In Progress" ? "in-progress" : "pending"} />
                  </td>
                  <td style={{ padding: "14px 20px" }}>{getPriorityBadge(task.priority)}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={task.assignee.name} size={24} color={task.assignee.color} />
                      <span style={{ fontSize: 12 }}>{task.assignee.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{task.dueDate}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="icon-btn"
                      style={{ color: "var(--danger)", border: "none", background: "transparent" }}
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 520, padding: 24 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700 }}>Create New Task</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)" }}>Add a task to your workspace Kanban board.</p>

            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth logic"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of requirements..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Project</label>
                  <select
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
                  >
                    <option value="Devflow AI Core">Devflow AI Core</option>
                    <option value="UI Design System">UI Design System</option>
                    <option value="Devflow Backend">Devflow Backend</option>
                    <option value="DevOps Setup">DevOps Setup</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Status Column</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. auth, security, ui"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)} style={{ minHeight: 36, fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 36, fontSize: 13 }}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
