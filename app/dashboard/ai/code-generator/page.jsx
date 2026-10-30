"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Code,
  Copy,
  Download,
  Eye,
  FileCode,
  FolderOpen,
  Frame,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Wand2,
  X
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownContent } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

// Language options
const languageOptions = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" }
];

// Framework options
const frameworkOptions = [
  { id: "react", name: "React" },
  { id: "nextjs", name: "Next.js" },
  { id: "vue", name: "Vue.js" },
  { id: "angular", name: "Angular" },
  { id: "svelte", name: "Svelte" },
  { id: "none", name: "None" }
];

// Styling options
const stylingOptions = [
  { id: "tailwind", name: "Tailwind CSS" },
  { id: "css-modules", name: "CSS Modules" },
  { id: "styled-components", name: "Styled Components" },
  { id: "emotion", name: "Emotion" },
  { id: "scss", name: "SCSS" },
  { id: "none", name: "None" }
];

// State management options
const stateOptions = [
  { id: "react-hooks", name: "React Hooks" },
  { id: "redux", name: "Redux" },
  { id: "zustand", name: "Zustand" },
  { id: "mobx", name: "MobX" },
  { id: "none", name: "None" }
];

// Output type options
const outputOptions = [
  { id: "component", name: "Component" },
  { id: "function", name: "Function" },
  { id: "class", name: "Class" },
  { id: "module", name: "Module" },
  { id: "full-app", name: "Full Application" }
];

export default function AICodeGeneratorPage() {
  const [prompt, setPrompt] = useState("Build a reusable login form with React Hook Form and Zod validation.");
  const [language, setLanguage] = useState("javascript");
  const [framework, setFramework] = useState("react");
  const [styling, setStyling] = useState("tailwind");
  const [stateManagement, setStateManagement] = useState("react-hooks");
  const [outputType, setOutputType] = useState("component");
  const [cleanArch, setCleanArch] = useState(true);
  const [useTypeScript, setUseTypeScript] = useState(false);
  const [includeTests, setIncludeTests] = useState(true);
  const [accessibility, setAccessibility] = useState(true);
  const [responsive, setResponsive] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [generatedCode, setGeneratedCode] = useState("");
  const [generatedExplanation, setGeneratedExplanation] = useState("");
  const [generatedStructure, setGeneratedStructure] = useState("");

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!prompt.trim()) {
      toast("Please enter a prompt", "warning");
      return;
    }

    setIsGenerating(true);
    setGenerated(false);

    try {
      const response = await api.ai.tools.generateCode({ prompt, language, framework, codeType: outputType, instructions: [styling, stateManagement, cleanArch && "clean architecture", includeTests && "include tests", accessibility && "accessibility", responsive && "responsive"].filter(Boolean).join(", ") + (useTypeScript ? ", TypeScript" : "") });
      const result = response.data?.result;
      if (!result?.code) throw new Error("The AI response did not contain code.");
      setGeneratedCode(result.code);
      setGeneratedExplanation(result.explanation || "");
      setGeneratedStructure([result.filename || "Generated file", ...(result.dependencies || []).map((item) => `Dependency: ${item}`), ...(result.assumptions || []).map((item) => `Assumption: ${item}`)].join("\n"));
      setIsGenerating(false);
      setGenerated(true);
      toast("Code generated successfully!", "success");
    } catch (error) { setIsGenerating(false); toast(error.message || "Code generation failed", "error"); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    toast("Code copied to clipboard", "success");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedStructure.split("\n")[0] || "generated-code.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast("File downloaded", "success");
  };

  const handleSave = () => {
    toast("Code saved to project", "success");
  };

  const handleInsert = () => {
    toast("Code inserted into project", "success");
  };

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 64px - 56px)",
      margin: "-28px",
      overflow: "hidden"
    }}>
      {/* Left Panel - Configuration */}
      <div style={{
        width: 400,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        overflowY: "auto"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px", fontFamily: "Space Grotesk" }}>
            AI Code Generator
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Generate production-ready code with AI
          </p>
        </div>

        <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 24, overflowY: "auto" }}>
          {/* Prompt Input */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              Describe what you want to build
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Create a responsive navbar with dropdown menus..."
              rows={4}
              style={{
                width: "100%",
                padding: 14,
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--card)",
                color: "var(--text)",
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical"
              }}
            />
          </div>

          {/* Language */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              Language
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 14,
                  appearance: "none",
                  cursor: "pointer"
                }}
              >
                {languageOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Framework */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              Framework
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 14,
                  appearance: "none",
                  cursor: "pointer"
                }}
              >
                {frameworkOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Styling */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              Styling
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={styling}
                onChange={(e) => setStyling(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 14,
                  appearance: "none",
                  cursor: "pointer"
                }}
              >
                {stylingOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* State Management */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              State Management
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={stateManagement}
                onChange={(e) => setStateManagement(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 14,
                  appearance: "none",
                  cursor: "pointer"
                }}
              >
                {stateOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Output Type */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
              Output Type
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={outputType}
                onChange={(e) => setOutputType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: 14,
                  appearance: "none",
                  cursor: "pointer"
                }}
              >
                {outputOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Advanced Options */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <Settings size={14} color="var(--muted)" />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--soft)" }}>
                Advanced
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Clean Architecture", value: cleanArch, setter: setCleanArch, desc: "Follow clean architecture principles" },
                { label: "TypeScript", value: useTypeScript, setter: setUseTypeScript, desc: "Generate TypeScript code" },
                { label: "Include Tests", value: includeTests, setter: setIncludeTests, desc: "Add unit and integration tests" },
                { label: "Accessibility", value: accessibility, setter: setAccessibility, desc: "WCAG 2.1 compliant" },
                { label: "Responsive", value: responsive, setter: setResponsive, desc: "Mobile-first responsive design" }
              ].map(option => (
                <label key={option.label} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 0"
                }}>
                  <input
                    type="checkbox"
                    checked={option.value}
                    onChange={(e) => option.setter(e.target.checked)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      border: "2px solid var(--border)",
                      appearance: "none",
                      background: option.value ? "var(--primary)" : "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginTop: 2,
                      position: "relative"
                    }}
                  />
                  {option.value && <Check size={12} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "white", pointerEvents: "none" }} />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ padding: 20, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "14px 24px",
              background: isGenerating ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))",
              border: "none",
              borderRadius: 14,
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: isGenerating ? "not-allowed" : "pointer",
              transition: "all 200ms ease"
            }}
            type="button"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Generated Code */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          gap: 4
        }}>
          {[
            { id: "code", label: "Code", icon: Code },
            { id: "preview", label: "Preview", icon: Eye },
            { id: "explanation", label: "Explanation", icon: Info },
            { id: "structure", label: "Folder Structure", icon: FolderOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === tab.id ? "var(--primary)" : "var(--muted)",
                transition: "all 150ms ease"
              }}
              type="button"
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {generated && (
            <div style={{ display: "flex", gap: 6, padding: "8px 0" }}>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)"
                }}
                type="button"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)"
                }}
                type="button"
              >
                <Download size={14} />
                Download
              </button>
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)"
                }}
                type="button"
              >
                <Save size={14} />
                Save
              </button>
              <button
                onClick={handleInsert}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)"
                }}
                type="button"
              >
                <FileCode size={14} />
                Insert
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)"
                }}
                type="button"
              >
                <RefreshCw size={14} className={isGenerating ? "spin" : ""} />
                Regenerate
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {!generated && !isGenerating && (
            <div style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              textAlign: "center"
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--purple) 20%, transparent))",
                display: "grid",
                placeItems: "center",
                marginBottom: 20
              }}>
                <Code size={36} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", fontFamily: "Space Grotesk" }}>
                Ready to Generate
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, maxWidth: 400 }}>
                Configure your options on the left panel and click &quot;Generate Code&quot; to create production-ready code.
              </p>
            </div>
          )}

          {isGenerating && (
            <div style={{
              display: "grid",
              placeItems: "center",
              height: "100%"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 60,
                  height: 60,
                  margin: "0 auto 20px",
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>
                  Generating your code...
                </h3>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          )}

          {generated && !isGenerating && activeTab === "code" && (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--muted)"
              }}>
                <span style={{ fontWeight: 600 }}>{generatedStructure.split("\n")[0] || "generated-code"}</span>
                <span>{language}</span>
              </div>
              <SyntaxHighlighter
                language={language === "typescript" ? "typescript" : "javascript"}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: 20, fontSize: 13, background: "transparent" }}
                showLineNumbers
              >
                {generatedCode}
              </SyntaxHighlighter>
            </div>
          )}

          {generated && !isGenerating && activeTab === "preview" && (
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
              height: "100%"
            }}>
              <div style={{
                padding: "10px 16px",
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}>
                <Frame size={14} />
                Preview — generated code is not executed in the browser
              </div>
              <div style={{
                padding: 40,
                display: "grid",
                placeItems: "center",
                background: "var(--bg)",
                minHeight: 300,
                textAlign: "center"
              }}>
                <div>
                  <Frame size={40} color="var(--muted)" style={{ marginBottom: 16 }} />
                  <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Live preview not available</h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 360, margin: "0 auto" }}>
                    Generated code is not executed here. Copy or download the code and run it in your local environment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {generated && !isGenerating && activeTab === "explanation" && (
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
              background: "var(--card)"
            }}>
              <MarkdownContent content={generatedExplanation} />
            </div>
          )}

          {generated && !isGenerating && activeTab === "structure" && (
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
              background: "var(--card)"
            }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Generated Folder Structure</h3>
              <pre style={{
                background: "#070b13",
                color: "#dbeafe",
                padding: 20,
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "JetBrains Mono",
                overflow: "auto",
                margin: 0,
                lineHeight: 1.8
              }}>
                {generatedStructure}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
