# DevFlow AI — Project Context

> **Purpose:** This is the authoritative working guide for developers and AI coding agents. Read it before changing code. The repository source, tests, package manifests, and runtime configuration are the source of truth; this document explains how they fit together.
>
> **Accuracy rule:** A page, component, dependency, model, route, mock, or roadmap entry does not by itself prove that a feature is production-complete. Feature status is labelled as **integrated**, **partial**, **mock/demo**, or **unverified** where appropriate. Re-audit source before relying on a status claim.

- Repository: [Aman-Chaudhary0/DevflowAI](https://github.com/Aman-Chaudhary0/DevflowAI)
- Default branch: `main`
- Product: DevFlow AI
- Frontend: Next.js App Router, React, JavaScript/JSX
- Backend: Express, Node.js, MongoDB/Mongoose
- Last documentation rewrite: 2026-11-14

---

## 1. Project Overview

### Product

**DevFlow AI** is a developer workspace/SaaS application intended to bring project management, AI-assisted development, source-control workflows, team collaboration, documentation, developer tools, deployments, and account administration into one interface.

### Purpose and problem

Developers commonly switch between separate tools for projects, tasks, repository information, AI assistance, code snippets, documentation, deployments, and team coordination. DevFlow AI aims to provide a unified workspace for those workflows.

### Product goals

1. Provide a coherent workspace and project-management experience.
2. Support secure account creation, authentication, and workspace membership.
3. Connect project and developer workflows to real backend persistence.
4. Provide AI chat and developer-assistance tools through controlled provider integrations.
5. Bring GitHub repository information into the workspace.
6. Support files, documents, tasks, activity, notifications, and collaboration.
7. Provide editor/playground, workflow, deployment, domain, integration, and billing surfaces.
8. Maintain a consistent, responsive, accessible product experience.

These are product goals, not a claim that every surface is fully integrated. See **Section 8** for the implementation-status distinctions.

### Target users

- Individual developers managing personal projects.
- Students and independent developers organizing learning and portfolio work.
- Small development teams coordinating projects and tasks.
- Developers who want repository information and AI-assisted workflows in one workspace.

### Product principles

- Existing information architecture is intentional.
- Reliability and security take priority over adding more features.
- Real data must not be silently replaced by mock data after an API failure.
- Existing UI and interactions should be preserved unless the task explicitly requests a change.
- Backend authorization must enforce ownership and membership; hiding a UI control is not authorization.

---

## 2. Tech Stack

### Frontend

Verified from the root package manifest and frontend source:

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Routing, layouts, application framework |
| React 19 | UI rendering and component model |
| JavaScript / JSX | Application language |
| Tailwind CSS v4 | Utility styling |
| CSS variables / global CSS | Theme tokens and shared visual system |
| Lucide React | Icons |
| Socket.IO Client | Realtime client connection |
| React Markdown | Markdown rendering |
| remark-gfm | GitHub-flavoured Markdown |
| rehype-highlight | Markdown code highlighting |
| react-syntax-highlighter | Code presentation |
| ESLint / eslint-config-next | Linting |

### Backend

Verified from `backend/package.json` and backend source:

| Technology | Purpose |
|---|---|
| Node.js (ES modules) | Backend runtime |
| Express 4 | HTTP API |
| MongoDB | Persistent database |
| Mongoose 8 | ODM, schemas, indexes |
| JSON Web Token | Access/refresh authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| cookie-parser | Cookie parsing |
| Helmet | HTTP security headers |
| CORS | Frontend/backend origin policy |
| express-rate-limit | Request throttling |
| compression | HTTP response compression |
| Morgan | HTTP request logging |
| Passport | OAuth authentication strategies |
| Nodemailer | Email delivery |
| Socket.IO | Realtime server |
| ioredis / redis | Redis connectivity |
| BullMQ | Background job queues |
| ImageKit SDK | Image/file media integration |
| Multer | Multipart upload handling |
| OTPAuth / qrcode | TOTP two-factor authentication |
| Jest / mongodb-memory-server | Automated backend tests |

### Important distinction

An installed package is not proof of a complete product integration. Verify the actual route, controller, service, provider configuration, persistence, authorization, tests, and manual runtime behavior before describing an integration as production-ready.

### Runtime boundaries

| Service | Default local address |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| Backend health | `GET /health` |
| Local Ollama provider (when selected) | `http://127.0.0.1:11434` |

The frontend API client uses `NEXT_PUBLIC_API_URL`, falling back to `http://localhost:5000`. The backend uses `FRONTEND_URL` for credentialed CORS and Socket.IO origin checks.

---

## 3. Project Structure

The repository is a split frontend/backend application.

### Root

```text
DevflowAI/
├── app/                    # Next.js App Router pages and layouts
├── components/             # Shared UI and domain components
├── lib/                    # API client, data, mocks, realtime helpers
├── public/                 # Static public assets
├── backend/                # Express API and background workers
├── package.json            # Frontend scripts and dependencies
├── package-lock.json
├── PROJECT_CONTEXT.md      # This document
└── ...
```

### Frontend responsibilities

| Path | Responsibility |
|---|---|
| `app/` | Route pages, nested layouts, route-level loading/error/not-found UI |
| `app/layout.jsx` | Root document/layout and global setup |
| `app/globals.css` | Theme tokens, typography, global styles, shared component styles |
| `app/dashboard/` | Authenticated workspace pages and dashboard shell |
| `app/admin/` | Admin shell and administration pages |
| `components/` | Reusable UI, navigation, page shells, forms, dialogs, domain views |
| `lib/api.js` | Shared HTTP client and domain API methods |
| `lib/data.js` | Static marketing/content data |
| `lib/dashboard-data.js` | Dashboard fixture data |
| `lib/mock/` | Mock/demo fixtures for features not fully integrated |
| `lib/realtime.js` | Frontend realtime/socket integration |

### Backend responsibilities

| Path | Responsibility |
|---|---|
| `backend/src/server.js` | Environment validation, DB/Redis startup, HTTP and Socket.IO lifecycle, graceful shutdown |
| `backend/src/app.js` | Express middleware and API route mounting |
| `backend/src/config/` | Database, Passport, Redis, and ImageKit configuration |
| `backend/src/routes/` | HTTP route declarations |
| `backend/src/controllers/` | HTTP request/response handling |
| `backend/src/services/` | Business logic and external-service orchestration |
| `backend/src/models/` | Mongoose schemas and indexes |
| `backend/src/middlewares/` | Authentication, validation, error handling |
| `backend/src/validators/` | Zod schemas |
| `backend/src/realtime/` | Socket.IO authentication and event definitions |
| `backend/src/queues/` | BullMQ queue setup |
| `backend/src/workers/` | Background worker entry points |
| `backend/src/utils/` | Shared response, token, email, encryption, and security helpers |
| `backend/src/__tests__/` | Backend automated tests |

### Architectural flow

Typical backend request flow:

```text
Browser / Next.js page
        |
        v
lib/api.js (shared request client)
        |
        v
Express route
        |
        v
Authentication / validation middleware
        |
        v
Controller
        |
        v
Service (business rules / provider calls)
        |
        v
Mongoose model / MongoDB / external provider
        |
        v
Standard API response or centralized error handler
```

Follow this separation. Do not move business logic into route files or duplicate API clients.

---

## 4. Design System

### Visual identity

The current visual direction is **Midnight Espresso + Amber Gold + Warm Ivory**. Dark mode is the default; light mode is supported. The actual source of truth is the CSS variables in `app/globals.css`.

### Theme tokens

| Token | Dark theme (default) | Light theme |
|---|---|---|
| Background | `#0F0E0C` | `#F7F4EC` |
| Soft background | `#171613` | `#FFFDF8` |
| Surface | `#1F1D19` | `#FFFFFF` |
| Card | `#1F1D19` | `#FFFDF8` |
| Border | `#4A4540` (neutral ramp) | `#E7E5E0` |
| Primary text | `#FAFAF9` | `#1A1814` |
| Muted text | `#C5C2B9` | `#6B6558` |
| Accent | `#F2A93B` | `#F2A93B` |
| Accent hover | `#E89A2A` | `#E89A2A` |
| Success | `#5FD3A0` | `#1F7A53` |
| Warning | `#F59E0B` | `#D97706` |
| Error | `#EF6B57` | `#C23F2B` |
| Info | `#06B6D4` | `#0891B2` |

The neutral palette is also defined in `app/globals.css` as `--neutral-50` through `--neutral-950`. Use semantic tokens such as `--bg`, `--surface`, `--card`, `--border`, `--text`, `--muted`, `--accent`, `--success`, `--warning`, `--danger`, and `--info` rather than hard-coding colors.

### Typography

| Use | Font |
|---|---|
| Display/headings | DM Serif Display |
| Body/UI | Inter |
| Code/technical content | JetBrains Mono |

### Spacing, shape, and depth

- The CSS defines a spacing scale based on 4px increments: 4, 8, 12, 16, 20, 24, 28, 32px and larger multiples.
- Standard cards use approximately 16px radius.
- Buttons use approximately 12px radius through the shared spacing token.
- Inputs and smaller controls use the established component styles; inspect the actual class before changing radii.
- Borders are restrained and use the semantic border token.
- Shadows and gradients should be subtle; avoid excessive glassmorphism or decorative effects.
- Accent gold is the primary emphasis color, not a reason to make every element gold.

### Theme implementation rules

- Theme values are driven by CSS variables and the active theme attribute.
- Preserve dark as the default.
- Preserve the existing theme toggle and light theme.
- Do not create a second theme implementation or scatter hard-coded color values across components.
- Before changing a token, inspect all uses in `app/globals.css` and related component styles.

---

## 5. UI/UX Guidelines

### Layout and navigation

- Preserve the current public, authentication, dashboard, project, and admin shells.
- Keep the desktop workspace navigation consistent with the existing dashboard layout.
- On smaller screens, use the existing responsive sidebar/drawer behavior.
- Respect the existing content width, grid, spacing, and page-header patterns.
- Do not introduce a new navigation item or page unless explicitly requested.

### Responsive behavior

Maintain usable layouts across:
- Large desktop: 1280px and wider.
- Laptop: 1024px–1279px.
- Tablet: 768px–1023px.
- Mobile: 640px–767px.
- Small mobile: below 640px.

Avoid horizontal overflow. Tables, forms, sidebars, dialogs, charts, and menus must remain usable on touch devices.

### Interaction states

Every asynchronous or interactive feature should handle the relevant states:

- Initial/loading state (use existing skeleton patterns where appropriate).
- Empty state with a meaningful next action.
- Success/updated state.
- Validation and server error state.
- Disabled/pending state to prevent accidental duplicate submissions.
- Confirmation state for destructive actions.

### Accessibility and motion

- Use semantic buttons and links for their intended actions.
- Inputs require labels and understandable validation messages.
- Preserve keyboard navigation and visible focus styles.
- Dialogs/drawers should support appropriate focus and dismissal behavior.
- Respect reduced-motion preferences where animations are introduced.
- Do not communicate status through color alone.

### UI-only change rule

When a task requests a visual redesign only:
- Modify presentation/styling only.
- Preserve all existing buttons, labels, links, components, routes, form fields, event handlers, API calls, state, validation, and business logic.
- Do not add, remove, rename, or repurpose functionality.
- Do not replace working components with decorative mockups.
- Verify the diff contains no unintended logic changes.

---

## 6. Pages & Routes

This section records the existing route families documented in the repository. Dynamic segments are shown in brackets. Route presence does not imply that the page is connected to a real API. Check the corresponding page and shared component before editing.

### Public and content pages

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/pricing` | Pricing and plans |
| `/features` | Product features |
| `/about` | About |
| `/blog` | Blog index |
| `/blog/ai-workspaces` | Blog article |
| `/docs` | Public documentation |
| `/contact` | Contact |
| `/privacy` | Privacy policy |
| `/terms` | Terms |
| `/search` | Public search |
| `/feedback` | Public feedback |
| `/help` | Help center |

### Authentication pages

| Route | Purpose |
|---|---|
| `/login` | Sign in |
| `/register` | Account registration |
| `/verify-email` | Email verification |
| `/forgot-password` | Password reset request |
| `/reset-password/[token]` | Password reset |
| `/reset-password/demo-token` | Demo/preview route |
| `/2fa` | Two-factor challenge/setup surface |

### Dashboard and workspace pages

| Route | Purpose |
|---|---|
| `/dashboard` | Workspace dashboard |
| `/dashboard/projects` | Project list |
| `/dashboard/projects/create` | Project creation |
| `/dashboard/projects/[projectId]` | Project overview |
| `/dashboard/projects/[projectId]/files` | Project files |
| `/dashboard/projects/[projectId]/docs` | Project documents |
| `/dashboard/projects/[projectId]/tasks` | Project tasks |
| `/dashboard/projects/[projectId]/team` | Project team |
| `/dashboard/projects/[projectId]/activity` | Project activity |
| `/dashboard/projects/[projectId]/analytics` | Project analytics |
| `/dashboard/projects/[projectId]/settings` | Project settings |
| `/dashboard/files` | Workspace files |
| `/dashboard/tasks` | Workspace tasks |
| `/dashboard/notifications` | Notifications |
| `/dashboard/profile` | Profile |
| `/dashboard/settings` | Settings |
| `/dashboard/team` | Team overview |
| `/dashboard/team/members` | Team members |
| `/dashboard/team/activity` | Team activity |
| `/dashboard/team/calendar` | Team calendar |
| `/dashboard/analytics` | Workspace analytics |

### AI pages

| Route | Purpose |
|---|---|
| `/dashboard/ai` | AI hub |
| `/dashboard/ai/chat` | AI chat |
| `/dashboard/ai/code-generator` | Code generation |
| `/dashboard/ai/code-review` | Code review |
| `/dashboard/ai/docs-generator` | Documentation generation |
| `/dashboard/ai/bug-fixer` | Bug-fixing assistance |
| `/dashboard/ai/backend-generator` | Backend generation assistance |
| `/dashboard/ai/sql-generator` | SQL generation |
| `/dashboard/ai/history` | AI history |

### GitHub pages

| Route | Purpose |
|---|---|
| `/dashboard/github` | GitHub overview |
| `/dashboard/github/repositories` | Repositories |
| `/dashboard/github/repositories/[repoId]` | Repository details |
| `/dashboard/github/pull-requests` | Pull requests |
| `/dashboard/github/commits` | Commits |
| `/dashboard/github/branches` | Branches |
| `/dashboard/github/issues` | Issues |
| `/dashboard/github/releases` | Releases |

### Editor, workflow, deployment, developer, billing pages

| Route | Purpose |
|---|---|
| `/dashboard/editor` | Editor |
| `/dashboard/editor/snippets` | Snippet library |
| `/dashboard/editor/playground` | Playground |
| `/dashboard/workflows` | Workflow list |
| `/dashboard/workflows/create` | Workflow builder |
| `/dashboard/workflows/[id]` | Workflow details |
| `/dashboard/deployments` | Deployments |
| `/dashboard/deployments/[id]` | Deployment details |
| `/dashboard/deployments/domains` | Domain management |
| `/dashboard/developer/api-keys` | API keys |
| `/dashboard/developer/webhooks` | Webhook surface |
| `/dashboard/integrations` | Integrations |
| `/dashboard/billing` | Subscription/billing |
| `/dashboard/billing/history` | Billing history |
| `/dashboard/search` | Dashboard search |
| `/dashboard/feedback` | Dashboard feedback |
| `/dashboard/help` | Dashboard help |

### Admin pages

| Route | Purpose |
|---|---|
| `/admin` | Admin overview |
| `/admin/users` | User administration |
| `/admin/ai-usage` | AI usage administration |
| `/admin/subscriptions` | Subscription administration |
| `/admin/reports` | Reports |
| `/admin/audit-logs` | Audit logs |

### Route rules

- Do not add, remove, rename, or relocate routes without explicit approval.
- Reuse existing dynamic route conventions (`projectId` and `id`) in their respective route families.
- Inspect whether a route delegates to `components/remaining-pages.jsx`, `components/final-pages.jsx`, or another shared module before editing.
- If a feature is not integrated, connect the existing page to the intended backend rather than creating a replacement page.

---

## 7. Components

### Shared site and layout components

| Component/file | Responsibility |
|---|---|
| `components/site-shell.jsx` | Public-site shell |
| `components/navbar.jsx` | Public navigation |
| `components/footer.jsx` | Public footer |
| `components/theme-toggle.jsx` | Dark/light theme control |
| `components/header-copy.jsx` | Shared page heading/subheading |
| `components/ui-blocks.jsx` | Reusable marketing/public UI blocks |
| `app/dashboard/layout.jsx` | Dashboard shell, navigation, auth check, top bar, mobile navigation |
| `app/admin/layout.jsx` | Admin shell |

### Dashboard primitives

| Component/file | Responsibility |
|---|---|
| `components/dashboard-ui.jsx` | Shared dashboard primitives: skeletons, empty states, toasts, confirmation dialogs, stat cards, progress, avatars, status badges, page headers, filters, small charts |
| `components/workspace-primitives.jsx` | Workspace breadcrumbs and drawer primitives |

### Domain component modules

| Component/file | Responsibility |
|---|---|
| `components/auth-ui.jsx` | Authentication UI and form presentation |
| `components/ai-ui.jsx` | AI-specific UI |
| `components/remaining-pages.jsx` | Shared implementations for several existing workspace surfaces |
| `components/final-pages.jsx` | Shared implementations/simulations for later product surfaces |
| `components/contact-form.jsx` | Contact form |

These shared page modules can contain substantial page behavior. Inspect imports and callers before modifying a route component; a short route file may simply render a shared page implementation.

### Reuse policy

1. Search for an existing component before creating a new one.
2. Keep components focused and follow their current prop contracts.
3. Do not duplicate dialogs, toasts, skeletons, page headers, buttons, inputs, badges, or navigation patterns.
4. Keep business logic in the appropriate hook/service/API layer rather than embedding it in purely presentational components.
5. Do not change component APIs globally to solve a one-page styling issue unless all call sites are checked.

---

## 8. Features & Functionality

### Feature status vocabulary

- **Integrated:** A real backend/API or provider path exists. Still verify the specific behavior and production configuration before release.
- **Partial:** Some real behavior exists, but one or more intended flows are incomplete.
- **Mock/demo:** The UI uses local fixtures, simulated data, or placeholder actions instead of a complete real service.
- **Unverified:** Source suggests an implementation, but automated/manual evidence is insufficient to claim reliable end-to-end behavior.

### Domain status snapshot

| Domain | Current understanding | Status |
|---|---|---|
| Public marketing/content | Public pages and static content data exist | Mostly static |
| Authentication | Express auth routes, JWT cookies, email flows, OAuth hooks, and 2FA code paths exist | Integrated foundation; provider configuration must be verified |
| Workspace/project lifecycle | Project routes and frontend API methods are mounted; inspect current project service/controllers and tests for exact supported actions | Integrated foundation; verify every lifecycle action |
| Files | File route and ProjectFile model exist; upload provider configuration is required | Partial / verify provider |
| Documents | Document model and docs surfaces exist | Partial / verify CRUD integration |
| Tasks/comments | Task routes, task models, and task UI exist | Partial-to-integrated; verify route behavior and access checks |
| Team/membership/invitations | Membership models and invitation route exist | Partial; verify invitation lifecycle and role enforcement |
| Activity | Activity model and project/task activity surfaces exist | Partial; verify event coverage |
| Notifications | Notification routes, service, model, and UI exist | Integrated foundation; verify delivery and real-time behavior |
| Realtime | Socket.IO server, cookie auth, realtime helpers/events exist | Integrated foundation; verify each event/room and reconnect flow |
| GitHub | Dedicated OAuth connection, encrypted credential storage, repository/resource endpoints exist | Integrated read-oriented API; verify live OAuth and scopes |
| AI chat | Authenticated chat routes, conversation/message persistence, Ollama/OpenAI provider abstraction exist | Integrated foundation; live provider/manual verification required |
| AI developer tools/history | Separate AI tools/history route groups and execution model exist | Partial; verify each tool and usage persistence |
| Editor/snippets/playground | Routes, models, and API client methods exist | Partial; validate save/load and safe execution boundaries |
| Workflows | Workflow routes, Redis/BullMQ queue/worker infrastructure exist | Partial; verify job execution and failure/retry behavior |
| Deployments/domains | Route groups, models, queues, and provider integration code exist | Partial; live provider/DNS verification required |
| API keys/integrations | Route groups and models exist | Partial; verify secret hashing, scopes, revocation, and real connector behavior |
| Billing | Billing routes and subscription/invoice/payment/webhook models exist | Partial; payment provider and webhook verification required |
| Admin | Admin route group, pages, and audit-related models/surfaces exist | Partial; verify server-side admin authorization for every endpoint |
| Production readiness | Requires deployment, secrets, provider, security, monitoring, and end-to-end verification | Not yet established by this document |

### Mock-data policy

The frontend contains fixture data in `lib/dashboard-data.js` and `lib/mock/`. Some pages and helpers remain intentionally mock/demo-backed. A mock must be clearly identified in code/documentation.

- Do not treat fixture data as a successful API response.
- Do not silently fall back to mocks when a real request fails.
- When integrating a feature, remove mock usage only from the intended flow and preserve unrelated mock-backed areas.
- Add explicit loading, empty, error, and success states.
- Update this matrix when integration status changes and cite the tests/manual verification in the implementation change.

---

## 9. Authentication

### Authentication model

The backend is the source of truth for user identity. The documented implementation uses JWT access/refresh tokens delivered through HTTP-only cookies. The frontend API client sends requests with `credentials: "include"` and attempts one refresh-token request after an eligible 401 response before surfacing the error.

### Auth endpoints

The following routes are mounted under `/api/auth`:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register account |
| POST | `/login` | Sign in |
| POST | `/logout` | Clear session |
| POST | `/refresh-token` | Refresh tokens |
| GET | `/me` | Current authenticated user |
| POST | `/forgot-password` | Start password reset |
| POST | `/reset-password` | Complete password reset |
| POST | `/verify-email` | Verify email |
| POST | `/resend-verification` | Resend verification email |
| POST | `/2fa/setup` | Start TOTP setup |
| POST | `/2fa/disable` | Disable two-factor authentication |
| POST | `/2fa/status` | Two-factor status operation |
| POST | `/2fa/challenge` | Complete 2FA challenge |
| GET | `/google` | Start Google OAuth |
| GET | `/google/callback` | Google OAuth callback |
| GET | `/github` | Start GitHub sign-in OAuth |
| GET | `/github/callback` | GitHub sign-in callback |
| GET | `/oauth/failure` | OAuth failure redirect |

OAuth sign-in (Passport) and GitHub repository integration are separate features with separate credentials and scopes.

### Session and security rules

- Do not store access tokens or refresh tokens in localStorage/sessionStorage.
- Keep JWT secrets and OAuth secrets on the backend only.
- Keep HTTP-only cookie, credentialed CORS, and refresh behavior consistent.
- Hash passwords with the existing password-hashing implementation.
- Never expose password hashes, refresh-token hashes, encrypted TOTP secrets, recovery-code hashes, or provider access tokens in user responses.
- Enforce 2FA challenge for accounts that have 2FA enabled; do not introduce an alternate login bypass.
- Protect account-sensitive flows with validation, rate limits, expiry, and single-use tokens where implemented.
- Never trust a user ID or role supplied by the browser when the authenticated request already identifies the user.

### Authorization

For every protected resource:
1. Authenticate the request.
2. Derive the actor from the authenticated request context.
3. Query the resource with the correct owner/workspace/project scope.
4. Check membership and role for the requested operation.
5. Validate and allowlist writable fields.
6. Test both permitted and denied access, including cross-user and cross-workspace attempts.

A protected frontend layout is not a substitute for backend authorization.

---

## 10. API Documentation

### API conventions

- Backend route prefixes are mounted in `backend/src/app.js`.
- Route files declare HTTP methods and validation middleware.
- Controllers handle HTTP concerns; services contain business rules and provider orchestration.
- Most API responses use the shared `ApiResponse` envelope: `{ statusCode, data, message, success }`.
- Validation uses Zod where defined.
- Errors flow through the not-found and centralized error handlers.
- The frontend uses `lib/api.js`; extend it instead of creating another generic fetch wrapper.
- For exact request schemas and response payloads, inspect the corresponding validator, controller, service, and test. Do not infer a payload from a route name.

### Mounted API groups

| Prefix | Route module | Domain |
|---|---|---|
| `/api/auth` | `auth.routes.js` | Authentication and account security |
| `/api/projects` | `project.routes.js` | Projects and dashboard router |
| `/api/files` | `files.routes.js` | File operations |
| `/api/tasks` | `task.routes.js` | Tasks, comments, task activity |
| `/api/notifications` | `notification.routes.js` | Notifications |
| `/api/invitations` | `invitation.routes.js` | Workspace/project invitations |
| `/api/github` | `github.routes.js` | GitHub connection and repository resources |
| `/api/ai` | `ai-chat.routes.js`, `ai-history.routes.js` | AI chat and history |
| `/api/ai/tools` | `ai-tools.routes.js` | AI developer tools |
| `/api/editor` | `editor.routes.js` | Editor files |
| `/api/snippets` | `snippet.routes.js` | Code snippets |
| `/api/playgrounds` | `playground.routes.js` | Playgrounds |
| `/api/workflows` | `workflow.routes.js` | Workflow definitions/execution |
| `/api/deployments` | `deployment.routes.js` | Deployment operations |
| `/api/domains` | `domain.routes.js` | Domain management |
| `/api/api-keys` | `api-key.routes.js` | API key lifecycle |
| `/api/integrations` | `integration.routes.js` | Integrations |
| `/api/billing` | `billing.routes.js` | Plans, subscriptions, payments, invoices |
| `/api/admin` | `admin.routes.js` | Admin operations |
| `/api/dashboard` | dashboard router exported by `project.routes.js` | Dashboard summaries |

### Verified endpoint details

#### Health

| Method | Path | Response purpose |
|---|---|---|
| GET | `/health` | Returns backend health plus Redis/queue availability information |

#### GitHub integration

All routes below are mounted under `/api/github` and the router applies `requireAuth`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/connect` | Begin GitHub repository OAuth connection |
| GET | `/callback` | OAuth callback |
| GET | `/status` | Connection status |
| DELETE | `/connection` | Disconnect stored integration |
| GET | `/repositories` | List repositories (validated pagination) |
| GET | `/repositories/by-id/:repositoryId` | Repository lookup |
| POST | `/sync` | Synchronize repository list |
| GET | `/repositories/:owner/:repo/:resource` | Read detail, branches, commits, pulls, issues, releases, contributors, or languages |

The GitHub integration uses a dedicated OAuth configuration, single-use short-lived state, PKCE S256, and AES-256-GCM encrypted token storage as documented by the backend. The UI must never receive the stored provider token. The integration currently exposes read operations; do not add write operations without explicit product/security approval. Pagination parameters are `page` and `perPage`; verify the validator for limits and defaults.

#### AI chat

The following routes are mounted under `/api/ai`. Chat endpoints require authentication and derive ownership from the authenticated user.

| Method | Path | Purpose |
|---|---|---|
| GET | `/models` | List configured/available models |
| GET | `/conversations` | List conversations; optional search |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/:conversationId` | Read conversation |
| PATCH | `/conversations/:conversationId` | Update title/pin state |
| DELETE | `/conversations/:conversationId` | Delete conversation and its messages |
| GET | `/conversations/:conversationId/messages` | Read paginated messages |
| POST | `/chat` | Submit user message and generate assistant response |
| POST | `/conversations/:conversationId/messages/:messageId/regenerate` | Regenerate assistant response |

Documented request shapes include:
- Create conversation: optional `{ model }`.
- Update conversation: `{ title }` and/or `{ pinned }`.
- Send chat: `{ conversationId, content, model, requestId }`; requestId is a UUID for idempotent retries.
- Regenerate: `{ model }`.
- Message history supports `limit` and `before` query parameters.

AI chat supports the configured Ollama or OpenAI provider path. Local Ollama defaults are documented in `backend/README.md`. Provider availability is runtime-dependent; mocked-provider tests do not prove that a live model service or OpenAI credential works.

### Frontend API client

`lib/api.js`:
- Defines the API base from `NEXT_PUBLIC_API_URL` or the local backend fallback.
- Sends cookie credentials.
- Parses JSON responses defensively.
- Retries an eligible non-auth 401 once after calling the refresh endpoint.
- Converts non-success responses into errors using backend messages/validation errors.
- Exposes grouped API methods for domains such as auth, projects, tasks, files, GitHub, AI, editor, snippets, workflows, deployments, billing, and other implemented API groups.

**Do not invent or document exact endpoint payloads from frontend method names.** For any endpoint not described in the verified tables above, inspect its route, validator, controller, service, and tests before changing or documenting the contract.

---

## 11. Database Schema

### Database

MongoDB is connected through Mongoose. Connection lifecycle and strict query configuration are handled in `backend/src/config/db.js`. The backend startup validates required environment variables before connecting.

### Model inventory

The current model index exports the following models:

| Model | Domain / purpose |
|---|---|
| `User` | Account identity and authentication data |
| `Workspace` | Workspace tenant and settings |
| `WorkspaceMember` | Workspace membership and role |
| `Project` | Workspace project |
| `ProjectMember` | Project membership and role |
| `ProjectFile` | Project file metadata |
| `Document` | Project/workspace documentation |
| `Task` | Work item/task |
| `TaskComment` | Task discussion |
| `Notification` | User notification |
| `Activity` | Activity/audit-style event |
| `Invitation` | Workspace/project invitation |
| `AIExecution` | AI execution record |
| `EditorFile` | Saved editor file |
| `Snippet` | Reusable code snippet |
| `Playground` | Code playground record |
| `Deployment` | Deployment record |
| `Domain` | Custom domain record |
| `APIKey` | API key metadata/credential lifecycle |
| `Integration` | External integration metadata |
| `Subscription` | Subscription record |
| `Invoice` | Invoice record |
| `Payment` | Payment record |
| `WebhookEvent` | Webhook event/idempotency record |

Use `backend/src/models/index.js` as the current export inventory. Inspect each individual model file for the exact fields, enums, defaults, indexes, references, and validation. This table deliberately describes domain purpose rather than guessing every schema property.

### Core relationships and tenancy

- A user is the canonical identity.
- A workspace has an owner and is the primary tenant boundary for workspace-scoped records.
- WorkspaceMember associates a user with a workspace and role.
- A project belongs to a workspace and has an owner.
- ProjectMember associates a user with a project and project role.
- Files, documents, tasks, comments, and activity are associated with their relevant workspace/project/task context.
- Notifications are associated with a recipient and may reference a related entity.
- Invitations represent a pending membership flow.
- AI conversation/history records must be scoped to their authenticated owner.
- Billing records must be associated with the correct customer/account/subscription.

### Data integrity rules

- Enforce tenant scope in every read, update, and delete query.
- Never authorize based solely on a client-provided owner/workspace/project ID.
- Use unique indexes for invariants that must survive concurrent requests.
- Handle duplicate-key errors and invalid ObjectIds safely.
- Avoid accidental cross-tenant population or response serialization.
- Define archive, soft-delete, permanent-delete, and cascade behavior explicitly.
- Do not add duplicate models when an existing model already represents the domain.
- Treat secrets and provider credentials as sensitive: hash or encrypt according to the existing design and never return raw secrets.

---

## 12. State Management

### Current approach

The frontend is a React/Next.js application. The repository's shared API/data modules and page/component implementations are the primary integration points. The project manifests do not declare Redux or Zustand; do not introduce either simply to add a small piece of state.

Use the existing state pattern in the target feature:
- Component state for local UI concerns (dialogs, tabs, form values, filters).
- Existing shared layout/context mechanisms where the app already uses them.
- `lib/api.js` for server data and mutations.
- `lib/realtime.js` for realtime client behavior where integrated.
- Local fixture modules only for documented mock/demo areas.

### State rules

- Do not create parallel sources of truth for the same server resource.
- Keep server data separate from transient presentation state.
- Refresh or update affected data after successful mutations.
- Show pending/error states and prevent duplicate submissions.
- Clean up event listeners and socket subscriptions when components unmount.
- Do not treat stale mock fixtures as current authenticated user data.
- Do not persist sensitive authentication material in browser storage.
- Before adding a global store, inspect the existing provider/layout structure and demonstrate why local state or the current shared pattern is insufficient.

---

## 13. Coding Conventions

### General

- Use JavaScript and JSX. Do not introduce TypeScript or convert files to `.ts`/`.tsx`.
- Follow the existing Next.js App Router conventions.
- Use ES modules in the backend.
- Preserve the current import style and naming patterns.
- Prefer small, focused, reviewable changes.
- Reuse existing dependencies and shared utilities.
- Avoid unnecessary abstractions and dependencies.

### Frontend

- Use lowercase/kebab-case filenames where that is the existing convention.
- Use PascalCase for React component names and camelCase for variables/functions.
- Keep route-specific composition in the route or its established shared page module.
- Use `lib/api.js` rather than raw duplicated fetch logic for backend requests.
- Use semantic HTML and accessible controls.
- Reuse existing design tokens and UI primitives.
- Keep secrets and server-only code out of client components.

### Backend

- Use ES module imports/exports.
- Follow route → middleware/validator → controller → service → model.
- Keep route declarations declarative and controllers thin.
- Put business rules and provider orchestration in services.
- Validate untrusted input with existing Zod patterns.
- Use shared response/error utilities.
- Enforce auth and tenant scope at the backend.
- Keep provider credentials and encryption keys in server-side environment variables.

### Error handling and logging

- Return useful, safe errors without leaking secrets, stack traces, tokens, or cross-tenant data.
- Do not swallow errors and pretend an operation succeeded.
- Keep logs useful but do not log passwords, cookies, bearer tokens, OAuth credentials, or private user content.
- Use the established centralized error handler.

---

## 14. Development Setup

### Prerequisites

- Node.js and npm compatible with the lockfiles.
- MongoDB instance and connection URI.
- Redis for queue-backed features (optional for some local API startup paths, required for queue execution).
- Git.
- Ollama and the configured model if using the local AI provider.
- Provider credentials only for integrations being tested (email, OAuth, GitHub integration, ImageKit, AI, deployment, payment, etc.).

### Frontend

From the repository root:

```bash
npm install
npm run dev
```

Other root scripts:

```bash
npm run build
npm run start
npm run lint
```

The root manifest currently defines Next.js dev/build/start and lint scripts. If the installed Next.js version no longer supports the configured lint command, verify the current CLI and report the actual result rather than silently changing project scripts.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Other backend scripts:

```bash
npm start
npm test
npm run worker
npm run worker:dev
```

The backend package defines separate API and worker entry points. Run the worker when testing queue-backed jobs.

### Required backend environment variables

The backend startup explicitly requires:

```env
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Optional/provider environment groups

Names and exact requirements must be checked against the relevant config/service and `backend/.env.example`. Documented groups include:

- Google/GitHub sign-in OAuth credentials.
- Dedicated GitHub repository integration OAuth client ID/secret, callback URL, and 32-byte encryption key encoded as 64 hex characters.
- AI provider selection/model/API key and timeout/input/output limits.
- Redis connection settings.
- Email SMTP/provider settings.
- ImageKit credentials.
- Deployment provider credentials.
- Payment provider/webhook secrets.
- Any API-key encryption/hash configuration required by the relevant service.

Example AI settings documented by the backend:

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:1.7b
AI_API_KEY=
AI_REQUEST_TIMEOUT_MS=120000
AI_MAX_INPUT_LENGTH=20000
AI_MAX_OUTPUT_LENGTH=40000
AI_MAX_OUTPUT_TOKENS=2048
```

For local Ollama:

```bash
ollama pull qwen3:1.7b
```

### Environment safety

- Never commit `.env` files, API keys, JWT secrets, OAuth secrets, database credentials, encryption keys, or payment secrets.
- Never expose backend secrets through `NEXT_PUBLIC_*`.
- Keep frontend and backend environment configuration separate.
- Keep `.env.example` values blank or clearly non-secret.
- Do not rotate encryption keys casually; existing encrypted credentials may become unreadable.
- Use exact production callback URLs and allowed frontend origins.

---

## 15. Important Restrictions

These restrictions apply to all AI coding agents and contributors unless the project owner explicitly overrides them.

### Scope and information architecture

1. Do not add new pages, routes, route groups, navigation items, or product sections without explicit approval.
2. Prefer implementing the requested behavior inside the existing page and component structure.
3. Do not remove or rename existing routes/components as an incidental refactor.
4. Do not introduce unrelated features, dependencies, or architectural rewrites.

### UI and functionality preservation

5. Do not add, remove, rename, or repurpose buttons, links, inputs, tabs, menus, dialogs, or components unless explicitly requested.
6. Do not change button labels, event handlers, form behavior, validation, API calls, permissions, or state management during a UI-only task.
7. Do not change business logic while performing styling work.
8. Preserve dark/light theme support and the current design tokens.
9. Do not create duplicate components or duplicate design systems.
10. Do not replace a functional component with a static visual mockup.

### Backend and security

11. Never trust client-provided ownership, workspace IDs, project IDs, roles, or permissions.
12. Do not bypass authentication, validation, rate limits, tenant checks, or centralized error handling.
13. Never expose passwords, JWTs, refresh tokens, OAuth tokens, encryption keys, API keys, or other secrets.
14. Do not add provider write permissions or destructive external actions without explicit approval.
15. Do not silently use mock data when a real API request fails.
16. Do not claim a provider integration works until configured and tested against the real provider.

### Change control and Git

17. Inspect `git status` before editing; preserve all user changes.
18. Do not reset, clean, force-push, rebase, merge, commit, or push unless the task explicitly authorizes that operation.
19. Do not overwrite unrelated files or revert another contributor's work.
20. Keep changes narrow and reviewable; explain any necessary cross-cutting changes before making them.

### Required workflow for every task

1. Read this file and inspect the current branch/status.
2. Inspect the target page/component and all relevant imports/callers.
3. For backend work, inspect route, validator, controller, service, model, middleware, and tests.
4. Identify whether the feature is real API-backed, partial, or mock/demo-backed.
5. State the intended scope and files likely to change.
6. Implement only the requested scope.
7. Run the narrowest relevant tests, then lint/build as appropriate.
8. Inspect the final diff for accidental UI, logic, route, or dependency changes.
9. Report exactly what changed, what was tested, test outcomes, and remaining limitations.
10. Update this document when architecture, routes, APIs, schemas, design tokens, feature status, or setup materially changes.

### Acceptance checklist

Before calling a task complete, verify:

- [ ] Only approved files and behavior changed.
- [ ] Existing routes and page structure remain intact.
- [ ] Existing UI interactions and functionality are preserved unless explicitly changed.
- [ ] Backend authorization and tenant isolation are enforced where relevant.
- [ ] Loading, empty, error, and success states are handled.
- [ ] No secrets or sensitive data are exposed.
- [ ] Relevant automated tests pass, or failures are clearly reported.
- [ ] Frontend lint/build checks were run when relevant.
- [ ] The diff contains no unrelated changes.
- [ ] This document is updated if the project context changed.

---

## Documentation maintenance

This document is a maintained project reference, not a substitute for source inspection. When implementation changes, update the relevant section in the same task. For new API contracts, document the actual method, path, validation schema, authorization rule, and response shape from source/tests. For schema changes, document fields/indexes/relationships from the model. For UI changes, keep routes and interaction contracts accurate.

If this document conflicts with source code, tests, or the current package manifests, trust the source and tests, then correct this document. Do not infer that an unverified or mock-backed feature is production-ready.
