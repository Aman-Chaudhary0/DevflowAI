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
    <div className="relative rounded-xl overflow-hidden my-3">
      <div className="flex justify-between items-center px-3 py-2 bg-(--surface) border-b border-(--border) text-sm text-(--muted)">
        <span className="font-semibold">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="bg-none border-none cursor-pointer text-(--muted) flex items-center gap-1 text-sm"
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
    <div className="flex gap-3 p-4 animate-fadeIn">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-(--primary) to-(--purple) grid place-items-center flex-shrink-0">
        <Sparkles size={16} color="white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-2">AI Assistant</div>
        <div className="ai-message-content text-sm leading-relaxed">
          <MarkdownContent content={message.content} />
        </div>

        {/* File references */}
        {message.files && message.files.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {message.files.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-(--surface) border border-(--border) rounded-lg text-xs text-(--muted)">
                <FileCode size={12} />
                {file}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div
          className="flex gap-1 mt-3"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {(showActions || true) && (
            <>
              <button
                onClick={() => onCopy && onCopy(message.content)}
                className="action-btn"
                title="Copy"
                type="button"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => onRegenerate && onRegenerate(message.id)}
                className="action-btn"
                title="Regenerate"
                type="button"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => onLike && onLike(message.id)}
                className="action-btn"
                title="Like"
                type="button"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => onDislike && onDislike(message.id)}
                className="action-btn"
                title="Dislike"
                type="button"
              >
                <ThumbsDown size={14} />
              </button>
              {onContinue && (
                <button
                  onClick={() => onContinue(message.id)}
                  className="action-btn"
                  title="Continue"
                  type="button"
                >
                  <Wand2 size={14} />
                </button>
              )}
              {onExplain && (
                <button
                  onClick={() => onExplain(message.id)}
                  className="action-btn"
                  title="Explain"
                  type="button"
                >
                  <MessageSquare size={14} />
                </button>
              )}
              {onInsert && (
                <button
                  onClick={() => onInsert(message.content)}
                  className="action-btn"
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
    <div className="flex gap-3 p-4 flex-row-reverse animate-fadeIn">
      <div className="w-8 h-8 rounded-lg bg-(--primary) grid place-items-center flex-shrink-0">
        <span className="text-white font-bold text-sm">U</span>
      </div>
      <div className="max-w-[70%] p-3 bg-(--primary) text-white rounded-[18px_18px_4px_18px] text-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────
export function TypingIndicator() {
  return (
    <div className="flex gap-3 p-4">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-(--primary) to-(--purple) grid place-items-center flex-shrink-0">
        <Sparkles size={16} color="white" />
      </div>
      <div className="flex items-center gap-1 p-2">
        <span className="w-2 h-2 rounded-full bg-(--muted)" style={{ animation: "bounce 1.4s infinite ease-in-out both" }} />
        <span className="w-2 h-2 rounded-full bg-(--muted)" style={{ animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full bg-(--muted)" style={{ animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
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
    <div className="border border-(--border) rounded-2xl bg-(--card) p-3 transition-colors duration-200">
      {/* Suggestions */}
      {suggestions.length > 0 && !value && (
        <div className="flex gap-2 flex-wrap mb-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onChange(s)}
              className="px-3 py-1.5 bg-(--surface) border border-(--border) rounded-full text-xs text-(--muted) cursor-pointer transition-all duration-150 whitespace-nowrap"
              type="button"
            >
              <Sparkles size={12} className="mr-1" />
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <button
          onClick={onAttach}
          className="w-9 h-9 rounded-lg bg-(--surface) border-none cursor-pointer grid place-items-center text-(--muted) flex-shrink-0"
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
          className="flex-1 border-none outline-none bg-transparent resize-none text-sm leading-relaxed py-2 min-h-6 max-h-[150px] font-inherit"
        />

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onVoice}
            className="w-9 h-9 rounded-lg bg-(--surface) border-none cursor-pointer grid place-items-center text-(--muted) transition-all duration-150"
            title="Voice input"
            type="button"
          >
            <Mic size={16} />
          </button>

          {isGenerating ? (
            <button
              onClick={onStop}
              className="w-9 h-9 rounded-lg bg-(--danger) border-none cursor-pointer grid place-items-center text-white"
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
              className="w-9 h-9 rounded-lg bg-(--primary) border-none cursor-pointer grid place-items-center text-white transition-all duration-150"
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
    <div className="border border-(--border) rounded-2xl bg-(--card) p-4 flex flex-col gap-4">
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-(--soft) mb-2">
          Current Context
        </div>
        <div className="flex flex-col gap-2">
          {project && (
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen size={14} color="var(--muted)" />
              <span className="text-(--muted)">Project:</span>
              <span className="font-semibold">{project}</span>
            </div>
          )}
          {branch && (
            <div className="flex items-center gap-2 text-sm">
              <GitBranch size={14} color="var(--muted)" />
              <span className="text-(--muted)">Branch:</span>
              <span className="font-semibold">{branch}</span>
            </div>
          )}
          {framework && (
            <div className="flex items-center gap-2 text-sm">
              <FileCode size={14} color="var(--muted)" />
              <span className="text-(--muted)">Framework:</span>
              <span className="font-semibold">{framework}</span>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-2 text-sm">
              <FileText size={14} color="var(--muted)" />
              <span className="text-(--muted)">Language:</span>
              <span className="font-semibold">{language}</span>
            </div>
          )}
        </div>
      </div>

      {files && files.length > 0 && (
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-(--soft) mb-2">
            Selected Files
          </div>
          <div className="flex flex-col gap-1">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-(--surface) rounded-lg text-xs">
                <FileCode size={12} color="var(--primary)" />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {memory && memory.length > 0 && (
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-(--soft) mb-2">
            Recent AI Memory
          </div>
          <div className="flex flex-col gap-1">
            {memory.slice(0, 3).map((m, i) => (
              <div key={i} className="px-2.5 py-1.5 bg-(--surface) rounded-lg text-xs text-(--muted) whitespace-nowrap overflow-hidden text-ellipsis">
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
    <div className="flex flex-col h-full border-r border-(--border) bg-(--surface) min-w-[260px] w-[260px]" style={{ minWidth: collapsed ? 0 : 260, width: collapsed ? 0 : 260 }}>
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-(--primary) border-none rounded-xl text-white font-semibold text-sm cursor-pointer transition-all duration-150"
          type="button"
        >
          <Wand2 size={16} />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-(--card) border border-(--border) rounded-lg">
            <Search size={14} color="var(--muted)" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 border-none outline-none bg-transparent text-sm text-(--text)"
            />
          </div>
        </div>
      )}

      {/* Folders & Conversations */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Pinned */}
        {!collapsed && conversations.some(c => c.pinned) && (
          <div className="mb-4">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-(--soft) px-2 py-1">
              Pinned
            </div>
            {conversations.filter(c => c.pinned).map(c => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] border-none rounded-lg cursor-pointer text-left"
                style={{ background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}
                type="button"
              >
                <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: c.id === activeId ? "var(--primary)" : "var(--text)" }}>
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
            <div key={folder.id} className="mb-2">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 bg-transparent border-none rounded-md cursor-pointer text-left"
                type="button"
              >
                {isExpanded ? <ChevronDown size={14} color="var(--muted)" /> : <ChevronRight size={14} color="var(--muted)" />}
                <span className="text-xs font-bold uppercase tracking-wider text-(--soft)">
                  {folder.name}
                </span>
                <span className="text-[11px] text-(--soft) ml-auto">
                  {folderConversations.length}
                </span>
              </button>

              {isExpanded && (
                <div className="pl-2">
                  {folderConversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c.id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] border-none rounded-lg cursor-pointer text-left"
                      style={{ background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}
                      type="button"
                    >
                      <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: c.id === activeId ? "var(--primary)" : "var(--text)" }}>
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
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-(--soft) px-2 py-1">
                  Recent
                </div>
              )}
              {recentConversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 bg-[color-mix(in_srgb,var(--primary)_16%,transparent)] border-none rounded-lg cursor-pointer text-left"
                  style={{ background: c.id === activeId ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "transparent" }}
                  type="button"
                >
                  <MessageSquare size={14} color={c.id === activeId ? "var(--primary)" : "var(--muted)"} />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: c.id === activeId ? "var(--primary)" : "var(--text)" }}>
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
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-(--surface) border border-(--border) rounded-lg cursor-pointer text-sm font-semibold text-(--text)"
        type="button"
      >
        <img src={selected.icon} alt={selected.name} className="w-5 h-5 rounded" />
        {selected.name}
        <ChevronDown size={14} color="var(--muted)" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 min-w-[200px] bg-(--card) border border-(--border) rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] z-50 overflow-hidden">
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => { onChange(option.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border-none cursor-pointer text-left"
                style={{ background: option.id === value ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent" }}
                type="button"
              >
                <img src={option.icon} alt={option.name} className="w-5 h-5 rounded" />
                <div>
                  <div className="text-sm font-semibold">{option.name}</div>
                  <div className="text-xs text-(--muted)">{option.description}</div>
                </div>
                {option.id === value && <Check size={14} color="var(--primary)" className="ml-auto" />}
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
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 bg-(--surface) border border-(--border) rounded-lg cursor-pointer text-sm font-semibold text-(--text)"
        type="button"
      >
        <Download size={14} />
        Export
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] right-0 min-w-[160px] bg-(--card) border border-(--border) rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] z-50 overflow-hidden">
            <button
              onClick={() => { onExport("md"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-transparent border-none cursor-pointer text-left text-sm"
              type="button"
            >
              <FileText size={14} />
              Export as Markdown
            </button>
            <button
              onClick={() => { onExport("pdf"); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-transparent border-none cursor-pointer text-left text-sm"
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
    <div className="border border-(--border) rounded-xl overflow-hidden">
      <div className="flex justify-between items-center px-3 py-2 bg-(--surface) border-b border-(--border)">
        <div className="flex gap-2">
          <button
            onClick={() => setView("split")}
            className="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
            style={{ background: view === "split" ? "var(--primary)" : "transparent", color: view === "split" ? "white" : "var(--muted)" }}
            type="button"
          >
            Split
          </button>
          <button
            onClick={() => setView("unified")}
            className="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer"
            style={{ background: view === "unified" ? "var(--primary)" : "transparent", color: view === "unified" ? "white" : "var(--muted)" }}
            type="button"
          >
            Unified
          </button>
        </div>
      </div>

      {view === "split" ? (
        <div className="grid grid-cols-2 gap-0">
          <div>
            <div className="px-3 py-2 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-xs font-semibold text-(--danger)">
              Original
            </div>
            <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}>
              {original}
            </SyntaxHighlighter>
          </div>
          <div className="border-l border-(--border)">
            <div className="px-3 py-2 bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-xs font-semibold text-(--success)">
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
    <div className="relative flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
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
      <div className="absolute grid place-items-center">
        <span className="text-[28px] font-extrabold font-display">{score}</span>
        <span className="text-xs text-(--muted)">/{max}</span>
      </div>
      {label && <span className="text-xs text-(--muted) font-semibold">{label}</span>}
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
    <div className="border border-(--border) rounded-xl p-4 mb-2" style={{ borderColor: color.border, background: color.bg }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase text-white" style={{ background: color.border }}>
          {severity}
        </span>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="mb-2 text-sm text-(--muted) leading-relaxed">{description}</p>
      {location && (
        <div className="inline-flex items-center gap-2 px-2 py-1 bg-(--surface) rounded-md text-xs font-code text-(--muted)">
          <FileCode size={12} />
          {location}
        </div>
      )}
      {fix && (
        <div className="mt-3 pt-3 border-t border-[color-mix(in_srgb,var(--border)_50%,transparent)]">
          <span className="text-xs font-semibold text-(--success)">Fix: </span>
          <span className="text-sm">{fix}</span>
        </div>
      )}
    </div>
  );
}

// Add CSS for action buttons
const style = document.createElement("style");
style.textContent = `
  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    color: var(--muted);
    transition: all 150ms ease;
  }
  .action-btn:hover {
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