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
  Wand2,
  Zap
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownContent } from "@/components/ai-ui";
import { toast } from "@/components/dashboard-ui";

// Mock generated documentation
const mockDocumentation = {
  outline: [
    { id: "readme", title: "README", icon: FileText },
    { id: "installation", title: "Installation", icon: FolderOpen },
    { id: "structure", title: "Folder Structure", icon: FolderOpen },
    { id: "architecture", title: "Architecture", icon: Book },
    { id: "env", title: "Environment Variables", icon: FileText },
    { id: "api", title: "API Endpoints", icon: Zap },
    { id: "deployment", title: "Deployment", icon: Upload },
    { id: "contributors", title: "Contributors", icon: Github }
  ],
  content: {
    readme: `# Devflow AI

AI-powered developer workspace that combines project management, AI assistance, and team collaboration in one seamless platform.

## Features

- **AI Chat** - ChatGPT-like assistant specialized for software development
- **Code Generation** - Generate production-ready code with AI
- **Code Review** - AI-powered code review like a senior developer
- **Documentation** - Auto-generate project documentation
- **Bug Fixer** - Help solve runtime and compile-time issues
- **Team Collaboration** - Real-time team workspace

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/devflow-ai.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
\`\`\`

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **AI**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **Real-time**: Socket.io, Redis
- **Deployment**: Docker, Kubernetes, Vercel

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.`,
    installation: `# Installation Guide

## Prerequisites

- Node.js 20+ 
- MongoDB 6+ or MongoDB Atlas account
- Redis 7+ (optional for caching)
- Git

## Local Development

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/your-org/devflow-ai.git
cd devflow-ai
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
\`\`\`

### 3. Environment Setup

\`\`\`bash
# Copy environment template
cp .env.example .env

# Generate JWT secrets
openssl rand -base64 64
\`\`\`

### 4. Start Services

\`\`\`bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
\`\`\`

## Docker Setup

\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
\`\`\``,
    structure: `# Project Structure

\`\`\`
devflow-ai/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   │   ├── ai/                 # AI tools pages
│   │   │   ├── chat/          # AI Chat interface
│   │   │   ├── code-generator/ # Code generation tool
│   │   │   ├── code-review/   # Code review tool
│   │   │   └── docs-generator/ # Documentation generator
│   │   ├── github/            # GitHub integration pages
│   │   ├── projects/          # Project management
│   │   └── team/              # Team dashboard
│   ├── (public)/              # Public pages
│   │   ├── about/
│   │   ├── blog/
│   │   ├── docs/
│   │   └── pricing/
│   └── (auth)/                # Authentication pages
│       ├── login/
│       ├── register/
│       └── forgot-password/
│
├── components/                  # Reusable React components
│   ├── ai-ui.jsx              # AI-specific components
│   ├── auth-ui.jsx            # Auth components
│   ├── dashboard-ui.jsx       # Dashboard components
│   └── ui-blocks.jsx          # Basic UI components
│
├── backend/                     # Express.js backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── lib/                         # Shared utilities
│   ├── api.js                 # API client
│   ├── data.js                # Mock data
│   └── dashboard-data.js      # Dashboard mock data
│
└── public/                      # Static assets
    ├── fonts/
    └── images/
\`\`\``,
    architecture: `# Architecture

## System Overview

Devflow AI follows a modern full-stack architecture with clear separation of concerns:

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   Next.js 15    │◄──►│   Express.js    │◄──►│   MongoDB       │
│   React 19      │    │   Socket.io     │    │   Redis         │
│   Tailwind CSS  │    │   JWT Auth      │    │   BullMQ        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Services   │    │   File Storage  │    │   Email Service │
│   OpenAI        │    │   ImageKit      │    │   Nodemailer    │
│   Claude        │    │   Multer        │    │   SMTP          │
│   Gemini        │    │   Local FS      │    │   SendGrid      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## Data Flow

1. **User Authentication**
   - JWT tokens stored in httpOnly cookies
   - Refresh token rotation for security
   - Optional 2FA with TOTP

2. **AI Processing**
   - Streaming responses via Server-Sent Events
   - Context-aware prompts with project data
   - Rate limiting per user/tier

3. **Real-time Updates**
   - Socket.io for live notifications
   - Optimistic UI updates
   - Conflict resolution

## Security Measures

- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection**: Parameterized queries, ORM usage
- **XSS Prevention**: Content Security Policy headers
- **Rate Limiting**: Redis-backed rate limiter
- **CORS**: Strict origin validation`,
    env: `# Environment Variables

## Required Variables

\`\`\`env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devflow

# JWT
JWT_ACCESS_SECRET=<64 char random string>
JWT_REFRESH_SECRET=<64 char random string>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Devflow AI <no-reply@devflow.ai>"

# Redis (optional)
REDIS_URL=redis://localhost:6379

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# File Storage (optional)
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
\`\`\`

## Security Notes

- Never commit \`.env\` files
- Use strong, random secrets (64+ characters)
- Rotate secrets regularly
- Use different secrets for development and production`,
    api: `# API Endpoints

## Authentication

\`\`\`
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/password
POST   /api/auth/logout            - Logout and clear cookies
POST   /api/auth/refresh-token     - Refresh access token
GET    /api/auth/me                - Get current user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
POST   /api/auth/verify-email      - Verify email address
GET    /api/auth/google            - Google OAuth login
GET    /api/auth/github            - GitHub OAuth login
\`\`\`

## Projects

\`\`\`
GET    /api/projects               - List all projects
POST   /api/projects               - Create new project
GET    /api/projects/:id           - Get project details
PUT    /api/projects/:id           - Update project
DELETE /api/projects/:id           - Delete project
POST   /api/projects/:id/archive   - Archive project
\`\`\`

## AI

\`\`\`
POST   /api/ai/chat                - Send chat message
POST   /api/ai/generate            - Generate code
POST   /api/ai/review              - Review code
POST   /api/ai/document            - Generate documentation
POST   /api/ai/fix                 - Fix bugs/errors
GET    /api/ai/conversations       - List conversations
GET    /api/ai/conversations/:id   - Get conversation
DELETE /api/ai/conversations/:id   - Delete conversation
\`\`\`

## GitHub Integration

\`\`\`
GET    /api/github/repos            - List connected repos
POST   /api/github/connect          - Connect GitHub account
POST   /api/github/sync/:repoId     - Sync repository
GET    /api/github/prs              - List pull requests
GET    /api/github/commits          - List commits
POST   /api/github/review/:prId     - AI review PR
\`\`\`

## Rate Limits

- **Authentication**: 10 requests/minute
- **AI**: 30 requests/minute (varies by tier)
- **General API**: 100 requests/minute

## Error Codes

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { "field": "email" }
  }
}
\`\`\``,
    deployment: `# Deployment Guide

## Vercel (Frontend)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push

\`\`\`bash
# Or deploy via CLI
vercel --prod
\`\`\`

## Railway/Render (Backend)

1. Connect GitHub repository
2. Set root directory to \`backend/\`
3. Add environment variables
4. Deploy

## Docker Deployment

\`\`\`dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/devflow
      - REDIS_URL=redis://redis:6379

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine

volumes:
  mongo-data:
\`\`\`

## Environment-Specific Configs

### Development
- Hot reload enabled
- Verbose logging
- Local file storage

### Production
- Minified bundles
- CDN for static assets
- Structured logging
- Health check endpoints`,
    contributors: `# Contributors

## Core Team

| Name | Role | GitHub |
|------|------|--------|
| Aman Chaudhary | Full Stack Developer | [@Aman-Chaudhary0](https://github.com/Aman-Chaudhary0) |
| Rahul Singh | Backend Engineer | [@rahul-singh](https://github.com/rahul-singh) |
| Priya Sharma | Frontend Engineer | [@priya-sharma](https://github.com/priya-sharma) |

## How to Contribute

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community

## Recognition

Special thanks to all our contributors and the open-source community!`
  }
};

export default function AIDocsGeneratorPage() {
  const [uploadMethod, setUploadMethod] = useState("folder"); // folder, github, zip
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeSection, setActiveSection] = useState("readme");
  const [docs, setDocs] = useState(mockDocumentation);
  const [editorContent, setEditorContent] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerated(false);

    // Simulate AI generation
    setTimeout(() => {
      setEditorContent(docs.content.readme);
      setIsGenerating(false);
      setGenerated(true);
      toast("Documentation generated successfully!", "success");
    }, 3000);
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    if (generated) {
      setEditorContent(docs.content[sectionId] || "");
    }
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
    toast("Downloaded", "success");
  };

  const handleExport = () => {
    // Export all sections
    const allContent = Object.entries(docs.content)
      .map(([key, content]) => content)
      .join("\n\n---\n\n");
    const blob = new Blob([allContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "documentation.md";
    a.click();
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
              Export All
            </button>
            <button
              onClick={() => { setGenerated(false); setEditorContent(""); }}
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
              New Generation
            </button>
          </div>
        )}
      </div>

      {!generated ? (
        <>
          {/* Upload Method Selector */}
          <div style={{
            display: "flex",
            gap: 4,
            padding: "6px",
            background: "var(--surface)",
            borderRadius: 12,
            width: "fit-content"
          }}>
            {[
              { id: "folder", label: "Folder", icon: FolderOpen },
              { id: "github", label: "GitHub Repository", icon: Github },
              { id: "zip", label: "ZIP File", icon: Upload }
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setUploadMethod(method.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: uploadMethod === method.id ? "var(--card)" : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: uploadMethod === method.id ? "var(--primary)" : "var(--muted)",
                  transition: "all 150ms ease"
                }}
                type="button"
              >
                <method.icon size={14} />
                {method.label}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 60,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            background: "var(--card)"
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 20%, transparent), color-mix(in srgb, var(--purple) 20%, transparent))",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 24px"
            }}>
              <Book size={36} color="var(--primary)" />
            </div>

            {uploadMethod === "folder" && (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Select Project Folder</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 400 }}>
                  Choose a folder containing your project files. We'll analyze the structure and generate documentation.
                </p>
                <button
                  onClick={() => toast("Folder selection coming soon", "info")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px",
                    background: "var(--primary)",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white"
                  }}
                  type="button"
                >
                  <FolderOpen size={16} />
                  Select Folder
                </button>
              </>
            )}

            {uploadMethod === "github" && (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Connect GitHub Repository</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 400 }}>
                  Enter a GitHub repository URL to analyze and generate documentation.
                </p>
                <div style={{ display: "flex", gap: 8, maxWidth: 500, width: "100%" }}>
                  <input
                    type="text"
                    placeholder="https://github.com/username/repo"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      background: "var(--bg-soft)",
                      color: "var(--text)",
                      fontSize: 14
                    }}
                  />
                  <button
                    onClick={handleGenerate}
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
                      color: "white"
                    }}
                    type="button"
                  >
                    <Github size={16} />
                    Connect
                  </button>
                </div>
              </>
            )}

            {uploadMethod === "zip" && (
              <>
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600 }}>Upload ZIP File</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24, maxWidth: 400 }}>
                  Upload a ZIP file of your project. Maximum size: 50MB.
                </p>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 500,
                    padding: 40,
                    border: "2px dashed var(--border)",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 200ms ease"
                  }}
                  onClick={() => toast("File upload coming soon", "info")}
                >
                  <Upload size={32} color="var(--muted)" style={{ marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Click to upload or drag and drop</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>ZIP files up to 50MB</p>
                </div>
              </>
            )}
          </div>

          {/* Options */}
          <div style={{
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 24,
            background: "var(--card)"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Documentation Options</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { label: "README", desc: "Project overview", checked: true },
                { label: "Installation", desc: "Setup guide", checked: true },
                { label: "Folder Structure", desc: "Project layout", checked: true },
                { label: "Architecture", desc: "System design", checked: true },
                { label: "Environment Variables", desc: "Config guide", checked: true },
                { label: "API Endpoints", desc: "API documentation", checked: true },
                { label: "Deployment", desc: "Deploy guide", checked: true },
                { label: "Contributors", desc: "Team info", checked: false }
              ].map(option => (
                <label key={option.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 150ms ease"
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={option.checked}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 6,
                      border: "2px solid var(--border)",
                      appearance: "none",
                      background: "transparent",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 32px",
                background: isGenerating ? "var(--border)" : "linear-gradient(135deg, var(--primary), var(--purple))",
                border: "none",
                borderRadius: 14,
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: isGenerating ? "not-allowed" : "pointer",
                transition: "all 200ms ease",
                minWidth: 200,
                justifyContent: "center"
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
                  Generate Documentation
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Documentation Editor Layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr 320px",
            gap: 20,
            height: "calc(100vh - 300px)",
            minHeight: 500
          }}>
            {/* Left - Outline */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
              overflow: "auto"
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Outline
                </h3>
              </div>
              <div style={{ padding: 8 }}>
                {docs.outline.map(section => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: activeSection === section.id ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                    type="button"
                  >
                    {activeSection === section.id ? (
                      <ChevronDown size={14} color="var(--primary)" />
                    ) : (
                      <ChevronRight size={14} color="var(--muted)" />
                    )}
                    <section.icon size={14} color={activeSection === section.id ? "var(--primary)" : "var(--muted)"} />
                    <span style={{
                      fontSize: 13,
                      fontWeight: activeSection === section.id ? 600 : 500,
                      color: activeSection === section.id ? "var(--primary)" : "var(--text)"
                    }}>
                      {section.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Center - Editor */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
              display: "flex",
              flexDirection: "column"
            }}>
              {/* Editor Toolbar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface)"
              }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => toast("Regenerating...", "info")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)"
                    }}
                    type="button"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => toast("Improving...", "info")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)"
                    }}
                    type="button"
                  >
                    <Sparkles size={12} />
                    Improve
                  </button>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)"
                    }}
                    type="button"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={handleDownload}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)"
                    }}
                    type="button"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={() => toast("Saved to project", "success")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 10px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)"
                    }}
                    type="button"
                  >
                    <Save size={12} />
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "var(--text)",
                    fontSize: 14,
                    lineHeight: 1.7,
                    fontFamily: "inherit",
                    resize: "none"
                  }}
                />
              </div>
            </div>

            {/* Right - Preview */}
            <div style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "var(--card)",
              display: "flex",
              flexDirection: "column"
            }}>
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