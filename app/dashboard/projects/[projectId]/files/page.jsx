"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Archive, Download, Eye, File, FileText, FolderOpen, Grid3X3, Image, List, MoreHorizontal, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import { ConfirmDialog, EmptyState, FilterBar, PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const folders = ["All Files", "Design", "Docs", "Database", "Assets"];

const fileIcons = {
  figma: { icon: File, color: "#f24e1e" },
  markdown: { icon: FileText, color: "#3b82f6" },
  image: { icon: Image, color: "#22c55e" },
  code: { icon: FileText, color: "#f59e0b" },
  pdf: { icon: FileText, color: "#ef4444" },
  archive: { icon: Archive, color: "#8b5cf6" }
};

function formatFileSize(bytes = 0) {
  if (!bytes || Number.isNaN(bytes)) return "0 KB";
  const caps = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < caps.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${caps[unitIndex]}`;
}

export default function ProjectFilesPage() {
  const { projectId } = useParams();
  const [view, setView] = useState("grid");
  const [folder, setFolder] = useState("All Files");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [projectName, setProjectName] = useState(projectId || "Project");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await api.projects.get(projectId);
        const project = response?.data?.project || response?.project || null;
        if (project?.name && !ignore) setProjectName(project.name);

        const filesResponse = await api.files.listProject(projectId, { page: 1, limit: 100 });
        const result = filesResponse?.data?.files || filesResponse?.files || [];
        if (!ignore) setFiles(result);
      } catch (err) {
        if (!ignore) setError(err.message || "Unable to load project files");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [projectId]);

  const filtered = useMemo(() => files.filter((f) => {
    const folderMatch = folder === "All Files" || f.folder === folder || (folder === "All Files" && !f.folder);
    const searchMatch = !search || (f.name || "").toLowerCase().includes(search.toLowerCase());
    return folderMatch && searchMatch;
  }), [files, folder, search]);

  const deleteFile = async (fileId) => {
    try {
      await api.files.deleteProject(projectId, fileId);
      setFiles((items) => items.filter((file) => (file._id || file.id) !== fileId));
      setDeleteDialog(null);
      toast("File deleted", "success");
    } catch (err) {
      toast(err.message || "Unable to delete file", "error");
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setDragging(false);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeUploadModal = () => {
    setUploadOpen(false);
    resetUploadState();
  };

  const handleUpload = async (event) => {
    const nextFile = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
    if (!nextFile) return;

    setSelectedFile(nextFile);

    if (event.type === "change" && fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (uploading) return;

    const formData = new FormData();
    formData.append("file", nextFile);
    formData.append("folder", folder === "All Files" ? "/" : folder);

    try {
      setUploading(true);
      const response = await api.files.uploadProject(projectId, formData);
      const nextFileRecord = response?.data?.file || response?.file;
      if (nextFileRecord) setFiles((items) => [nextFileRecord, ...items]);
      closeUploadModal();
      toast("Files uploaded", "success");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onDropFile = (event) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer?.files?.[0];
    if (!droppedFile) return;
    handleUpload({ target: { files: [droppedFile] }, dataTransfer: { files: [droppedFile] }, type: "drop" });
  };

  const onBrowseFile = (event) => {
    const selected = event.target?.files?.[0];
    if (!selected) return;
    setSelectedFile(selected);
    if (event.target) event.target.value = "";
  };

  const onSubmitSelectedFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folder", folder === "All Files" ? "/" : folder);

    try {
      setUploading(true);
      const response = await api.files.uploadProject(projectId, formData);
      const nextFileRecord = response?.data?.file || response?.file;
      if (nextFileRecord) setFiles((items) => [nextFileRecord, ...items]);
      closeUploadModal();
      toast("Files uploaded", "success");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: projectName, href: `/dashboard/projects/${projectId}` }, { label: "Files" }]} />
      <PageHeader title="Files" subtitle={`${filtered.length} files`}>
        <button className="btn btn-primary" onClick={() => setUploadOpen(true)} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <Upload size={16} /> Upload
        </button>
        <button className="btn btn-outline" onClick={() => toast("Folder created", "success")} style={{ minHeight: 38, fontSize: 13 }} type="button">
          <Plus size={16} /> New Folder
        </button>
      </PageHeader>

      {error ? <div className="stat-card" style={{ marginBottom: 16, color: "var(--danger)" }}>{error}</div> : null}

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

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {folders.map((f) => (
          <button key={f} className={`filter-chip ${folder === f ? "active" : ""}`} onClick={() => setFolder(f)} type="button">{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="stat-card" style={{ marginTop: 18 }}>Loading files…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files found" description="Upload your first file to get started." action="Upload File" onAction={() => setUploadOpen(true)} />
      ) : view === "grid" ? (
        <div className="dash-grid-3" style={{ marginTop: 18 }}>
          {filtered.map((f) => {
            const fileType = f.mimeType?.startsWith("image/") ? "image" : "code";
            const { icon: Icon, color } = fileIcons[fileType] || { icon: File, color: "var(--muted)" };
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
                        {[ ["Preview", Eye], ["Download", Trash2] ].map(([label, Ic]) => (
                          <button key={label} className="sidebar-item" onClick={() => { setMenuOpen(null); if (label === "Delete") setDeleteDialog(f._id); else if (label === "Download") { if (f.url) window.open(f.url, "_blank", "noopener,noreferrer"); else toast("No download URL available", "error"); } else if (label === "Preview") { if (f.url) setPreviewFile(f); else toast("No preview available for this file", "error"); } else toast(`${label}`, "success"); }} style={{ borderRadius: 0, color: label === "Delete" ? "var(--danger)" : undefined, width: "100%" }} type="button">
                            <Ic size={14} /><span>{label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 11 }}>{formatFileSize(f.size)} · {f.uploadedBy?.name || "Unknown"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{f.folder || "/"}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{new Date(f.updatedAt || f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stat-card" style={{ padding: 0, overflow: "hidden", marginTop: 18 }}>
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
                const fileType = f.mimeType?.startsWith("image/") ? "image" : "code";
                const { icon: Icon, color } = fileIcons[fileType] || { icon: File, color: "var(--muted)" };
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
                    <td><span className="muted" style={{ fontSize: 13 }}>{f.uploadedBy?.name || "Unknown"}</span></td>
                    <td><span style={{ fontSize: 13 }}>{formatFileSize(f.size)}</span></td>
                    <td><span className="badge" style={{ padding: "2px 8px", fontSize: 11 }}>{f.folder || "/"}</span></td>
                    <td><span className="muted" style={{ fontSize: 12 }}>{new Date(f.updatedAt || f.createdAt).toLocaleDateString()}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="icon-btn" onClick={() => { if (f.url) setPreviewFile(f); else toast("No preview available for this file", "error"); }} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><Eye size={14} /></button>
                        <button className="icon-btn" onClick={() => { if (f.url) window.open(f.url, "_blank", "noopener,noreferrer"); else toast("No download URL available", "error"); }} style={{ width: 28, height: 28, border: "none", background: "transparent" }} type="button"><Download size={14} /></button>
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

      {uploadOpen ? (
        <div className="dialog-overlay" onClick={() => setUploadOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 17 }}>Upload Files</strong>
              <button onClick={() => setUploadOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button"><X size={18} /></button>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDropFile} style={{ border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`, borderRadius: 14, padding: "40px 24px", textAlign: "center", background: dragging ? "color-mix(in srgb, var(--primary) 5%, transparent)" : "transparent", transition: "all 150ms ease" }}>
              <Upload size={32} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Drag & drop files here</p>
              <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>or click to browse</p>
              <input type="file" onChange={onBrowseFile} style={{ display: "block", width: "100%" }} ref={fileInputRef} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
              <button className="btn btn-outline" onClick={() => setUploadOpen(false)} style={{ minHeight: 38 }} type="button">Cancel</button>
              <button className="btn btn-primary" onClick={onSubmitSelectedFile} style={{ minHeight: 38 }} type="button" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog open={!!deleteDialog} title="Delete File" description="This file will be permanently deleted." confirmLabel="Delete" danger onConfirm={() => deleteFile(deleteDialog)} onCancel={() => setDeleteDialog(null)} />

      {previewFile ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "grid", placeItems: "center", padding: 20 }} onClick={() => setPreviewFile(null)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "min(900px, 100%)", maxHeight: "80vh", overflow: "auto", padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{previewFile.name}</h3>
              <button className="icon-btn" onClick={() => setPreviewFile(null)} type="button"><X size={15} /></button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              {previewFile.mimeType?.startsWith("image/") || previewFile.url?.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i) ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: 420, display: "block", margin: "0 auto", borderRadius: 8 }} />
              ) : (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--fg)", fontSize: 13 }}>{previewFile.url ? "Preview is available for this file type." : "No preview available for this file type."}</pre>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
