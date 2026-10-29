"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, MessageSquare, MoreVertical, RefreshCw, Share2, Sparkles, X } from "lucide-react";
import { AIMessage, UserMessage, TypingIndicator, ChatInput, ChatHistory, ContextPanel, ModelSelector, ExportMenu } from "@/components/ai-ui";
import { api } from "@/lib/api";
import { toast } from "@/components/dashboard-ui";

const folders = [];
const formatMessage = (message) => ({ ...message, id: message._id, type: message.role === "assistant" ? "ai" : "user" });

export default function AIChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelOptions, setModelOptions] = useState([]);
  const [modelAvailabilityMessage, setModelAvailabilityMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const activeRef = useRef(null);
  const requestRef = useRef(null);
  const pendingNewRef = useRef(false);
  const retryRef = useRef(null);

  const loadConversations = useCallback(async (search = "") => {
    const result = await api.ai.conversations(search);
    setConversations(result.data?.conversations || []);
    return result.data?.conversations || [];
  }, []);

  useEffect(() => {
    let current = true;
    Promise.all([api.ai.models(), loadConversations()]).then(async ([models, list]) => {
      if (!current) return;
      const available = models.data?.models || [];
      setModelAvailabilityMessage(models.data?.availabilityMessage || "");
      setModelOptions(available.map((model) => ({ id: model.id, name: model.name, description: `${model.provider} · configured`, icon: model.name.slice(0, 2).toUpperCase() })));
      const model = available[0]?.id || "";
      setSelectedModel(model);
      const requestedId = new URLSearchParams(window.location.search).get("conversation");
      setLoadingHistory(false);
      const prompt = new URLSearchParams(window.location.search).get("prompt");
      if (prompt && model) {
        const created = await api.ai.createConversation({ model });
        const conversation = created.data.conversation;
        setConversations((previous) => [conversation, ...previous]);
        activeRef.current = conversation._id;
        setActiveConversation(conversation._id);
        window.history.replaceState(null, "", `/dashboard/ai/chat?conversation=${encodeURIComponent(conversation._id)}`);
      } else if (requestedId) {
        const requested = list.find((conversation) => conversation._id === requestedId);
        if (requested?.model) setSelectedModel(requested.model);
        selectConversation(requestedId);
      }
      else if (list[0]) { if (list[0].model) setSelectedModel(list[0].model); selectConversation(list[0]._id); }
      else setLoadingHistory(false);
    }).catch((loadError) => { if (current) { setError(loadError.message); setLoadingHistory(false); } });
    return () => { current = false; };
    // conversations are populated by loadConversations above; this runs only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConversations]);

  useEffect(() => {
    const prompt = new URLSearchParams(window.location.search).get("prompt");
    if (prompt) setInputValue(prompt);
  }, []);

  const selectConversation = useCallback(async (id) => {
    requestRef.current?.abort();
    requestRef.current = null;
    setIsGenerating(false);
    activeRef.current = id;
    setActiveConversation(id);
    setMessages([]);
    setLoadingMessages(true);
    setError("");
    try {
      const result = await api.ai.messages(id, { limit: 100 });
      if (activeRef.current !== id) return;
      setMessages((result.data?.messages || []).map(formatMessage));
      const conversation = conversations.find((item) => item._id === id);
      if (conversation?.model) setSelectedModel(conversation.model);
      window.history.replaceState(null, "", `/dashboard/ai/chat?conversation=${encodeURIComponent(id)}`);
    } catch (loadError) {
      if (activeRef.current === id) setError(loadError.message);
    } finally { if (activeRef.current === id) setLoadingMessages(false); }
  }, [conversations]);

  // Refresh history after searches without substituting fixture data on failure.
  useEffect(() => {
    if (!activeRef.current && !loadingHistory) return;
    const timer = setTimeout(() => {
      loadConversations(searchQuery).catch((loadError) => setError(loadError.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, loadConversations, loadingHistory]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleNewChat = async () => {
    if (pendingNewRef.current || (activeConversation && messages.length === 0)) return;
    if (!selectedModel) { setError("No AI model is configured. Configure the backend AI provider to start a chat."); return; }
    pendingNewRef.current = true;
    requestRef.current?.abort();
    requestRef.current = null;
    setIsGenerating(false);
    setError("");
    try {
      const result = await api.ai.createConversation({ model: selectedModel });
      const conversation = result.data.conversation;
      setConversations((previous) => [conversation, ...previous]);
      activeRef.current = conversation._id;
      setActiveConversation(conversation._id);
      setMessages([]);
      setInputValue("");
      setLoadingHistory(false);
      window.history.replaceState(null, "", `/dashboard/ai/chat?conversation=${encodeURIComponent(conversation._id)}`);
    } catch (createError) { setError(createError.message); }
    finally { pendingNewRef.current = false; }
  };

  const handleSendMessage = async (content, existingRequestId) => {
    if (!content.trim() || isGenerating) return;
    const conversationId = activeConversation;
    if (!selectedModel) { setInputValue(content); setError("No AI model is configured. Configure the backend AI provider to start a chat."); return; }
    if (!conversationId) {
      setInputValue(content);
      setError("Start a new chat before sending a message.");
      return;
    }
    const requestId = existingRequestId || (retryRef.current?.content === content ? retryRef.current.requestId : crypto.randomUUID());
    const tempId = `pending-${requestId}`;
    setError("");
    setInputValue("");
    setMessages((previous) => [...previous, { id: tempId, type: "user", content, pending: true }]);
    setIsGenerating(true);
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const result = await api.ai.sendMessage({ conversationId, content, model: selectedModel, requestId }, { signal: controller.signal });
      if (activeRef.current !== conversationId) return;
      const { userMessage, assistant, conversation } = result.data;
      retryRef.current = null;
      setMessages((previous) => [...previous.filter((message) => message.id !== tempId), formatMessage(userMessage), formatMessage(assistant)]);
      setConversations((previous) => [conversation, ...previous.filter((item) => item._id !== conversation._id)]);
    } catch (sendError) {
      if (sendError.name !== "AbortError" && activeRef.current === conversationId) {
        setMessages((previous) => previous.filter((message) => message.id !== tempId));
        setInputValue(content);
        retryRef.current = { content, requestId };
        setError(sendError.message);
      } else if (sendError.name === "AbortError" && activeRef.current === conversationId) {
        setMessages((previous) => previous.filter((message) => message.id !== tempId));
        api.ai.messages(conversationId, { limit: 100 }).then((result) => {
          if (activeRef.current === conversationId) setMessages((result.data?.messages || []).map(formatMessage));
        }).catch(() => {});
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsGenerating(false);
      }
    }
  };

  const handleRegenerate = async (messageId) => {
    if (!activeConversation || isGenerating || !selectedModel) return;
    const conversationId = activeConversation;
    const controller = new AbortController();
    requestRef.current = controller;
    setIsGenerating(true);
    setError("");
    try {
      const result = await api.ai.regenerate(conversationId, messageId, { model: selectedModel }, { signal: controller.signal });
      if (activeRef.current !== conversationId) return;
      const { assistant } = result.data;
      setMessages((previous) => previous.map((message) => message.id === messageId ? formatMessage(assistant) : message));
    } catch (regenerateError) { if (regenerateError.name !== "AbortError") setError(regenerateError.message); }
    finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsGenerating(false);
      }
    }
  };

  const handleCopy = async (content) => {
    try { await navigator.clipboard.writeText(content); toast("Copied to clipboard", "success"); }
    catch { toast("Could not copy this message", "error"); }
  };

  const handleLike = () => toast("Thanks for your feedback!", "success");
  const handleDislike = () => toast("Feedback is not saved yet", "info");

  const handleExport = (format) => {
    if (format === "pdf") { toast("PDF export is unavailable", "info"); return; }
    const conversation = conversations.find((item) => item._id === activeConversation);
    const title = conversation?.title || "conversation";
    const body = messages.map((message) => `${message.type === "user" ? "User" : "Assistant"}: ${message.content}`).join("\n\n");
    const markdown = messages.map((message) => `### ${message.type === "user" ? "User" : "Assistant"}\n\n${message.content}`).join("\n\n");
    const content = format === "txt" ? body : `# ${title}\n\n${markdown}`;
    const blob = new Blob([content], { type: format === "txt" ? "text/plain;charset=utf-8" : "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "conversation"}.${format === "txt" ? "txt" : "md"}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const active = conversations.find((item) => item._id === activeConversation);
  const suggestions = ["Explain this code", "Help me debug an issue", "Suggest an implementation"];

  return <div style={{ display: "flex", height: "calc(100vh - 64px - 56px)", margin: "-28px", overflow: "hidden", position: "relative", isolation: "isolate" }}>
    {!sidebarCollapsed && <div style={{ flex: "0 0 260px", width: 260, minWidth: 260, height: "100%", position: "relative", zIndex: 2, overflow: "hidden", pointerEvents: "auto" }}><ChatHistory conversations={conversations.map((item) => ({ ...item, id: item._id, updatedAt: item.updatedAt }))} folders={folders} activeId={activeConversation} onSelect={selectConversation} onNew={handleNewChat} search={searchQuery} onSearch={setSearchQuery} collapsed={sidebarCollapsed} /></div>}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 0, borderLeft: sidebarCollapsed ? "none" : "1px solid var(--border)", borderRight: contextCollapsed ? "none" : "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} type="button" aria-label="Toggle chat history" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--muted)" }}>{sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} options={modelOptions} />
          <span style={{ color: "var(--soft)", fontSize: 13 }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--surface)", borderRadius: 8 }}><MessageSquare size={14} color="var(--muted)" /><span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{active?.title || "New Chat"}</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExportMenu onExport={handleExport} />
          <button type="button" disabled title="Conversation sharing is unavailable" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--muted)", opacity: 0.6 }}><Share2 size={14} /> Share</button>
          <button type="button" disabled title="More conversation actions are unavailable" aria-label="More conversation actions" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "none", display: "grid", placeItems: "center", color: "var(--muted)", opacity: 0.6 }}><MoreVertical size={16} /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column" }}>
        {(loadingHistory || loadingMessages) && <div role="status" style={{ color: "var(--muted)", padding: 16 }}>Loading conversations…</div>}
        {!loadingHistory && !modelOptions.length && <div role="alert" style={{ margin: "8px 0", padding: 12, borderRadius: 10, background: "color-mix(in srgb, var(--warning) 12%, transparent)", color: "var(--warning)" }}>{modelAvailabilityMessage || "No AI model is configured. Set up the backend AI provider to enable chat."}</div>}
        {!loadingHistory && !loadingMessages && !error && !messages.length && <div style={{ margin: "auto", textAlign: "center", color: "var(--muted)" }}><Sparkles size={24} /><p>{activeConversation ? "Send a message to begin this conversation." : "Create a chat to start a conversation."}</p></div>}
        {error && <div role="alert" style={{ margin: "8px 0", padding: 12, borderRadius: 10, background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>{error}<button onClick={() => activeConversation ? selectConversation(activeConversation) : loadConversations().then(() => setError(""))} type="button" style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: 0, color: "inherit", cursor: "pointer" }}>Retry</button></div>}
        {messages.map((message) => <div key={message.id}>{message.type === "user" ? <UserMessage message={message} /> : <AIMessage message={message} onCopy={handleCopy} onRegenerate={handleRegenerate} onLike={handleLike} onDislike={handleDislike} />}</div>)}
        {isGenerating && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--card)" }}>
        <ChatInput value={inputValue} onChange={setInputValue} onSend={handleSendMessage} onAttach={() => toast("File attachment is not connected", "info")} onVoice={() => toast("Voice input is not connected", "info")} isGenerating={isGenerating} onStop={() => requestRef.current?.abort()} placeholder="Ask AI anything about your code..." suggestions={suggestions} />
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--soft)" }}>AI can make mistakes. Review generated code carefully.</div>
      </div>
    </div>
    {!contextCollapsed ? <div style={{ width: 280, padding: 16, overflowY: "auto", background: "var(--surface)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Context</span><button onClick={() => setContextCollapsed(true)} type="button" aria-label="Collapse context" style={{ border: 0, background: "transparent", color: "var(--muted)" }}><X size={14} /></button></div>
      <ContextPanel />
      <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>Project and repository context are not connected. The assistant only receives messages in this conversation.</p>
      <div style={{ marginTop: 16, fontSize: 11, color: "var(--soft)" }}><FileText size={13} /> Context attachments are unavailable.</div>
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", marginBottom: 8 }}>Quick Actions</div>
        {["Explain the code I provide", "Help document the code I provide", "Review the code I provide for security issues"].map((prompt) => <button key={prompt} onClick={() => setInputValue(prompt)} type="button" style={{ display: "block", width: "100%", marginBottom: 6, padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "var(--text)", textAlign: "left" }}>{prompt}</button>)}
      </div>
    </div> : <button onClick={() => setContextCollapsed(false)} aria-label="Expand context" type="button" style={{ width: 24, border: 0, background: "var(--card)", color: "var(--muted)" }}><ChevronRight size={14} /></button>}
  </div>;
}
