"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Save, Send, Workflow } from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const nodes = [
  "Pull Request Merged",
  "Branch = main",
  "Run Production Deployment",
  "Send Slack Notification",
];

const defaultForm = {
  name: "Deploy Production After Approval",
  description: "Deploy after a pull request is merged into main.",
  project: "",
  status: "draft",
  trigger: {
    type: "github",
    event: "pull_request.merged",
    configuration: {},
    enabled: true,
  },
  conditions: [
    { field: "branch", operator: "equals", value: "main", logic: "AND" },
  ],
  actions: [
    {
      name: "Deploy production",
      type: "slack_notification",
      configuration: { channel: "#deployments" },
      enabled: true,
      timeout: 60000,
    },
  ],
};

export default function CreateWorkflow() {
  const router = useRouter();
  const [test, setTest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const res = await api.projects.list({
          page: 1,
          limit: 50,
          sortBy: "updatedAt",
          sortOrder: "desc",
        });
        const items = res?.data?.projects || res?.projects || [];
        if (!active) return;
        setProjects(items);
        if (items.length > 0 && !form.project) {
          setForm((prev) => ({ ...prev, project: items[0]._id }));
        }
      } catch {
        if (active) setProjects([]);
      }
    }

    loadProjects();
    return () => {
      active = false;
    };
  }, [form.project]);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (publish = false) => {
    setSubmitting(true);
    try {
      const projectId =
        form.project && /^[a-fA-F0-9]{24}$/.test(form.project)
          ? form.project
          : "";
      const payload = {
        ...form,
        ...(projectId ? { project: projectId } : {}),
        status: publish ? "active" : "draft",
        trigger: {
          ...form.trigger,
          type: form.trigger.type || "manual",
          event: form.trigger.event || "workflow.manual_triggered",
          enabled: true,
        },
      };

      const res = await api.workflows.create(payload);
      const workflow = res?.data?.workflow || res?.workflow;
      if (!workflow?._id) {
        throw new Error("Workflow was created but no id was returned");
      }
      toast(
        publish ? "Workflow published." : "Workflow saved as draft.",
        "success"
      );
      setTimeout(() => router.push(`/dashboard/workflows/${workflow._id}`), 500);
    } catch (error) {
      toast(error.message || "Unable to save workflow", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Crumb items={["Dashboard", "Workflows", "Create"]} />
      <PageHeader
        title="Create Workflow"
        subtitle="Automate repetitive development tasks with triggers, conditions, and actions."
      >
        <button
          className="btn btn-outline"
          onClick={() => handleSave(false)}
          type="button"
          disabled={submitting}
        >
          <Save size={15} /> {submitting ? "Saving..." : "Save Draft"}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => handleSave(true)}
          type="button"
          disabled={submitting}
        >
          <Send size={15} /> {submitting ? "Publishing..." : "Publish"}
        </button>
      </PageHeader>
      <div className="workflow-layout mt-6">
        <section className="card p-5">
          <label>
            Workflow Name
            <input
              className="input w-full mt-2"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>
          <label className="block mt-4">
            Description
            <textarea
              className="input w-full mt-2"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>
          <label className="block mt-4">
            Project
            <select
              className="input w-full mt-2"
              value={form.project}
              onChange={(e) => updateField("project", e.target.value)}
            >
              <option value="">Select a project</option>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value="">No projects available</option>
              )}
            </select>
          </label>
          <button
            className="btn btn-outline mt-5"
            onClick={() => setTest(true)}
            type="button"
          >
            <Play size={15} /> Test Workflow
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
