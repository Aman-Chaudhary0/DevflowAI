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
      <div className="flex items-center gap-3 flex-wrap">
        <div className="dash-search" style={{ minWidth: 220, flex: 1, maxWidth: 360 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto", minWidth: 180, height: 40, padding: "0 12px" }}>
          {sortOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
        <div className="flex gap-1 border border-(--border) rounded-[10px] p-0.75">
          <button className={`icon-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} style={{ width: 32, height: 32, border: "none", background: view === "grid" ? "var(--primary)" : "transparent", color: view === "grid" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><Grid3X3 size={15} /></button>
          <button className={`icon-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")} style={{ width: 32, height: 32, border: "none", background: view === "list" ? "var(--primary)" : "transparent", color: view === "list" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><List size={15} /></button>
        </div>
      </div>

      <FilterBar filters={filters} active={filter} onChange={setFilter} />

      {/* Bulk Actions */}
      {selected.length > 0 ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)" }}>
          <span className="text-[13px] font-semibold">{selected.length} selected</span>
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
            <div key={p._id} className="project-card relative">
              <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="absolute top-4 left-4 w-4 h-4 cursor-pointer" />
              <div className="flex items-start justify-between pl-7">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl grid place-items-center text-white font-extrabold text-base shrink-0" style={{ background: p.color }}>{p.name.charAt(0)}</div>
                  <div>
                    <p className="m-0 mb-0.5 font-bold text-sm">{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="relative">
                  <button className="icon-btn w-7.5 h-7.5 border-0 bg-transparent" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p._id ? null : p._id); }} type="button"><MoreHorizontal size={16} /></button>
                  {menuOpen === p._id ? (
                    <div className="absolute right-0 top-9 w-40 bg-(--card) border border-(--border) rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-10 overflow-hidden">
                      {[["Star", Star], ["Share", Share2], ["Settings", Settings], ["Archive", Archive], ["Delete", Trash2]].map(([label, Icon]) => (
                        <button key={label} className="sidebar-item rounded-none w-full" onClick={() => { setMenuOpen(null); if (label === "Delete") setDeleteDialog(p._id); else toast(`${label} action`, "success"); }} style={{ color: label === "Delete" ? "var(--danger)" : undefined }} type="button">
                          <Icon size={15} /><span>{label}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="muted m-0 text-[13px] pl-7 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</p>
              <div className="pl-7">
                <div className="flex gap-1.5 mb-2.5 flex-wrap">
                  {p.stack.map((s) => <span key={s} className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{s}</span>)}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="muted text-xs">Progress</span>
                  <span className="text-xs font-bold">{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} />
              </div>
              <div className="flex items-center justify-between pl-7">
                <AvatarGroup members={p.members} max={3} size={26} />
                <span className="muted text-[11px]">Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 pl-7">
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
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold text-[13px] shrink-0" style={{ background: p.color }}>{p.name.charAt(0)}</div>
                      <div>
                        <p className="m-0 mb-0.5 font-semibold text-[13px]">{p.name}</p>
                        <p className="muted m-0 text-[11px]">{p.stack.slice(0, 2).join(" · ")}</p>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td><AvatarGroup members={p.members} max={3} size={24} /></td>
                  <td><span className="text-[13px]">{p.tasks.open} open</span></td>
                  <td>
                    <div className="flex items-center gap-2 min-w-25">
                      <ProgressBar value={p.progress} />
                      <span className="text-xs font-bold shrink-0">{p.progress}%</span>
                    </div>
                  </td>
                  <td><span className="muted text-xs">{new Date(p.updatedAt).toLocaleDateString()}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <Link className="btn btn-outline" href={`/dashboard/projects/${p._id}`} style={{ minHeight: 30, padding: "0 10px", fontSize: 12 }}>Open</Link>
                      <button className="icon-btn text-(--danger) border-0 bg-transparent w-7.5 h-7.5" onClick={() => setDeleteDialog(p._id)} type="button"><Trash2 size={14} /></button>
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
