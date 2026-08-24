# Devflow AI Project Context

## Remaining Product Pages

Five frontend-only pages were added using existing visual tokens, dashboard primitives, public shell, toast UI, and local mock data in `lib/mock/remaining-pages.js`.

| Route | Capability |
| --- | --- |
| `/dashboard/ai/sql-generator` | Natural-language SQL workspace with schema context, simulated generation, safety report, result tabs, and local query history. |
| `/dashboard/integrations` | Integrations marketplace with filtering, mock connection/management, sync, and disconnect confirmation. |
| `/help` | Public Help Center with article search, topics, guides, FAQ accordions, and simulated article drawer. |
| `/feedback` | Public feedback form with loading and confirmation states. |
| `/search` | Public full-page workspace search with filters, sorting, loading, grouped local results, and quick links. |

All these screens keep state locally and make no real external connections, SQL executions, uploads, or API calls.

## Project Summary

Devflow AI is a dark-first, premium, minimal developer workspace UI. It is designed as an AI-powered product interface for developers and teams that need project dashboards, AI chat, documentation, analytics, workflow management, and polished public pages.

The frontend is fully built (UI-only). The backend authentication system is fully implemented with Express.js, MongoDB, and JWT.

## Final Frontend Expansion: Pages 21–31

Routes for workspace webhooks, integrations, global search, help, feedback, and `/admin` administration are frontend-only and use fictional data from `lib/mock/final-pages.js`. `components/final-pages.jsx` centralizes page interactions such as search, drawers, confirmations, safe copy/retry actions, feedback voting, integration connection simulation, and admin operations. The dedicated admin shell uses the same theme variables and navigation for Overview, Users, AI Usage, Subscriptions, Reports, and Audit Logs. No credentials, service connections, payment operations, security enforcement, or backend calls are present; charts are lightweight CSS visualizations because no chart package is installed.

## Dashboard Expansion: Pages 11–20

The following dashboard routes are frontend-only, use centralized fictional data from `lib/mock/workspace.js`, and retain all state locally in React. They do not create API routes, persist credentials, or connect payment providers.

| Route                           | Capability                          | Key interactions                                                                  |
| ------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `/dashboard/team/members`       | Workspace member administration     | Member search/role filtering, details drawer, permissions, invite simulation      |
| `/dashboard/team/activity`      | Workspace activity timeline         | Activity-type filtering and activity details                                      |
| `/dashboard/team/calendar`      | Shared planning calendar            | Event view controls, create-event simulation, event details                       |
| `/dashboard/editor/snippets`    | Reusable snippet library            | Search, copy, favourite, create simulation, editor drawer                         |
| `/dashboard/editor/playground`  | Safe frontend playground simulation | HTML/CSS/JS tabs, mock run/preview, reset and share actions; never executes input |
| `/dashboard/workflows/create`   | Automation workflow builder         | Default trigger/condition/action flow, test simulation, draft/publish feedback    |
| `/dashboard/workflows/[id]`     | Workflow monitoring                 | Run, tabs, run drawer, logs, configuration, disable confirmation                  |
| `/dashboard/billing`            | Subscription dashboard              | Dummy Pro plan, usage meters, plan-upgrade simulation, fictional payment method   |
| `/dashboard/billing/history`    | Invoice history                     | Status filtering, invoice details, mock download feedback                         |
| `/dashboard/developer/api-keys` | Developer credential management     | Masked fictional keys, create-once reveal, copy, revoke confirmation              |

Shared UI helpers for breadcrumb text and accessible dialog-style drawers live in `components/workspace-primitives.jsx`. Additional responsive styles in `app/globals.css` support the workspace grid, code preview, workflow canvas, plan card, and narrow-screen stacking. No real secrets are ever used: API keys remain demonstrably mock values and invoices/payment details are dummy UI data.

---

## Required Pages

### Public Pages

1. `/` Landing page with hero, dashboard mockup, trusted companies, features, AI showcase, product screens, workflow, testimonials, pricing preview, FAQ, and footer.
2. `/pricing` Pricing hero, billing toggle, pricing cards, comparison table, FAQ-style CTA.
3. `/features` Searchable feature hero, filters, feature cards, demos, performance stats.
4. `/about` Mission, story timeline, values, technology stack, team cards, stats.
5. `/blog` Blog landing with search, categories, featured article, sidebar, article grid, pagination action.
6. `/blog/ai-workspaces` Blog detail page with hero, author metadata, share action, sticky table of contents, article body, code block, related articles, comments.
7. `/docs` Documentation page with left nav, search, content, code snippets, right "On this page" sidebar, previous/next, feedback.
8. `/contact` Contact hero, contact info, form UI, map placeholder, FAQ cards.
9. `/privacy` Privacy policy layout with sticky navigation and legal content placeholders.
10. `/terms` Terms and conditions layout with sticky navigation and legal content placeholders.
11. `app/not-found.jsx` Custom 404 page with animated-style developer illustration panel, actions, recent page links, and developer quote.

### Authentication Pages

1. `/login` Login page with email/password fields, show/hide password, remember me, forgot password, loading state, Google/GitHub buttons, and register link.
2. `/register` Register page with full name, username, email, password, confirm password, live validation, password strength meter, terms agreement, and social login buttons.
3. `/verify-email` Email verification page with envelope illustration, resend/change/open email actions, countdown UI, and success state.
4. `/forgot-password` Password reset request page with email field, reset link action, and sent-email success state.
5. `/reset-password/[token]` Secure reset page with new password fields, strength requirements, and password changed success state. `/reset-password/demo-token` is included as a convenient preview URL.
6. `/2fa` Two-factor authentication page with six OTP boxes, paste support, backspace navigation, countdown UI, verify action, backup code, resend code, and success message.

---

## Design Direction

- Dark-first theme using `#0B0F19` background, `#111827` secondary background, `#1A2235` cards, `#273244` borders, `#F8FAFC` primary text, and `#3B82F6` primary accent.
- Light mode variables are present and can be toggled by the navbar theme button.
- Typography uses Space Grotesk for headings, Inter for body, and JetBrains Mono for code.
- UI style is professional, minimal, elegant, fast, clean, scalable, and developer friendly.
- Cards use `18px` radius, buttons use `14px`, inputs use `12px`.
- Responsive behavior is desktop-first with stacked layouts on tablet/mobile.

---

## Frontend Technology Choices

| Category      | Technology                                                 | Why                                                                      |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Framework     | Next.js 15 App Router                                      | Fast, SEO-friendly, production-ready routing                             |
| Language      | JavaScript JSX                                             | User requested JavaScript instead of TypeScript                          |
| Styling       | Tailwind CSS v4 plus CSS tokens                            | Utility-ready setup with explicit theme variables                        |
| Icons         | Lucide React                                               | Clean, consistent SVG icon system                                        |
| Animations    | CSS micro-interactions, Framer Motion dependency available | Smooth hover and floating effects; Framer Motion can be layered in later |
| Charts        | Recharts dependency available                              | Intended for future analytics implementation                             |
| Forms         | React Hook Form and Zod dependencies available             | Ready for future validated forms                                         |
| Tables        | TanStack Table dependency available                        | Ready for future advanced tables                                         |
| Drag and Drop | dnd-kit dependencies available                             | Ready for future Kanban interactions                                     |
| Code Editor   | Monaco dependency available                                | Ready for future VS Code-style editor page                               |
| Markdown      | react-markdown dependency available                        | Ready for future AI and docs rendering                                   |
| Theme         | CSS variables and client theme toggle                      | Dark-first with light mode support                                       |

---

## Backend Technology Choices

| Category         | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Runtime          | Node.js                                             |
| Framework        | Express.js                                          |
| Language         | JavaScript ES Modules                               |
| Database         | MongoDB + Mongoose                                  |
| Authentication   | JWT Access Token + Refresh Token (httpOnly cookies) |
| Password Hashing | bcryptjs (cost factor 12)                           |
| Validation       | Zod                                                 |
| Cookies          | cookie-parser                                       |
| Security         | Helmet, CORS, express-rate-limit                    |
| Logging          | Morgan                                              |
| File Upload      | Multer                                              |
| Storage          | ImageKit                                            |
| Queue            | BullMQ                                              |
| Cache            | Redis                                               |
| Realtime         | Socket.io                                           |
| Email            | Nodemailer                                          |
| OAuth            | Passport.js (Google, GitHub)                        |
| Environment      | dotenv                                              |

---

## Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              MongoDB connection
│   │   ├── redis.js           Redis client
│   │   ├── passport.js        Google + GitHub OAuth strategies
│   │   └── imagekit.js        ImageKit SDK instance
│   ├── controllers/
│   │   └── auth/
│   │       └── auth.controller.js   HTTP layer — sets cookies, calls service
│   ├── services/
│   │   └── auth/
│   │       └── auth.service.js      Business logic — DB queries, token issuance
│   ├── routes/
│   │   └── auth.routes.js     All /api/auth/* routes with validation middleware
│   ├── models/
│   │   └── User.js            Mongoose user schema with password hashing hooks
│   ├── middlewares/
│   │   ├── auth.js            requireAuth — verifies access token from cookie or Bearer header
│   │   ├── errorHandler.js    Global error handler + 404 handler
│   │   └── validate.js        Zod schema validation middleware
│   ├── validators/
│   │   └── auth.validator.js  Zod schemas for all auth endpoints
│   ├── utils/
│   │   ├── ApiError.js        Custom error class with statusCode
│   │   ├── ApiResponse.js     Consistent JSON response shape
│   │   ├── asyncHandler.js    Wraps async route handlers
│   │   ├── generateToken.js   JWT sign + verify helpers
│   │   └── sendEmail.js       Nodemailer transporter
│   ├── app.js                 Express app setup (middleware, routes)
│   └── server.js              HTTP server + Socket.io bootstrap
├── .env                       Local secrets (never commit)
├── .env.example               Template for required env vars
├── .gitignore
└── package.json
```

---

## Auth API Endpoints

| Method | Route                           | Auth     | Description                                                    |
| ------ | ------------------------------- | -------- | -------------------------------------------------------------- |
| POST   | `/api/auth/register`            | Public   | Register with name, email, password. Sends verification email. |
| POST   | `/api/auth/login`               | Public   | Login with email + password. Sets httpOnly cookies.            |
| POST   | `/api/auth/logout`              | Required | Clears cookies and invalidates refresh token.                  |
| POST   | `/api/auth/refresh-token`       | Public   | Issues new token pair from refresh token cookie.               |
| GET    | `/api/auth/me`                  | Required | Returns current authenticated user.                            |
| POST   | `/api/auth/forgot-password`     | Public   | Sends password reset link to email.                            |
| POST   | `/api/auth/reset-password`      | Public   | Resets password using token from email link.                   |
| POST   | `/api/auth/verify-email`        | Public   | Verifies email using token from verification email.            |
| POST   | `/api/auth/resend-verification` | Public   | Resends email verification link.                               |
| GET    | `/api/auth/google`              | Public   | Initiates Google OAuth flow.                                   |
| GET    | `/api/auth/google/callback`     | Public   | Google OAuth callback.                                         |
| GET    | `/api/auth/github`              | Public   | Initiates GitHub OAuth flow.                                   |
| GET    | `/api/auth/github/callback`     | Public   | GitHub OAuth callback.                                         |

---

## User Model Fields

| Field                    | Type    | Notes                                                     |
| ------------------------ | ------- | --------------------------------------------------------- |
| name                     | String  | Required, 2–80 chars                                      |
| email                    | String  | Required, unique, indexed                                 |
| password                 | String  | Required for local provider, bcrypt hashed, select: false |
| avatar                   | String  | URL, default empty                                        |
| role                     | String  | `user` or `admin`, default `user`                         |
| provider                 | String  | `local`, `google`, or `github`                            |
| providerId               | String  | OAuth provider user ID                                    |
| isVerified               | Boolean | Email verified flag                                       |
| refreshToken             | String  | Hashed, select: false                                     |
| emailVerificationToken   | String  | SHA-256 hashed, select: false                             |
| emailVerificationExpires | Date    | 1 hour TTL                                                |
| passwordResetToken       | String  | SHA-256 hashed, select: false                             |
| passwordResetExpires     | Date    | 15 minute TTL                                             |

---

## Required Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devflow

# JWT
JWT_ACCESS_SECRET=<random 64 char secret>
JWT_REFRESH_SECRET=<random 64 char secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your email>
SMTP_PASS=<app password>
SMTP_FROM="Devflow AI <no-reply@devflow.ai>"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# ImageKit (optional)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Redis (optional, for BullMQ queues)
REDIS_URL=redis://localhost:6379
```

---

## Important Frontend Files

- `app/globals.css`: Global design tokens, theme variables, layout primitives, component classes, responsive rules.
- `app/layout.jsx`: Root layout with navbar, footer, metadata, and dark theme default.
- `components/navbar.jsx`: Shared public navbar with routes, theme toggle, and mobile menu button.
- `components/footer.jsx`: Shared footer with links, socials, newsletter, privacy, and terms.
- `components/ui-blocks.jsx`: Shared hero, feature grid, pricing cards, dashboard mock, search bar, code block, and rating components.
- `components/auth-ui.jsx`: Shared authentication shell, brand panel, auth card, inputs, social buttons, password strength, verification panel, forgot success panel, and OTP input.
- `components/site-shell.jsx`: Route-aware shell that hides the public navbar/footer on authentication pages.
- `lib/data.js`: Shared nav, features, pricing, blog, stats, footer, and activity data.

---

## Running the Project

### Frontend

```bash
# From project root
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd backend
# Fill in .env values first
npm run dev        # http://localhost:5000
```

Health check: `GET http://localhost:5000/health`

---

## Completed Dashboard Pages

All 38 dashboard pages have been implemented with full UI, mock data, and responsive design:

### Original Dashboard Pages (1-10)

| Page             | Route                               | Status      | Features                                                                                                                                   |
| ---------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Dashboard Home   | `/dashboard`                        | ✅ Complete | Welcome banner, stats cards, productivity chart, AI usage widget, recent projects, tasks, activity timeline, notifications, quick actions  |
| My Projects      | `/dashboard/projects`               | ✅ Complete | Grid/list view toggle, search, filters, sort, bulk actions, project cards with progress bars                                               |
| Create Project   | `/dashboard/projects/create`        | ✅ Complete | 5-step wizard (Basic Info, Technology, Repository, Team, Review), validation, success animation                                            |
| Project Overview | `/dashboard/projects/[id]`          | ✅ Complete | Hero section, progress ring, tasks stats, deployment status, recent files, commits, AI assistant widget, docs completion                   |
| Project Files    | `/dashboard/projects/[id]/files`    | ✅ Complete | Grid/list view, folder navigation, file upload modal with drag-drop, file preview, delete confirmation                                     |
| Project Docs     | `/dashboard/projects/[id]/docs`     | ✅ Complete | Left nav, markdown editor with toolbar, AI assistant panel (improve, generate, summarize, fix grammar), PDF export                         |
| Project Team     | `/dashboard/projects/[id]/team`     | ✅ Complete | Member table, role filters, status filters, invite modal with permissions preview, role management                                         |
| Project Activity | `/dashboard/projects/[id]/activity` | ✅ Complete | Grouped timeline (Today/Yesterday/Previous), activity filters, export CSV/PDF, activity stats                                              |
| Project Settings | `/dashboard/projects/[id]/settings` | ✅ Complete | Tabbed navigation (General, Git, Integrations, Members, Notifications, Security, Danger Zone), API key management, delete/archive/transfer |
| Analytics        | `/dashboard/analytics`              | ✅ Complete | Top stats cards, area chart, pie chart (languages), heatmap, deployment stats, team leaderboard, AI usage analytics                        |

### AI Pages (11-16)

This project includes a comprehensive set of six AI pages. Each page has a full UI scaffold implemented; below are deep descriptions, frontend wiring, backend API expectations, data contracts, UX notes, and verification guidance.

| Page                       | Route                          | Status      | Purpose                                                                                                                                                                   |
| -------------------------- | ------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Hub                     | `/dashboard/ai`                | ✅ Complete | Centralized AI workspace — unified entry for chat, generation, review, docs, and bug-fixing. Provides quick templates, model selection, usage quotas, and recent history. |
| AI Chat                    | `/dashboard/ai/chat`           | ✅ Complete | Conversational assistant with context management, streaming responses, and code/markdown rendering.                                                                       |
| AI Code Generator          | `/dashboard/ai/code-generator` | ✅ Complete | Generate scaffolded code from prompts or templates, with options (language, framework, test harness, linting).                                                            |
| AI Code Review             | `/dashboard/ai/code-review`    | ✅ Complete | Analyze pasted or repo-sourced code, produce categorized findings (style/security/perf), and produce suggested fixes/diffs.                                               |
| AI Documentation Generator | `/dashboard/ai/docs-generator` | ✅ Complete | Convert code/repo structure into organized docs, generate TOC, and export markdown.                                                                                       |
| AI Bug Fixer               | `/dashboard/ai/bug-fixer`      | ✅ Complete | Accept error messages, stack traces, or failing tests and surface probable fixes with diffs and confidence scores.                                                        |

Design & Frontend wiring (common)

- **Primary UI files**: `app/dashboard/ai/page.jsx` (hub), `app/dashboard/ai/chat/page.jsx`, `app/dashboard/ai/code-generator/page.jsx`, `app/dashboard/ai/code-review/page.jsx`, `app/dashboard/ai/docs-generator/page.jsx`, `app/dashboard/ai/bug-fixer/page.jsx`.
- **Shared components**: `components/ai-ui.jsx` (controls, model selector, templates), `components/dashboard-ui.jsx` (cards, diff viewer, toast), `components/ui-blocks.jsx` (modals, editors).
- **API helper**: `lib/api.js` exposes `api.ai.*` functions; extend it with AI endpoints (examples below).
- **State & storage**: Local IndexedDB or server-side `ai/sessions` to persist conversations, templates, and usage. Use `localStorage` for temporary draft state and `POST` to backend for permanent history.
- **Auth & permissions**: All AI endpoints require `Authorization` (access cookie) or same-site httpOnly cookie; frontend uses `credentials: 'include'` (already configured in `lib/api.js`).

Backend API expectations (examples)

- `POST /api/ai/chat` — body: { sessionId?, messages: [{ role, content }], model, temperature } → returns streaming response chunked or final { id, choices, usage }.
- `POST /api/ai/generate-code` — body: { prompt, language, framework, options } → returns { files: [{ path, content }], artifactsUrl? }.
- `POST /api/ai/code-review` — body: { source, repoUrl?, path?, options } → returns { score, issues: [{ file, lineStart, lineEnd, severity, message, suggestion }] }.
- `POST /api/ai/docs` — body: { repoUrl?, files?:[], options } → returns { outline:[], files:[{path, markdown}] }.
- `POST /api/ai/bugfix` — body: { errorText, stackTrace?, repoSnippet? } → returns { fixes:[{ diff, explanation, confidence }] }.

Data contracts (examples)

- Chat message: { id, role: 'user'|'assistant'|'system', content, createdAt }
- AI session: { id, userId, model, createdAt, updatedAt, messagesCount, metadata }
- Issue (code-review): { id, file, start, end, severity: 'critical'|'major'|'minor', category: 'security'|'style'|'perf', message, suggestion }

UX & performance notes

- Stream responses for `ai/chat` to show tokens incrementally (use SSE or fetch ReadableStream). Provide cancel/stop generation action.
- Include a model selector with token/quota hints and a usage meter in the `AI Hub` header.
- Run heavy operations (code review, repo analysis) as async jobs with an endpoint to poll `/api/ai/jobs/:id` and a websocket/Socket.io progress channel.
- Always surface fallback text when external LLM API fails and provide a retry button. Show reasons (rate-limit, timeout, auth).

Security, privacy & costs

- Rate-limit the endpoints and require server-side billing/usage tracking. Persist only metadata and hashed prompts unless user opts into storing full content.
- Add sanitization for uploaded code/repos to avoid executing untrusted scripts on the server. Use a sandboxed analysis pipeline.

Testing & verification

- Unit: tests for `lib/api` calls (mock fetch), formatters, and validators for AI payloads.
- Integration: run a dev small-model backend or mock responses to validate streaming and diff rendering.
- Manual: verify `AI Hub` can open each tool, create a session, run a small prompt, and display returned artifacts.

Frontend-to-backend quick mappings (files → endpoints)

- `app/dashboard/ai/chat/page.jsx` → `POST /api/ai/chat`
- `app/dashboard/ai/code-generator/page.jsx` → `POST /api/ai/generate-code`
- `app/dashboard/ai/code-review/page.jsx` → `POST /api/ai/code-review` and `/api/ai/jobs`
- `app/dashboard/ai/docs-generator/page.jsx` → `POST /api/ai/docs` and `GET /api/ai/docs/:id` for exported bundles
- `app/dashboard/ai/bug-fixer/page.jsx` → `POST /api/ai/bugfix`

Notes for implementers

- Add `AI_*` env vars for third-party LLM keys and fallback models in `.env.example`.
- Make sure CORS and `FRONTEND_URL` allow the frontend host for cookies to be included (backend `app.js` already uses `credentials: true` and `FRONTEND_URL`).
- Track usage: add `src/services/ai/usage.service.js` and DB schema for `AiUsage` to compute quotas and billing.

### GitHub Pages (16-20)

| Page                   | Route                                     | Status      | Features                                                                                                                          |
| ---------------------- | ----------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Connected Repositories | `/dashboard/github/repositories`          | ✅ Complete | Grid/list view toggle, search, language/visibility filters, sync status, bulk actions, repository cards with stars/forks/language |
| Repository Details     | `/dashboard/github/repositories/[repoId]` | ✅ Complete | Hero section, statistics, tabs (Overview/Branches/Contributors/Releases/Settings), widgets, AI suggestions                        |
| Pull Requests          | `/dashboard/github/pull-requests`         | ✅ Complete | PR cards with status/labels/reviewers, AI review button, files changed, review comments, timeline, merge status                   |
| Commit History         | `/dashboard/github/commits`               | ✅ Complete | Commit timeline, diff viewer, author/date/branch filters, statistics (commits today/this week, average size)                      |
| Team Dashboard         | `/dashboard/team`                         | ✅ Complete | Team stats, member list with roles/status, activity feed, performance leaderboard, shared resources, team calendar                |

### UX Features Implemented

- **Persistent Sidebar**: Collapsible with active indicators, tooltips, and two-level navigation (global + project-specific)
- **Sticky Navbar**: Search (Ctrl+K), notifications, theme toggle, workspace switcher, user profile dropdown
- **Responsive Design**: Desktop, tablet, and mobile layouts with adaptive navigation
- **Skeleton Loading States**: Animated shimmer effects while data loads
- **Empty States**: Friendly illustrations with clear calls to action
- **Toast Notifications**: Success, warning, error, and info feedback for actions
- **Confirm Dialogs**: For destructive actions (delete, revoke, archive)
- **Consistent Design System**: Shared cards, buttons, forms, spacing, typography, and animations

### Component Library (`components/dashboard-ui.jsx`)

- `Skeleton`, `SkeletonCard`, `SkeletonRow`
- `EmptyState`
- `ToastContainer`, `toast()`
- `ConfirmDialog`
- `StatCard`, `ProgressBar`, `ProgressRing`
- `Avatar`, `AvatarGroup`
- `StatusBadge`
- `PageHeader`, `FilterBar`
- `MiniBarChart`, `Sparkline`

### Design System

- **Colors**: Dark-first theme with CSS variables (`--bg: #0b0f19`, `--card: #1a2235`, `--primary: #3b82f6`)
- **Typography**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)
- **Spacing**: Consistent 4px grid system
- **Border Radius**: Cards (18px), Buttons (14px), Inputs (12px)
- **Animations**: Micro-interactions, hover effects, smooth transitions

## Additional Dashboard Pages (21-28)

These 8 pages were built after the original 20 and extend the dashboard with global-level features.

| Page            | Route                      | Status      | Features                                                                                                                         |
| --------------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Global Files    | `/dashboard/files`         | ✅ Complete | Workspace-wide file manager, grid/list view, folder filters, upload modal with drag-drop, file type icons, context menu          |
| Tasks           | `/dashboard/tasks`         | ✅ Complete | Full task list with priority filters, status filters, search, sort, create task modal, bulk actions, due date indicators         |
| Notifications   | `/dashboard/notifications` | ✅ Complete | Grouped notifications (unread/today/yesterday), mark all read, filter by type (review/error/warning/info/success), clear actions |
| Profile         | `/dashboard/profile`       | ✅ Complete | Avatar upload, personal info form, password change, connected accounts (Google/GitHub), danger zone                              |
| Global Settings | `/dashboard/settings`      | ✅ Complete | Tabbed layout (General, Appearance, Notifications, Security, Billing, Integrations), theme toggle, API keys, session management  |
| Team Dashboard  | `/dashboard/team`          | ✅ Complete | Team stats, member list with roles/status, activity feed, performance leaderboard, shared resources                              |
| Code Editor     | `/dashboard/editor`        | ✅ Complete | VS Code-style layout, file tree sidebar, tab bar, syntax-highlighted editor area, terminal panel, run button                     |
| Workflows       | `/dashboard/workflows`     | ✅ Complete | Workflow list with status, trigger types, run history, enable/disable toggle, create workflow modal                              |

## New Dashboard Pages (29-38)

These 10 pages extend the product with AI administration, GitHub branch/release/issue management, project-level planning, and deployment operations. They are implemented as frontend-only routes using centralized mock data and simulated async interactions.

### AI Operations

| Page                 | Route                             | Status      | Notes                                                                                                                                                                               |
| -------------------- | --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Backend Generator | `/dashboard/ai/backend-generator` | ✅ Complete | Multi-panel generator with prompt editor, templates, configuration selectors, staged generation progress, architecture/database/API/code tabs, and simulated save/download actions. |
| AI History           | `/dashboard/ai/history`           | ✅ Complete | Central history dashboard with tool filters, project filters, status filters, search, action menu, and detail-friendly list layout.                                                 |

### GitHub Management

| Page     | Route                        | Status      | Notes                                                                                                                               |
| -------- | ---------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Branches | `/dashboard/github/branches` | ✅ Complete | Repository selector, branch summary stats, searchable table, protected branch behavior, comparison actions, and create-branch flow. |
| Releases | `/dashboard/github/releases` | ✅ Complete | Release summary cards, release cards with markdown notes, draft/publish actions, and create-release modal behavior.                 |
| Issues   | `/dashboard/github/issues`   | ✅ Complete | Issue summary cards, search/filter controls, issue list, issue detail drawer concept, and AI analysis entry point.                  |

### Project Planning

| Page              | Route                                | Status      | Notes                                                                                                                   |
| ----------------- | ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Project Tasks     | `/dashboard/projects/[id]/tasks`     | ✅ Complete | Project-scoped task board/list view with realistic task cards, local add-task actions, and route-aware project context. |
| Project Analytics | `/dashboard/projects/[id]/analytics` | ✅ Complete | Project-scoped analytics dashboard with top stats and activity summaries derived from the project route.                |

### Deployments & Domains

| Page               | Route                            | Status      | Notes                                                                                                                   |
| ------------------ | -------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Deployments        | `/dashboard/deployments`         | ✅ Complete | Workspace-wide deployment table with environment filter, status badges, deploy actions, and responsive table handling.  |
| Deployment Details | `/dashboard/deployments/[id]`    | ✅ Complete | Detailed deployment monitoring with pipeline stages, terminal-style build logs, URL actions, and rollback confirmation. |
| Domains            | `/dashboard/deployments/domains` | ✅ Complete | Domain list, SSL/DNS state, add-domain flow, DNS verification simulation, and responsive table layout.                  |

### Mock Data and Interaction Layer

- `lib/mock/ai.js`: backend generator examples and AI history records.
- `lib/mock/github.js`: branch, release, and issue mock datasets.
- `lib/mock/tasks.js`: per-project task data keyed by route-friendly project IDs.
- `lib/mock/analytics.js`: project analytics snapshots.
- `lib/mock/deployments.js`: deployment rows and detailed deployment logs/pipeline data.
- `lib/mock/domains.js`: domain inventory and DNS/SSL state.
- `lib/api.js`: now exports `mockApi.*` helpers with simulated delays so the new pages can behave like product surfaces without backend integration.

### Navigation Updates

- The dashboard sidebar now reveals contextual groups for AI, GitHub, and deployments when browsing those route families.
- Existing global navigation was preserved; no duplicate root navigation was introduced.
- The new routes are wired to the current product structure rather than replacing any existing pages.

### Interaction Requirements Covered

- Search/filter controls update mock results locally.
- Buttons trigger toasts and staged loading states.
- Delete, rollback, and domain actions use confirmation flows.
- Deployment and AI generation paths simulate async work with visible progress.
- Responsive tables use horizontal scrolling rather than breaking layout.

## Remaining Future Work

- Wire all dashboard pages to backend APIs (replace mock data with real fetch/axios calls)
- Add 2FA (TOTP) support to backend — `/api/auth/2fa/setup`, `/api/auth/2fa/verify`
- Replace placeholder terminal/image blocks with real product screenshots
- Wire contact/newsletter forms to backend actions
- Add Framer Motion page transitions and scroll reveal animations
- Add real legal copy for Privacy and Terms before launch
- Add Redis-backed rate limiting and session blacklisting on logout
- Implement BullMQ email queue for reliable email delivery
