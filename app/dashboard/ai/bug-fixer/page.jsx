"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  Code,
  Copy,
  Download,
  FileCode,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  Wand2,
  XCircle
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { DiffViewer, MarkdownContent } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";

// Mock bug fix data
const mockBugFixData = {
  rootCause: `## Root Cause Analysis

The error occurs because of a **race condition** in the authentication flow. When multiple requests are made simultaneously, the JWT token validation happens before the user session is fully initialized in Redis.

### Technical Details

1. **Timing Issue**: The \`setUser\` function in the frontend is called asynchronously, but the subsequent API call doesn't wait for it to complete.

2. **Missing Await**: The \`fetchUserProfile()\` function is not awaited before making the authenticated request.

3. **Session Gap**: There's a window between token generation and session storage where the token exists but the session data isn't available.

### Stack Trace Analysis

\`\`\`
Error: Cannot read properties of undefined (reading 'id')
    at authMiddleware (src/middleware/auth.js:24:32)
    at processTicksAndRejections (internal/process/task_queues:95:5)
    at async userController (src/controllers/user.controller.js:15:5)
\`\`\`

The error originates from line 24 in \`auth.js\` where it tries to access \`req.user.id\` before the user object is populated.`,
  fixedCode: `// Before (Bug)
const handleLogin = async (req, res) => {
  const user = await authenticateUser(req.body);
  const token = generateToken(user);
  
  // Bug: Not waiting for session to be set
  res.setHeader('Authorization', \`Bearer \${token}\`);
  fetchUserProfile(); // Fire and forget!
  
  res.json({ token });
};

// After (Fixed)
const handleLogin = async (req, res) => {
  const user = await authenticateUser(req.body);
  const token = generateToken(user);
  
  // Fix: Wait for session initialization
  await initializeUserSession(user.id, token);
  
  res.setHeader('Authorization', \`Bearer \${token}\`);
  await fetchUserProfile(); // Now properly awaited
  
  res.json({ token });
};`,
  originalCode: `const handleLogin = async (req, res) => {
  const user = await authenticateUser(req.body);
  const token = generateToken(user);
  
  res.setHeader('Authorization', \`Bearer \${token}\`);
  fetchUserProfile();
  
  res.json({ token });
};`,
  suggestions: [
    {
      title: "Add Explicit Await",
      description: "Always await async operations that affect subsequent code execution.",
      code: "await initializeUserSession(user.id, token);"
    },
    {
      title: "Use Async/Await Consistently",
      description: "Mixing callbacks and promises can lead to timing issues. Stick to one pattern.",
      code: "const result = await asyncOperation(); // Instead of .then()"
    },
    {
      title: "Add Error Boundaries",
      description: "Wrap critical sections in try-catch to handle edge cases gracefully.",
      code: "try { await operation(); } catch (error) { handleGracefully(error); }"
    }
  ],
  resources: [
    { title: "Understanding JavaScript Async/Await", url: "#", type: "Guide" },
    { title: "Race Conditions in Node.js", url: "#", type: "Article" },
    { title: "Best Practices for Error Handling", url: "#", type: "Documentation" }
  ],
  confidence: 96
};

const sampleErrors = [
  { label: "TypeError: Cannot read properties of undefined", value: "TypeError: Cannot read properties of undefined (reading 'id')" },
  { label: "Promise rejection", value: "UnhandledPromiseRejectionWarning: Error: Connection timeout" },
  { label: "CORS Error", value: "Access to fetch at 'https://api.example.com' has been blocked by CORS policy" },
  { label: "Memory leak", value: "<--- Last few GCs ---> [12345:0x123456789] Memory leak detected" }
];

export default function AIBugFixerPage() {
  const [errorInput, setErrorInput] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [bugData, setBugData] = useState(null);
  const [activeTab, setActiveTab] = useState("root-cause");

  const handleAnalyze = () => {
    if (!errorInput.trim() && !stackTrace.trim() && !consoleOutput.trim() && !uploadedFile) {
      toast("Please enter an error or upload a file", "warning");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate AI analysis
    setTimeout(() => {
      setBugData(mockBugFixData);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      toast("Bug analysis complete!", "success");
    }, 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setStackTrace(e.target.result);
        toast("File uploaded successfully", "success");
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text)"
              }}
              type="button"
            >
              <Download size={14} />
              Download Report
            </button>
            <button
              onClick={() => { setAnalysisComplete(false); setBugData(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                background: "var(--primary)",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: "white"
              }}
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
          {/* Input Section */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20
          }}>
            {/* Error Input */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
              padding: 20
            }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                Error Message
              </h3>

              {/* Quick Select */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                  Common Errors
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sampleErrors.map((err, i) => (
                    <button
                      key={i}
                      onClick={() => setErrorInput(err.value)}
                      style={{
                        padding: "6px 12px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 12,
                        color: "var(--text)",
                        transition: "all 150ms ease"
                      }}
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
                style={{
                  width: "100%",
                  padding: 14,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--bg-soft)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontFamily: "JetBrains Mono",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Stack Trace & Console Output */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
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
                  style={{
                    width: "100%",
                    padding: 14,
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    background: "var(--bg-soft)",
                    color: "var(--text)",
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                    resize: "vertical"
                  }}
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
                  style={{
                    width: "100%",
                    padding: 14,
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    background: "var(--bg-soft)",
                    color: "var(--text)",
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                    resize: "vertical"
                  }}
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            background: "var(--card)"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>
              Optional: Upload Error Log File
            </h3>
            <div
              style={{
                padding: 32,
                border: "2px dashed var(--border)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                transition: "all 200ms ease"
              }}
              onClick={() => document.getElementById("errorFileInput").click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setUploadedFile(file);
                  const reader = new FileReader();
                  reader.onload = (e) => setStackTrace(e.target.result);
                  reader.readAsText(file);
                }
              }}
            >
              <input
                id="errorFileInput"
                type="file"
                accept=".log,.txt,.json"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                display: "grid",
                placeItems: "center"
              }}>
                <Upload size={22} color="var(--primary)" />
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600 }}>
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                background: isAnalyzing ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))",
                border: "none",
                borderRadius: 14,
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                transition: "all 200ms ease",
                minWidth: 200,
                justifyContent: "center"
              }}
              type="button"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bug size={18} />
                  Analyze Bug
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <div style={{ display: "flex", gap: 24 }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Confidence Score */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 20,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--card)"
              }}>
                <div style={{ position: "relative" }}>
                  <svg width={64} height={64}>
                    <circle
                      cx={32}
                      cy={32}
                      r={27}
                      fill="none"
                      stroke="color-mix(in srgb, var(--border) 70%, transparent)"
                      strokeWidth={6}
                    />
                    <circle
                      cx={32}
                      cy={32}
                      r={27}
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth={6}
                      strokeDasharray={169.6}
                      strokeDashoffset={169.6 - (bugData.confidence / 100) * 169.6}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{bugData.confidence}%</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>Confidence Score</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                    AI confidence in this analysis
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                display: "flex",
                gap: 4,
                padding: "6px",
                background: "var(--surface)",
                borderRadius: 12,
                width: "fit-content"
              }}>
                {[
                  { id: "root-cause", label: "Root Cause", icon: Lightbulb },
                  { id: "fixed-code", label: "Fixed Code", icon: CheckCircle2 },
                  { id: "suggestions", label: "Suggestions", icon: Wand2 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 16px",
                      background: activeTab === tab.id ? "var(--card)" : "transparent",
                      border: "none",
                      borderRadius: 10,
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
              </div>

              {/* Tab Content */}
              <div style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--card)",
                padding: 24,
                minHeight: 400
              }}>
                {activeTab === "root-cause" && (
                  <div className="article">
                    <MarkdownContent content={bugData.rootCause} />
                  </div>
                )}

                {activeTab === "fixed-code" && (
                  <div>
                    <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Code Comparison</h3>
                    <DiffViewer
                      original={bugData.originalCode}
                      fixed={bugData.fixedCode}
                      language="javascript"
                    />
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleCopy(bugData.fixedCode)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)"
                        }}
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
                    {bugData.suggestions.map((suggestion, i) => (
                      <div key={i} style={{
                        padding: 16,
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        background: "var(--card)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Lightbulb size={16} color="var(--warning)" />
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{suggestion.title}</h4>
                        </div>
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)" }}>{suggestion.description}</p>
                        <div style={{
                          background: "#070b13",
                          padding: 12,
                          borderRadius: 8,
                          overflow: "auto"
                        }}>
                          <code style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: "#dbeafe" }}>
                            {suggestion.code}
                          </code>
                        </div>
                      </div>
                    ))}

                    {/* Learning Resources */}
                    <div style={{ marginTop: 8 }}>
                      <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Related Resources</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {bugData.resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: 12,
                              border: "1px solid var(--border)",
                              borderRadius: 10,
                              color: "var(--text)",
                              textDecoration: "none",
                              transition: "all 150ms ease"
                            }}
                          >
                            <FileCode size={16} color="var(--primary)" />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{resource.title}</div>
                            </div>
                            <span style={{
                              padding: "2px 8px",
                              background: "color-mix(in srgb, var(--primary) 15%, transparent)",
                              color: "var(--primary)",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600
                            }}>
                              {resource.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Quick Stats */}
            <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                padding: 20,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--card)"
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Bug Summary
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Error Type</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Race Condition</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Severity</div>
                    <span style={{
                      padding: "2px 8px",
                      background: "color-mix(in srgb, var(--warning) 15%, transparent)",
                      color: "var(--warning)",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      High
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Category</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Authentication</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Files Affected</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>2 files</div>
                  </div>
                </div>
              </div>

              <div style={{
                padding: 20,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "color-mix(in srgb, var(--success) 5%, transparent)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Fix Available</h3>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                  A fix has been identified for this issue. Review the fixed code and apply the changes.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}