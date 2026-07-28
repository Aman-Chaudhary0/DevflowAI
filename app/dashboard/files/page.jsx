"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload, Search, Folder, FileText, Image as ImageIcon, Code, Archive,
  Download, Trash2, Eye, HardDrive, Filter, LayoutGrid, List, MoreVertical,
  Plus, ExternalLink, FileCode, CheckCircle
} from "lucide-react";
import { PageHeader, StatCard, ProgressRing, Avatar, toast } from "@/components/dashboard-ui";

const initialFiles = [
  { id: "file-1", name: "schema.prisma", type: "code", category: "Source Code", size: "14.2 KB", updated: "2 hours ago", project: "Devflow Core", owner: "Aman Chaudhary", downloads: 42 },
  { id: "file-2", name: "architecture_diagram.png", type: "image", category: "Assets", size: "2.4 MB", updated: "Yesterday", project: "UI System", owner: "Sarah Chen", downloads: 128 },
  { id: "file-3", name: "api_v2_spec.openapi.json", type: "code", category: "Source Code", size: "88.6 KB", updated: "Mar 24, 2025", project: "Devflow Core", owner: "Alex Rivera", downloads: 19 },
  { id: "file-4", name: "security_audit_q1.pdf", type: "doc", category: "Docs", size: "1.8 MB", updated: "Mar 22, 2025", project: "Security Audit", owner: "Marcus Vance", downloads: 67 },
  { id: "file-5", name: "release_v1.4.0.zip", type: "archive", category: "Archives", size: "145.2 MB", updated: "Mar 20, 2025", project: "DevOps", owner: "Elena Rostova", downloads: 310 },
  { id: "file-6", name: "tailwind.config.js", type: "code", category: "Source Code", size: "4.8 KB", updated: "3 hours ago", project: "UI System", owner: "Aman Chaudhary", downloads: 15 },
  { id: "file-7", name: "product_roadmap_2025.pdf", type: "doc", category: "Docs", size: "3.2 MB", updated: "Mar 18, 2025", project: "Product", owner: "Sarah Chen", downloads: 204 },
  { id: "file-8", name: "brand_assets.zip", type: "archive", category: "Archives", size: "48.9 MB", updated: "Mar 15, 2025", project: "Design", owner: "Sarah Chen", downloads: 88 }
];

export default function FilesPage() {
  const [files, setFiles] = useState(initialFiles);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.project.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case "code": return <Code size={20} style={{ color: "#3b82f6" }} />;
      case "image": return <ImageIcon size={20} style={{ color: "#ec4899" }} />;
      case "doc": return <FileText size={20} style={{ color: "#10b981" }} />;
      case "archive": return <Archive size={20} style={{ color: "#f59e0b" }} />;
      default: return <FileText size={20} style={{ color: "var(--muted)" }} />;
    }
  };

  const deleteFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
    toast("File removed from workspace storage", "danger");
  };

  const handleSimulatedUpload = (e) => {
    e.preventDefault();
    const mockNewFile = {
      id: `file-${Date.now()}`,
      name: "new_upload_document.pdf",
      type: "doc",
      category: "Docs",
      size: "2.1 MB",
      updated: "Just now",
      project: "Devflow Core",
      owner: "Aman Chaudhary",
      downloads: 0
    };
    setFiles([mockNewFile, ...files]);
    setShowUploadModal(false);
    toast("File uploaded successfully to cloud storage!", "success");
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <PageHeader title="Workspace Files" subtitle="Cloud storage, source assets, documents, and build artifacts">
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
          <Upload size={16} /> Upload File
        </button>
      </PageHeader>

      {/* Storage Breakdown Banner */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing value={206.5} max={1024} size={70} stroke={8} color="#3b82f6" />
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Workspace Storage</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0" }}>206.5 MB <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>/ 1 GB</span></div>
            <div style={{ fontSize: 11, color: "var(--success)" }}>797.5 MB remaining (20% used)</div>
          </div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Source Code</div>
          <div style={{ fontSize: 16, fontWeight: 700, margin: "2px 0" }}>107.6 KB</div>
          <div style={{ fontSize: 11, color: "#3b82f6" }}>3 code files</div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Docs & PDF</div>
          <div style={{ fontSize: 16, fontWeight: 700, margin: "2px 0" }}>5.0 MB</div>
          <div style={{ fontSize: 11, color: "#10b981" }}>2 document files</div>
        </div>

        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 20 }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Archives & Media</div>
          <div style={{ fontSize: 16, fontWeight: 700, margin: "2px 0" }}>196.5 MB</div>
          <div style={{ fontSize: 11, color: "#f59e0b" }}>3 zip & asset files</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
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
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13 }}
            >
              <option value="All">All Categories</option>
              <option value="Source Code">Source Code</option>
              <option value="Docs">Docs</option>
              <option value="Assets">Assets</option>
              <option value="Archives">Archives</option>
            </select>
          </div>
        </div>

        {/* Grid / List switch */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "grid" ? "var(--primary)" : "transparent", color: viewMode === "grid" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            <LayoutGrid size={15} /> Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "none", background: viewMode === "list" ? "var(--primary)" : "transparent", color: viewMode === "list" ? "#fff" : "var(--muted)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {filteredFiles.map(file => (
            <div
              key={file.id}
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, transition: "transform 0.15s, border-color 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "grid", placeItems: "center" }}>
                  {getFileIcon(file.type)}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="icon-btn" onClick={() => { setPreviewFile(file); toast(`Previewing ${file.name}`, "info"); }} title="Preview">
                    <Eye size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => toast(`Downloading ${file.name}...`, "success")} title="Download">
                    <Download size={15} />
                  </button>
                  <button className="icon-btn" onClick={() => deleteFile(file.id)} style={{ color: "var(--danger)" }} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700, color: "var(--fg)", wordBreak: "break-all" }}>{file.name}</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 12, color: "var(--muted)" }}>
                <span>{file.size}</span>
                <span>•</span>
                <span style={{ color: "var(--primary)", fontWeight: 500 }}>{file.project}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)", fontSize: 12, color: "var(--muted)" }}>
                <span>By {file.owner}</span>
                <span>{file.updated}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
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
              {filteredFiles.map(file => (
                <tr key={file.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {getFileIcon(file.type)}
                      <span style={{ fontWeight: 600, color: "var(--fg)" }}>{file.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{file.category}</td>
                  <td style={{ padding: "14px 20px", color: "var(--primary)", fontWeight: 500 }}>{file.project}</td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{file.size}</td>
                  <td style={{ padding: "14px 20px" }}>{file.owner}</td>
                  <td style={{ padding: "14px 20px", color: "var(--muted)" }}>{file.updated}</td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button className="icon-btn" onClick={() => toast(`Downloading ${file.name}...`, "success")} title="Download"><Download size={14} /></button>
                      <button className="icon-btn" onClick={() => deleteFile(file.id)} style={{ color: "var(--danger)" }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 500, padding: 24 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700 }}>Upload Workspace File</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)" }}>Drag and drop files or choose from your computer.</p>

            <form onSubmit={handleSimulatedUpload}>
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 14,
                  padding: "36px 20px",
                  textAlign: "center",
                  background: dragActive ? "rgba(59, 130, 246, 0.1)" : "rgba(0,0,0,0.2)",
                  borderColor: dragActive ? "var(--primary)" : "var(--border)",
                  marginBottom: 20,
                  cursor: "pointer"
                }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleSimulatedUpload(e); }}
              >
                <Upload size={32} style={{ color: "var(--primary)", marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Drag files here to upload</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Supports ZIP, PDF, JSON, PNG, TSX up to 100MB</div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)} style={{ minHeight: 36, fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 36, fontSize: 13 }}>
                  Start Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
