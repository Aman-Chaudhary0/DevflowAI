"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Archive, Download, Eye, File, FileText, FolderOpen, Grid3X3, Image, List, MoreHorizontal, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog, EmptyState, FilterBar, PageHeader, toast } from "@/components/dashboard-ui";
import { mockFiles } from "@/lib/dashboard-data";

const folders = ["All Files", "Design", "Docs", "Database", "Assets"];

const fileIcons = {
  figma: { icon: File, color: "#f24e1e" },
  markdown: { icon: FileText, color: "#3b82f6" },
  image: { icon: Image, color: "#22c55e" },
  code: { icon: FileText, color: "#f59e0b" },
  pdf: { icon: FileText, color: "#ef4444" },
  archive: { icon: Archive, color: "#8b5cf6" }
};

export default function ProjectFilesPage() {
  const { projectId } = useParams();
  const [view, setView] = useState("grid");
  const [folder, setFolder] = useState("All Files");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const filtered = mockFiles.filter((f) => {
    if (folder !== "All Files" && f.folder !== folder) return false;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <PageHeader title="Files" subtitle={`${filtered.length} files`}>
        <button className="btn btn-primary" onClick={() => setUploadOpen(true)} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <Upload size={16} /> Upload
        </button>
        <button className="btn btn-outline" onClick={() => toast("Folder created", "success")} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <Plus size={16} /> New Folder
        </button>
      </PageHeader>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 4, border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
          <button className="icon-btn" onClick={() => setView("grid")} style={{ width: 32, height: 32, border: "none", background: view === "grid" ? "var(--primary)" : "transparent", color: view === "grid" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><Grid3X3 size={15} /></button>
          <button className="icon-btn" onClick={() => setView("list")} style={{ width: 32, height: 32, border: "none", background: view === "list" ? "var(--primary)" : "transparent", color: view === "list" ? "white" : "var(--muted)", borderRadius: 8 }} type="button"><List size={15} /></button>
        </div>
      </div>

      {/* Breadcrumb + Folders */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {folders.map((f) => (
          <button key={f} className={`filter-chip ${folder === f ? "active" : ""}`} onClick={() => setFolder(f)} type="button">{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files found" description="Upload your first file to get started." action="Upload File" onAction={() => setUploadOpen(true)} />
      ) : view === "grid" ? (
        <div className="dash-grid-3">
          {filtered.map((f) => {
            const { icon: Icon, color } = fileIcons[f.type] || { icon: File, color: "var(--muted)" };
            return (
              <div key={f._id} className="stat-card" style={{ gap: 12, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center" }}>
                    <Icon size={22} color={color} />
                  </div>
                  <div style={{ position: "relative" }}>
                    <button className="icon-btn" onClick={() => setMenuOpen(menuOpen === f._id ? null : f._id)} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><MoreHorizontal size={15} /></button>
                    {menuOpen === f._id ? (
                      <div style={{ position: "absolute", right: 0, top: 32, width: 160, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 10, overflow: "hidden" }}>
                        {[["Preview", Eye], ["Download", Download], ["Star", Star], ["Delete", Trash2]].map(([label, Ic]) => (
                          <button key={label} className="sidebar-item" onClick={() => { setMenuOpen(null); if (label === "Delete") setDeleteDialog(f._id); else toast(`${label}`, "success"); }} style={{ borderRadius: 0, color: label === "Delete" ? "var(--danger)" : undefined, width: "100%" }} type="button">
                            <Ic size={14} /><span>{label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 11 }}>{f.size} · {f.owner}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{f.folder}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{f.updatedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Size</th>
                <th>Folder</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const { icon: Icon, color } = fileIcons[f.type] || { icon: File, color: "var(--muted)" };
                return (
                  <tr key={f._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <Icon size={15} color={color} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                      </div>
                    </td>
                    <td><span className="muted" style={{ fontSize: 13 }}>{f.owner}</span></td>
                    <td><span style={{ fontSize: 13 }}>{f.size}</span></td>
                    <td><span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{f.folder}</span></td>
                    <td><span className="muted" style={{ fontSize: 12 }}>{f.updatedAt}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="icon-btn" onClick={() => toast("Downloading", "success")} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><Download size={14} /></button>
                        <button className="icon-btn" onClick={() => setDeleteDialog(f._id)} style={{ width: 28, height: 28, border: "none", background: "transparent", color: "var(--danger)" }} type="button"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen ? (
        <div className="dialog-overlay" onClick={() => setUploadOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 17 }}>Upload Files</strong>
              <button onClick={() => setUploadOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button"><X size={18} /></button>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); toast("Files uploaded", "success"); setUploadOpen(false); }}
              style={{ border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`, borderRadius: 14, padding: "40px 24px", textAlign: "center", background: dragging ? "color-mix(in srgb, var(--primary) 5%, transparent)" : "transparent", transition: "all 150ms ease" }}
            >
              <Upload size={32} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Drag & drop files here</p>
              <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>or click to browse</p>
              <button className="btn btn-outline" style={{ minHeight: 36, fontSize: 13 }} type="button">Browse Files</button>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setUploadOpen(false)} style={{ minHeight: 38 }} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={() => { toast("Files uploaded", "success"); setUploadOpen(false); }} style={{ minHeight: 38 }} type="button">Upload</button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={!!deleteDialog} title="Delete File" description="This file will be permanently deleted." confirmLabel="Delete" danger onConfirm={() => { toast("File deleted", "success"); setDeleteDialog(null); }} onCancel={() => setDeleteDialog(null)} />
    </>
  );
}
