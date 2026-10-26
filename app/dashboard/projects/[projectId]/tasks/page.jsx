"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, EmptyState, SkeletonCard, StatCard, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { getProjectByKey } from "@/lib/dashboard-data";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params?.projectId;
  const [tasks, setTasks] = useState(null);
  const [view, setView] = useState('board');
  const projectName = getProjectByKey(projectId)?.name || projectId;

  const loadTasks = useCallback(async () => {
    try {
      const response = await api.tasks.list({ projectId, page: 1, limit: 100 });
      const rows = response?.data?.tasks || response?.tasks || [];
      const labels = { todo: "Todo", blocked: "Backlog", in_progress: "In Progress", review: "Review", done: "Done" };
      setTasks(rows.map((task) => ({
        id: String(task._id), title: task.title, status: labels[task.status] || "Todo",
        priority: task.priority ? task.priority[0].toUpperCase() + task.priority.slice(1) : "Medium",
        assignee: task.assignee?.name || "Unassigned",
        due: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"
      })));
    } catch (error) {
      setTasks([]);
      toast(error.message || "Unable to load project tasks", "error");
    }
  }, [projectId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => {
    const socket = connectRealtime();
    const refresh = (event) => {
      if (String(event?.projectId || "") === String(projectId)) loadTasks();
    };
    const events = ["task.created", "task.updated", "task.deleted", "task.comment.created"];
    events.forEach((event) => socket.on(event, refresh));
    socket.on("connect", loadTasks);
    return () => {
      events.forEach((event) => socket.off(event, refresh));
      socket.off("connect", loadTasks);
    };
  }, [projectId, loadTasks]);

  return (
    <div>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: projectName, href: `/dashboard/projects/${projectId}` }, { label: "Tasks" }]} />
      <PageHeader title="Project Tasks" subtitle={`${projectId} — project specific tasks`}>
        <button className="btn btn-primary" onClick={() => toast('Add task (mock)')} type="button">Add Task</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard label="Total" value={tasks?.length ?? '—'} delta="active items" trend="neutral" />
        <StatCard label="In progress" value={tasks ? tasks.filter((t) => t.status === 'In Progress').length : '—'} delta="current work" trend="up" />
        <StatCard label="Backlog" value={tasks ? tasks.filter((t) => t.status === 'Backlog').length : '—'} delta="queued" trend="neutral" />
        <StatCard label="High priority" value={tasks ? tasks.filter((t) => t.priority === 'High').length : '—'} delta="urgent" trend="up" />
      </div>

      <div className="card p-4 mt-6 border border-(--border)" style={{ background: "linear-gradient(180deg, rgba(59,130,246,0.06), transparent 22%), var(--card)" }}>
        <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
          <div className="flex gap-2">
            <button className={`btn ${view==='board'?'btn-primary':'btn-ghost'}`} onClick={() => setView('board')} type="button">Board</button>
            <button className={`btn ${view==='list'?'btn-primary':'btn-ghost'}`} onClick={() => setView('list')} type="button">List</button>
          </div>
          <span className="badge">Route aware project context</span>
        </div>

        {tasks === null ? (
          <SkeletonCard />
        ) : tasks.length === 0 ? (
          <EmptyState title="No tasks" description="Create the first task for this project." action="Add Task" onAction={() => toast('Add task (mock)')} />
        ) : view === 'board' ? (
          <div className="grid grid-cols-5 gap-3">
            {['Backlog','Todo','In Progress','Review','Done'].map((col) => (
              <div key={col} className="card p-3 border border-(--border)">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{col}</div>
                  <span className="badge">{tasks.filter(t => t.status === col || (col==='Backlog' && t.status==='Backlog')).length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {tasks.filter(t => t.status === col || (col==='Backlog' && t.status==='Backlog')).map(t => (
                    <div key={t.id} className="card p-3 border border-(--border)" style={{ background: "var(--bg)" }}>
                      <div className="font-medium text-sm">{t.title}</div>
                      <div className="muted text-xs mt-1">{t.assignee} • {t.due}</div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="badge">{t.priority}</span>
                        <button className="btn btn-ghost h-8 px-3 text-xs" onClick={() => toast('Task opened')} type="button">Open</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full" style={{ minWidth: 900 }}>
              <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}><td className="font-medium">{t.title}</td><td>{t.status}</td><td>{t.priority}</td><td>{t.assignee}</td><td>{t.due}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
