"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Share2,
  Star,
  Trash2
} from "lucide-react";
import {
  AvatarGroup,
  ConfirmDialog,
  EmptyState,
  FilterBar,
  PageHeader,
  ProgressBar,
  SkeletonRow,
  StatusBadge,
  toast
} from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
  { label: "Personal", value: "personal" },
  { label: "Team", value: "team" }
];

const sortOptions = ["Recently Updated", "Name A-Z", "Newest"];

export default function ProjectsPage() {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recently Updated");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [selected, setSelected] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.projects.list({ page: 1, limit: 100, sortBy: "updatedAt", sortOrder: "desc" });
      const items = res?.data?.projects || res?.projects || [];
      setProjects(items);
    } catch (err) {
      setError(err.message || "Unable to load projects");
      toast(err.message || "Unable to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    let result = [...projects];

    if (filter === "active") result = result.filter((p) => p.status === "active");
    if (filter === "archived") result = result.filter((p) => p.status === "archived");
    if (filter === "team") result = result.filter((p) => p.visibility === "internal" || p.visibility === "public");
    if (filter === "personal") result = result.filter((p) => p.visibility === "private");
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(term));
    }

    if (sort === "Name A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return result;
  }, [projects, filter, search, sort]);

  function toggleSelect(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function mutateProject(projectId, action, successMessage) {
    if (pendingAction) return;
    setPendingAction(action + projectId);

    try {
      if (action === "archive") await api.projects.archive(projectId);
      if (action === "restore") await api.projects.restore(projectId);
      if (action === "delete") await api.projects.delete(projectId);
      toast(successMessage, "success");
      await loadProjects();
      setSelected((prev) => prev.filter((id) => id !== projectId));
      setDeleteDialog(null);
      setMenuOpen(null);
    } catch (err) {
      toast(err.message || "Something went wrong", "error");
    } finally {
      setPendingAction(null);
    }
  }

  if (loading) {
    return (
      <div className="projects-page">
        <PageHeader title="My Projects" subtitle="Loading projects..." />
        <div className="projects-table-card">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>{[1,2,3].map((i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <PageHeader title="My Projects" subtitle={`${filtered.length} projects`}>
        <Link className="btn btn-primary min-h-9.5 text-xs" href="/dashboard/projects/create">
          <Plus size={16} /> New Project
        </Link>
      </PageHeader>

      <div className="projects-toolbar">
        <div className="dash-search min-w-55 flex-1 max-w-90">
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input projects-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects">
          {sortOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div className="projects-view-toggle" role="group" aria-label="Project view">
          <button className={`icon-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} type="button"><Grid3X3 size={16} /></button>
          <button className={`icon-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} type="button"><List size={16} /></button>
        </div>
      </div>

      <div className="projects-filter-panel">
        <span className="projects-filter-label">Filter</span>
        <FilterBar filters={filterOptions.map((f) => ({ ...f, count: f.value === "all" ? projects.length : projects.filter((p) => f.value === "active" ? p.status === "active" : f.value === "archived" ? p.status === "archived" : f.value === "team" ? p.visibility === "internal" || p.visibility === "public" : p.visibility === "private").length }))} active={filter} onChange={setFilter} />
      </div>

      {selected.length > 0 ? (
        <div className="projects-bulk-toolbar">
          <span className="text-[13px] font-semibold">{selected.length} selected</span>
          <button className="btn btn-outline min-h-8 px-3 text-xs" onClick={() => Promise.all(selected.map((id) => mutateProject(id, "archive", "Projects archived")))}><Archive size={14} /> Archive</button>
          <button className="btn btn-outline min-h-8 px-3 text-xs" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => setDeleteDialog("bulk")}><Trash2 size={14} /> Delete</button>
          <button className="btn btn-ghost min-h-8 px-3 text-xs" onClick={() => setSelected([])}>Clear</button>
        </div>
      ) : null}

      {error ? (
        <EmptyState icon={Archive} title="Unable to load projects" description={error} action="Retry" onAction={loadProjects} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Plus} title="No projects found" description="Create your first project to get started." action="New Project" onAction={() => { window.location.href = "/dashboard/projects/create"; }} />
      ) : view === "grid" ? (
        <div className="dash-grid-3 project-grid">
          {filtered.map((p) => (
            <div key={p._id} className="project-card relative">
              <div className="project-card-header">
                <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="project-card-select" aria-label={`Select ${p.name || "project"}`} />
                <div className="project-card-mark" style={{ background: p.settings?.color || "#3b82f6" }}>{(p.name || "P").charAt(0)}</div>
                <div className="project-card-heading">
                    <p className="project-card-name">{p.name}</p>
                    <StatusBadge status={p.status} />
                </div>
                <div className="project-card-menu relative">
                  <button className="icon-btn" aria-label={`Actions for ${p.name || "project"}`} onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p._id ? null : p._id); }} type="button"><MoreHorizontal size={16} /></button>
                  {menuOpen === p._id ? (
                    <div className="absolute right-0 top-9 w-40 bg-(--card) border border-(--border) rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-10 overflow-hidden">
                      {[ ["Star", Star], ["Share", Share2], ["Settings", Settings], [p.status === "archived" ? "Restore" : "Archive", Archive], ["Delete", Trash2] ].map(([label, Icon]) => (
                        <button key={label} className="sidebar-item rounded-none w-full" onClick={async () => { setMenuOpen(null); if (label === "Delete") setDeleteDialog(p._id); else if (label === "Archive" || label === "Restore") await mutateProject(p._id, label.toLowerCase(), label === "Archive" ? "Project archived" : "Project restored"); else toast(`${label} action`, "success"); }} style={{ color: label === "Delete" ? "var(--danger)" : undefined }} type="button">
                          <Icon size={15} /><span>{label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="project-card-description">{p.description || "No description provided."}</p>
              <div className="project-card-details">
                <div className="project-card-tech">
                  {(p.settings?.techStack || []).slice(0, 3).map((s) => <span key={s} className="badge">{s}</span>)}
                  {(p.settings?.techStack || []).length > 3 ? <span className="badge project-card-tech-more">+{p.settings.techStack.length - 3}</span> : null}
                </div>
                <div className="project-card-progress-label">
                  <span className="muted text-xs">Progress</span>
                  <span className="text-xs font-bold">{p.status === "archived" ? 100 : 72}%</span>
                </div>
                <ProgressBar value={p.status === "archived" ? 100 : 72} />
              </div>
              <div className="project-card-footer">
                <AvatarGroup members={p.owner ? [{ _id: p.owner._id || p.owner, name: p.owner.name || "Owner", color: "#3b82f6" }] : []} max={3} size={26} />
                <span className="muted text-[11px]">Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="project-card-actions">
                <Link className="btn btn-primary" href={`/dashboard/projects/${p._id}`} style={{ flex: 1, minHeight: 34, fontSize: 12 }}>Open</Link>
                <button className="btn btn-outline" aria-label={`Copy link to ${p.name || "project"}`} title="Copy project link" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/dashboard/projects/${p._id}`)} style={{ minHeight: 34, padding: "0 12px", fontSize: 12 }} type="button"><Share2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="projects-table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p._id) : [])} /></th>
                <th>Name</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td><input type="checkbox" aria-label={`Select ${p.name || "project"}`} checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="project-table-mark" style={{ background: p.settings?.color || "#3b82f6" }}>{(p.name || "P").charAt(0)}</div>
                      <div>
                        <p className="m-0 mb-0.5 font-semibold text-[13px]">{p.name}</p>
                        <p className="muted m-0 text-[11px]">{(p.settings?.techStack || []).slice(0, 2).join(" · ") || "Project"}</p>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><span className="badge">{p.visibility}</span></td>
                  <td><span className="muted text-xs">{new Date(p.updatedAt).toLocaleDateString()}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <Link className="btn btn-outline" href={`/dashboard/projects/${p._id}`} style={{ minHeight: 30, padding: "0 10px", fontSize: 12 }}>Open</Link>
                      <button className="icon-btn projects-delete-button" aria-label={`Delete ${p.name || "project"}`} onClick={() => setDeleteDialog(p._id)} type="button"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete Project"
        description="This action cannot be undone. All project data will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deleteDialog === "bulk") {
            Promise.all(selected.map((projectId) => mutateProject(projectId, "delete", "Projects deleted"))).catch(() => {});
            setSelected([]);
          } else {
            mutateProject(deleteDialog, "delete", "Project deleted");
          }
        }}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
