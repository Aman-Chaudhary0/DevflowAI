"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code,
  Copy,
  Download,
  FileCode,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Upload,
  Wand2,
} from "lucide-react";
import { DiffViewer, MarkdownContent } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const sampleErrors = [
  { label: "TypeError: Cannot read properties of undefined", value: "TypeError: Cannot read properties of undefined (reading 'id')" },
  { label: "Promise rejection", value: "UnhandledPromiseRejectionWarning: Error: Connection timeout" },
  { label: "CORS Error", value: "Access to fetch at 'https://api.example.com' has been blocked by CORS policy" },
  { label: "Memory leak", value: "<--- Last few GCs ---> [12345:0x123456789] Memory leak detected" }
];

export default function AIBugFixerPage() {
  const [errorInput, setErrorInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [bugData, setBugData] = useState(null);
  const [activeTab, setActiveTab] = useState("root-cause");

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    if (!errorInput.trim() && !stackTrace.trim() && !consoleOutput.trim() && !codeInput.trim() && !uploadedFile) {
      toast("Please enter an error, code, or upload a file", "warning");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    try {
      const response = await api.ai.tools.fixBug({
        error: [errorInput, consoleOutput].filter(Boolean).join("\n\n") || "Analyze the supplied code/stack trace.",
        stackTrace,
        sourceCode: codeInput || (uploadedFile ? stackTrace : ""),
        instructions: "Analyze the supplied error with stated uncertainties."
      });
      const result = response.data?.result;
      setBugData({
        rootCause: `## ${result.summary || "Analysis"}\n\n${result.rootCause}\n\n${result.explanation || ""}`,
        originalCode: codeInput || (uploadedFile ? stackTrace : ""),
        fixedCode: result.correctedCode || "No corrected code can be determined from the supplied context.",
        suggestions: [...(result.suggestedChanges || []), ...(result.recommendations || [])].map((item) =>
          typeof item === "string"
            ? { title: "Suggested change", description: item, code: "" }
            : { title: item.title || "Suggested change", description: item.description || item.change || "", code: item.code || "" }
        ),
        resources: []
      });
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast("Bug analysis complete!", "success");
    } catch (error) { setIsAnalyzing(false); toast(error.message || "Bug analysis failed", "error"); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setStackTrace(ev.target.result);
        toast(`${file.name} loaded`, "success");
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard", "success");
  };

  const handleDownload = () => {
    const content = `# Bug Analysis Report\n\n${bugData.rootCause}\n\n## Fixed Code\n\n${bugData.fixedCode}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bug-analysis.md";
    a.click();
    URL.revokeObjectURL(url);
    toast("Report downloaded", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "Space Grotesk" }}>
            AI Bug Fixer
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Get instant help solving runtime and compile-time issues
          </p>
        </div>
        {analysisComplete && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDownload}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
              type="button"
            >
              <Download size={14} />
              Download Report
            </button>
            <button
              onClick={() => { setAnalysisComplete(false); setBugData(null); setErrorInput(""); setCodeInput(""); setStackTrace(""); setConsoleOutput(""); setUploadedFile(null); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "var(--primary)", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "white" }}
              type="button"
            >
              <RefreshCw size={14} />
              New Analysis
            </button>
          </div>
        )}
      </div>

      {!analysisComplete ? (
        <>
          {/* Row 1: Error + Stack/Console */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Error Message */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                Error Message
              </h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                  Common Errors
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sampleErrors.map((err, i) => (
                    <button
                      key={i}
                      onClick={() => setErrorInput(err.value)}
                      style={{ padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text)" }}
                      type="button"
                    >
                      {err.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={errorInput}
                onChange={(e) => setErrorInput(e.target.value)}
                placeholder="Paste your error message here..."
                rows={6}
                style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 13, fontFamily: "JetBrains Mono", resize: "vertical" }}
              />
            </div>

            {/* Stack Trace & Console */}
            <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Code size={18} color="var(--info)" />
                  Stack Trace
                </h3>
                <textarea
                  value={stackTrace}
                  onChange={(e) => setStackTrace(e.target.value)}
                  placeholder="Paste stack trace (optional)..."
                  rows={5}
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 12, fontFamily: "JetBrains Mono", resize: "vertical" }}
                />
              </div>
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Info size={18} color="var(--success)" />
                  Console Output
                </h3>
                <textarea
                  value={consoleOutput}
                  onChange={(e) => setConsoleOutput(e.target.value)}
                  placeholder="Paste console output (optional)..."
                  rows={3}
                  style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 12, fontFamily: "JetBrains Mono", resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          {/* Code Input */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <FileCode size={18} color="var(--primary)" />
              Source Code / Prompt
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>
              Paste the relevant code or describe the problem in detail. The AI will use this as the primary context for analysis.
            </p>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste your code here, or describe the problem in detail..."
              rows={8}
              spellCheck={false}
              style={{ width: "100%", padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--bg-soft)", color: "var(--text)", fontSize: 13, fontFamily: "JetBrains Mono", resize: "vertical" }}
            />
          </div>

          {/* File Upload */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 24, background: "var(--card)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>
              Optional: Upload Error Log File
            </h3>
            <div
              style={{ padding: 32, border: "2px dashed var(--border)", borderRadius: 12, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
              onClick={() => document.getElementById("errorFileInput").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setUploadedFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setStackTrace(ev.target.result);
                  reader.readAsText(file);
                }
              }}
            >
              <input id="errorFileInput" type="file" accept=".log,.txt,.json" style={{ display: "none" }} onChange={handleFileUpload} />
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "color-mix(in srgb, var(--primary) 15%, transparent)", display: "grid", placeItems: "center" }}>
                <Upload size={22} color="var(--primary)" />
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: uploadedFile ? "var(--primary)" : "var(--text)" }}>
                  {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Supports .log, .txt, .json files up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", background: isAnalyzing ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))", border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 700, cursor: isAnalyzing ? "not-allowed" : "pointer", minWidth: 200, justifyContent: "center" }}
              type="button"
            >
              {isAnalyzing ? (
                <><Loader2 size={18} className="spin" />Analyzing...</>
              ) : (
                <><Bug size={18} />Analyze Bug</>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, padding: "6px", background: "var(--surface)", borderRadius: 12, width: "fit-content" }}>
                {[
                  { id: "root-cause", label: "Root Cause", icon: Lightbulb },
                  { id: "fixed-code", label: "Fixed Code", icon: CheckCircle2 },
                  { id: "suggestions", label: "Suggestions", icon: Wand2 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: activeTab === tab.id ? "var(--card)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? "var(--primary)" : "var(--muted)" }}
                    type="button"
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 16, background: "var(--card)", padding: 24, minHeight: 400 }}>
                {activeTab === "root-cause" && (
                  <div className="article">
                    <MarkdownContent content={bugData.rootCause} />
                  </div>
                )}

                {activeTab === "fixed-code" && (
                  <div>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Code Comparison</h3>
                    <DiffViewer original={bugData.originalCode} fixed={bugData.fixedCode} language="javascript" />
                    <div style={{ marginTop: 16 }}>
                      <button
                        onClick={() => handleCopy(bugData.fixedCode)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text)" }}
                        type="button"
                      >
                        <Copy size={14} />
                        Copy Fixed Code
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "suggestions" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {bugData.suggestions.length === 0 && (
                      <p style={{ color: "var(--muted)", fontSize: 14 }}>No additional suggestions returned.</p>
                    )}
                    {bugData.suggestions.map((suggestion, i) => (
                      <div key={i} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Lightbulb size={16} color="var(--warning)" />
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{suggestion.title}</h4>
                        </div>
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)" }}>{suggestion.description}</p>
                        {suggestion.code && (
                          <div style={{ background: "#070b13", padding: 12, borderRadius: 8, overflow: "auto" }}>
                            <code style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#dbeafe" }}>
                              {suggestion.code}
                            </code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: 280 }}>
              <div style={{ padding: 20, border: "1px solid var(--border)", borderRadius: 16, background: "color-mix(in srgb, var(--success) 5%, transparent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Analysis Complete</h3>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                  Review the root cause, fixed code, and suggestions tabs. Download the report to save the analysis.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
