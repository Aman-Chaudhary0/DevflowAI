"use client";

import { useState } from "react";
import {
  Book,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Github,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Upload,
  CheckSquare,
  Square,
} from "lucide-react";
import { MarkdownContent } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const docSections = [
  { id: "readme",           title: "README",                icon: Book,      desc: "Project overview" },
  { id: "installation",     title: "Installation",          icon: FolderOpen, desc: "Setup guide" },
  { id: "architecture",     title: "Architecture",          icon: FileText,  desc: "System design" },
  { id: "api",              title: "API Endpoints",         icon: FileText,  desc: "API documentation" },
  { id: "deployment",       title: "Deployment",            icon: FileText,  desc: "Deploy guide" },
  { id: "environment",      title: "Environment Variables", icon: FileText,  desc: "Config guide" },
  { id: "folder-structure", title: "Folder Structure",      icon: FolderOpen, desc: "Project layout" },
  { id: "contributors",     title: "Contributors",          icon: FileText,  desc: "Team info" },
];

const DEFAULT_SELECTED = new Set(["readme", "installation", "architecture", "api", "deployment", "environment", "folder-structure"]);

export default function AIDocsGeneratorPage() {
  const [uploadMethod, setUploadMethod] = useState("description"); // description, github, code
  const [projectDescription, setProjectDescription] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedSections, setSelectedSections] = useState(new Set(DEFAULT_SELECTED));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [generated, setGenerated] = useState(false);
  const [activeSection, setActiveSection] = useState("readme");
  const [docs, setDocs] = useState({ content: {} });
  const [editorContent, setEditorContent] = useState("");

  const toggleSection = (id) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const buildPrompt = (sectionId) => {
    const parts = [];
    if (projectDescription.trim()) parts.push(`Project description: ${projectDescription.trim()}.`);
    if (codeInput.trim()) parts.push(`Source code / context:\n\`\`\`\n${codeInput.trim()}\n\`\`\``);
    if (uploadMethod === "github" && githubUrl.trim()) parts.push(`GitHub URL (for reference only, contents not fetched): ${githubUrl.trim()}.`);
    parts.push(`Generate ${sectionId} documentation. State assumptions clearly and provide a useful, complete template.`);
    return parts.join("\n\n");
  };

  const generateSection = async (sectionId) => {
    const response = await api.ai.tools.documentation({
      prompt: buildPrompt(sectionId),
      documentationType: sectionId,
    });
    const markdown = response.data?.result?.markdown;
    if (!markdown) throw new Error(`No documentation returned for ${sectionId}.`);
    return markdown;
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (selectedSections.size === 0) {
      toast("Select at least one documentation section", "warning");
      return;
    }
    setIsGenerating(true);
    setGenerated(false);
    setDocs({ content: {} });

    const sectionsToGenerate = docSections.filter(s => selectedSections.has(s.id));
    const newContent = {};
    let firstSection = null;

    for (const section of sectionsToGenerate) {
      setGeneratingSection(section.id);
      try {
        const markdown = await generateSection(section.id);
        newContent[section.id] = markdown;
        if (!firstSection) firstSection = section.id;
      } catch (err) {
        toast(`Failed to generate ${section.title}: ${err.message}`, "error");
      }
    }

    setDocs({ content: newContent });
    setGeneratingSection(null);
    setIsGenerating(false);

    if (Object.keys(newContent).length > 0) {
      const startSection = firstSection || sectionsToGenerate[0].id;
      setActiveSection(startSection);
      setEditorContent(newContent[startSection] || "");
      setGenerated(true);
      toast("Documentation generated!", "success");
    }
  };

  const handleRegenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratingSection(activeSection);
    try {
      const markdown = await generateSection(activeSection);
      const newContent = { ...docs.content, [activeSection]: markdown };
      setDocs({ content: newContent });
      setEditorContent(markdown);
      toast(`${activeSection} regenerated`, "success");
    } catch (err) {
      toast(err.message || "Regeneration failed", "error");
    }
    setGeneratingSection(null);
    setIsGenerating(false);
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    setEditorContent(docs.content[sectionId] || "");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorContent);
    toast("Copied to clipboard", "success");
  };

  const handleDownload = () => {
    const blob = new Blob([editorContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSection}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded", "success");
  };

  const handleExport = () => {
    const allContent = Object.values(docs.content).join("\n\n---\n\n");
    const blob = new Blob([allContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "documentation.md";
    a.click();
    URL.revokeObjectURL(url);
    toast("All documentation exported", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "Space Grotesk" }}>
            AI Documentation Generator
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Automatically generate comprehensive project documentation
          </p>
        </div>
        {generated && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExport}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
              type="button"
            >
              <Download size={14} />
              Export All
            </button>
            <button
              onClick={() => { setGenerated(false); setEditorContent(""); setDocs({ content: {} }); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--primary)", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "white" }}
              type="button"
            >
              <RefreshCw size={14} />
              New Generation
            </button>
          </div>
        )}
      </div>

      {!generated ? (
        <>
          {/* Input Method Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "6px", background: "var(--surface)", borderRadius: 12, width: "fit-content" }}>
            {[
              { id: "description", label: "Description", icon: FileText },
              { id: "code",        label: "Paste Code",  icon: FolderOpen },
              { id: "github",      label: "GitHub URL",  icon: Github },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setUploadMethod(method.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: uploadMethod === method.id ? "var(--card)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: uploadMethod === method.id ? "var(--primary)" : "var(--muted)", transition: "all 150ms ease" }}
                type="button"
              >
                <method.icon size={14} />
                {method.label}
              </button>
            ))}
          </div>

          {/* Context Input */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 24, background: "var(--card)" }}>
            {/* Project description — always shown */}
            <div style={{ marginBottom: uploadMethod === "description" ? 0 : 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Project description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project, tech stack, purpose, and any relevant context..."
                rows={4}
                style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
              />
            </div>

            {uploadMethod === "code" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Source code (paste relevant files or snippets)
                </label>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px" }}>
                  The AI will use this code as context to generate more accurate documentation.
                </p>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={"// Paste your source code here...\n// You can include multiple files separated by comments"}
                  rows={12}
                  spellCheck={false}
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 13, fontFamily: "JetBrains Mono, monospace", resize: "vertical" }}
                />
              </div>
            )}

            {uploadMethod === "github" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  GitHub repository URL
                </label>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 10px" }}>
                  Repository contents are not fetched — the URL is included as context only.
                </p>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--bg-soft)", color: "var(--text)", fontSize: 14 }}
                />
              </div>
            )}
          </div>

          {/* Documentation Sections */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 24, background: "var(--card)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Select Sections to Generate</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelectedSections(new Set(docSections.map(s => s.id)))}
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
                  type="button"
                >
                  Select all
                </button>
                <button
                  onClick={() => setSelectedSections(new Set())}
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {docSections.map(section => {
                const checked = selectedSections.has(section.id);
                return (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      border: `1px solid ${checked ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      background: checked ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface)",
                      textAlign: "left",
                      transition: "all 150ms ease",
                    }}
                  >
                    {checked
                      ? <CheckSquare size={16} color="var(--primary)" />
                      : <Square size={16} color="var(--muted)" />
                    }
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--primary)" : "var(--text)" }}>{section.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{section.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSections.size > 0 && (
              <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--muted)" }}>
                {selectedSections.size} section{selectedSections.size > 1 ? "s" : ""} selected — each will be generated as a separate AI call.
              </p>
            )}
          </div>

          {/* Generate Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || selectedSections.size === 0}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", background: (isGenerating || selectedSections.size === 0) ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))", border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 700, cursor: (isGenerating || selectedSections.size === 0) ? "not-allowed" : "pointer", minWidth: 220, justifyContent: "center" }}
              type="button"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="spin" />
                  {generatingSection ? `Generating ${generatingSection}...` : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate {selectedSections.size > 0 ? `${selectedSections.size} Section${selectedSections.size > 1 ? "s" : ""}` : "Documentation"}
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Documentation Editor Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", gap: 20, height: "calc(100vh - 300px)", minHeight: 500 }}>
            {/* Left - Outline */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", overflow: "auto" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Outline
                </h3>
              </div>
              <div style={{ padding: 8 }}>
                {docSections.filter(s => selectedSections.has(s.id)).map(section => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: activeSection === section.id ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                    type="button"
                  >
                    {activeSection === section.id
                      ? <ChevronDown size={14} color="var(--primary)" />
                      : <ChevronRight size={14} color="var(--muted)" />
                    }
                    <section.icon size={14} color={activeSection === section.id ? "var(--primary)" : "var(--muted)"} />
                    <span style={{ fontSize: 13, fontWeight: activeSection === section.id ? 600 : 500, color: activeSection === section.id ? "var(--primary)" : docs.content[section.id] ? "var(--text)" : "var(--muted)" }}>
                      {section.title}
                    </span>
                    {generatingSection === section.id && (
                      <Loader2 size={12} className="spin" color="var(--primary)" style={{ marginLeft: "auto" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Center - Editor */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, cursor: isGenerating ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, color: "var(--text)" }}
                    type="button"
                  >
                    {isGenerating && generatingSection === activeSection
                      ? <Loader2 size={12} className="spin" />
                      : <RefreshCw size={12} />
                    }
                    Regenerate
                  </button>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text)" }} type="button">
                    <Copy size={12} />
                  </button>
                  <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text)" }} type="button">
                    <Download size={12} />
                  </button>
                  <button onClick={() => toast("Saved to project", "success")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text)" }} type="button">
                    <Save size={12} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  style={{ width: "100%", height: "100%", border: "none", outline: "none", background: "transparent", color: "var(--text)", fontSize: 14, lineHeight: 1.7, fontFamily: "inherit", resize: "none" }}
                />
              </div>
            </div>

            {/* Right - Preview */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Preview
                </h3>
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
                <div className="article">
                  <MarkdownContent content={editorContent} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
