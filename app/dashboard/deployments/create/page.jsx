"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

export default function CreateDeploymentPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    branch: "",
    environment: "preview",
    commitSha: ""
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);
        const result = await api.projects.list();
        const projectList = result.projects || result.data?.projects || [];
        
        // Filter projects that have GitHub repositories connected
        const githubProjects = projectList.filter(p => 
          p.repository?.provider === "github" && p.repository?.name
        );
        
        setProjects(githubProjects);
        if (githubProjects.length === 0) {
          toast("No GitHub repositories found. Connect a GitHub repository to a project first.", "info");
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
        toast(err.message || "Failed to load projects", "error");
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const handleProjectChange = async (e) => {
    const projectId = e.target.value;
    setFormData(prev => ({ ...prev, projectId, branch: "" }));
    
    if (!projectId) {
      setBranches([]);
      return;
    }

    // Find selected project to get default branch
    const selectedProject = projects.find(p => p._id === projectId);
    if (selectedProject?.repository?.defaultBranch) {
      setFormData(prev => ({ ...prev, branch: selectedProject.repository.defaultBranch }));
    }

    // Load branches from GitHub
    try {
      setLoadingBranches(true);
      const repo = selectedProject.repository;
      const branchesResult = await api.github.resource(
        repo.name.split("/")[0],
        repo.name.split("/")[1],
        "branches"
      );
      
      const branchList = branchesResult.branches || [];
      setBranches(branchList);
      
      if (branchList.length === 0) {
        toast("No branches found in this repository", "info");
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
      toast(err.message || "Failed to load branches", "error");
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.projectId) {
      toast("Please select a project", "error");
      return;
    }

    if (!formData.branch) {
      toast("Please select a branch", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await api.deployments.create({
        projectId: formData.projectId,
        branch: formData.branch,
        environment: formData.environment,
        commitSha: formData.commitSha || undefined
      });
      
      toast("Deployment created successfully", "success");
      router.push(`/dashboard/deployments/${result.deployment.id}`);
    } catch (err) {
      console.error("Failed to create deployment:", err);
      toast(err.message || "Failed to create deployment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Crumb items={["Dashboard", "Deployments", "Create"]} />
      <PageHeader title="Create Deployment" subtitle="Deploy your application to a new environment." />

      <div className="card p-6 mt-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">GitHub Repository</label>
            {loadingProjects ? (
              <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded text-gray-400 text-sm">
                Loading repositories...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-sm">
                No GitHub repositories connected. Go to Projects and connect a GitHub repository first.
              </div>
            ) : (
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleProjectChange}
                className="input w-full"
                required
              >
                <option value="">Select a repository...</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.repository?.name} ({project.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              {!formData.projectId ? (
                <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded text-gray-400 text-sm">
                  Select a repository first
                </div>
              ) : loadingBranches ? (
                <div className="p-3 bg-gray-500/10 border border-gray-500/20 rounded text-gray-400 text-sm">
                  Loading branches...
                </div>
              ) : branches.length === 0 ? (
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="main"
                  className="input w-full"
                  required
                />
              ) : (
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select a branch...</option>
                  {branches.map(branch => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Environment</label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="preview">Preview</option>
                <option value="production">Production</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Commit SHA (optional)</label>
            <input
              type="text"
              name="commitSha"
              value={formData.commitSha}
              onChange={handleChange}
              placeholder="Leave empty for latest commit"
              className="input w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || projects.length === 0 || loadingProjects || !formData.branch}
              className="btn btn-primary"
            >
              {loading ? "Creating..." : "Create Deployment"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
