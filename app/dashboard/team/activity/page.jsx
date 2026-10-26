"use client";
import { useCallback, useEffect, useState } from "react";
import { Download, Filter } from "lucide-react";
import {
  Avatar,
  EmptyState,
  PageHeader,
  StatCard,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";
export default function TeamActivityPage() {
  const [type, setType] = useState("All"),
    [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivity = useCallback(async () => {
    try {
      setError(null);
      const projectsResponse = await api.projects.list({ page: 1, limit: 100 });
      const projects = projectsResponse?.data?.projects || projectsResponse?.projects || [];
      const workspaceId = projects[0]?.workspace?._id || projects[0]?.workspace;
      if (!workspaceId) {
        setRows([]);
        return;
      }
      const response = await api.tasks.activityWorkspace(workspaceId);
      const projectNames = new Map(projects.map((project) => [String(project._id), project.name]));
      const activityRows = response?.data?.activity || response?.activity || [];
      setRows(activityRows.map((entry) => ({
        id: String(entry._id),
        type: entry.entityType === "task" ? "Task" : entry.entityType,
        member: entry.actor?.name || "Team member",
        action: String(entry.action || "updated").replaceAll("_", " "),
        resource: entry.metadata?.title || entry.entityId || entry.entityType,
        project: projectNames.get(String(entry.project)) || "Workspace project",
        time: new Date(entry.createdAt).toLocaleString(),
        createdAt: entry.createdAt
      })));
    } catch (err) {
      setError(err.message || "Unable to load workspace activity");
      toast(err.message || "Unable to load workspace activity", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
    const socket = connectRealtime();
    const refresh = () => loadActivity();
    socket.on("activity.created", refresh);
    socket.on("connect", refresh);
    return () => {
      socket.off("activity.created", refresh);
      socket.off("connect", refresh);
    };
  }, [loadActivity]);

  const rowsForType = rows.filter((item) => type === "All" || item.type === type);
  const todayCount = rows.filter((item) => new Date(item.createdAt).toDateString() === new Date().toDateString()).length;
  return (
    <div>
      <Crumb items={["Dashboard", "Team", "Activity"]} />
      <PageHeader
        title="Team Activity"
        subtitle="Track what your team is building, reviewing, deploying, and discussing."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Activity export is not available from the current API", "info")}
          type="button"
        >
          <Download size={16} />
          Export
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Activity today" value={todayCount} />
        <StatCard label="Commits" value="—" />
        <StatCard label="Reviews" value="—" />
        <StatCard label="AI operations" value="—" />
      </div>
      <section className="card p-5 mt-6">
        <div className="flex gap-3 flex-wrap mb-5">
          <Filter size={17} />
          {[
            "All",
            "Task",
          ].map((x) => (
            <button
              key={x}
              className={`btn ${type === x ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setType(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
        {loading ? <p className="muted">Loading workspace activity...</p> : error ? (
          <EmptyState title="Unable to load activity" description={error} action="Retry" onAction={loadActivity} />
        ) : rowsForType.length ? (
          <div className="timeline">
            {rowsForType.map((a) => (
              <div className="timeline-item" key={a.id}>
                <div className="timeline-dot" />
                <div className="flex-1 rounded-xl border border-(--border) p-4">
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-2">
                      <Avatar name={a.member} size={32} />
                      <div>
                        <b>{a.member}</b> {a.action} <b>{a.resource}</b>
                        <p className="muted text-sm m-0 mt-1">
                          {a.project} · {a.time}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSelected(a)}
                      type="button"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activity found"
            description="No activity matches the selected filters."
            action="Clear filters"
            onAction={() => setType("All")}
          />
        )}
      </section>
      <Drawer
        open={!!selected}
        title="Activity details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <p>
              <b>{selected.member}</b> {selected.action}{" "}
              <b>{selected.resource}</b>.
            </p>
            <p className="muted">
              Project: {selected.project}
              <br />
              Timestamp: {selected.time}
              <br />
              Related item: {selected.resource}
            </p>
          </>
        )}
      </Drawer>
    </div>
  );
}
