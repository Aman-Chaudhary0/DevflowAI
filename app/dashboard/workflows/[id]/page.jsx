"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Play, Power } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  StatCard,
  StatusBadge,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { workflows } from "@/lib/mock/workspace";
export default function WorkflowDetails() {
  const { id } = useParams(),
    [tab, setTab] = useState("Overview"),
    [disable, setDisable] = useState(false),
    [run, setRun] = useState(null),
    w = workflows.find((x) => x.id === id) || workflows[0];
  const runs = ["run_48291", "run_48290", "run_48289"];
  return (
    <div>
      <Crumb items={["Dashboard", "Workflows", w.name]} />
      <PageHeader
        title={w.name}
        subtitle={`${w.project} · last run ${w.lastRun}`}
      >
        <button
          className="btn btn-primary"
          onClick={() => toast("Workflow run started")}
          type="button"
        >
          <Play size={15} />
          Run Now
        </button>
        <button
          className="btn btn-outline"
          onClick={() => setDisable(true)}
          type="button"
        >
          <Power size={15} />
          Disable
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Status" value="Active" />
        <StatCard label="Total runs" value={w.runs} />
        <StatCard label="Successful" value={w.successful} />
        <StatCard label="Failed" value={w.failed} />
      </div>
      <section className="card p-5 mt-6">
        <div className="tabs">
          {["Overview", "Runs", "Logs", "Configuration", "Activity"].map(
            (x) => (
              <button
                className={`tab ${tab === x ? "active" : ""}`}
                onClick={() => setTab(x)}
                key={x}
                type="button"
              >
                {x}
              </button>
            ),
          )}
        </div>
        {tab === "Overview" && (
          <div className="workflow-canvas">
            {[
              "Pull Request Merged",
              "Branch = main",
              "Production Deployment",
              "Slack Notification",
            ].map((x, i) => (
              <div key={x}>
                <div className="workflow-node">
                  <small>
                    {i === 1 ? "Condition" : i ? "Action" : "Trigger"}
                  </small>
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
              {runs.map((x) => (
                <tr key={x}>
                  <td>{x}</td>
                  <td>Aug 23, 2026</td>
                  <td>1m 42s</td>
                  <td>
                    <StatusBadge status="success" />
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setRun(x)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Logs" && (
          <pre className="terminal-panel mt-4">
            [10:41:02] Trigger detected{"\n"}[10:41:03] Condition evaluated
            {"\n"}[10:41:05] Deployment started{"\n"}[10:42:21] Deployment
            successful
          </pre>
        )}
        {tab === "Configuration" && (
          <div className="mt-4 muted">
            Trigger: Pull Request Merged
            <br />
            Condition: Branch equals main
            <br />
            Environment: Production
            <br />
            Created by: Aman Chaudhary
          </div>
        )}
      </section>
      <Drawer open={!!run} title="Workflow run" onClose={() => setRun(null)}>
        <p>
          <b>{run}</b>
          <br />
          Trigger: GitHub
          <br />
          Condition passed
          <br />
          Execution: 1m 42s
          <br />
          Status: Success
        </p>
      </Drawer>
      <ConfirmDialog
        open={disable}
        title="Disable this workflow?"
        description="Automatic executions will stop until you enable it again."
        confirmLabel="Disable"
        danger
        onConfirm={() => {
          setDisable(false);
          toast("Workflow disabled.");
        }}
        onCancel={() => setDisable(false)}
      />
    </div>
  );
}
