"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2, FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Save,
  Play, Sparkles, Terminal, Copy, Download, RefreshCw, GitBranch, Settings, Check, X
} from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";

const initialFiles = {
  "app/page.jsx": `import { PageHero } from "@/components/ui-blocks";

export default function HomePage() {
  return (
    <main className="container mx-auto py-12">
      <PageHero 
        title="Devflow AI Workspace"
        description="The Next-Gen AI workspace for software engineering teams."
      />
    </main>
  );
}`,
  "components/auth.jsx": `"use client";

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  
  return (
    <form className="auth-card">
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Sign In</button>
    </form>
  );
}`,
  "lib/api.js": `export async function fetchProjects() {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}`
};

// WebEditorPage is a page component that renders a web-based code editor interface for the Devflow AI workspace. It provides a file explorer, code editing area, and an integrated terminal, allowing users to manage files, edit code, and run commands within the workspace. The page also includes features like AI-assisted code optimization and saving changes to files. 
export default function WebEditorPage() {
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState("app/page.jsx");
  const [codeContent, setCodeContent] = useState(initialFiles["app/page.jsx"]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState([
    "Devflow AI IDE v2.4.0 ready.",
    "$ pnpm dev --turbo",
    "▲ Next.js 15.1.0 - Local: http://localhost:3000",
    "✓ Ready in 1.4s"
  ]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const handleFileChange = (fileName) => {
    // Save current file edits
    setFiles(prev => ({ ...prev, [activeFile]: codeContent }));
    setActiveFile(fileName);
    setCodeContent(files[fileName] || "");
  };

  const handleSave = () => {
    setFiles(prev => ({ ...prev, [activeFile]: codeContent }));
    toast(`Saved ${activeFile}`, "success");
  };

  const runAICodeImprovement = () => {
    setAiAnalyzing(true);
    toast("AI Copilot analyzing code...", "info");
    setTimeout(() => {
      setAiAnalyzing(false);
      setCodeContent(prev => `// AI Optimized: Added error boundary & strict typing\n` + prev);
      toast("AI code suggestions applied!", "success");
    }, 1200);
  };

  return (
    <div style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column", background: "#0b0f19", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", margin: 16 }}>
      {/* IDE Header Bar */}
      <div style={{ height: 48, background: "#111827", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Code2 size={20} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fg)" }}>Devflow Web IDE</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>
            {activeFile}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-outline" onClick={runAICodeImprovement} disabled={aiAnalyzing} style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
            <Sparkles size={14} style={{ color: "#a855f7" }} /> {aiAnalyzing ? "Optimizing..." : "AI Copilot"}
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ minHeight: 32, fontSize: 12, gap: 6 }}>
            <Save size={14} /> Save Code
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left File Tree Sidebar */}
        <div style={{ width: 240, background: "#0f172a", borderRight: "1px solid var(--border)", padding: 12, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Workspace Explorer
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Object.keys(files).map(fileName => (
              <button
                key={fileName}
                onClick={() => handleFileChange(fileName)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: activeFile === fileName ? 600 : 400,
                  background: activeFile === fileName ? "rgba(59, 130, 246, 0.15)" : "transparent",
                  color: activeFile === fileName ? "#3b82f6" : "var(--muted)",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <FileCode size={15} />
                {fileName}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0b0f19", position: "relative" }}>
          {/* Active File Tab */}
          <div style={{ background: "#111827", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
            <div style={{ padding: "8px 16px", background: "#0b0f19", borderRight: "1px solid var(--border)", borderTop: "2px solid var(--primary)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <FileCode size={14} style={{ color: "var(--primary)" }} />
              {activeFile}
            </div>
          </div>

          {/* Textarea Code Input */}
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
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

          {/* Bottom Terminal Console */}
          {showTerminal && (
            <div style={{ height: 160, background: "#090d16", borderTop: "1px solid var(--border)", padding: 12, fontFamily: "monospace", fontSize: 12, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", marginBottom: 8, borderBottom: "1px solid color-mix(in srgb, var(--border) 40%, transparent)", paddingBottom: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Terminal size={14} /> Integrated Terminal</span>
                <button onClick={() => setShowTerminal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><X size={14} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", color: "#10b981" }}>
                {terminalOutput.map((line, idx) => (
                  <div key={idx} style={{ marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div style={{ height: 28, background: "#111827", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 11, color: "var(--muted)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GitBranch size={12} /> main</span>
          <span>UTF-8</span>
          <span>JavaScript / React</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setShowTerminal(!showTerminal)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 11 }}>
            Terminal {showTerminal ? "Hide" : "Show"}
          </button>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </div>
  );
}
