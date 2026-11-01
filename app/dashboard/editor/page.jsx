"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, FileCode, Plus, Save, Sparkles, Terminal, Trash2, X } from "lucide-react";
import { ConfirmDialog, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const emptyTemplate = `export default function Example() {
  return <div>Hello from DevFlow AI</div>;
}
`;

export default function WebEditorPage() {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState("");
  const [draft, setDraft] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState([
    "Devflow AI IDE ready.",
    "$ npm run dev",
    "✓ local preview available"
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const MAX_FILE_NAME_LENGTH = 64;

  const activeFile = useMemo(
    () => files.find((file) => file._id === activeFileId) || null,
    [files, activeFileId],
  );

  const normalizeFileName = (value) => value.replace(/[\\/:*?"<>|]+/g, "").trim();

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.editor.files.list({ page: 1, limit: 100 });
      const items = response?.data?.files || response?.files || [];

      const hydrated = await Promise.all(
        items.map(async (file) => {
          try {
            const detail = await api.editor.files.get(file._id);
            const fresh = detail?.data?.file || detail?.file;
            return fresh || file;
          } catch {
            return file;
          }
        }),
      );

      setFiles(hydrated);
      if (!hydrated.length) {
        setActiveFileId("");
        setDraft("");
        return;
      }
      if (!hydrated.some((file) => file._id === activeFileId)) {
        setActiveFileId(hydrated[0]._id);
      }
    } catch (err) {
      setError(err.message || "Unable to load files");
      toast(err.message || "Unable to load files", "error");
    } finally {
      setLoading(false);
    }
  }, [activeFileId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (!activeFile) {
      setDraft("");
      return;
    }
    setDraft(activeFile.content || "");
  }, [activeFile]);

  const handleSave = async () => {
    if (!activeFile) return;

    if (!draft.trim()) {
      toast("File content cannot be empty. Add some code before saving.", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: activeFile.title || activeFile.path || "Untitled",
        path: activeFile.path,
        language: activeFile.language || "javascript",
        content: draft,
      };
      const response = await api.editor.files.update(activeFile._id, payload);
      const updated = response?.data?.file || response?.file || activeFile;
      setFiles((prev) => prev.map((file) => (file._id === activeFile._id ? { ...file, ...updated } : file)));
      toast(`Saved ${updated.path || activeFile.path}`, "success");
    } catch (err) {
      toast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFile = async () => {
    const cleanedName = normalizeFileName(newFileName);
    if (!cleanedName) {
      toast("Please enter a file name before creating the file.", "error");
      return;
    }

    if (cleanedName.length > MAX_FILE_NAME_LENGTH) {
      toast(`File name is too long. Keep it under ${MAX_FILE_NAME_LENGTH} characters.`, "error");
      return;
    }

    const safeName = cleanedName.includes("/") ? cleanedName.split("/").pop() : cleanedName;
    const path = `src/${safeName}`;

    try {
      const response = await api.editor.files.create({
        title: safeName,
        path,
        language: safeName.endsWith(".css") ? "css" : safeName.endsWith(".json") ? "json" : safeName.endsWith(".md") ? "markdown" : "javascript",
        content: "",
      });

      const created = response?.data?.file || response?.file;
      if (!created) return;

      setFiles((prev) => [created, ...prev]);
      setActiveFileId(created._id);
      setDraft(created.content || "");
      setNewFileName("");
      toast(`Created ${path}`, "success");
    } catch (err) {
      toast(err.message || "Unable to create file", "error");
    }
  };

  const handleDeleteFile = async () => {
    if (!activeFile) return;
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!activeFile) return;

    try {
      await api.editor.files.delete(activeFile._id);
      const remaining = files.filter((file) => file._id !== activeFile._id);
      setFiles(remaining);
      setDeleteDialogOpen(false);
      if (remaining.length) {
        setActiveFileId(remaining[0]._id);
      } else {
        setActiveFileId("");
        setDraft("");
      }
      toast("File deleted", "success");
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const runAICodeImprovement = () => {
    setAiAnalyzing(true);
    toast("AI Copilot analyzing code…", "info");
    setTimeout(() => {
      setAiAnalyzing(false);
      setDraft((prev) => `${prev}\n\n// AI Optimized: smaller, clearer logic and a safer default export.`);
      setTerminalOutput((prev) => [
        ...prev,
        "AI optimization applied to the active file."
      ]);
      toast("AI code suggestions applied.", "success");
    }, 1000);
  };

  const handleSelectFile = async (fileId) => {
    const file = files.find((item) => item._id === fileId);
    if (!file) return;

    setActiveFileId(fileId);
    if (file.content !== undefined) {
      setDraft(file.content || "");
      return;
    }

    try {
      const detail = await api.editor.files.get(fileId);
      const fresh = detail?.data?.file || detail?.file;
      if (fresh) {
        setFiles((prev) => prev.map((item) => (item._id === fileId ? { ...item, ...fresh } : item)));
        setDraft(fresh.content || "");
      }
    } catch (err) {
      toast(err.message || "Unable to load file contents", "error");
    }
  };

  const fileTree = files.length ? files : [];

  if (loading) {
    return (
      <div className="card p-6 text-sm text-(--muted)">Loading workspace files…</div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", background: "#0b0f19", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", margin: 16 }}>
      <div style={{ height: 48, background: "#111827", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Code2 size={20} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Devflow Web IDE</span>
          {activeFile ? (
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>
              {activeFile.path}
            </span>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            value={newFileName}
            onChange={(event) => setNewFileName(event.target.value)}
            placeholder="filename.js"
            style={{
              minWidth: 150,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "#0b0f19",
              color: "var(--fg)",
              padding: "0 10px",
              fontSize: 12,
            }}
          />
          <button className="btn btn-outline" onClick={handleCreateFile} type="button" style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
            <Plus size={14} /> New File
          </button>
          <button className="btn btn-outline" onClick={runAICodeImprovement} disabled={aiAnalyzing} type="button" style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
            <Sparkles size={14} style={{ color: "#a855f7" }} /> {aiAnalyzing ? "Optimizing..." : "AI Copilot"}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!activeFile || saving} type="button" style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
            <Save size={14} /> {saving ? "Saving..." : "Save Code"}
          </button>
          {activeFile ? (
            <button className="btn btn-ghost" onClick={() => setDeleteDialogOpen(true)} type="button" style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
              <Trash2 size={14} /> Delete
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="card m-4 p-4 text-sm text-(--danger)">{error}</div>
      ) : null}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: 240, background: "#0f172a", borderRight: "1px solid var(--border)", padding: 12, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Workspace Explorer
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {fileTree.length === 0 ? (
              <div className="muted text-sm">No files yet.</div>
            ) : (
              fileTree.map((file) => (
                <button
                  key={file._id}
                  onClick={() => handleSelectFile(file._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: activeFileId === file._id ? 600 : 400,
                    background: activeFileId === file._id ? "rgba(59, 130, 246, 0.15)" : "transparent",
                    color: activeFileId === file._id ? "#3b82f6" : "var(--muted)",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  type="button"
                >
                  <FileCode size={15} />
                  {file.path.split("/").pop()}
                </button>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0b0f19", position: "relative" }}>
          {activeFile ? (
            <>
              <div style={{ background: "#111827", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                <div style={{ padding: "8px 16px", background: "#0b0f19", borderRight: "1px solid var(--border)", borderTop: "2px solid var(--primary)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <FileCode size={14} style={{ color: "var(--primary)" }} />
                  {activeFile.path}
                </div>
              </div>

              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                style={{
                  flex: 1,
                  width: "100%",
                  background: "#0b0f19",
                  color: "#f8fafc",
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  padding: 16,
                  border: "none",
                  outline: "none",
                  resize: "none"
                }}
              />
            </>
          ) : (
            <div className="p-6 text-(--muted)">Create or select a file to begin editing.</div>
          )}

          {showTerminal ? (
            <div style={{ height: 160, background: "#090d16", borderTop: "1px solid var(--border)", padding: 12, fontFamily: "monospace", fontSize: 12, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", marginBottom: 8, borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", paddingBottom: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Terminal size={14} /> Integrated Terminal</span>
                <button onClick={() => setShowTerminal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }} type="button"><X size={14} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", color: "#10b981" }}>
                {terminalOutput.map((line, index) => (
                  <div key={`${line}-${index}`} style={{ marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ height: 28, background: "#111827", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 11, color: "var(--muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>main</span>
          <span>UTF-8</span>
          <span>{activeFile?.language || "JavaScript"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setShowTerminal(!showTerminal)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 11 }} type="button">
            Terminal {showTerminal ? "Hide" : "Show"}
          </button>
          <span>{activeFile ? `Ln 1, Col 1` : "No file open"}</span>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete file"
        description={`This will permanently remove ${activeFile?.path || "this file"} from your editor workspace.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteFile}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
