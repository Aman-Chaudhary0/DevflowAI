"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  ArrowUpDown,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import {
  Avatar,
  EmptyState,
  PageHeader,
  StatCard,
  toast
} from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";

const columns = [
  { id: "todo", title: "To Do", color: "#f59e0b", icon: Circle },
  { id: "in_progress", title: "In Progress", color: "#3b82f6", icon: Clock },
  { id: "review", title: "In Review", color: "#8b5cf6", icon: AlertCircle },
  { id: "blocked", title: "Blocked", color: "#ef4444", icon: AlertCircle },
  { id: "done", title: "Done", color: "#10b981", icon: CheckCircle2 }
];

const statusMap = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  blocked: "Blocked",
  done: "Done"
};

function toDisplayDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", projectId: "", priority: "medium", status: "todo", dueDate: "", labels: "" });
  const [pendingAction, setPendingAction] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const loadProjects = useCallback(async () => {
    const response = await api.projects.list({ page: 1, limit: 50 });
    const items = response?.data?.projects || response?.projects || [];
    setProjects(items);
    if (items.length > 0) {
      setNewTask((prev) => prev.projectId ? prev : ({ ...prev, projectId: items[0]._id }));
    }
    return items;
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.tasks.list({ page: 1, limit: 100, search, sortBy: "updatedAt", sortOrder: "desc" });
      const items = response?.data?.tasks || response?.tasks || [];
      setTasks(items);
    } catch (err) {
      setError(err.message || "Unable to load tasks");
      toast(err.message || "Unable to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProjects().catch(() => undefined);
  }, [loadProjects]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const socket = connectRealtime();
    let refreshTimer;
    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => loadTasks(), 120);
    };
    ["task.created", "task.updated", "task.deleted", "task.comment.created"].forEach((event) => socket.on(event, refresh));
    socket.on("connect", refresh);
    return () => {
      clearTimeout(refreshTimer);
      ["task.created", "task.updated", "task.deleted", "task.comment.created"].forEach((event) => socket.off(event, refresh));
      socket.off("connect", refresh);
    };
  }, [loadTasks]);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !term || `${task.title || ""} ${task.project?.name || ""}`.toLowerCase().includes(term);
      const matchesPriority = priorityFilter === "All" || (task.priority || "medium").toLowerCase() === priorityFilter.toLowerCase();
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (!newTask.title.trim() || !newTask.projectId) {
      const message = !newTask.title.trim() ? "Task title is required" : "Please select a project";
      setFormError(message);
      toast(message, "error");
      return;
    }

    try {
      setPendingAction(true);
      const payload = {
        title: newTask.title,
        description: newTask.description,
        projectId: newTask.projectId,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        labels: newTask.labels ? newTask.labels.split(",").map((item) => item.trim()).filter(Boolean) : []
      };
      await api.tasks.create(payload);
      setFormSuccess(true);
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", projectId: projects[0]?._id || "", priority: "medium", status: "todo", dueDate: "", labels: "" });
      await loadTasks();
      toast("Task created successfully", "success");
    } catch (err) {
      const message = err.message || "Unable to create task";
      setFormError(message);
      toast(message, "error");
    } finally {
      setPendingAction(false);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      setPendingAction(true);
      await api.tasks.update(taskId, { status: newStatus });
      await loadTasks();
      toast(`Task moved to ${statusMap[newStatus] || newStatus}`, "success");
    } catch (err) {
      toast(err.message || "Unable to update task status", "error");
    } finally {
      setPendingAction(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setPendingAction(true);
      await api.tasks.delete(taskId);
      await loadTasks();
      toast("Task deleted", "success");
    } catch (err) {
      toast(err.message || "Unable to delete task", "error");
    } finally {
      setPendingAction(false);
    }
  };

  const getPriorityBadge = (priority = "medium") => {
    const map = {
      urgent: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
      high: { bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
      medium: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
      low: { bg: "rgba(107, 114, 128, 0.15)", color: "#9ca3af", border: "rgba(107, 114, 128, 0.3)" }
    };
    const key = String(priority).toLowerCase();
    const style = map[key] || map.medium;
    return (
      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 600, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        {String(priority).charAt(0).toUpperCase() + String(priority).slice(1)}
      </span>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        <PageHeader title="Tasks & Kanban" subtitle="Loading workspace tasks..." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[1,2,3,4].map((item) => (
            <div key={item} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 16, minHeight: 180 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <PageHeader title="Tasks & Kanban" subtitle="Organize, track, and prioritize workspace deliverables">
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ minHeight: 38, fontSize: 13, gap: 6 }} type="button" disabled={pendingAction}>
          <Plus size={16} /> New Task
        </button>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Tasks" value={tasks.length} delta={`${tasks.filter((t) => t.status === "todo").length} open`} trend="neutral" icon={Circle} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="In Progress" value={tasks.filter((t) => t.status === "in_progress").length} delta="active work" trend="up" icon={Clock} iconBg="rgba(245, 158, 11, 0.15)" />
        <StatCard label="In Review" value={tasks.filter((t) => t.status === "review").length} delta="awaiting feedback" trend="up" icon={AlertCircle} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Completed" value={tasks.filter((t) => t.status === "done").length} delta="finished" trend="up" icon={CheckCircle2} iconBg="rgba(16, 185, 129, 0.15)" />
      </div>

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
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}>
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button onClick={() => setViewMode("kanban")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "kanban" ? "var(--primary)" : "transparent", color: viewMode === "kanban" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }} type="button">
            <LayoutGrid size={15} /> Board
          </button>
          <button onClick={() => setViewMode("list")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "list" ? "var(--primary)" : "transparent", color: viewMode === "list" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }} type="button">
            <List size={15} /> List
          </button>
        </div>
      </div>

      {error ? (
        <EmptyState icon={Filter} title="Unable to load tasks" description={error} action="Retry" onAction={loadTasks} />
      ) : viewMode === "kanban" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((task) => task.status === col.id);
            return (
              <div key={col.id} style={{ background: "rgba(26, 34, 53, 0.6)", border: "1px solid var(--border)", borderRadius: 18, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <col.icon size={16} style={{ color: col.color }} />
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{col.title}</h3>
                    <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "var(--muted)", fontWeight: 600 }}>{colTasks.length}</span>
                  </div>
                  <button className="icon-btn" onClick={() => { setShowCreateModal(true); setNewTask((prev) => ({ ...prev, status: col.id })); }} title="Add task to column" type="button">
                    <Plus size={15} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {colTasks.length === 0 ? (
                    <div style={{ padding: "24px 12px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--muted)", fontSize: 13 }}>
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div key={task._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)" }}>{task.project?.name || "Project"}</span>
                          {getPriorityBadge(task.priority || "medium")}
                        </div>

                        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, fontWeight: 600, color: "var(--fg)", lineHeight: 1.4 }}>{task.title}</h4>
                        <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {task.description || "No description provided."}
                        </p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                          {(task.labels || []).map((tag, idx) => (
                            <span key={`${tag}-${idx}`} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "var(--muted)" }}>
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--muted)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {toDisplayDate(task.dueDate)}</span>
                            {task.comments?.length > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={13} /> {task.comments.length}</span>}
                          </div>
                          <Avatar name={task.assignee?.name || "Unassigned"} size={24} color={task.assignee?.avatar ? "var(--primary)" : "#3b82f6"} />
                        </div>

                        <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 8, borderTop: "1px dashed color-mix(in srgb, var(--border) 40%, transparent)" }}>
                          {columns.filter((column) => column.id !== task.status).map((column) => (
                            <button key={column.id} onClick={() => moveTask(task._id, column.id)} style={{ flex: 1, padding: "4px 6px", fontSize: 10, borderRadius: 6, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--muted)", cursor: "pointer", textAlign: "center" }} type="button" disabled={pendingAction}>
                              → {column.title}
                            </button>
                          ))}
                          <button onClick={() => deleteTask(task._id)} style={{ padding: "4px 8px", fontSize: 10, borderRadius: 6, border: "none", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", cursor: "pointer" }} title="Delete Task" type="button" disabled={pendingAction}>
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
      ) : (
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
              {filteredTasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600 }}>{task.title}</td>
                  <td style={{ padding: "14px 20px" }}>{task.project?.name || "Project"}</td>
                  <td style={{ padding: "14px 20px" }}>{statusMap[task.status] || task.status}</td>
                  <td style={{ padding: "14px 20px" }}>{getPriorityBadge(task.priority || "medium")}</td>
                  <td style={{ padding: "14px 20px" }}>{task.assignee?.name || "Unassigned"}</td>
                  <td style={{ padding: "14px 20px" }}>{toDisplayDate(task.dueDate)}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button onClick={() => deleteTask(task._id)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", cursor: "pointer" }} type="button" disabled={pendingAction}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="dialog-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Create task</p>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button">✕</button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: "grid", gap: 12 }}>
              {formError && (
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#fca5a5", fontSize: 12, lineHeight: 1.5 }}>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#86efac", fontSize: 12 }}>
                  Task created successfully.
                </div>
              )}

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Title</label>
                <input value={newTask.title} onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Project</label>
                <select value={newTask.projectId} onChange={(e) => setNewTask((prev) => ({ ...prev, projectId: e.target.value }))} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }}>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Status</label>
                  <select value={newTask.status} onChange={(e) => setNewTask((prev) => ({ ...prev, status: e.target.value }))} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }}>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Due date</label>
                <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Labels</label>
                <input value={newTask.labels} onChange={(e) => setNewTask((prev) => ({ ...prev, labels: e.target.value }))} placeholder="backend, ui, research" style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px" }} />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))} rows={4} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", padding: "10px 12px", resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowCreateModal(false); setFormError(null); setFormSuccess(false); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={pendingAction}>{pendingAction ? "Creating..." : "Create Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
