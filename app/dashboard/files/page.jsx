"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Upload, Search, Folder, FileText, Image as ImageIcon, Code, Archive,
  Download, Trash2, Eye, HardDrive, Filter, LayoutGrid, List, MoreVertical,
  Plus, ExternalLink, FileCode, CheckCircle
} from "lucide-react";
import { PageHeader, StatCard, ProgressRing, Avatar, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const fileTypeMap = {
  image: { icon: ImageIcon, color: "#ec4899" },
  code: { icon: Code, color: "#3b82f6" },
  doc: { icon: FileText, color: "#10b981" },
  archive: { icon: Archive, color: "#f59e0b" },
  pdf: { icon: FileText, color: "#ef4444" },
  default: { icon: FileText, color: "var(--muted)" }
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

function getCategoryForMime(mimeType = "") {
  if (!mimeType) return "Docs";
  if (mimeType.startsWith("image/")) return "Assets";
  if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("text/")) return "Source Code";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "Docs";
  return "Archives";
}

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadFiles() {
      try {
        setLoading(true);
        setError("");
        const response = await api.files.listWorkspace({ page: 1, limit: 50, search: "" });
        const items = response?.data?.files || response?.files || [];
        if (!ignore) setFiles(items);
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load workspace files");
          setFiles([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFiles();
    return () => { ignore = true; };
  }, []);

  const filteredFiles = files.filter((f) => {
    const name = (f.name || "").toLowerCase();
    const projectName = (f.project?.name || "").toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || projectName.includes(search.toLowerCase());
    const category = getCategoryForMime(f.mimeType);
    const matchesCategory = categoryFilter === "All" || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (file) => {
    const mime = file.mimeType || "";
    if (mime.startsWith("image/")) return <ImageIcon size={20} style={{ color: "#ec4899" }} />;
    if (mime.includes("json") || mime.includes("javascript") || mime.includes("text/")) return <Code size={20} style={{ color: "#3b82f6" }} />;
    if (mime.includes("pdf") || mime.includes("document") || mime.includes("text/")) return <FileText size={20} style={{ color: "#10b981" }} />;
    if (mime.includes("zip") || mime.includes("archive")) return <Archive size={20} style={{ color: "#f59e0b" }} />;
    return <FileText size={20} style={{ color: "var(--muted)" }} />;
  };

  const deleteFile = async (fileId) => {
    try {
      const target = files.find((item) => item._id === fileId || item.id === fileId);
      if (!target) return;
      const projectId = target.project?._id || target.project;
      if (!projectId) {
        toast("This file is missing its project reference", "error");
        return;
      }
      await api.files.deleteProject(projectId, fileId);
      setFiles((current) => current.filter((item) => (item._id || item.id) !== fileId));
      toast("File removed from workspace storage", "success");
    } catch (err) {
      toast(err.message || "Unable to delete file", "error");
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const selected = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
    if (!selected) {
      toast("Choose a file to upload", "error");
      return;
    }

    const projectId = prompt("Enter the project id to attach this upload to:", "");
    if (!projectId || !projectId.trim()) {
      toast("A project id is required to upload a file", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", selected);
    formData.append("folder", "/workspace");

    try {
      setUploading(true);
      const response = await api.files.uploadProject(projectId.trim(), formData);
      const created = response?.data?.file || response?.file || null;
      if (created) setFiles((current) => [created, ...current]);
      setShowUploadModal(false);
      toast("File uploaded successfully to project storage", "success");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <PageHeader title="Workspace Files" subtitle="Cloud storage, source assets, documents, and build artifacts">
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Upload size={16} /> Upload File
        </button>
      </PageHeader>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing value={loading ? 0 : Math.min(75, filteredFiles.length * 10)} max={100} size={70} stroke={8} color="#3b82f6" />
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Workspace Storage</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0" }}>{loading ? "Loading..." : `${files.length} files`}</div>
            <div style={{ fontSize: 11, color: "var(--success)" }}>{files.length ? `${files.length} files currently indexed` : "No files available"}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Search files by name or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Category:</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}>
              <option value="All">All Categories</option>
              <option value="Source Code">Source Code</option>
              <option value="Docs">Docs</option>
              <option value="Assets">Assets</option>
              <option value="Archives">Archives</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button onClick={() => setViewMode("grid")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "grid" ? "var(--primary)" : "transparent", color: viewMode === "grid" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            <LayoutGrid size={15} /> Grid
          </button>
          <button onClick={() => setViewMode("list")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "list" ? "var(--primary)" : "transparent", color: viewMode === "list" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            <List size={15} /> List
          </button>
        </div>
      </div>

      {error ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, color: "var(--danger)" }}>{error}</div>
      ) : null}

      {loading && !files.length ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>Loading files…</div>
      ) : null}

      {!loading && !filteredFiles.length ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>No files matched your filters.</div>
      ) : null}

      {viewMode === "grid" && !loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filteredFiles.map((file) => {
            const category = getCategoryForMime(file.mimeType);
            return (
              <div key={file._id || file.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
                    {getFileIcon(file)}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" onClick={() => { setPreviewFile(file); toast(`Previewing ${file.name}`, "info"); }} title="Preview">
                      <Eye size={15} />
                    </button>
                    <button className="icon-btn" onClick={() => { const url = file.url || ""; if (url) window.open(url, "_blank", "noopener,noreferrer"); else toast("No download URL available", "error"); }} title="Download">
                      <Download size={15} />
                    </button>
                    <button className="icon-btn" onClick={() => deleteFile(file._id || file.id)} style={{ color: "var(--danger)" }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700, color: "var(--fg)", wordBreak: "break-all" }}>{file.name}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 12, color: "var(--muted)" }}>
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span style={{ color: "var(--primary)", fontWeight: 500 }}>{file.project?.name || "Project"}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)", fontSize: 12, color: "var(--muted)" }}>
                  <span>By {file.uploadedBy?.name || "Unknown"}</span>
                  <span>{new Date(file.updatedAt || file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {viewMode === "list" && !loading ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontWeight: 600 }}>
                <th style={{ padding: "14px 20px" }}>File Name</th>
                <th style={{ padding: "14px 20px" }}>Category</th>
                <th style={{ padding: "14px 20px" }}>Project</th>
                <th style={{ padding: "14px 20px" }}>Size</th>
                <th style={{ padding: "14px 20px" }}>Owner</th>
                <th style={{ padding: "14px 20px" }}>Updated</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file._id || file.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {getFileIcon(file)}
                      <span style={{ fontWeight: 600, color: "var(--fg)" }}>{file.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{getCategoryForMime(file.mimeType)}</td>
                  <td style={{ padding: "14px 20px", color: "var(--primary)", fontWeight: 500 }}>{file.project?.name || "Project"}</td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{formatFileSize(file.size)}</td>
                  <td style={{ padding: "14px 20px" }}>{file.uploadedBy?.name || "Unknown"}</td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{new Date(file.updatedAt || file.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button className="icon-btn" onClick={() => { const url = file.url || ""; if (url) window.open(url, "_blank", "noopener,noreferrer"); else toast("No download URL available", "error"); }} title="Download"><Download size={14} /></button>
                      <button className="icon-btn" onClick={() => deleteFile(file._id || file.id)} style={{ color: "var(--danger)" }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {showUploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 500, padding: 24 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700 }}>Upload Workspace File</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)" }}>Choose a project and add a file from your computer.</p>

            <form onSubmit={handleUpload}>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>Project ID</span>
                  <input id="project-upload-id" type="text" placeholder="Project ObjectId" style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)" }} />
                </label>
                <div
                  style={{ border: "2px dashed var(--border)", borderRadius: 14, padding: "36px 20px", textAlign: "center", background: dragActive ? "rgba(59, 130, 246, 0.1)" : "rgba(0,0,0,0.2)", borderColor: dragActive ? "var(--primary)" : "var(--border)", marginBottom: 20, cursor: "pointer" }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); const selected = e.dataTransfer.files?.[0]; if (!selected) return; const formData = new FormData(); formData.append("file", selected); formData.append("folder", "/workspace"); const projectId = document.getElementById("project-upload-id")?.value?.trim(); if (!projectId) { toast("A project id is required to upload a file", "error"); return; } setUploading(true); api.files.uploadProject(projectId, formData).then((response) => { const created = response?.data?.file || response?.file || null; if (created) setFiles((current) => [created, ...current]); setShowUploadModal(false); toast("File uploaded successfully to project storage", "success"); }).catch((err) => toast(err.message || "Upload failed", "error")).finally(() => setUploading(false)); }}
                >
                  <Upload size={32} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
                  <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Drag & drop files here</p>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--muted)" }}>or click to browse</p>
                  <input type="file" onChange={handleUpload} style={{ display: "block", width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)} style={{ minHeight: 38 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 38 }} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewFile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "grid", placeItems: "center", padding: 20 }} onClick={() => setPreviewFile(null)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "min(900px, 100%)", maxHeight: "80vh", overflow: "auto", padding: 20 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{previewFile.name}</h3>
              <button className="icon-btn" onClick={() => setPreviewFile(null)} type="button"><Trash2 size={15} /></button>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              {previewFile.mimeType?.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: 420, display: "block", margin: "0 auto", borderRadius: 8 }} />
              ) : (
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--fg)", fontSize: 13 }}>{previewFile.url ? "Download URL available" : "No preview available for this file type."}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
