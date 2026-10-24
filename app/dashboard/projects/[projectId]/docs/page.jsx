"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

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
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [projectResponse, docsResponse] = await Promise.all([
          api.projects.get(projectId),
          api.files.docs.list(projectId, { page: 1, limit: 50 })
        ]);
        const nextProject = projectResponse?.data?.project || projectResponse?.project || null;
        const nextDocs = docsResponse?.data?.documents || docsResponse?.documents || [];
        if (!ignore) {
          setProject(nextProject);
          setDocuments(nextDocs);
          if (nextDocs.length) {
            setActiveDocId(nextDocs[0]._id);
            setContent(nextDocs[0].content || "");
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message || "Unable to load project documentation");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [projectId]);

  const filteredDocs = useMemo(() => documents.filter((doc) => {
    return !search || (doc.title || "").toLowerCase().includes(search.toLowerCase());
  }), [documents, search]);

  const currentDoc = documents.find((doc) => doc._id === activeDocId) || documents[0] || null;

  useEffect(() => {
    if (currentDoc) {
      setContent(currentDoc.content || "");
    }
  }, [currentDoc]);

  if (!project && !loading) {
    return <EmptyState icon={FileText} title="Project not found" description="This project cannot be opened right now." action="Back to projects" onAction={() => window.location.assign("/dashboard/projects")} />;
  }

  async function handleSave() {
    if (!currentDoc) {
      toast("Create a document before saving", "error");
      return;
    }

    try {
      setSaving(true);
      await api.files.docs.update(projectId, currentDoc._id, { content, title: currentDoc.title, slug: currentDoc.slug, visibility: currentDoc.visibility || "workspace" });
      const updated = documents.map((doc) => doc._id === currentDoc._id ? { ...doc, content } : doc);
      setDocuments(updated);
      toast("Saved", "success");
    } catch (err) {
      toast(err.message || "Unable to save document", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleNewDoc() {
    try {
      const title = `New Document ${documents.length + 1}`;
      const payload = { title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""), content: "# New Document\n\nStart writing here.", contentFormat: "markdown", visibility: "workspace" };
      const response = await api.files.docs.create(projectId, payload);
      const created = response?.data?.document || response?.document;
      if (created) {
        setDocuments((current) => [created, ...current]);
        setActiveDocId(created._id);
        setContent(created.content || "");
      }
      toast("New doc created", "success");
    } catch (err) {
      toast(err.message || "Unable to create document", "error");
    }
  }

  async function handleDeleteDoc() {
    if (!currentDoc) return;
    try {
      await api.files.docs.delete(projectId, currentDoc._id);
      const nextDocuments = documents.filter((doc) => doc._id !== currentDoc._id);
      setDocuments(nextDocuments);
      if (nextDocuments.length) {
        setActiveDocId(nextDocuments[0]._id);
        setContent(nextDocuments[0].content || "");
      } else {
        setActiveDocId(null);
        setContent("");
      }
      toast("Document deleted", "success");
      setDeleteDialog(null);
    } catch (err) {
      toast(err.message || "Unable to delete document", "error");
    }
  }

  function handleAIAction(action) {
    setMenuOpen(null);
    toast(`${action} started...`, "info");
  }

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: project?.name || projectId, href: `/dashboard/projects/${projectId}` }, { label: "Documentation" }]} />
      <PageHeader title="Documentation" subtitle="Project docs and guides">
        <button className="btn btn-primary" onClick={handleNewDoc} style={{ minHeight: 36, fontSize: 13 }} type="button">
          <Plus size={15} /> New Doc
        </button>
      </PageHeader>

      {error ? <div className="stat-card" style={{ marginBottom: 16, color: "var(--danger)" }}>{error}</div> : null}

      {loading ? (
        <div className="stat-card">Loading documents…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20, minHeight: "60vh" }}>
          <div className="stat-card" style={{ gap: 8, padding: 12, height: "fit-content", position: "sticky", top: 84 }}>
            <div className="dash-search" style={{ minHeight: 34, height: 34 }}>
              <Search size={14} color="var(--muted)" />
              <input placeholder="Search docs..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: 13 }} />
            </div>
            {filteredDocs.map((doc) => (
              <button
                key={doc._id}
                className={`sidebar-item ${activeDocId === doc._id ? "active" : ""}`}
                onClick={() => { setActiveDocId(doc._id); setContent(doc.content || ""); }}
                style={{ borderRadius: 10, padding: "8px 10px", fontSize: 13 }}
                type="button"
              >
                <FileText size={15} />
                <span>{doc.title}</span>
              </button>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
            <span className="muted" style={{ fontSize: 11, padding: "0 10px" }}>
              {currentDoc ? `Updated ${new Date(currentDoc.updatedAt || currentDoc.createdAt).toLocaleDateString()}` : "No document selected"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="stat-card" style={{ padding: "8px 12px", gap: 4, flexDirection: "row", flexWrap: "wrap" }}>
              {toolbarActions.map((action) => (
                <button key={action.label} className="icon-btn" onClick={() => toast(`${action.label} applied`, "success")} style={{ width: 32, height: 32, border: "none", background: "transparent" }} title={action.label} type="button">
                  <action.icon size={15} />
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button className="btn btn-outline" onClick={handleSave} disabled={saving || !currentDoc} style={{ minHeight: 32, padding: "0 14px", fontSize: 12 }} type="button">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="stat-card" style={{ flex: 1, gap: 0, padding: 0, overflow: "hidden" }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: "100%", height: "100%", minHeight: 400, border: "none", outline: "none", background: "transparent", color: "var(--text)", fontFamily: "JetBrains Mono, monospace", fontSize: 14, lineHeight: 1.7, padding: 20, resize: "none" }}
                placeholder="Start writing your documentation..."
              />
            </div>
          </div>

          <div className="stat-card" style={{ gap: 14, height: "fit-content", position: "sticky", top: 84 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-mark" style={{ width: 32, height: 32, background: "linear-gradient(135deg, var(--purple), var(--primary))" }}>
                <Wand2 size={16} />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>AI Assistant</p>
            </div>
            {aiActions.map((action) => (
              <div key={action.label} style={{ position: "relative" }}>
                <button className="sidebar-item" onClick={() => setMenuOpen(menuOpen === action.label ? null : action.label)} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", height: "auto", flexDirection: "column", alignItems: "flex-start", gap: 2 }} type="button">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <action.icon size={14} color="var(--purple)" />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{action.label}</span>
                  </div>
                  <span className="muted" style={{ fontSize: 11 }}>{action.desc}</span>
                </button>
                {menuOpen === action.label && (
                  <div style={{ position: "absolute", left: 0, top: "100%", width: 180, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 10, overflow: "hidden", marginTop: 4 }}>
                    <button className="sidebar-item" onClick={() => handleAIAction(action.label)} style={{ borderRadius: 0, width: "100%" }} type="button">Run now</button>
                  </div>
                )}
              </div>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <button className="btn btn-outline" onClick={() => toast("Exporting PDF...", "info")} style={{ minHeight: 34, fontSize: 12, width: "100%" }} type="button">Export as PDF</button>
            <button className="btn btn-outline" onClick={() => setDeleteDialog(true)} style={{ minHeight: 34, fontSize: 12, width: "100%", color: "var(--danger)" }} type="button">Delete Document</button>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteDialog} title="Delete Document" description="This document will be permanently deleted." confirmLabel="Delete" danger onConfirm={handleDeleteDoc} onCancel={() => setDeleteDialog(null)} />
    </>
  );
}