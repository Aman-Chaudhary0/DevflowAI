"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Dislike,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  FolderOpen,
  GitBranch,
  Github,
  Heart,
  Like,
  Loader2,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  MoreHorizontal,
  Paperclip,
  Play,
  RefreshCw,
  Save,
  Search,
  Share2,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Wand2,
  X
} from "lucide-react";

// ─── Code Block Component ──────────────────────────────────────
function CodeBlock({ language, code, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", margin: "12px 0" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        fontSize: 12,
        color: "var(--muted)"
      }}>
        <span style={{ fontWeight: 600 }}>{language || "code"}</span>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12
          }}
          type="button"
        >
          {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown Renderer ─────────────────────────────────────────
export function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          if (match) {
            return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, "")} />;
          }
          return (
            <code style={{
              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: "0.9em",
              fontFamily: "JetBrains Mono, monospace"
            }} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>{children}</p>;
        },
        h1({ children }) {
          return <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px", fontFamily: "Space Grotesk" }}>{children}</h1>;
        },
        h2({ children }) {
          return <h2 style={{ fontSize: 20, fontWeight: 700, margin: "20px 0 12px", fontFamily: "Space Grotesk" }}>{children}</h2>;
        },
        h3({ children }) {
          return <h3 style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 8px", fontFamily: "Space Grotesk" }}>{children}</h3>;
        },
        ul({ children }) {
          return <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ul>;
        },
        ol({ children }) {
          return <ol style={{ margin: "0 0 12px", paddingLeft: 20 }}>{children}</ol>;
        },
        li({ children }) {
          return <li style={{ margin: "4px 0", lineHeight: 1.6 }}>{children}</li>;
        },
        table({ children }) {
          return (
            <div style={{ overflowX: "auto", margin: "12px 0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                {children}
              </table>
            </div>
          );
        },
        thead({ children }) {
          return <thead style={{ background: "var(--surface)" }}>{children}</thead>;
        },
        th({ children }) {
          return (
            <th style={{ padding: "8px 12px", textAlign: "left", border: "1px solid var(--border)", fontWeight: 600 }}>
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td style={{ padding: "8px 12px", border: "1px solid var(--border)" }}>{children}</td>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote style={{
              borderLeft: "3px solid var(--primary)",
              paddingLeft: 16,
              margin: "12px 0",
              color: "var(--muted)",
              fontStyle: "italic"
            }}>
              {children}
            </blockquote>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ─── AI Message Bubble ─────────────────────────────────────────
export function AIMessage({ message, onRegenerate, onLike, onDislike, onCopy, onInsert, onExplain, onContinue }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "16px 0",
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "linear-gradient(135deg, var(--primary), var(--purple))",
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }}>
        <Sparkles size={16} color="white" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>AI Assistant</div>
        <div className="ai-message-content" style={{ fontSize: 14, lineHeight: 1.7 }}>
          <MarkdownContent content={message.content} />
        </div>

        {/* File references */}
        {message.files && message.files.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {message.files.map((file, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--muted)"
              }}>
                <FileCode size={12} />
                {file}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{ display: "flex", gap: 4, marginTop: 12 }}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {(showActions || true) && (
            <>
              <button
                onClick={() => onCopy && onCopy(message.content)}
                style={{ actionButton: true }}
                title="Copy"
                type="button"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => onRegenerate && onRegenerate(message.id)}
                style={{ actionButton: true }}
                title="Regenerate"
                type="button"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => onLike && onLike(message.id)}
                style={{ actionButton: true }}
                title="Like"
                type="button"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => onDislike && onDislike(message.id)}
                style={{ actionButton: true }}
                title="Dislike"
                type="button"
              >
                <ThumbsDown size={14} />
              </button>
              {onContinue && (
                <button
                  onClick={() => onContinue(message.id)}
                  style={{ actionButton: true }}
                  title="Continue"
                  type="button"
                >
                  <Wand2 size={14} />
                </button>
              )}
              {onExplain && (
                <button
                  onClick={() => onExplain(message.id)}
                  style={{ actionButton: true }}
                  title="Explain"
                  type="button"
                >
                  <MessageSquare size={14} />
                </button>
              )}
              {onInsert && (
                <button
                  onClick={() => onInsert(message.content)}
                  style={{ actionButton: true }}
                  title="Insert into Project"
                  type="button"
                >
                  <FileCode size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── User Message Bubble ───────────────────────────────────────
export function UserMessage({ message }) {
  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "16px 0",
      flexDirection: "row-reverse",
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "var(--primary)",
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>U</span>
      </div>
      <div style={{
        maxWidth: "70%",
        padding: "12px 16px",
        background: "var(--primary)",
        color: "white",
        borderRadius: "18px 18px 4px 18px",
        fontSize: 14,
        lineHeight: 1.6
      }}>
        {message.content}
      </div>
    </div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────
export function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, padding: "16px 0" }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "linear-gradient(135deg, var(--primary), var(--purple))",
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }}>
        <Sparkles size={16} color="white" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 0" }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
          animationDelay: "0s"
        }} />
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
          animationDelay: "0.2s"
        }} />
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
          animationDelay: "0.4s"
        }} />
      </div>
    </div>
  );
}

// ─── Chat Input ────────────────────────────────────────────────
export function ChatInput({
  value,
  onChange,
  onSend,
  onAttach,
  onVoice,
  isGenerating,
  onStop,
  placeholder = "Ask AI anything...",
  suggestions = []
}) {
  const [rows, setRows] = useState(1);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    const lineCount = val.split("\n").length;
    setRows(Math.min(Math.max(lineCount, 1), 6));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isGenerating) {
        onSend(value);
        onChange("");
        setRows(1);
      }
    }
  };

  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 16,
      background: "var(--card)",
      padding: 12,
      transition: "border-color 200ms ease"
    }}>
      {/* Suggestions */}
      {suggestions.length > 0 && !value && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              style={{
                padding: "6px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                fontSize: 12,
                color: "var(--muted)",
                cursor: "pointer",
                transition: "all 150ms ease",
                whiteSpace: "nowrap"
              }}
              type="button"
            >
              <Sparkles size={12} style={{ marginRight: 4 }} />
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <button
          onClick={onAttach}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--surface)",
            border: "none",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            color: "var(--muted)",
            flexShrink: 0
          }}
          title="Attach file"
          type="button"
        >
          <Paperclip size={16} />
        </button>

        <textarea
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            resize: "none",
            fontSize: 14,
            lineHeight: 1.6,
            padding: "8px 0",
            minHeight: 24,
            maxHeight: 150,
            fontFamily: "inherit"
          }}
        />

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={onVoice}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--surface)",
              border: "none",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              color: "var(--muted)",
              transition: "all 150ms ease"
            }}
            title="Voice input"
            type="button"
          >
            <Mic size={16} />
          </button>

          {isGenerating ? (
            <button
              onClick={onStop}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--danger)",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "white"
              }}
              title="Stop generation"
              type="button"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (value.trim()) {
                  onSend(value);
                  onChange("");
                  setRows(1);
                }
              }}
              disabled={!value.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: value.trim() ? "var(--primary)" : "var(--border)",
                border: "none",
                cursor: value.trim() ? "pointer" : "not-allowed",
                display: "grid",
                placeItems: "center",
                color: value.trim() ? "white" : "var(--muted)",
                transition: "all 150ms ease"
              }}
              title="Send message"
              type="button"
            >
              <Wand2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Context Panel ─────────────────────────────────────────────
export function ContextPanel({ project, files, branch, framework, language, memory }) {
  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: 16,
      background: "var(--card)",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", marginBottom: 8 }}>
          Current Context
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {project && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <FolderOpen size={14} color="var(--muted)" />
              <span style={{ color: "var(--muted)" }}>Project:</span>
              <span style={{ fontWeight: 600 }}>{project}</span>
            </div>
          )}
          {branch && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <GitBranch size={14} color="var(--muted)" />
              <span style={{ color: "var(--muted)" }}>Branch:</span>
              <span style={{ fontWeight: 600 }}>{branch}</span>
            </div>
          )}
          {framework && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <FileCode size={14} color="var(--muted)" />
              <span style={{ color: "var(--muted)" }}>Framework:</span>
              <span style={{ fontWeight: 600 }}>{framework}</span>
            </div>
          )}
          {language && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <FileText size={14} color="var(--muted)" />
              <span style={{ color: "var(--muted)" }}>Language:</span>
              <span style={{ fontWeight: 600 }}>{language}</span>
            </div>
          )}
        </div>
      </div>

      {files && files.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", marginBottom: 8 }}>
            Selected Files
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {files.map((file, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "var(--surface)",
                borderRadius: 8,
                fontSize: 12
              }}>
                <FileCode size={12} color="var(--primary)" />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {memory && memory.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", marginBottom: 8 }}>
            Recent AI Memory
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {memory.slice(0, 3).map((m, i) => (
              <div key={i} style={{
                padding: "6px 10px",
                background: "var(--surface)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chat History Sidebar ──────────────────────────────────────
export function ChatHistory({
  conversations,
  folders,
  activeId,
  onSelect,
  onNew,
  onSearch,
  search,
  collapsed
}) {
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const filteredConversations = search
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      minWidth: collapsed ? 0 : 260,
      width: collapsed ? 0 : 260
    }}>
      {/* New Chat Button */}
      <div style={{ padding: 12 }}>
        <button
          onClick={onNew}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: "var(--primary)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 150ms ease"
          }}
          type="button"
        >
          <Wand2 size={16} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10
          }}>
            <Search size={14} color="var(--muted)" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search chats..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "var(--text)"
              }}
            />
          </div>
        </div>
      )}

      {/* Folders & Conversations */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {/* Pinned */}
        {!collapsed && conversations.some(c => c.pinned) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", padding: "4px 8px" }}>
              Pinned
            </div>
            {conversations.filter(c => c.pinned).map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left"
                }}
                type="button"
              >
                <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: c.id === activeId ? "var(--primary)" : "var(--text)"
                  }}>
                    {c.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Folders */}
        {folders.map(folder => {
          const folderConversations = filteredConversations.filter(c => c.folder === folder.id);
          if (folderConversations.length === 0) return null;
          const isExpanded = expandedFolders[folder.id] !== false;

          return (
            <div key={folder.id} style={{ marginBottom: 8 }}>
              <button
                onClick={() => toggleFolder(folder.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left"
                }}
                type="button"
              >
                {isExpanded ? <ChevronDown size={14} color="var(--muted)" /> : <ChevronRight size={14} color="var(--muted)" />}
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--soft)" }}>
                  {folder.name}
                </span>
                <span style={{
                  fontSize: 11,
                  color: "var(--soft)",
                  marginLeft: "auto"
                }}>
                  {folderConversations.length}
                </span>
              </button>

              {isExpanded && (
                <div style={{ paddingLeft: 8 }}>
                  {folderConversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 10px",
                        background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                      type="button"
                    >
                      <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: c.id === activeId ? "var(--primary)" : "var(--text)"
                        }}>
                          {c.title}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Recent (no folder) */}
        {(() => {
          const recentConversations = filteredConversations.filter(c => !c.folder);
          if (recentConversations.length === 0) return null;

          return (
            <div>
              {!collapsed && (
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", padding: "4px 8px" }}>
                  Recent
                </div>
              )}
              {recentConversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  type="button"
                >
                  <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: c.id === activeId ? "var(--primary)" : "var(--text)"
                    }}>
                      {c.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Model Selector ────────────────────────────────────────────
export function ModelSelector({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.id === value) || options[0];

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
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
        <img src={selected.icon} alt={selected.name} style={{ width: 20, height: 20, borderRadius: 4 }} />
        {selected.name}
        <ChevronDown size={14} color="var(--muted)" />
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            minWidth: 200,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
            zIndex: 50,
            overflow: "hidden"
          }}>
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => { onChange(option.id); setOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: option.id === value ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left"
                }}
                type="button"
              >
                <img src={option.icon} alt={option.name} style={{ width: 20, height: 20, borderRadius: 4 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{option.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{option.description}</div>
                </div>
                {option.id === value && <Check size={14} color="var(--primary)" style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Export Menu ───────────────────────────────────────────────
export function ExportMenu({ onExport }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
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
        Export
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 160,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
            zIndex: 50,
            overflow: "hidden"
          }}>
            <button
              onClick={() => { onExport("md"); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13
              }}
              type="button"
            >
              <FileText size={14} />
              Export as Markdown
            </button>
            <button
              onClick={() => { onExport("pdf"); setOpen(false); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13
              }}
              type="button"
            >
              <FileText size={14} />
              Export as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Diff Viewer ───────────────────────────────────────────────
export function DiffViewer({ original, fixed, language = "javascript" }) {
  const [view, setView] = useState("split"); // split, unified

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setView("split")}
            style={{
              padding: "4px 10px",
              background: view === "split" ? "var(--primary)" : "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: view === "split" ? "white" : "var(--muted)"
            }}
            type="button"
          >
            Split
          </button>
          <button
            onClick={() => setView("unified")}
            style={{
              padding: "4px 10px",
              background: view === "unified" ? "var(--primary)" : "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: view === "unified" ? "white" : "var(--muted)"
            }}
            type="button"
          >
            Unified
          </button>
        </div>
      </div>

      {view === "split" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div>
            <div style={{ padding: "8px 12px", background: "color-mix(in srgb, var(--danger) 10%, transparent)", fontSize: 12, fontWeight: 600, color: "var(--danger)" }}>
              Original
            </div>
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}>
              {original}
            </SyntaxHighlighter>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)" }}>
            <div style={{ padding: "8px 12px", background: "color-mix(in srgb, var(--success) 10%, transparent)", fontSize: 12, fontWeight: 600, color: "var(--success)" }}>
              Fixed
            </div>
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}>
              {fixed}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <div>
          <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}>
            {`-${original}\n+${fixed}`}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

// ─── Score Card ────────────────────────────────────────────────
export function ScoreCard({ score, label, max = 100, size = 120 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (score / max) * 100);
  const offset = circ - (pct / 100) * circ;
  const color = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--border) 70%, transparent)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div style={{ position: "absolute", display: "grid", placeItems: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "Space Grotesk" }}>{score}</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>/{max}</span>
      </div>
      {label && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</span>}
    </div>
  );
}

// ─── Issue Card ────────────────────────────────────────────────
export function IssueCard({ severity, title, description, location, fix }) {
  const colors = {
    critical: { bg: "color-mix(in srgb, var(--danger) 10%, transparent)", border: "var(--danger)", text: "var(--danger)" },
    high: { bg: "color-mix(in srgb, var(--warning) 10%, transparent)", border: "var(--warning)", text: "var(--warning)" },
    medium: { bg: "color-mix(in srgb, var(--info) 10%, transparent)", border: "var(--info)", text: "var(--info)" },
    low: { bg: "color-mix(in srgb, var(--primary) 10%, transparent)", border: "var(--primary)", text: "var(--primary)" }
  };

  const color = colors[severity] || colors.low;

  return (
    <div style={{
      border: "1px solid",
      borderColor: color.border,
      borderRadius: 12,
      background: color.bg,
      padding: 16,
      marginBottom: 8
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          padding: "2px 8px",
          background: color.border,
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          color: "white"
        }}>
          {severity}
        </span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{description}</p>
      {location && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          background: "var(--surface)",
          borderRadius: 6,
          fontSize: 12,
          fontFamily: "JetBrains Mono",
          color: "var(--muted)"
        }}>
          <FileCode size={12} />
          {location}
        </div>
      )}
      {fix && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)" }}>Fix: </span>
          <span style={{ fontSize: 13 }}>{fix}</span>
        </div>
      )}
    </div>
  );
}

// Add CSS for action buttons
const style = document.createElement("style");
style.textContent = `
  [style*="actionButton: true"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28;
    height: 28;
    padding: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8;
    cursor: pointer;
    color: var(--muted);
    transition: all 150ms ease;
  }
  [style*="actionButton: true"]:hover {
    background: var(--card);
    color: var(--text);
    border-color: var(--primary);
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ai-message-content {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
`;
if (typeof document !== "undefined" && !document.getElementById("ai-ui-styles")) {
  style.id = "ai-ui-styles";
  document.head.appendChild(style);
}