"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  MessageSquare,
  MoreVertical,
  Paperclip,
  RefreshCw,
  Save,
  Search,
  Share2,
  Sparkles,
  Wand2,
  X
} from "lucide-react";
import {
  AIMessage,
  UserMessage,
  TypingIndicator,
  ChatInput,
  ChatHistory,
  ContextPanel,
  ModelSelector,
  ExportMenu
} from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";

// Mock model options
const modelOptions = [
  { id: "gemini", name: "Gemini Pro", description: "Google's advanced AI", icon: "https://ui-avatars.com/api/?name=G&background=4285F4&color=fff&size=40" },
  { id: "gpt4", name: "GPT-4", description: "OpenAI's most capable", icon: "https://ui-avatars.com/api/?name=O&background=10A37F&color=fff&size=40" },
  { id: "claude", name: "Claude 3", description: "Anthropic's AI assistant", icon: "https://ui-avatars.com/api/?name=C&background=D97706&color=fff&size=40" }
];

// Mock folders
const folders = [
  { id: "general", name: "General" },
  { id: "project", name: "Project Discussions" },
  { id: "bugs", name: "Bug Fixes" },
  { id: "docs", name: "Documentation" }
];

// Mock conversations
const mockConversations = [
  { id: "c1", title: "JWT Authentication Setup", folder: "project", pinned: true, updatedAt: "2 min ago" },
  { id: "c2", title: "React Hook Form Validation", folder: "bugs", pinned: true, updatedAt: "1 hour ago" },
  { id: "c3", title: "API Design Best Practices", folder: "general", updatedAt: "3 hours ago" },
  { id: "c4", title: "MongoDB Schema Optimization", folder: "project", updatedAt: "Yesterday" },
  { id: "c5", title: "CSS Grid Layout Issues", folder: "bugs", updatedAt: "2 days ago" },
  { id: "c6", title: "README Generation", folder: "docs", updatedAt: "3 days ago" }
];

// Mock AI responses
const mockResponses = [
  "I'll help you with that. Let me analyze the code and provide a solution.\n\nHere's the recommended approach:\n\n```javascript\nconst express = require('express');\nconst jwt = require('jsonwebtoken');\nconst bcrypt = require('bcryptjs');\n\nconst router = express.Router();\n\n// Login endpoint\nrouter.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  \n  // Validate input\n  if (!email || !password) {\n    return res.status(400).json({ error: 'Email and password required' });\n  }\n  \n  // Find user\n  const user = await User.findOne({ email });\n  if (!user) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n  \n  // Check password\n  const isValid = await bcrypt.compare(password, user.password);\n  if (!isValid) {\n    return res.status(401).json({ error: 'Invalid credentials' });\n  }\n  \n  // Generate token\n  const token = jwt.sign(\n    { userId: user._id, email: user.email },\n    process.env.JWT_SECRET,\n    { expiresIn: '7d' }\n  );\n  \n  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });\n});\n\nmodule.exports = router;\n```\n\n**Key Security Considerations:**\n\n1. Always use bcrypt for password hashing\n2. Store JWT secret in environment variables\n3. Set appropriate token expiration\n4. Validate all inputs before processing\n5. Use HTTPS in production",
  "Great question! Here's a comprehensive solution:\n\n## Understanding the Problem\n\nThe issue you're facing is common when working with async operations in React. Let me break down the solution:\n\n### Step 1: Setup Form State\n\n```javascript\nimport { useForm } from 'react-hook-form';\nimport { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';\n\nconst schema = z.object({\n  email: z.string().email('Invalid email'),\n  password: z.string().min(8, 'Password must be 8+ chars'),\n  name: z.string().min(2, 'Name required')\n});\n\nexport default function LoginForm() {\n  const { register, handleSubmit, formState: { errors } } = useForm({\n    resolver: zodResolver(schema)\n  });\n  \n  const onSubmit = async (data) => {\n    // Handle submission\n  };\n}\n```\n\n### Step 2: Error Handling\n\nMake sure to handle errors gracefully and provide user feedback.",
  "I've analyzed your code and found several optimization opportunities:\n\n| Metric | Before | After | Improvement |\n|--------|--------|-------|-------------|\n| Load Time | 2.4s | 0.8s | 67% faster |\n| Bundle Size | 450KB | 280KB | 38% smaller |\n| Requests | 24 | 8 | 67% fewer |\n\n### Recommendations:\n\n1. **Code Splitting** - Split large bundles\n2. **Lazy Loading** - Load components on demand\n3. **Caching** - Implement Redis caching\n4. **CDN** - Serve static assets from CDN"
];

export default function AIChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState("c1");
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "m1",
      type: "ai",
      content: "Hello! I'm your AI development assistant. I can help you with code generation, debugging, documentation, and more. What would you like to work on today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = {
      id: `m${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const aiMessage = {
        id: `m${Date.now() + 1}`,
        type: "ai",
        content: randomResponse,
        timestamp: new Date().toISOString(),
        files: ["src/auth/login.js", "src/middleware/auth.js"]
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `m${Date.now()}`,
        type: "ai",
        content: "Hello! I'm your AI development assistant. I can help you with code generation, debugging, documentation, and more. What would you like to work on today?",
        timestamp: new Date().toISOString()
      }
    ]);
    setActiveConversation(null);
    toast("New chat started", "success");
  };

  const handleSelectConversation = (id) => {
    setActiveConversation(id);
    // In a real app, load conversation messages here
    toast("Conversation loaded", "success");
  };

  const handleCopy = async (content) => {
    await navigator.clipboard.writeText(content);
    toast("Copied to clipboard", "success");
  };

  const handleExport = (format) => {
    const content = messages.map(m => `${m.type === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n\n');
    const blob = new Blob([content], { type: format === 'pdf' ? 'application/pdf' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export.${format}`;
    a.click();
    toast(`Exported as ${format.toUpperCase()}`, "success");
  };

  const handleRegenerate = (messageId) => {
    toast("Regenerating response...", "info");
    // In a real app, call API to regenerate
  };

  const handleLike = (messageId) => {
    toast("Thanks for your feedback!", "success");
  };

  const handleDislike = (messageId) => {
    toast("We'll improve our responses", "info");
  };

  const suggestions = [
    "Create JWT authentication",
    "Explain this code",
    "Fix the bug",
    "Generate documentation",
    "Optimize performance"
  ];

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 64px - 56px)",
      margin: "-28px",
      overflow: "hidden"
    }}>
      {/* Left Sidebar - Chat History */}
      {!sidebarCollapsed && (
        <ChatHistory
          conversations={mockConversations}
          folders={folders}
          activeId={activeConversation}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          search={searchQuery}
          onSearch={setSearchQuery}
          collapsed={sidebarCollapsed}
        />
      )}

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        borderLeft: sidebarCollapsed ? "none" : "1px solid var(--border)",
        borderRight: contextCollapsed ? "none" : "1px solid var(--border)"
      }}>
        {/* Chat Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--surface)",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "var(--muted)"
              }}
              type="button"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                options={modelOptions}
              />
            </div>

            <span style={{ color: "var(--soft)", fontSize: 13 }}>|</span>

            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--surface)", borderRadius: 8 }}>
              <MessageSquare size={14} color="var(--muted)" />
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                {activeConversation ? mockConversations.find(c => c.id === activeConversation)?.title : "New Chat"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ExportMenu onExport={handleExport} />

            <button
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
              <Share2 size={14} />
              Share
            </button>

            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--surface)",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "var(--muted)"
              }}
              type="button"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}>
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "user" ? (
                <UserMessage message={message} />
              ) : (
                <AIMessage
                  message={message}
                  onCopy={handleCopy}
                  onRegenerate={handleRegenerate}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              )}
            </div>
          ))}
          {isGenerating && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          background: "var(--card)"
        }}>
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            onAttach={() => toast("File attachment coming soon", "info")}
            onVoice={() => toast("Voice input coming soon", "info")}
            isGenerating={isGenerating}
            onStop={() => setIsGenerating(false)}
            placeholder="Ask AI anything about your code..."
            suggestions={suggestions}
          />
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 8,
            fontSize: 11,
            color: "var(--soft)"
          }}>
            AI can make mistakes. Review generated code carefully.
          </div>
        </div>
      </div>

      {/* Right Panel - Context */}
      {!contextCollapsed && (
        <div style={{
          width: 280,
          padding: 16,
          overflowY: "auto",
          background: "var(--surface)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Context</span>
            <button
              onClick={() => setContextCollapsed(true)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "var(--surface)",
                border: "none",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "var(--muted)"
              }}
              type="button"
            >
              <X size={14} />
            </button>
          </div>

          <ContextPanel
            project="Devflow AI"
            branch="main"
            framework="Next.js 15"
            language="JavaScript"
            files={["src/auth/login.js", "src/middleware/auth.js", "src/models/User.js"]}
            memory={[
              "JWT authentication pattern",
              "Express.js middleware structure",
              "MongoDB schema design"
            ]}
          />

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)", marginBottom: 8 }}>
              Quick Actions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => setInputValue("Explain the current code context")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                  textAlign: "left"
                }}
                type="button"
              >
                <Sparkles size={14} color="var(--primary)" />
                Explain context
              </button>
              <button
                onClick={() => setInputValue("Generate documentation for selected files")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                  textAlign: "left"
                }}
                type="button"
              >
                <FileText size={14} color="var(--primary)" />
                Generate docs
              </button>
              <button
                onClick={() => setInputValue("Review code for security issues")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                  textAlign: "left"
                }}
                type="button"
              >
                <RefreshCw size={14} color="var(--primary)" />
                Security review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Toggle Button (when collapsed) */}
      {contextCollapsed && (
        <button
          onClick={() => setContextCollapsed(false)}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 48,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            color: "var(--muted)",
            zIndex: 10
          }}
          type="button"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}