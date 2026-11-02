"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Play, Power } from "lucide-react";
import { ConfirmDialog, EmptyState, PageHeader, StatCard, StatusBadge, toast } from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

export default function WorkflowDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [tab, setTab] = useState("Overview");
  const [workflow, setWorkflow] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const res = await api.workflows.get(id);
      const item = res?.data?.workflow || res?.workflow || null;
      setWorkflow(item);
      const runsRes = await api.workflows.runs.list(id, { page: 1, limit: 20 });
      setRuns(runsRes?.data?.runs || runsRes?.runs || []);
    } catch (error) {
      toast(error.message || "Unable to load workflow", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadWorkflow();
  }, [id]);

  const statusSummary = useMemo(() => {
    if (!runs.length) return { total: 0, success: 0, failed: 0 };
    return {
      total: runs.length,
      success: runs.filter((run) => String(run.status).toLowerCase() === "success").length,
      failed: runs.filter((run) => String(run.status).toLowerCase() === "failed").length
    };
  }, [runs]);

  const toggleStatus = async () => {
    if (!workflow) return;
    try {
      const nextStatus = workflow.status === "active" ? "paused" : "active";
      const res = await api.workflows.setStatus(workflow._id, nextStatus);
      const nextWorkflow = res?.data?.workflow || res?.workflow;
      if (nextWorkflow) setWorkflow(nextWorkflow);
      toast(`Workflow ${nextStatus === "active" ? "enabled" : "paused"}.`, "info");
    } catch (error) {
      toast(error.message || "Unable to update workflow status", "error");
    }
  };

  const runNow = async () => {
    if (!workflow) return;
    try {
      setRunLoading(true);
      const res = await api.workflows.run(workflow._id, { manualTest: true, triggerType: "manual", payload: { source: "dashboard" } });
      const run = res?.data?.run || res?.run || null;
      if (run) {
        setSelectedRun(run);
        setRuns((items) => [run, ...items]);
      }
      toast("Workflow run started.","success");
    } catch (error) {
      toast(error.message || "Unable to run workflow", "error");
    } finally {
      setRunLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-5 mt-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Workflow not found"
        description="This workflow link is unavailable. Return to the workflows list and open another item."
        action="Back to workflows"
        onAction={() => router.push("/dashboard/workflows")}
      />
    );
  }

  const logs = workflow.logs || [
    { step: "workflow.started", message: `${workflow.name} initialized`, status: "info" },
    { step: "condition.eval", message: "Condition checks passed", status: "success" },
    { step: "action.execute", message: (workflow.actions?.[0]?.name || "AI action") + " executed", status: "success" }
  ];

  const pauseAction = workflow?.status === "active";
  const confirmTitle = pauseAction ? "Pause this workflow?" : "Enable this workflow?";
  const confirmDescription = pauseAction
    ? "Automatic executions will stop until you enable it again."
    : "This workflow will resume automatic executions when enabled.";
  const confirmLabel = pauseAction ? "Pause" : "Enable";

  return (
    <div>
      <Crumb items={["Dashboard", "Workflows", workflow.name]} />
      <PageHeader title={workflow.name} subtitle={`${workflow.project?.name || workflow.project || "Project"} · last run ${workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleString() : "never"}`}>
        <button className="btn btn-primary" onClick={runNow} type="button" disabled={runLoading}>
          <Play size={15} /> {runLoading ? "Running..." : "Run Now"}
        </button>
        <button className="btn btn-outline" onClick={() => setDisable(true)} type="button">
          <Power size={15} />
          {workflow.status === "active" ? "Pause" : "Enable"}
        </button>
      </PageHeader>

      <div className="dash-grid-4 mt-6">
        <StatCard label="Status" value={workflow.status || "draft"} />
        <StatCard label="Total runs" value={workflow.totalRuns || statusSummary.total || 0} />
        <StatCard label="Successful" value={statusSummary.success || workflow.successfulRuns || 0} />
        <StatCard label="Failed" value={statusSummary.failed || workflow.failedRuns || 0} />
      </div>

      <section className="card p-5 mt-6">
        <div className="tabs">
          {[
            "Overview",
            "Runs",
            "Logs",
            "Configuration",
            "Activity"
          ].map((x) => (
            <button className={`tab ${tab === x ? "active" : ""}`} onClick={() => setTab(x)} key={x} type="button">
              {x}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="workflow-canvas">
            {(workflow.trigger ? [workflow.trigger.event || "workflow.manual_triggered", workflow.conditions?.[0]?.field || "Branch = main", workflow.actions?.[0]?.name || "Production Deployment", workflow.actions?.[1]?.name || "Slack Notification"] : ["Manual Trigger", "Condition", "Production Deployment", "Slack Notification"]).map((x, i) => (
              <div key={`${x}-${i}`}>
                <div className="workflow-node">
                  <small>{i === 1 ? "Condition" : i ? "Action" : "Trigger"}</small>
                  <b>{x}</b>
                </div>
                {i < 3 && <div className="workflow-line">↓</div>}
              </div>
            ))}
          </div>
        )}

        {tab === "Runs" && (
          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">No runs yet.</td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run._id}>
                    <td>{run._id?.slice(-8) || "n/a"}</td>
                    <td>{run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}</td>
                    <td>{run.duration ? `${run.duration}ms` : "—"}</td>
                    <td>
                      <StatusBadge status={String(run.status || "pending").toLowerCase()} />
                    </td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => setSelectedRun(run)} type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === "Logs" && (
          <pre className="terminal-panel mt-4">{logs.map((entry) => `[${new Date(entry.timestamp || Date.now()).toLocaleTimeString()}] ${entry.message}`).join("\n") || "No logs available."}</pre>
        )}

        {tab === "Configuration" && (
          <div className="mt-4 muted">
            Trigger: {workflow.trigger?.event || "workflow.manual_triggered"}
            <br />
            Condition: {workflow.conditions?.[0] ? `${workflow.conditions[0].field} ${workflow.conditions[0].operator}` : "No conditions"}
            <br />
            Actions: {workflow.actions?.length ? workflow.actions.map((action) => action.name).join(", ") : "No actions configured"}
            <br />
            Created by: {workflow.createdBy?.name || "System"}
          </div>
        )}
      </section>

      <Drawer open={!!selectedRun} title="Workflow run" onClose={() => setSelectedRun(null)}>
        {selectedRun ? (
          <p>
            <b>{selectedRun._id}</b>
            <br />
            Trigger: {selectedRun.triggerType || "manual"}
            <br />
            Status: {selectedRun.status || "pending"}
            <br />
            Started: {selectedRun.startedAt ? new Date(selectedRun.startedAt).toLocaleString() : "—"}
            <br />
            Duration: {selectedRun.duration ? `${selectedRun.duration}ms` : "—"}
          </p>
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={disable}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        danger={pauseAction}
        onConfirm={() => {
          setDisable(false);
          toggleStatus();
        }}
        onCancel={() => setDisable(false)}
      />
    </div>
  );
}
