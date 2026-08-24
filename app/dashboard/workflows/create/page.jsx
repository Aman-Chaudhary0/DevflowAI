"use client";
import { useState } from "react";
import { Play, Save, Send, Workflow } from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
const nodes = [
  "Pull Request Merged",
  "Branch = main",
  "Run Production Deployment",
  "Send Slack Notification",
];
export default function CreateWorkflow() {
  const [test, setTest] = useState(false);
  return (
    <div>
      <Crumb items={["Dashboard", "Workflows", "Create"]} />
      <PageHeader
        title="Create Workflow"
        subtitle="Automate repetitive development tasks with triggers, conditions, and actions."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Workflow saved as draft.")}
          type="button"
        >
          <Save size={15} />
          Save Draft
        </button>
        <button
          className="btn btn-primary"
          onClick={() => toast("Workflow published.")}
          type="button"
        >
          <Send size={15} />
          Publish
        </button>
      </PageHeader>
      <div className="workflow-layout mt-6">
        <section className="card p-5">
          <label>
            Workflow Name
            <input
              className="input w-full mt-2"
              defaultValue="Deploy Production After Approval"
            />
          </label>
          <label className="block mt-4">
            Description
            <textarea
              className="input w-full mt-2"
              defaultValue="Deploy after a pull request is merged into main."
            />
          </label>
          <label className="block mt-4">
            Project
            <select className="input w-full mt-2">
              <option>DevFlow AI</option>
              <option>MediQueue</option>
            </select>
          </label>
          <button
            className="btn btn-outline mt-5"
            onClick={() => setTest(true)}
            type="button"
          >
            <Play size={15} />
            Test Workflow
          </button>
          {test && (
            <div className="terminal-panel mt-4">
              ✓ Trigger detected
              <br />✓ Condition passed
              <br />✓ Deployment started
              <br />✓ Notification sent
              <br />✓ Workflow completed
            </div>
          )}
        </section>
        <section className="card p-5">
          <div className="flex justify-between">
            <h2 className="m-0">Workflow builder</h2>
            <Workflow color="var(--primary)" />
          </div>
          <div className="workflow-canvas">
            {nodes.map((n, i) => (
              <div key={n}>
                <div className="workflow-node">
                  <small>
                    {i === 0 ? "Trigger" : i === 1 ? "Condition" : "Action"}
                  </small>
                  <b>{n}</b>
                  <span className="muted">Configured</span>
                </div>
                {i < nodes.length - 1 && <div className="workflow-line">↓</div>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
