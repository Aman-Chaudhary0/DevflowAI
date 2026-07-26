"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  Filter,
  Github,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Upload,
  Wand2,
  X,
  Zap
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScoreCard, IssueCard } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";

// Mock review data
const mockReviewData = {
  overallScore: 92,
  categories: {
    codeQuality: { score: 94, label: "Code Quality" },
    naming: { score: 88, label: "Naming" },
    readability: { score: 95, label: "Readability" },
    complexity: { score: 85, label: "Complexity" },
    bugs: { score: 98, label: "Bug Detection" }
  },
  issues: [
    {
      id: 1,
      severity: "high",
      title: "SQL Injection Vulnerability",
      description: "User input is directly concatenated into SQL query without parameterization. This allows attackers to execute arbitrary SQL commands.",
      location: "src/routes/user.js:42",
      fix: "Use parameterized queries or an ORM like Sequelize to handle database operations safely."
    },
    {
      id: 2,
      severity: "medium",
      title: "Missing Error Handling",
      description: "Async function lacks try-catch block which could lead to unhandled promise rejections.",
      location: "src/services/auth.service.js:28",
      fix: "Wrap async operations in try-catch blocks and implement proper error handling middleware."
    },
    {
      id: 3,
      severity: "medium",
      title: "Unused Variable",
      description: "Variable 'tempData' is declared but never used, indicating dead code.",
      location: "src/utils/helpers.js:15",
      fix: "Remove unused variable to improve code clarity and reduce bundle size."
    },
    {
      id: 4,
      severity: "low",
      title: "Inconsistent Naming Convention",
      description: "Function uses camelCase while project convention is snake_case for private methods.",
      location: "src/utils/helpers.js:8",
      fix: "Rename function to follow project naming conventions."
    },
    {
      id: 5,
      severity: "low",
      title: "Magic Number",
      description: "Hardcoded value '86400' should be extracted to a named constant for better readability.",
      location: "src/middleware/auth.js:56",
      fix: "Extract to constant: const TOKEN_EXPIRY_SECONDS = 86400;"
    }
  ],
  security: {
    checks: [
      { name: "SQL Injection", status: "warning", details: "1 potential issue found" },
      { name: "XSS Prevention", status: "pass", details: "No issues detected" },
      { name: "JWT Implementation", status: "pass", details: "Secure implementation" },
      { name: "Password Hashing", status: "pass", details: "Using bcrypt with cost 12" },
      { name: "Secret Management", status: "warning", details: "API key found in code" }
    ]
  },
  performance: {
    suggestions: [
      { title: "Add Database Indexing", impact: "high", description: "Add index on users.email for faster lookups" },
      { title: "Implement Caching", impact: "medium", description: "Cache frequently accessed user data with Redis" },
      { title: "Lazy Load Dependencies", impact: "low", description: "Defer loading of non-critical modules" }
    ]
  },
  bestPractices: {
    missing: [
      { title: "Type Definitions", description: "Consider adding TypeScript for type safety" },
      { title: "Input Validation", description: "Add Zod/Joi validation for all API inputs" },
      { title: "API Documentation", description: "Add OpenAPI/Swagger documentation" }
    ]
  }
};

const sampleCode = `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// User registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user exists
  const checkQuery = \`SELECT * FROM users WHERE email = '\${email}'\`;
  const existingUser = await db.query(checkQuery);
  
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // Insert user
  const insertQuery = \`INSERT INTO users (name, email, password) VALUES ('\${name}', '\${email}', '\${hashedPassword}')\`;
  const result = await db.query(insertQuery);
  
  // Generate JWT
  const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
  
  res.status(201).json({ token, user: { id: result.rows[0].id, name, email } });
});

// User login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
  const result = await db.query(query);
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;`;

export default function AICodeReviewPage() {
  const [inputMethod, setInputMethod] = useState("paste"); // paste, upload, github
  const [code, setCode] = useState(sampleCode);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [severityFilter, setSeverityFilter] = useState("all");

  const handleReview = () => {
    if (!code.trim()) {
      toast("Please enter some code to review", "warning");
      return;
    }

    setIsReviewing(true);
    setReviewComplete(false);

    // Simulate AI review
    setTimeout(() => {
      setReviewData(mockReviewData);
      setIsReviewing(false);
      setReviewComplete(true);
      toast("Code review complete!", "success");
    }, 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
        toast("File uploaded successfully", "success");
      };
      reader.readAsText(file);
    }
  };

  const handleGitHubConnect = () => {
    toast("GitHub integration coming soon", "info");
  };

  const handleDownloadReport = () => {
    const report = JSON.stringify(reviewData, null, 2);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-review-report.json";
    a.click();
    toast("Report downloaded", "success");
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    toast("Code copied to clipboard", "success");
  };

  const filteredIssues = severityFilter === "all"
    ? reviewData?.issues || []
    : reviewData?.issues.filter(i => i.severity === severityFilter) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", fontFamily: "Space Grotesk" }}>
            AI Code Review
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
            Get AI-powered code review like a senior developer
          </p>
        </div>
        {reviewComplete && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDownloadReport}
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
              onClick={() => { setReviewComplete(false); setReviewData(null); }}
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
              New Review
            </button>
          </div>
        )}
      </div>

      {!reviewComplete ? (
        <>
          {/* Input Method Selector */}
          <div style={{
            display: "flex",
            gap: 4,
            padding: "6px",
            background: "var(--surface)",
            borderRadius: 12,
            width: "fit-content"
          }}>
            {[
              { id: "paste", label: "Paste Code", icon: Code },
              { id: "upload", label: "Upload File", icon: Upload },
              { id: "github", label: "GitHub PR", icon: Github }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setInputMethod(method.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: inputMethod === method.id ? "var(--card)" : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: inputMethod === method.id ? "var(--primary)" : "var(--muted)",
                  transition: "all 150ms ease"
                }}
                type="button"
              >
                <method.icon size={14} />
                {method.label}
              </button>
            ))}
          </div>

          {/* Code Input */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--card)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                {inputMethod === "paste" ? "Paste your code below" : inputMethod === "upload" ? "Upload a code file" : "Connect GitHub PR"}
              </span>
              {inputMethod === "paste" && (
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                  type="button"
                >
                  <Copy size={12} />
                  Copy
                </button>
              )}
            </div>

            {inputMethod === "paste" && (
              <div style={{ position: "relative" }}>
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: 20, fontSize: 13, maxHeight: 500, overflow: "auto" }}
                  showLineNumbers
                  value={code}
                  onChange={(val) => setCode(val)}
                />
              </div>
            )}

            {inputMethod === "upload" && (
              <div
                style={{
                  padding: 60,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  border: "2px dashed var(--border)",
                  margin: 20,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 200ms ease"
                }}
                onClick={() => document.getElementById("fileInput").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setCode(e.target.result);
                      setInputMethod("paste");
                    };
                    reader.readAsText(file);
                  }
                }}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".js,.ts,.jsx,.tsx,.py,.java,.go,.rs,.css,.html"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--purple) 20%, transparent))",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px"
                }}>
                  <Upload size={28} color="var(--primary)" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>
                  Drop your file here or click to browse
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                  Supports JS, TS, Python, Java, Go, Rust, CSS, HTML
                </p>
              </div>
            )}

            {inputMethod === "github" && (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "var(--surface)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px"
                }}>
                  <Github size={28} color="var(--muted)" />
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Connect GitHub Repository</h3>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20, maxWidth: 400, marginInline: "auto" }}>
                  Connect your GitHub repository to review pull requests automatically.
                </p>
                <button
                  onClick={handleGitHubConnect}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    background: "#24292e",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                    margin: "0 auto"
                  }}
                  type="button"
                >
                  <Github size={16} />
                  Connect with GitHub
                </button>
              </div>
            )}
          </div>

          {/* Review Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleReview}
              disabled={isReviewing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                background: isReviewing ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))",
                border: "none",
                borderRadius: 14,
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: isReviewing ? "not-allowed" : "pointer",
                transition: "all 200ms ease",
                minWidth: 200,
                justifyContent: "center"
              }}
              type="button"
            >
              {isReviewing ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Start Review
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Review Dashboard */}
          <div style={{ display: "flex", gap: 24 }}>
            {/* Left - Score Cards */}
            <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Overall Score */}
              <div style={{
                padding: 24,
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "var(--card)",
                textAlign: "center"
              }}>
                <div style={{ position: "relative", display: "inline-flex", marginBottom: 12 }}>
                  <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx={60}
                      cy={60}
                      r={52}
                      fill="none"
                      stroke="color-mix(in srgb, var(--border) 70%, transparent)"
                      strokeWidth={10}
                    />
                    <circle
                      cx={60}
                      cy={60}
                      r={52}
                      fill="none"
                      stroke={reviewData.overallScore >= 80 ? "var(--success)" : reviewData.overallScore >= 60 ? "var(--warning)" : "var(--danger)"}
                      strokeWidth={10}
                      strokeDasharray={326.7}
                      strokeDashoffset={326.7 - (reviewData.overallScore / 100) * 326.7}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "Space Grotesk" }}>
                      {reviewData.overallScore}
                    </span>
                  </div>
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Overall Score</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
                  {reviewData.overallScore >= 90 ? "Excellent code quality!" : reviewData.overallScore >= 70 ? "Good, with room for improvement" : "Needs significant improvements"}
                </p>
              </div>

              {/* Category Scores */}
              {Object.entries(reviewData.categories).map(([key, category]) => (
                <div key={key} style={{
                  padding: "16px 20px",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  background: "var(--card)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{category.label}</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: category.score >= 90 ? "var(--success)" : category.score >= 70 ? "var(--warning)" : "var(--danger)"
                    }}>
                      {category.score}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${category.score}%`,
                        background: category.score >= 90 ? "var(--success)" : category.score >= 70 ? "var(--warning)" : "var(--danger)",
                        borderRadius: 3,
                        transition: "width 1s ease"
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right - Issues & Sections */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Section Tabs */}
              <div style={{
                display: "flex",
                gap: 4,
                padding: "6px",
                background: "var(--surface)",
                borderRadius: 12,
                width: "fit-content"
              }}>
                {[
                  { id: "overview", label: "Issues", icon: AlertTriangle },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "performance", label: "Performance", icon: Zap },
                  { id: "best-practices", label: "Best Practices", icon: CheckCircle2 }
                ].map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: activeSection === section.id ? "var(--card)" : "transparent",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: activeSection === section.id ? "var(--primary)" : "var(--muted)",
                      transition: "all 150ms ease"
                    }}
                    type="button"
                  >
                    <section.icon size={14} />
                    {section.label}
                    {section.id === "overview" && (
                      <span style={{
                        padding: "2px 6px",
                        background: "var(--danger)",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "white"
                      }}>
                        {reviewData.issues.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Filter Bar */}
              {activeSection === "overview" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Filter size={14} color="var(--muted)" />
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Filter:</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["all", "critical", "high", "medium", "low"].map(sev => (
                      <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev)}
                        style={{
                          padding: "4px 10px",
                          background: severityFilter === sev ? "var(--primary)" : "var(--surface)",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          color: severityFilter === sev ? "white" : "var(--muted)",
                          textTransform: "capitalize"
                        }}
                        type="button"
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {activeSection === "overview" && (
                  <div>
                    {filteredIssues.length === 0 ? (
                      <div style={{
                        padding: 40,
                        textAlign: "center",
                        border: "1px solid var(--border)",
                        borderRadius: 16,
                        background: "var(--card)"
                      }}>
                        <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: 16 }} />
                        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>No Issues Found</h3>
                        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                          Great job! Your code passed all checks.
                        </p>
                      </div>
                    ) : (
                      filteredIssues.map(issue => (
                        <IssueCard
                          key={issue.id}
                          severity={issue.severity}
                          title={issue.title}
                          description={issue.description}
                          location={issue.location}
                          fix={issue.fix}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeSection === "security" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviewData.security.checks.map((check, i) => (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 16,
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        background: "var(--card)"
                      }}>
                        {check.status === "pass" ? (
                          <CheckCircle2 size={20} color="var(--success)" />
                        ) : (
                          <AlertTriangle size={20} color="var(--warning)" />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{check.name}</div>
                          <div style={{ fontSize: 13, color: "var(--muted)" }}>{check.details}</div>
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          background: check.status === "pass" ? "color-mix(in srgb, var(--success) 15%, transparent)" : "color-mix(in srgb, var(--warning) 15%, transparent)",
                          color: check.status === "pass" ? "var(--success)" : "var(--warning)",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {check.status === "pass" ? "Pass" : "Warning"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "performance" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviewData.performance.suggestions.map((suggestion, i) => (
                      <div key={i} style={{
                        padding: 16,
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        background: "var(--card)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{
                            padding: "2px 8px",
                            background: suggestion.impact === "high" ? "color-mix(in srgb, var(--danger) 15%, transparent)" : suggestion.impact === "medium" ? "color-mix(in srgb, var(--warning) 15%, transparent)" : "color-mix(in srgb, var(--info) 15%, transparent)",
                            color: suggestion.impact === "high" ? "var(--danger)" : suggestion.impact === "medium" ? "var(--warning)" : "var(--info)",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase"
                          }}>
                            {suggestion.impact} impact
                          </span>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{suggestion.title}</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "best-practices" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviewData.bestPractices.missing.map((item, i) => (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 16,
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        background: "var(--card)"
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "color-mix(in srgb, var(--info) 15%, transparent)",
                          display: "grid",
                          placeItems: "center"
                        }}>
                          <ArrowUpRight size={16} color="var(--info)" />
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>{item.title}</h4>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}