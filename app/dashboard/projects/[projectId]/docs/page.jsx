"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Bold,
  Code,
  FileText,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  MoreVertical,
  Plus,
  Search,
  Table,
  Trash2,
  Undo,
  Upload,
  Wand2
} from "lucide-react";
import { ConfirmDialog, EmptyState, PageHeader, toast } from "@/components/dashboard-ui";
import { mockDocs, mockProjects } from "@/lib/dashboard-data";

const docNav = [
  { id: "readme", label: "README", icon: FileText },
  { id: "api", label: "API Reference", icon: Code },
  { id: "database", label: "Database Schema", icon: Table },
  { id: "deployment", label: "Deployment Guide", icon: Upload }
];

const toolbarActions = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: LinkIcon, label: "Link" },
  { icon: Code, label: "Code" },
  { icon: Image, label: "Image" },
  { icon: Table, label: "Table" },
  { icon: List, label: "List" },
  { icon: ListOrdered, label: "Ordered List" }
];

const aiActions = [
  { label: "Improve Writing", icon: Wand2, desc: "Enhance clarity and style" },
  { label: "Generate API Docs", icon: Code, desc: "Auto-document endpoints" },
  { label: "Summarize", icon: FileText, desc: "Create a brief summary" },
  { label: "Fix Grammar", icon: Bold, desc: "Correct errors" }
];

export default function ProjectDocsPage() {
  const { projectId } = useParams();
  const project = mockProjects.find((p) => p._id === projectId) || mockProjects[0];
  const [activeDoc, setActiveDoc] = useState("readme");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [content, setContent] = useState(mockDocs[0].content);

  const currentDoc = mockDocs.find((d) => d.id === activeDoc) || mockDocs[0];

  function handleAIAction(action) {
    setMenuOpen(null);
    toast(`${action} started...`, "info");
  }

  return (
    <>
      <PageHeader title="Documentation" subtitle="Project docs and guides">
        <button className="btn btn-primary" onClick={() => toast("New doc created", "success")} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <Plus size={15} /> New Doc
        </button>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, minHeight: "60vh" }}>
        {/* Left Nav */}
        <div className="stat-card" style={{ gap: 8, padding: 12, height: "fit-content", position: "sticky", top: 84 }}>
          <div className="dash-search" style={{ minHeight: 34, height: 34 }}>
            <Search size={14} color="var(--muted)" />
            <input placeholder="Search docs..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: 13 }} />
          </div>
          {docNav.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeDoc === item.id ? "active" : ""}`}
              onClick={() => setActiveDoc(item.id)}
              style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
              type="button"
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </button>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
          <span className="muted" style={{ fontSize: 11, padding: "0 10px" }}>
            Updated {currentDoc.updatedAt}
          </span>
        </div>

        {/* Editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Toolbar */}
          <div className="stat-card" style={{ padding: "8px 12px", gap: 4, flexDirection: "row", flexWrap: "wrap" }}>
            {toolbarActions.map((action) => (
              <button
                key={action.label}
                className="icon-btn"
                onClick={() => toast(`${action.label} applied`, "success")}
                style={{ width: 32, height: 32, border: "none", background: "transparent" }}
                title={action.label}
                type="button"
              >
                <action.icon size={15} />
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button className="btn btn-outline" onClick={() => toast("Saved", "success")} style={{ minHeight: 32, padding: "0 14px", fontSize: 12 }} type="button">
              Save
            </button>
          </div>

          {/* Editor Area */}
          <div className="stat-card" style={{ flex: 1, gap: 0, padding: 0, overflow: "hidden" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 400,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "var(--text)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 14,
                lineHeight: 1.7,
                padding: 20,
                resize: "none"
              }}
              placeholder="Start writing your documentation..."
            />
          </div>
        </div>

        {/* AI Panel */}
        <div className="stat-card" style={{ gap: 14, height: "fit-content", position: "sticky", top: 84 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="logo-mark" style={{ width: 32, height: 32, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}>
              <Wand2 size={16} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>AI Assistant</p>
          </div>
          {aiActions.map((action) => (
            <div key={action.label} style={{ position: "relative" }}>
              <button
                className="sidebar-item"
                onClick={() => setMenuOpen(menuOpen === action.label ? null : action.label)}
                style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", height: "auto", flexDirection: "column", alignItems: "flex-start", gap: 2 }}
                type="button"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <action.icon size={14} color="var(--purple)" />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{action.label}</span>
                </div>
                <span className="muted" style={{ fontSize: 11 }}>{action.desc}</span>
              </button>
              {menuOpen === action.label && (
                <div style={{ position: "absolute", left: 0, top: "100%", width: 180, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 10, overflow: "hidden", marginTop: 4 }}>
                  <button
                    className="sidebar-item"
                    onClick={() => handleAIAction(action.label)}
                    style={{ borderRadius: 0, width: "100%" }}
                    type="button"
                  >
                    Run now
                  </button>
                </div>
              )}
            </div>
          ))}
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <button className="btn btn-outline" onClick={() => toast("Exporting PDF...", "info")} style={{ minHeight: 34, fontSize: 12, width: "100%" }} type="button">
            Export as PDF
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete Document"
        description="This document will be permanently deleted."
        confirmLabel="Delete"
        danger
        onConfirm={() => { toast("Document deleted", "success"); setDeleteDialog(null); }}
        onCancel={() => setDeleteDialog(null)}
      />
    </>
  );
}