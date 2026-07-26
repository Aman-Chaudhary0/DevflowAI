"use client";

import Link from "next/link";
import { useState } from "react";
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
  StatusBadge,
  toast
} from "@/components/dashboard-ui";
import { mockProjects } from "@/lib/dashboard-data";

const filters = [
  { label: "All", value: "all", count: 6 },
  { label: "Active", value: "active", count: 5 },
  { label: "Archived", value: "archived", count: 1 },
  { label: "Personal", value: "personal" },
  { label: "Team", value: "team" }
];

const sortOptions = ["Recently Updated", "Name A-Z", "Progress", "Members"];

export default function ProjectsPage() {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Recently Updated");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [selected, setSelected] = useState([]);

  const filtered = mockProjects.filter((p) => {
    if (filter === "active") return p.status === "active";
    if (filter === "archived") return p.status === "archived";
    if (filter === "team") return p.visibility === "team";
    return true;
  }).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function toggleSelect(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <>
      <PageHeader title="My Projects" subtitle={`${filtered.length} projects`}>
        <Link className="btn btn-primary" href="/dashboard/projects/create" style={{ minHeight: 38, fontSize: 13 }}>
          <Plus size={16} /> New Project
        </Link>
      </PageHeader>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ minWidth: 220, flex: 1, maxWidth: 360 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto", minWidth: 180, height: 40, padding: "0 12px" }}>
          {sortOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div style={{ display: "flex", gap: 4, border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
          <button className={`icon-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} style={{ width: 32, height: 32, border: "none", background: view === "grid" ? "var(--primary)" : "transparent", color: view === "grid" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><Grid3X3 size={15} /></button>
          <button className={`icon-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} style={{ width: 32, height: 32, border: "none", background: view === "list" ? "var(--primary)" : "transparent", color: view === "list" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><List size={15} /></button>
        </div>
      </div>

      <FilterBar filters={filters} active={filter} onChange={setFilter} />

      {/* Bulk Actions */}
      {selected.length > 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "color-mix(in srgb, var(--primary) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)", borderRadius: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.length} selected</span>
          <button className="btn btn-outline" onClick={() => { toast("Projects archived", "success"); setSelected([]); }} style={{ minHeight: 32, padding: "0 12px", fontSize: 12 }} type="button"><Archive size={14} /> Archive</button>
          <button className="btn btn-outline" onClick={() => setDeleteDialog("bulk")} style={{ minHeight: 32, padding: "0 12px", fontSize: 12, color: "var(--danger)", borderColor: "var(--danger)" }} type="button"><Trash2 size={14} /> Delete</button>
          <button className="btn btn-ghost" onClick={() => setSelected([])} style={{ minHeight: 32, padding: "0 12px", fontSize: 12 }} type="button">Clear</button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState icon={Plus} title="No projects found" description="Create your first project to get started." action="New Project" onAction={() => {}} />
      ) : view === "grid" ? (
        <div className="dash-grid-3">
          {filtered.map((p) => (
            <div key={p._id} className="project-card" style={{ position: "relative" }}>
              <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} style={{ position: "absolute", top: 16, left: 16, width: 16, height: 16, cursor: "pointer" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingLeft: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: p.color, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{p.name.charAt(0)}</div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p._id ? null : p._id); }} style={{ width: 30, height: 30, border: "none", background: "transparent" }} type="button"><MoreHorizontal size={16} /></button>
                  {menuOpen === p._id ? (
                    <div style={{ position: "absolute", right: 0, top: 36, width: 160, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 10, overflow: "hidden" }}>
                      {[["Star", Star], ["Share", Share2], ["Settings", Settings], ["Archive", Archive], ["Delete", Trash2]].map(([label, Icon]) => (
                        <button key={label} className="sidebar-item" onClick={() => { setMenuOpen(null); if (label === "Delete") setDeleteDialog(p._id); else toast(`${label} action`, "success"); }} style={{ borderRadius: 0, color: label === "Delete" ? "var(--danger)" : undefined, width: "100%" }} type="button">
                          <Icon size={15} /><span>{label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 13, paddingLeft: 28, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</p>
              <div style={{ paddingLeft: 28 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  {p.stack.map((s) => <span key={s} className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{s}</span>)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="muted" style={{ fontSize: 12 }}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 28 }}>
                <AvatarGroup members={p.members} max={3} size={26} />
                <span className="muted" style={{ fontSize: 11 }}>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", gap: 8, paddingLeft: 28 }}>
                <Link className="btn btn-primary" href={`/dashboard/projects/${p._id}`} style={{ flex: 1, minHeight: 34, fontSize: 12 }}>Open</Link>
                <button className="btn btn-outline" onClick={() => toast("Link copied", "success")} style={{ minHeight: 34, padding: "0 12px", fontSize: 12 }} type="button"><Share2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p._id) : [])} /></th>
                <th>Name</th>
                <th>Status</th>
                <th>Members</th>
                <th>Tasks</th>
                <th>Progress</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{p.name.charAt(0)}</div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                        <p className="muted" style={{ margin: 0, fontSize: 11 }}>{p.stack.slice(0, 2).join(" · ")}</p>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><AvatarGroup members={p.members} max={3} size={24} /></td>
                  <td><span style={{ fontSize: 13 }}>{p.tasks.open} open</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                      <ProgressBar value={p.progress} />
                      <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td><span className="muted" style={{ fontSize: 12 }}>{new Date(p.updatedAt).toLocaleDateString()}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link className="btn btn-outline" href={`/dashboard/projects/${p._id}`} style={{ minHeight: 30, padding: "0 10px", fontSize: 12 }}>Open</Link>
                      <button className="icon-btn" onClick={() => setDeleteDialog(p._id)} style={{ width: 30, height: 30, border: "none", background: "transparent", color: "var(--danger)" }} type="button"><Trash2 size={14} /></button>
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
        onConfirm={() => { toast("Project deleted", "success"); setDeleteDialog(null); setSelected([]); }}
        onCancel={() => setDeleteDialog(null)}
      />
    </>
  );
}
