# DevFlow AI — Project Context, Architecture, Rules, and Roadmap

> **Purpose:** This is the central working reference for developers and AI coding agents working on DevFlow AI. Read it before planning or editing code. Keep it aligned with the repository, preserve valid history, and update it whenever a phase materially changes the system.
>
> **Truth rule:** Source code and tests are the authority for current implementation. A planned feature is not implemented merely because a route, model, UI, dependency, mock, or roadmap item exists. Clearly label verified, partial, mock-only, planned, and locally reported work.

Last documentation audit: 2026-10-30

Repository: \`Aman-Chaudhary0/DevflowAI\`  
Audited remote branch: \`main\`  
Primary product: AI-assisted developer workspace

---

## 1. Product overview

DevFlow AI is a dark-first developer workspace intended to bring project organization, AI-assisted development, repository workflows, team collaboration, documentation, tasks, deployments, analytics, and developer utilities into one product.

The repository contains:
- A Next.js App Router frontend built with JavaScript and JSX.
- An Express backend in the separate \`backend/\` directory.
- MongoDB/Mongoose data models for users and workspace-scoped product entities.
- Authentication and session handling using JWTs and HTTP-only cookies.
- Existing public, authentication, dashboard, project, AI, GitHub, editor, workflow, deployment, billing, notification, settings, and admin routes.
- Shared UI primitives and a substantial mock-data layer used by features not yet backed by production APIs.

### Product goal

Turn the already-designed website into a coherent, secure, working SaaS product by connecting the existing UI to real persistence and external services in deliberate phases.

The product should ultimately support a workflow such as:

1. A user registers, verifies their account, and signs in securely.
2. The user works inside a workspace and creates or imports a project.
3. The project can be connected to a source repository.
4. Project files, documents, tasks, team membership, and activity are managed with real permissions.
5. AI features can work against user-provided prompts and authorized project context.
6. Developers can review changes, use editor/playground experiences, and automate repeatable workflows.
7. Jobs, deployments, domains, usage, billing, notifications, and administration are integrated as their phases are delivered.
8. The product is tested, secured, deployed, and presented as a credible portfolio-grade application.

This workflow is a long-term target, not a claim that every step currently works.

## 2. Non-negotiable project rules

These rules apply to every phase unless the project owner explicitly changes them.

1. **Freeze the existing information architecture.** Do not add pages, routes, route groups, or new navigation items without explicit approval.
2. **Reuse the existing UI.** Prioritize functionality, data integration, reliability, accessibility, and small UI corrections over redesign.
3. **Preserve the established design system.** Do not casually change the theme, palette, typography, spacing, component style, or layout.
4. **Use JavaScript/JSX.** Do not migrate files to TypeScript or introduce TypeScript-only conventions.
5. **Inspect before editing.** Read the target files, their imports/callers, relevant models/services, tests, and this document before implementation.
6. **Make narrow, reviewable changes.** Do not refactor unrelated modules or replace established architecture to solve a local problem.
7. **Reuse existing API clients, models, middleware, components, and utilities.** Do not create duplicates.
8. **Never trust client-provided ownership or authorization identifiers.** Resolve user identity from authenticated server context and verify workspace/project access server-side.
9. **Do not silently use mock data as a fallback for failed real API requests.** Report an error state instead. Mocks may remain only where the phase has not integrated the feature and the limitation is documented.
10. **Do not claim external integrations work without a real configured and tested integration.** A UI toggle, mock response, or stored repository URL is not proof of a live GitHub, email, AI, or deployment connection.
11. **Test the exact changed behavior.** Record the commands run and actual outcomes; never report tests as passing if they were not run.
12. **Update this document.** Phase completion requires documentation of actual changes, tests, limitations, and the next step.
13. **Do not commit, push, merge, force-push, reset, or discard work unless the current task explicitly authorizes that action.**
14. **Preserve user changes.** Check Git status first. If unexpected uncommitted work exists, stop before any operation that could overwrite it.
15. **No scope creep.** Implement only the phase's accepted scope and acceptance criteria.

## 3. Current repository audit and status

### 3.1 Remote audit baseline

The remote \`main\` branch was inspected on 2026-10-23. Its tree contains the original frontend route set, Phase 1 authentication implementation, Phase 2 database models/tests, and mock-based project/dashboard pages. At the time of this audit, the remote \`main\` tree did **not** contain the Phase 3 project service/controller/routes or \`project.lifecycle.test.js\` described in the user's local implementation report.

The user reported that Phase 3 was implemented locally with:
- A live dashboard summary API.
- Real project listing, creation, detail loading, archive, restore, and delete flows.
- Duplicate-slug and access checks.
- Backend tests passing 11/11, frontend lint passing, and production build passing.
- Remaining project subviews still partly mock-only.

**Reconciliation requirement:** Treat those Phase 3 details as user-reported local status until the implementation is pushed to or otherwise made available in the audited repository branch. Do not falsely document them as verified on remote \`main\`. When Phase 3 code is present in the repository, re-audit the actual files and update this section.

### 3.2 Status definitions

- **Complete (verified):** The implementation exists and relevant tests or checks were actually run successfully.
- **Implemented, verification incomplete:** Code exists but required validation is missing or not conclusive.
- **Partial:** Only part of the intended behavior is implemented or integrated.
- **Mock-only:** The UI uses local fixtures, simulated delays, or fake actions instead of a real backend/external service.
- **Planned:** Not yet implemented.
- **Reported locally:** Described by the developer but not present in the remote branch inspected for this document.

### 3.3 High-level status snapshot

| Area | Remote-main status at audit | Notes |
|---|---|---|
| Existing UI and route inventory | Present | Preserve routes and design; route existence does not mean backend integration. |
| Authentication foundation | Complete according to existing context and tests | Includes email/password, session cookies, email flows, OAuth hooks, and TOTP 2FA code paths. Production provider configuration still needs environment verification. |
| Database foundation | Complete according to Phase 2 model tests | Models exist for workspace/project and supporting entities; models alone do not provide CRUD APIs. |
| Workspace/project API integration | Reported locally; not visible on audited remote main | Reconcile local Phase 3 implementation with GitHub before marking remote completion. |
| Dashboard/project subviews | Partial/mock-only on audited remote main | Core project pages in remote main import mock project data. |
| Files and documents | UI and models exist; end-to-end backend integration not verified | Planned Phase 4. |
| Tasks and team collaboration | UI and models exist; end-to-end backend integration not verified | Planned Phase 5. |
| Real-time collaboration | Socket.IO server bootstrap exists; product events/rooms not verified | Planned Phase 6. |
| GitHub product integration | UI/mock layer exists; live OAuth/API integration not verified | Planned Phase 7. |
| AI features | Phase 9 chat implemented; Phase 10 developer tools partial, verification incomplete on `feature/phase-10-ai-developer-tools` | Tool API and UI integrations are present and automated tests/build pass; manual browser checks and live provider verification remain outstanding. Phase 11 usage analytics remain planned. |
| Editor/playground | UI exists; execution/security boundaries need implementation and verification | Planned Phase 12. |
| Workflows and background jobs | UI and dependencies exist; production workflow execution not verified | Planned Phases 13–14. |
| Deployments/domains | UI/mock flows exist; live provider integration not verified | Planned Phase 15. |
| API keys/integrations | Some UI exists; secure lifecycle/API behavior not verified | Planned Phase 16. |
| Billing, notifications, admin | UI and some supporting models exist; complete product flows not verified | Planned Phases 17–19. |
| Production hardening and release | Not complete as a whole | Planned Phases 20–24. |

## 4. Technology stack

### 4.1 Frontend

Verified from the root package manifest and repository files:

- Next.js 15 App Router.
- React 19.
- JavaScript and JSX.
- Tailwind CSS v4 plus CSS variables and existing global CSS.
- Lucide React icons.
- \`react-markdown\`, \`remark-gfm\`, and \`rehype-highlight\` for Markdown content.
- \`react-syntax-highlighter\` for code presentation.
- ESLint / Next.js lint tooling.

Do not add a dependency just because it is popular. First determine whether the existing stack or an installed package already solves the requirement.

### 4.2 Backend

Verified from \`backend/package.json\`, backend source, and configuration:

- Node.js using ES modules.
- Express 4.
- MongoDB and Mongoose.
- JWT access/refresh token support.
- bcryptjs password hashing.
- Zod validation.
- cookie-parser.
- Helmet, CORS, express-rate-limit, compression, and Morgan.
- Nodemailer email delivery.
- Passport with Google and GitHub OAuth strategies.
- Socket.IO server bootstrap.
- Redis client and BullMQ dependencies.
- ImageKit integration dependency.
- Multer upload dependency.
- OTPAuth and QR-code dependencies for two-factor authentication.
- Jest and mongodb-memory-server for backend tests.

A package dependency being installed does not prove the corresponding product feature is complete.

### 4.3 Runtime boundaries

- Frontend dev server defaults to \`http://localhost:3000\`.
- Backend defaults to \`http://localhost:5000\`.
- Backend health route is \`GET /health\`.
- Frontend API base uses \`NEXT_PUBLIC_API_URL\`, falling back to \`http://localhost:5000\`.
- Browser requests in \`lib/api.js\` include credentials for cookie-based auth.
- Backend CORS is configured from \`FRONTEND_URL\` with credentials enabled.

Keep frontend and backend environment variables separate and never commit real secrets.

## 5. Design system and UI preservation

### 5.1 Visual identity

The established visual direction is premium, dark-first, minimal, and developer-focused. It uses dense but readable workspace layouts, restrained borders, rounded surfaces, and blue accent emphasis.

Core tokens documented in the existing project context:

- Background: \`#0B0F19\`
- Secondary surface: \`#111827\`
- Card surface: \`#1A2235\`
- Border: \`#273244\`
- Primary text: \`#F8FAFC\`
- Primary accent: \`#3B82F6\`
- Heading font: Space Grotesk
- Body font: Inter
- Code font: JetBrains Mono
- Cards: approximately 18px radius
- Buttons: approximately 14px radius
- Inputs: approximately 12px radius

Verify the actual CSS variables in \`app/globals.css\` before changing or duplicating tokens. The list above is a project-level reference, not permission to hard-code colors where tokens already exist.

### 5.2 UX behavior standards

- Preserve dark and light theme support.
- Use responsive layouts; sidebars should collapse to an overlay/drawer on small screens.
- Use existing skeleton components for asynchronous loading.
- Show explicit empty states with useful next actions.
- Show useful errors instead of leaving blank screens.
- Use confirmation dialogs for destructive actions.
- Forms need validation, pending, success, and error states.
- Buttons must perform an action or be clearly disabled.
- Tables must remain usable on narrow screens.
- Maintain keyboard navigation, focus visibility, labels, and accessible dialogs.
- Avoid adding new design primitives when an existing shared component is suitable.

## 6. Frontend route inventory

This is the route inventory visible in the audited remote-main tree. It describes route existence, not completion of the route's backend behavior. Before adding or removing a route, compare the current tree and get explicit approval.

### 6.1 Public and content routes

| Route | Purpose |
|---|---|
| \`/\` | Landing page |
| \`/pricing\` | Pricing and plan comparison |
| \`/features\` | Product feature overview |
| \`/about\` | About page |
| \`/blog\` | Blog index |
| \`/blog/ai-workspaces\` | Blog article |
| \`/docs\` | Public documentation landing |
| \`/contact\` | Contact form |
| \`/privacy\` | Privacy policy |
| \`/terms\` | Terms and conditions |
| \`/search\` | Public search surface |
| \`/feedback\` | Public feedback surface |
| \`/help\` | Public help center |
| \`/not-found\` | Route/page convention if present; Next.js also has \`app/not-found.jsx\` |

### 6.2 Authentication routes

| Route | Purpose |
|---|---|
| \`/login\` | Sign in |
| \`/register\` | Create account |
| \`/verify-email\` | Email verification |
| \`/forgot-password\` | Request password reset |
| \`/reset-password/[token]\` | Token-based password reset |
| \`/reset-password/demo-token\` | Demo/preview route |
| \`/2fa\` | Two-factor challenge/setup UI surface |

### 6.3 Dashboard and workspace routes

| Route | Purpose |
|---|---|
| \`/dashboard\` | Workspace dashboard |
| \`/dashboard/projects\` | Project list |
| \`/dashboard/projects/create\` | Project creation wizard |
| \`/dashboard/projects/[projectId]\` | Project overview |
| \`/dashboard/projects/[projectId]/files\` | Project files |
| \`/dashboard/projects/[projectId]/docs\` | Project documentation |
| \`/dashboard/projects/[projectId]/tasks\` | Project tasks |
| \`/dashboard/projects/[projectId]/team\` | Project team |
| \`/dashboard/projects/[projectId]/activity\` | Project activity |
| \`/dashboard/projects/[projectId]/analytics\` | Project analytics |
| \`/dashboard/projects/[projectId]/settings\` | Project settings |
| \`/dashboard/files\` | Workspace file manager |
| \`/dashboard/tasks\` | Workspace task board |
| \`/dashboard/notifications\` | Notification center |
| \`/dashboard/profile\` | User profile |
| \`/dashboard/settings\` | Workspace/user settings surface |
| \`/dashboard/team\` | Team overview |
| \`/dashboard/team/members\` | Team member management |
| \`/dashboard/team/activity\` | Team activity |
| \`/dashboard/team/calendar\` | Team calendar |
| \`/dashboard/analytics\` | Workspace analytics |

### 6.4 AI routes

| Route | Purpose |
|---|---|
| \`/dashboard/ai\` | AI hub |
| \`/dashboard/ai/chat\` | AI conversation |
| \`/dashboard/ai/code-generator\` | Code generation |
| \`/dashboard/ai/code-review\` | Code review |
| \`/dashboard/ai/docs-generator\` | Documentation generation |
| \`/dashboard/ai/bug-fixer\` | Bug-fixing assistance |
| \`/dashboard/ai/backend-generator\` | Backend blueprint generation |
| \`/dashboard/ai/sql-generator\` | SQL generation route |
| \`/dashboard/ai/history\` | AI history |

### 6.5 GitHub routes

| Route | Purpose |
|---|---|
| \`/dashboard/github\` | GitHub hub |
| \`/dashboard/github/repositories\` | Repository list |
| \`/dashboard/github/repositories/[repoId]\` | Repository detail |
| \`/dashboard/github/pull-requests\` | Pull requests |
| \`/dashboard/github/commits\` | Commit history |
| \`/dashboard/github/branches\` | Branches |
| \`/dashboard/github/releases\` | Releases |
| \`/dashboard/github/issues\` | Issues |

### 6.6 Editor, workflows, deployments, developer, and billing routes

| Route | Purpose |
|---|---|
| \`/dashboard/editor\` | Editor hub |
| \`/dashboard/editor/snippets\` | Snippet library |
| \`/dashboard/editor/playground\` | Code playground |
| \`/dashboard/workflows\` | Workflow list |
| \`/dashboard/workflows/create\` | Workflow builder |
| \`/dashboard/workflows/[id]\` | Workflow detail |
| \`/dashboard/deployments\` | Deployment list |
| \`/dashboard/deployments/[id]\` | Deployment detail |
| \`/dashboard/deployments/domains\` | Domain management |
| \`/dashboard/developer/api-keys\` | API key manager |
| \`/dashboard/developer/webhooks\` | Webhook manager |
| \`/dashboard/integrations\` | Integration catalog/surface |
| \`/dashboard/billing\` | Subscription dashboard |
| \`/dashboard/billing/history\` | Billing history |
| \`/dashboard/search\` | Dashboard search |
| \`/dashboard/feedback\` | Dashboard feedback surface |
| \`/dashboard/help\` | Dashboard help surface |

### 6.7 Admin routes

| Route | Purpose |
|---|---|
| \`/admin\` | Admin overview |
| \`/admin/users\` | User management |
| \`/admin/ai-usage\` | AI usage administration |
| \`/admin/subscriptions\` | Subscription administration |
| \`/admin/reports\` | Reports |
| \`/admin/audit-logs\` | Audit logs |

### 6.8 Route preservation rules

- Do not create new pages to solve an integration gap when an existing page is intended for that feature.
- Use the existing dynamic route parameter conventions: \`projectId\` for project-scoped pages and \`id\` where the existing route family already uses it.
- Keep public, auth, dashboard, and admin shells consistent with current routing behavior.
- If a route is currently a small placeholder or a wrapper into a shared component, document it as such; do not infer that it is complete from the file's existence.
- Any proposed route removal or addition requires explicit approval.

## 7. Frontend architecture and important files

### 7.1 Root and shell files

- \`app/layout.jsx\`: root layout and global metadata.
- \`app/globals.css\`: global styles, design tokens, and extensive UI styling.
- \`components/site-shell.jsx\`: public-site shell behavior.
- \`components/navbar.jsx\`: public navigation.
- \`components/footer.jsx\`: public footer and related local interactions.
- \`components/theme-toggle.jsx\`: theme toggle.
- \`components/header-copy.jsx\`: shared page heading/subheading block.
- \`components/ui-blocks.jsx\`: reusable public/marketing UI primitives.

### 7.2 Dashboard UI primitives

- \`components/dashboard-ui.jsx\`: shared dashboard components including skeletons, empty states, toasts, confirmation dialogs, stat cards, progress indicators, avatars, status badges, page headers, filter bars, and small charts.
- \`components/workspace-primitives.jsx\`: breadcrumb and drawer primitives.
- \`app/dashboard/layout.jsx\`: dashboard shell, navigation, auth check, top bar, menus, theme, and mobile sidebar behavior.
- \`app/admin/layout.jsx\`: admin shell.

Reuse these components where appropriate. Avoid parallel components with overlapping responsibility.

### 7.3 Domain component modules

- \`components/auth-ui.jsx\`: reusable auth presentation and form states.
- \`components/ai-ui.jsx\`: AI-specific interactive UI.
- \`app/dashboard/ai/chat/page.jsx\`: Phase 9 authenticated conversation list, message loading, send/retry/cancel state, copy, export, and honest unavailable-context UI using the shared AI components.
- \`components/remaining-pages.jsx\`: shared frontend-only implementations for several later product surfaces.
- \`components/final-pages.jsx\`: shared simulations for later workspace/integration surfaces.
- \`components/contact-form.jsx\`: contact form component.

These large shared page modules should be inspected before editing a route because a route file may delegate most of its implementation to one of them.

### 7.4 Data and API modules

- \`lib/data.js\`: public navigation, feature, pricing, post, stats, and footer data.
- \`lib/dashboard-data.js\`: dashboard fixtures including mock user, projects, tasks, activity, notifications, team members, files, analytics, and docs.
- \`lib/api.js\`: shared backend request wrapper and exported \`api\` methods, plus mock API helpers.
- \`lib/mock/ai.js\`: AI fixtures.
- \`lib/mock/analytics.js\`: analytics fixtures.
- \`lib/mock/deployments.js\`: deployment fixtures.
- \`lib/mock/domains.js\`: domain fixtures.
- \`lib/mock/github.js\`: GitHub fixtures.
- \`lib/mock/tasks.js\`: task fixtures.
- \`lib/mock/workspace.js\`: workspace fixtures.
- \`lib/mock/remaining-pages.js\` and \`lib/mock/final-pages.js\`: additional mock domain data.

### 7.5 API client rules

The existing \`lib/api.js\` wrapper:
- Uses \`NEXT_PUBLIC_API_URL\` or localhost backend fallback.
- Sends \`credentials: "include"\`.
- Parses JSON responses defensively.
- Throws an \`Error\` using the backend message or a generic fallback for non-success responses.
- Exposes auth methods for registration, login, logout, current user, password reset, email verification, and resend verification.
- Also exports mock helpers for AI, GitHub, project task/analytics fixtures, deployments, and domains.
- Phase 9 adds \`api.ai\` methods for configured models, conversations, messages, send, regenerate, update, and delete. The AI Chat route uses these methods and does not fall back to mock AI data.

When adding real APIs:
- Extend this client rather than creating a second generic client.
- Keep credentials and cookie behavior intact.
- Follow the existing error conventions unless a deliberate, tested improvement is needed.
- Do not turn failed network requests into successful mock responses.
- Avoid hard-coded localhost URLs outside the existing configuration fallback.
- Keep server-only secrets out of client bundles.

## 8. Backend architecture

### 8.1 Directory responsibilities

| Path | Responsibility |
|---|---|
| \`backend/src/app.js\` | Express middleware and route registration, including authenticated \`/api/ai\` routes |
| \`backend/src/server.js\` | Environment validation, database connection, HTTP/Socket.IO bootstrap, shutdown |
| \`backend/src/config/db.js\` | MongoDB connection lifecycle |
| \`backend/src/config/passport.js\` | OAuth strategy configuration |
| \`backend/src/config/redis.js\` | Redis client configuration |
| \`backend/src/config/imagekit.js\` | ImageKit configuration |
| \`backend/src/routes/\` | HTTP route definitions |
| \`backend/src/controllers/\` | Request/response handling |
| \`backend/src/services/\` | Business logic |
| \`backend/src/models/\` | Mongoose schemas/models |
| \`backend/src/middlewares/\` | Auth, validation, errors |
| \`backend/src/validators/\` | Zod request schemas |
| \`backend/src/utils/\` | API errors/responses, tokens, email, encryption, 2FA helpers |
| \`backend/src/__tests__/\` | Backend automated tests |

Follow the existing route → middleware/validation → controller → service → model pattern as it is established for the feature. Keep controllers thin and business rules in services.

### 8.2 Express middleware and security setup

The audited \`backend/src/app.js\` configures:
- Helmet.
- CORS with the configured frontend origin and credentials.
- Compression.
- JSON and URL-encoded parsing with a 1 MB limit.
- Cookie parsing.
- Passport initialization.
- Morgan request logging.
- An auth API rate limiter.
- \`GET /health\`.
- Auth routes under \`/api/auth\`.
- Not-found and centralized error handlers.

The server validates \`MONGO_URI\`, \`JWT_ACCESS_SECRET\`, and \`JWT_REFRESH_SECRET\` before starting. It connects to MongoDB and creates a Socket.IO server. Socket.IO currently emits a basic connection event; do not treat that bootstrap as complete real-time product functionality.

### 8.3 Existing auth API routes

The audited backend route file defines:

| Method | Path | Purpose |
|---|---|---|
| POST | \`/api/auth/register\` | Registration |
| POST | \`/api/auth/login\` | Login |
| POST | \`/api/auth/logout\` | Logout |
| POST | \`/api/auth/refresh-token\` | Refresh session tokens |
| GET | \`/api/auth/me\` | Authenticated current user |
| POST | \`/api/auth/forgot-password\` | Password reset request |
| POST | \`/api/auth/reset-password\` | Complete password reset |
| POST | \`/api/auth/verify-email\` | Verify email |
| POST | \`/api/auth/resend-verification\` | Resend verification |
| POST | \`/api/auth/2fa/setup\` | Start TOTP setup |
| POST | \`/api/auth/2fa/disable\` | Disable 2FA with verification |
| POST | \`/api/auth/2fa/status\` | Check/update 2FA status flow |
| POST | \`/api/auth/2fa/challenge\` | Complete 2FA challenge |
| GET | \`/api/auth/google\` | Start Google OAuth |
| GET | \`/api/auth/google/callback\` | Google OAuth callback |
| GET | \`/api/auth/github\` | Start GitHub OAuth |
| GET | \`/api/auth/github/callback\` | GitHub OAuth callback |
| GET | \`/api/auth/oauth/failure\` | OAuth failure redirect |

Confirm exact request/response contracts in validators, controllers, and services before changing an endpoint. The presence of OAuth routes does not prove that provider credentials are configured in a deployed environment.

### 8.4 AI Chat API (Phase 9 local branch)

All `/api/ai` endpoints require `requireAuth` and derive ownership from `req.user._id`. JSON responses use the existing `{ statusCode, data, message, success }` envelope.

| Method | Path | Contract |
|---|---|---|
| GET | `/api/ai/models` | Returns `{ configured, models: [{ id, name, provider }], availabilityMessage }`; Ollama models are listed only after checking local `/api/tags`. |
| GET | `/api/ai/conversations?search=` | Lists at most 100 owner conversations, ordered pinned first then most recently updated; optional title search. |
| POST | `/api/ai/conversations` | Body `{ model? }`; creates an empty conversation with the authenticated owner and `New chat` title. |
| GET | `/api/ai/conversations/:conversationId` | Reads owner conversation metadata. |
| PATCH | `/api/ai/conversations/:conversationId` | Body may contain `title` (1-120 chars) and/or `pinned` (boolean). |
| DELETE | `/api/ai/conversations/:conversationId` | Permanently deletes the owned conversation and its messages. |
| GET | `/api/ai/conversations/:conversationId/messages?limit=50&before=` | Returns ascending `{ messages, hasMore, nextBefore }`; limit 1-100; `before` is an ISO datetime cursor. |
| POST | `/api/ai/chat` | Body `{ conversationId, content, model, requestId }`; `requestId` is a UUID used for idempotent user-message retries. Returns persisted user/assistant messages, updated conversation, provider/model, and provider-reported usage only when available. |
| POST | `/api/ai/conversations/:conversationId/messages/:messageId/regenerate` | Body `{ model }`; regenerates the assistant response for its preceding user message and replaces the old response after success. |

Generation errors preserve the submitted user message for retry and do not persist a failed assistant completion. Common errors include 400 validation/model errors, 401 authentication, 404 for missing or non-owned conversations, 429 request/provider rate limits, 503 unconfigured/unavailable provider, and 504 provider timeout. Ollama and OpenAI use non-streaming JSON responses. Browser abort is passed to provider fetch; only completed assistant output is stored. The provider may continue work if upstream cancellation is not honored. The model-list endpoint checks the configured Ollama model against the local `/api/tags` response.

## 9. Authentication and session behavior

### 9.1 Principles

- The backend is the source of truth for authentication.
- Protected frontend routes must not silently fall back to a mock user.
- Use the existing JWT access/refresh token and cookie model; do not replace the auth architecture as part of an unrelated phase.
- Keep access and refresh secrets server-only.
- Apply validation to untrusted request bodies.
- Use generic, safe errors where detailed errors could leak sensitive account information.
- Clear/invalidate session state on logout and relevant security events.
- Ensure a 2FA-enabled account cannot bypass the challenge by calling a different login path.
- Never expose passwords, token hashes, encrypted TOTP secrets, recovery-code hashes, or other sensitive fields in public user payloads.

### 9.2 Existing implementation described by the project context

Phase 1 is documented as implementing:
- Registration and email/password login.
- Logout and refresh-token flows.
- Current-user endpoint and protected dashboard checks.
- Email verification and password reset flows.
- Google/GitHub Passport OAuth route hooks.
- TOTP 2FA setup and verification.
- Login challenge when 2FA is enabled.
- Recovery codes and protected 2FA disablement.
- Encrypted TOTP secret storage and filtering of sensitive user fields.
- Hashed recovery codes and brute-force protections.

The existing context reports the Phase 1 checks as passing: frontend lint/build, backend 2FA tests, and backend syntax checks. Treat those as recorded project history; rerun relevant checks after modifying auth.

### 9.3 Security checks for every protected resource

- Authenticate the request.
- Load the target record by identifier and constrain the query by the authenticated user's workspace/project access.
- Verify role/permission for the requested action.
- Validate and allowlist editable fields.
- Do not trust a client-supplied owner, workspace, or membership role.
- Test both allowed and denied paths.
- Avoid returning private records merely because an identifier is valid.
- Use consistent 401/403/404 semantics according to the established API convention without leaking cross-tenant data.

## 10. Database foundation and data relationships

### 10.1 Existing model inventory

The audited model index exports:
- \`User\`
- \`Workspace\`
- \`WorkspaceMember\`
- \`Project\`
- \`ProjectMember\`
- \`ProjectFile\`
- \`Document\`
- \`Task\`
- \`TaskComment\`
- \`Notification\`
- \`Activity\`

Phase 9 adds \`AIConversation\` and \`AIMessage\` (not workspace-scoped; private to their authenticated owner). Conversations store owner, title, selected model, pin state, and timestamps, with an owner/update ordering index. Messages reference a conversation and store \`user\`/\`assistant\` role, content, optional model, user retry UUID, optional parent user-message reference, and creation time. Indexes support ordered conversation history and unique per-conversation user request IDs. Conversation deletion explicitly deletes its messages first. No token costs or estimated usage are persisted.

The presence of a schema means the data shape has been started; it does not mean CRUD endpoints, authorization, UI wiring, storage, notifications, or business workflows are complete.

### 10.2 Core relationships

- A \`User\` is the canonical identity for authentication.
- A \`Workspace\` has an owner and is the tenant boundary for workspace-scoped product data.
- \`WorkspaceMember\` associates users with workspaces and roles.
- A \`Project\` belongs to a workspace and has an owner.
- \`ProjectMember\` associates users with a project and a project-level role.
- \`ProjectFile\` belongs to a project/workspace and records upload/storage metadata.
- \`Document\` belongs to a project/workspace and records authored content.
- \`Task\` belongs to a project/workspace and can reference its creator and assignee.
- \`TaskComment\` associates comments with task/user context.
- \`Notification\` targets a recipient and may include workspace/project references.
- \`Activity\` records an actor, workspace/project context, entity, action, and metadata.

Inspect each schema for the precise fields, enums, indexes, defaults, and validation before writing migrations or services.

### 10.3 Model-level details verified in source

**Workspace**
- Name, slug, description, owner, avatar, settings, timestamps.
- Slug is lowercase and constrained to a URL-friendly pattern.
- Owner references \`User\`.
- Workspace slug is unique.
- An owner/update-time index exists.

**Project**
- Name, slug, description, workspace, owner, status, visibility, repository metadata, settings, timestamps.
- Status enum includes \`active\`, \`planning\`, \`archived\`, and \`completed\`.
- Visibility enum includes \`private\`, \`internal\`, and \`public\`.
- Repository provider enum includes \`none\`, \`github\`, \`gitlab\`, and \`bitbucket\`.
- Slug is unique per workspace through a compound index.
- Workspace/status/update-time and owner/update-time indexes exist.

**WorkspaceMember / ProjectMember**
- These schemas model user membership and role within a workspace/project.
- The Phase 2 test explicitly creates unique compound indexes for workspace+user and project+user. Verify whether indexes are also declared in the model definitions and how production index creation is managed before relying on them operationally.

**Other supporting models**
- Project files, documents, tasks, comments, notifications, and activities are defined in the model directory.
- Consult each model file for full schema details; do not infer unlisted fields.

### 10.4 Data and tenancy rules

- Workspace scoping is a security boundary, not merely a UI filter.
- Queries and mutations must enforce workspace/project access.
- Validate all foreign-key references and role transitions.
- Use database uniqueness constraints for invariants that must survive concurrent requests.
- Handle duplicate-key errors and invalid ObjectIds cleanly.
- Define whether deletes are soft deletes, archive transitions, or permanent deletes; follow existing behavior and product requirements.
- Avoid cascading deletion until the data-retention policy is explicit and tested.
- Do not create duplicate models to support a feature already represented by an existing schema.

## 11. Mock-data inventory and integration policy

### 11.1 Current mock areas in remote main

The frontend includes:
- \`lib/dashboard-data.js\` with mock users, projects, tasks, activity, notifications, members, files, analytics, and docs.
- \`lib/mock/ai.js\`
- \`lib/mock/analytics.js\`
- \`lib/mock/deployments.js\`
- \`lib/mock/domains.js\`
- \`lib/mock/github.js\`
- \`lib/mock/tasks.js\`
- \`lib/mock/workspace.js\`
- \`lib/mock/remaining-pages.js\`
- \`lib/mock/final-pages.js\`
- \`mockApi\` helpers in \`lib/api.js\` that return fixtures with simulated delays.

Several remote-main project pages import \`mockProjects\`, \`getProjectByKey\`, \`mockActivity\`, \`mockFiles\`, or \`mockTasks\`. These imports are evidence that those specific page data flows are not yet fully integrated in that branch.

### 11.2 Integration labels to maintain

For each major page/widget, document its state using one of these labels:
- **Live:** uses a real backend/external API and handles errors.
- **Partial:** real data is used for some behavior while other widgets remain mocked.
- **Mock-only:** fixtures/simulated actions drive the UI.
- **Planned:** not implemented.
- **Blocked:** implementation depends on credentials, provider access, infrastructure, or an unresolved decision.

### 11.3 Migration process from mock to real data

1. Identify the page's current data imports and event handlers.
2. Identify the authoritative model, API contract, and authorization policy.
3. Implement or reuse backend routes/services/validators.
4. Extend the existing API client.
5. Replace mock reads/writes only for the approved feature scope.
6. Add loading, empty, error, success, and permission-denied states.
7. Test cross-user and cross-workspace access.
8. Remove obsolete mock imports from the migrated flow.
9. Keep unrelated mock areas unchanged and explicitly documented.
10. Update the integration matrix and \`PROJECT_CONTEXT.md\`.

Never mix a live API result with unrelated mock counts in a way that misrepresents the real product state.

## 12. Error handling, state, and UX behavior

### 12.1 Frontend states

Every real async page should handle:
- Initial loading.
- Empty dataset.
- Search/filter with zero matches.
- API failure/network failure.
- Unauthorized or expired session.
- Forbidden action.
- Missing/deleted record.
- Form validation failure.
- Successful mutation.
- Pending mutation and duplicate-submit prevention.

Use the existing dashboard UI components where they fit. Avoid inventing new error conventions in individual pages.

### 12.2 Backend behavior

- Use Zod validators for user-controlled input where consistent with the existing code.
- Keep business rules in services.
- Use the established API error/response utilities and centralized error handler.
- Validate identifiers and enum values.
- Return appropriate status codes.
- Do not log secrets, tokens, password reset values, or sensitive personal data.
- Handle database duplicate-key and validation errors explicitly.
- Apply rate limiting to sensitive endpoints.
- Ensure failure paths do not leave partial data mutations.

## 13. Environment variables and local setup

### 13.1 Frontend setup

From repository root:

\`\`\`bash
npm install
npm run dev
\`\`\`

The frontend development server normally runs at \`http://localhost:3000\`.

Frontend scripts in the audited root package:
- \`npm run dev\`
- \`npm run build\`
- \`npm run start\`
- \`npm run lint\`

Use the package scripts as the source of truth. If a script fails because of a framework-version change, inspect the current toolchain and make a narrowly scoped fix only when authorized.

### 13.2 Backend setup

\`\`\`bash
cd backend
npm install
\`\`\`

Create \`backend/.env\` from \`backend/.env.example\`, fill the required local values, then run:

\`\`\`bash
npm run dev
\`\`\`

The backend normally runs at \`http://localhost:5000\`.

Health check:
\`\`\`text
GET http://localhost:5000/health
\`\`\`

Backend test command:
\`\`\`bash
npm test -- --runInBand
\`\`\`

The package script uses Jest through Node's experimental VM modules. If the command differs in a local environment, inspect the package script before changing it.

### 13.3 Environment variable groups

The backend example includes:
- \`PORT\`, \`NODE_ENV\`
- \`MONGO_URI\`
- \`JWT_ACCESS_SECRET\`, \`JWT_REFRESH_SECRET\`
- \`ACCESS_TOKEN_EXPIRY\`, \`REFRESH_TOKEN_EXPIRY\`
- \`FRONTEND_URL\`
- SMTP host, port, username, password, sender
- Google OAuth client ID, secret, callback URL
- GitHub OAuth client ID, secret, callback URL
- ImageKit public/private keys and URL endpoint
- \`REDIS_URL\`

Phase 8/9 AI configuration is optional and server-only. \`AI_PROVIDER\` supports \`ollama\` (default) and \`openai\`; the default model is \`qwen3:1.7b\` for Ollama and \`gpt-4o-mini\` for OpenAI. \`AI_API_KEY\` is required only for OpenAI. \`AI_REQUEST_TIMEOUT_MS\`, \`AI_MAX_INPUT_LENGTH\`, \`AI_MAX_OUTPUT_LENGTH\`, and \`AI_MAX_OUTPUT_TOKENS\` remain bounded server settings. Missing/unavailable Ollama or a model that is not installed is reported by \`/api/ai/models\`; generation returns a safe service-unavailable error. Never expose these values through \`NEXT_PUBLIC_*\`.

The 2FA implementation also uses an encryption key setting in test/runtime logic; inspect the current encryption utility and deployment config for its exact name and production requirements.

Never add real credentials to this document, source control, logs, or client-side code. Use placeholders only.

## 14. Coding conventions and safe implementation workflow

### 14.1 Before coding

1. Read this document.
2. Confirm the current branch and Git status.
3. Confirm the target phase and its acceptance criteria.
4. Inspect target files and all relevant callers/imports.
5. Inspect existing models, route conventions, auth middleware, validation, error utilities, and tests.
6. Check whether the desired helper/API/model already exists.
7. Identify exactly which files should change.
8. If the scope conflicts with these rules or requires a new route/page, stop and ask for approval.

### 14.2 While coding

- Keep changes limited to the approved phase.
- Follow JavaScript/JSX and existing module conventions.
- Prefer small, reusable service functions over large controllers.
- Validate input at the backend boundary.
- Enforce authorization at the backend for every read and mutation.
- Preserve cookies, refresh behavior, route conventions, and existing UI.
- Do not add dependencies unless a real requirement cannot be met by existing tools and approval is obtained.
- Do not introduce hard-coded secrets, fake success responses, silent mock fallbacks, or hidden destructive behavior.
- Keep accessibility and responsive behavior intact.

### 14.3 After coding

1. Inspect \`git diff --check\`.
2. Inspect \`git diff --stat\` and the full diff.
3. Run relevant tests, lint, and production build.
4. Manually verify the affected user journey and failure paths.
5. Verify auth and cross-tenant access for protected APIs.
6. Update this document with only verified outcomes.
7. Report changed files, tests/commands, results, limitations, and any deferred items.
8. Do not merge until the branch is reviewed and acceptance criteria pass.

## 15. Git and change-control workflow

- Use a dedicated feature branch for each phase.
- Start the branch from the latest updated \`main\), after the preceding phase has been merged and verified.
- Do not work on \`main\` for feature implementation.
- Before switching branches, check for uncommitted work and preserve it.
- Never force-push, reset hard, clean untracked files, or discard changes without explicit approval.
- Stage only intended files; do not blindly use \`git add .\` when unrelated changes may exist.
- Review the entire diff before committing.
- Use a clear commit message describing the phase/feature.
- Push the feature branch and open a pull request into \`main\`.
- Merge only after tests, build/lint, diff review, and acceptance criteria pass.
- After merge, update local \`main\) and create the next feature branch from it.
- Do not automatically start the next phase before the previous phase is merged and tested.

Suggested branch names:
- \`feature/phase-0-frontend-cleanup\`
- \`feature/phase-1-auth\`
- \`feature/phase-2-database\`
- \`feature/phase-3-workspace-projects\`
- \`feature/phase-4-files-docs\`
- Continue the same naming pattern for later phases.
- Use \`docs/\` branches for documentation-only changes.

## 16. Test strategy and acceptance standards

### 16.1 Required validation categories

- Unit tests for business rules.
- Model validation and uniqueness tests.
- API tests for success, invalid input, missing auth, insufficient permissions, and missing records.
- Cross-user and cross-workspace authorization tests.
- Frontend lint.
- Production build.
- Manual testing of the affected UI journey.
- Regression checks for auth, routing, theme, and shared components when relevant.
- Integration tests for external providers where credentials/test environments are available.

### 16.2 Security cases

For each protected resource, test:
- No access token/cookie.
- Expired or invalid session.
- Authenticated user with no membership.
- Member with read-only role attempting a write.
- Valid member performing an allowed action.
- User supplying another user's workspace/project ID.
- Invalid ObjectId or malformed request.
- Duplicate slug or uniqueness conflict.
- Resource deleted/archived during an operation.
- External provider failure or timeout, where relevant.

### 16.3 Documentation of test results

Record:
- Exact command.
- Test count and pass/fail result if available.
- Any skipped tests.
- Whether the test requires MongoDB, Redis, provider credentials, or another service.
- Known failures and whether they predate the current change.

Do not turn a successful build into a claim that the product flow has been fully tested.

## 17. Feature status matrix

Maintain this matrix as phases are delivered. Status values must be updated from source and test evidence.

| Domain | Existing UI | Backend/data foundation | Integration status on audited remote main |
|---|---|---|---|
| Public/marketing | Present | Not central to backend | Mostly static/local interactions; verify forms individually |
| Authentication | Present | Auth services/models/routes | Documented as Phase 1 complete; retest after auth changes |
| Workspace/project core | Present | Models exist | Project pages still mock-based on audited remote main; Phase 3 reported locally |
| Files | Present | ProjectFile model and upload dependency | Not verified end-to-end |
| Documents | Project docs UI exists | Document model | Not verified end-to-end |
| Tasks/comments | Task UI exists | Task and TaskComment models | Not verified end-to-end |
| Team/membership | Team UI exists | WorkspaceMember/ProjectMember models | Not verified end-to-end |
| Activity | UI exists | Activity model | Not verified end-to-end |
| Notifications | UI exists | Notification model | Not verified end-to-end |
| Real-time | Existing server bootstrap | Socket.IO dependency | Basic connection only; product events not verified |
| GitHub | Pages and mock data | OAuth hooks exist for login, not necessarily repository authorization | Live repository integration not verified |
| AI | Multiple UI surfaces | Phase 8 provider abstraction and Phase 9 chat models/routes exist on local feature branch | Chat persistence and mocked-provider flow tested; live provider/browser verification incomplete. Other AI tools remain mock/demo-only. |
| Editor/playground | UI exists | Safe execution backend not confirmed | Not production-ready until sandbox/security design is verified |
| Workflows/jobs | UI exists | BullMQ/Redis dependencies | Durable execution not verified |
| Deployments/domains | UI exists | External provider integration not confirmed | Mock/demo behavior until proven otherwise |
| API keys/webhooks | UI routes exist | Secure key lifecycle not confirmed | Not verified end-to-end |
| Billing | UI exists | Payment provider integration not confirmed | Not verified end-to-end |
| Admin | UI routes exist | Admin authorization/audit behavior not verified | Not verified end-to-end |
| Production release | N/A | Deployment configuration needs review | Planned |

## 18. Approved implementation roadmap: Phases 0–24

The core UI/page count is frozen. This roadmap is about making existing pages and flows work; it is not permission to add new pages. Each phase must begin from the merged and tested result of the previous phase. Phase scope may be refined after inspecting the code, but a phase must not silently absorb unrelated future work.

### Phase 0 — Frontend baseline and cleanup

**Goal:** Establish a stable baseline for the already-designed UI.

Scope:
- Audit all existing routes and shared layouts.
- Fix broken imports, runtime errors, route mismatches, responsive defects, and obvious accessibility issues.
- Normalize loading, empty, error, and confirmation patterns where necessary.
- Confirm theme behavior and design tokens.
- Identify mock data and fake async actions.
- Establish repeatable lint/build checks.
- Keep the existing page inventory frozen.

Acceptance:
- Existing routes render without avoidable crashes.
- Shared shell and navigation remain consistent.
- Lint/build baseline is recorded.
- A mock/integration inventory exists.
- No new pages/routes are introduced.

Status: The UI and route inventory are present. Do not assume every possible cleanup criterion has been re-run recently; validate before declaring the phase fully closed.

### Phase 1 — Authentication and account security foundation

**Goal:** Make existing auth pages use real server-backed identity and secure session behavior.

Scope:
- Registration and login.
- Email verification and resend.
- Forgot/reset password.
- Logout and refresh-token lifecycle.
- Current-user endpoint and protected dashboard access.
- Google/GitHub OAuth hooks with real configuration checks.
- TOTP 2FA setup, challenge, recovery codes, and secure disablement.
- Safe public user payloads and auth rate limits.
- Remove mock-user fallback from protected routes.

Acceptance:
- Auth state comes from the backend.
- Protected pages redirect or show auth errors correctly.
- Cookie/session lifecycle works.
- 2FA cannot be bypassed.
- Sensitive fields are never exposed.
- Auth tests, lint, and build pass.

Status: Existing project context records Phase 1 as verified complete, including a reported 5-test 2FA suite and frontend lint/build. Re-run after any auth changes and validate provider configuration in the target environment.

### Phase 2 — Database foundation

**Goal:** Establish schemas and relationships for workspace-scoped features.

Scope:
- User compatibility with existing auth.
- Workspace and WorkspaceMember.
- Project and ProjectMember.
- ProjectFile and Document.
- Task and TaskComment.
- Notification and Activity.
- Required field/enums/indexes/timestamps.
- MongoDB connection lifecycle and model tests.

Acceptance:
- Schemas validate expected and invalid data.
- References and uniqueness rules are tested.
- Auth model remains compatible.
- Test database lifecycle is clean.
- No feature CRUD API is claimed merely because a model exists.

Status: The model files and Phase 2 model tests are present on audited remote main. Existing project context records this phase as the database foundation.

### Phase 3 — Workspace and project lifecycle

**Goal:** Connect the existing dashboard/project core to authenticated, persisted data.

Scope:
- Workspace initialization/selection using the existing workspace models and auth context.
- Dashboard summary from real data.
- Project list with real pagination/search/filter/sort only where supported by the existing UI and approved requirements.
- Create project through the existing creation wizard.
- Load project overview using the real database ID.
- Update project fields supported by the current UI.
- Archive, restore, and delete according to explicit policy.
- Workspace/project membership authorization.
- Duplicate slug handling and safe error states.
- Extend \`lib/api.js\`; do not create a second API client.
- Keep existing page layout and UI.

Explicit exclusions:
- Do not build new pages.
- Do not fully integrate every project subview in this phase.
- Do not invent GitHub connection success or team invites.
- Do not implement tasks, files, docs, AI, analytics pipelines, or deployment integrations ahead of their phases.

Acceptance:
- Create → list → detail uses a persisted record.
- Mutations are authorized and persisted.
- Dashboard counts are based on real data.
- Duplicate slug/access cases are tested.
- Unauthorized and cross-workspace access is denied.
- Backend tests, lint, and production build pass.
- \`PROJECT_CONTEXT.md\) is updated.

Status: Reported locally complete by the developer with 11/11 backend tests, lint, and build passing. The implementation was not present in the remote \`main\` tree inspected for this document. Verify the branch/push/merge state and re-audit actual source before treating remote main as complete.

### Phase 4 — Workspace/project files and documentation

**Goal:** Turn existing file and document pages into real persisted workflows.

Scope:
- Project and workspace file listing.
- Upload/download/delete with authorization.
- Integrate the existing ImageKit configuration or another approved storage mechanism.
- Validate file size, MIME type, names, and ownership.
- Store storage metadata in ProjectFile.
- Connect existing project files and docs pages.
- Persist document content and metadata through Document.
- Support Markdown safely and preserve existing editor/viewer UI.
- Add file/document audit activity where appropriate.

Acceptance:
- Files and docs persist across reloads.
- Users cannot read or delete another workspace's files.
- Storage failures are handled.
- Upload validation and limits are tested.
- Existing mock file/document data is removed only from migrated flows.

### Phase 5 — Tasks and team collaboration

**Goal:** Connect existing task and team pages to real workspace/project data.

Scope:
- Task create/read/update/delete and status/priority transitions.
- Task assignment, labels, due dates, and project/workspace scope as supported by existing UI/models.
- Task comments and activity.
- Workspace/project member listing and role-aware UI.
- Invitations only when the backend email/token flow is actually implemented.
- Permission rules for owner/admin/editor/viewer or the role vocabulary actually present in the models.
- Synchronize task counts and dashboard summaries from persisted records.

Acceptance:
- Task and membership changes persist.
- Roles are enforced server-side.
- Invalid assignments and cross-workspace references are rejected.
- Tests cover task transitions and permissions.
- Existing task/team pages are reused.

### Phase 6 — Real-time collaboration

**Goal:** Upgrade the existing Socket.IO bootstrap into secure, scoped product events.

Scope:
- Authenticate socket connections using the established session model.
- Authorize workspace/project room joins.
- Define named events for approved task, activity, notification, and collaboration updates.
- Join/leave rooms safely and clean up disconnects.
- Avoid leaking events across tenants.
- Provide reconnect and stale-data behavior on the frontend.
- Use persisted database state as the source of truth; socket messages are notifications, not authorization.

Acceptance:
- Only authorized members receive scoped events.
- Reconnect behavior is reliable.
- Duplicate events do not create duplicate records.
- Integration tests cover room authorization and tenant isolation.
- No new page is needed to add real-time behavior to existing views.

### Phase 7 — GitHub integration

**Goal:** Connect existing GitHub pages to the actual GitHub API and user-authorized repositories.

Scope:
- Distinguish app login OAuth from GitHub repository authorization; do not assume auth OAuth grants required scopes for all product actions.
- Secure provider connection/token storage and revocation.
- Repository list/detail, branches, commits, pull requests, issues, and releases as supported by current pages.
- Repository linking/import to an existing project.
- Rate-limit, pagination, API error, and permission handling.
- Store only the minimum necessary provider metadata.
- Do not expose access tokens to the browser.

Acceptance:
- Lists/detail pages display real GitHub data for the connected account.
- Token permissions and revoked connections are handled.
- No mock data is shown as live data.
- OAuth scopes and token storage are reviewed for security.

### Phase 8 — AI infrastructure and provider abstraction

**Goal:** Build a secure backend foundation for AI features without coupling the UI to one provider.

Scope:
- Define provider/service interfaces and server-side configuration.
- Validate prompts and bound request sizes.
- Establish model selection, timeout, retry, error, and cancellation behavior.
- Protect provider keys on the server.
- Define workspace/project context authorization.
- Add usage/cost metadata and observability.
- Add safe handling for provider outages and rate limits.

Acceptance:
- AI calls are server-side.
- Secrets never enter client bundles or logs.
- Provider errors and timeouts are handled.
- Usage can be attributed to the authenticated user/workspace.
- No fabricated output is returned as a successful live AI result.

### Phase 9 — AI chat

**Goal:** Connect the existing AI chat page to a real conversation service.

**Current local branch status (2026-10-28):** Implemented; mocked tests pass and local Ollama/Qwen inference is verified. Manual browser verification remains incomplete; live OpenAI behavior is not tested.

Scope:
- Conversation creation/list/detail and message persistence if supported by the approved design.
- Prompt submission and streamed or ordinary responses based on the chosen provider capabilities.
- Context inclusion only for resources the user may access.
- Conversation rename/delete and history behavior where already present in UI.
- Error, retry, cancel, and loading states.
- Safe rendering of Markdown/code output.

Acceptance:
- Conversation history persists as designed.
- Access checks prevent reading another user's/workspace's chats.
- Provider errors are visible and recoverable.
- Streaming, if implemented, handles cancellation/disconnect correctly.

### Phase 10 — AI developer tools

**Goal:** Integrate existing AI tools with actual model-backed endpoints.

Scope:
- Code generator.
- Code review.
- Documentation generator.
- Bug fixer.
- Backend blueprint generator.
- SQL generator.
- Validate input and output formats per tool.
- Keep user prompts and generated artifacts associated with the right user/project.
- Require confirmation before applying destructive or repository-changing actions.
- Do not claim a generated result is tested or executed unless that work actually occurred.

Acceptance:
- Each existing tool calls a real backend service.
- Results, failures, and usage are recorded appropriately.
- Generated content is presented safely.
- Tool-specific validation and tests pass.
- Existing AI pages are retained.

**Local implementation status note (2026-10-30):** Phase 10 has a partial implementation audit in section 3.4.13. Preserve this original roadmap and acceptance list; usage persistence and remaining verification are outstanding.

### Phase 11 — AI history, usage, and analytics

**Goal:** Persist AI runs and provide truthful usage/history views.

Scope:
- AI run metadata and history.
- User/workspace usage totals and filters.
- Cost/token data only when returned or calculated from reliable provider metadata.
- Failure states and retention policy.
- Connect existing history and analytics surfaces.
- Distinguish estimates from provider-reported values.

Acceptance:
- History reflects actual persisted runs.
- Usage totals reconcile with stored events.
- No fake metrics are presented as production analytics.
- Access is scoped to the relevant user/workspace/admin permissions.

### Phase 12 — Editor and playground

**Goal:** Make existing editor/snippet/playground experiences useful without introducing unsafe execution.

Scope:
- Persist snippets and supported editor artifacts.
- Connect existing editor and playground views to the required data services.
- Define language/runtime support.
- If code execution is offered, use an isolated, resource-limited sandbox/service.
- Enforce execution timeout, memory/CPU limits, network restrictions, output limits, and cleanup.
- Never execute arbitrary user code directly inside the main web server process.
- Provide clear execution status and error output.

Acceptance:
- Snippets persist and respect permissions.
- Code execution, if offered, is isolated and bounded.
- Unsupported runtimes are clearly identified.
- Abuse cases and resource exhaustion are tested.

### Phase 13 — Workflows

**Goal:** Connect the existing workflow list, builder, and detail routes to persisted workflow definitions.

Scope:
- Workflow CRUD and versioned definitions as appropriate.
- Validate node/step types and transitions.
- Define trigger and execution semantics.
- Add run history, status, logs, retry, and cancellation where supported.
- Restrict secrets and credentials from ordinary workflow payloads.
- Keep the existing workflow UI and route structure.

Acceptance:
- Workflow definitions persist.
- Invalid definitions cannot be executed.
- Execution state is observable.
- Access is authorized.
- Failed runs can be diagnosed without exposing secrets.

### Phase 14 — Background jobs, Redis, and BullMQ

**Goal:** Introduce durable asynchronous processing for suitable long-running tasks.

Scope:
- Configure Redis for local/test/production environments.
- Define queues, workers, retry/backoff, idempotency, concurrency, and dead-letter/failure handling.
- Use jobs for approved work such as AI tasks, imports, deployment tasks, or workflow runs.
- Keep request handlers responsive and prevent duplicate jobs.
- Record job state in a way the UI can query.
- Gracefully handle Redis outage and worker shutdown.

Acceptance:
- Jobs survive normal process restarts according to queue guarantees.
- Retries do not duplicate side effects.
- Queue and worker failures are observable.
- Secrets are not written to job logs.
- Resource limits and queue authorization are defined.

### Phase 15 — Deployments and domains

**Goal:** Replace deployment/domain mock actions with real provider-backed workflows.

Scope:
- Choose and document supported deployment providers.
- Secure provider credentials.
- Create/list/detail/cancel deployment actions only where provider APIs support them.
- Persist deployment status, logs/metadata, and timestamps.
- Domain add/verify/remove workflows.
- DNS/verification status and provider error handling.
- Use background jobs for long-running deployments where appropriate.
- Do not report success until the provider confirms it.

Acceptance:
- Deployment status reflects provider state.
- Failed and cancelled deployments are represented correctly.
- Domain verification is real.
- Access and credentials are scoped and protected.
- Existing deployment/domain pages are reused.

### Phase 16 — API keys, webhooks, and integrations

**Goal:** Make existing developer API key/webhook/integration surfaces secure and functional.

Scope:
- Generate high-entropy keys and show plaintext only once where applicable.
- Store hashes rather than reusable plaintext secrets when feasible.
- Support scoped permissions, last-used metadata, expiry/rotation, and revocation.
- Authenticate API requests and rate-limit them.
- Sign outgoing webhooks, support retries, and prevent replay where appropriate.
- Store integration credentials securely.
- Log security-relevant events without leaking credentials.

Acceptance:
- Revoked keys stop working.
- Scopes are enforced.
- Webhook delivery attempts and failures are observable.
- Secrets are not returned in subsequent API responses.
- API documentation matches implementation.

### Phase 17 — Billing and usage limits

**Goal:** Connect existing billing pages to a real billing provider only after the product's plans and entitlements are specified.

Scope:
- Confirm plans, pricing, trial rules, and entitlements before implementation.
- Provider customer/subscription lifecycle.
- Checkout and billing portal integration.
- Webhook signature verification and idempotent processing.
- Invoice/history data.
- Usage metering and entitlement enforcement.
- Graceful behavior for failed payments, cancellation, and plan changes.
- Never store raw payment card details.

Acceptance:
- Subscription status comes from the provider and verified webhook events.
- Entitlements are enforced on the backend.
- Billing history is not fabricated.
- Webhook retries do not double-apply changes.
- Billing access is properly authorized.

### Phase 18 — Notifications

**Goal:** Connect the existing notification center to real events and persisted notification data.

Scope:
- Notification creation for approved events.
- List, pagination, read/unread state, mark read, and supported bulk actions.
- Realtime delivery using Phase 6 where applicable.
- Email notifications only where user preferences and email configuration permit.
- Preferences, deduplication, and retention policy as required.

Acceptance:
- Notifications persist and reflect actual events.
- Read state survives reload.
- Users only see their own notifications.
- Delivery failures do not break the primary product action.

### Phase 19 — Admin and audit workflows

**Goal:** Make existing admin pages secure and data-backed.

Scope:
- Explicit admin authorization and least privilege.
- User management actions with safeguards.
- AI usage/subscription reports based on reliable data.
- Audit logs for sensitive admin and security actions.
- Pagination/filtering and safe export where appropriate.
- Confirmation and reason capture for destructive/sensitive actions.
- Prevent ordinary users from reaching admin APIs by changing frontend URLs.

Acceptance:
- Backend verifies admin permissions on every route.
- Sensitive actions create audit records.
- Reports are derived from real data.
- Cross-tenant access and privilege escalation are tested.

### Phase 20 — Security hardening

**Goal:** Perform a dedicated application security pass after major features exist.

Scope:
- Authentication/session/cookie configuration review.
- Authorization matrix and IDOR testing.
- Input validation, output encoding, XSS/CSRF/CORS review as applicable.
- Rate limiting and abuse controls.
- Upload/storage security.
- OAuth/token handling and secret management.
- Dependency audit and security headers.
- SSRF and command/code execution review for AI, repository, webhook, and playground functionality.
- Logging/privacy/data-retention review.
- Backup, restore, and incident-response considerations.

Acceptance:
- High-risk findings are fixed or explicitly documented with an owner/plan.
- Security tests cover core tenant boundaries.
- Production secrets are configured outside source control.
- No critical known issue is silently waived.

### Phase 21 — Comprehensive testing and regression

**Goal:** Test the whole product as an integrated system.

Scope:
- Unit tests for services and utilities.
- API integration tests.
- Auth and role matrix.
- End-to-end tests for signup → workspace/project → core project lifecycle.
- Files/docs/tasks/team tests.
- GitHub/AI/workflow/deployment provider tests using safe test environments.
- Failure, retry, timeout, and expired-session cases.
- Responsive and accessibility regression.
- Stable test fixtures and cleanup.

Acceptance:
- Critical user journeys have repeatable tests.
- Tests are deterministic enough for CI.
- Failed/skipped tests are reported honestly.
- Core build/lint/test checks run before merge.

### Phase 22 — Performance and reliability

**Goal:** Improve responsiveness and operational resilience after the core product is integrated.

Scope:
- Profile slow API/database paths.
- Add appropriate indexes and pagination.
- Avoid unbounded queries and oversized payloads.
- Optimize expensive frontend rendering and bundle size based on evidence.
- Cache only data with a clear invalidation/authorization strategy.
- Add request/job timeouts and bounded retries.
- Add structured logs and health/readiness checks.
- Establish basic performance budgets and load tests for critical flows.

Acceptance:
- Optimizations are evidence-based.
- No tenant-specific data leaks through shared caching.
- Slow/failing dependencies degrade gracefully.
- Measured results and remaining bottlenecks are documented.

### Phase 23 — Production deployment and operations

**Goal:** Deploy the frontend, backend, database, Redis/workers, and external integrations reliably.

Scope:
- Select deployment targets and document service boundaries.
- Configure environment variables/secrets in the deployment platform.
- Configure production CORS, cookies, HTTPS, callback URLs, and trusted proxies.
- Provision MongoDB and Redis with access control/backups.
- Configure worker processes and graceful shutdown.
- Add health/readiness monitoring, logs, alerts, and rollback process.
- Validate email/OAuth/ImageKit/AI/GitHub/deployment/billing provider credentials in production.
- Add database backup/restore and incident response basics.

Acceptance:
- Production build and smoke tests pass.
- Auth cookies and callbacks work over HTTPS.
- Secrets are not exposed.
- Critical dependencies are monitored.
- Rollback and recovery steps are documented.

### Phase 24 — Portfolio polish and release readiness

**Goal:** Present DevFlow AI as a credible, demonstrable portfolio product.

Scope:
- Verify the full product journey with realistic seeded/demo data that is clearly identified.
- Remove misleading placeholder success states from completed features.
- Review accessibility, responsive behavior, copy, empty/error states, and visual consistency.
- Prepare architecture diagram and feature documentation.
- Document real limitations honestly.
- Prepare screenshots/demo video and a clear project README.
- Add deployment links and setup instructions without exposing secrets.
- Ensure the project story emphasizes engineering decisions, security, testing, and trade-offs rather than page count.

Acceptance:
- A reviewer can understand the architecture and run the project.
- Demo flows work reliably.
- Real integrations are distinguished from previews/mocks.
- Known limitations are documented.
- The portfolio presentation matches the actual implementation.

## 19. Phase execution contract

Every phase must have a short execution plan before coding:
- Objective and user-visible outcome.
- Files/routes/models/APIs likely involved.
- Existing code to reuse.
- Data and authorization rules.
- Explicit in-scope and out-of-scope items.
- Tests and manual verification.
- Documentation updates.
- Acceptance criteria.

After a phase:
- Mark only verified items complete.
- Update feature integration statuses.
- Record exact test/build/lint results.
- List unresolved defects and deferred work.
- Review the full diff.
- Commit/push/open a PR only when authorized.
- Merge only after the phase passes review and required validation.
- Create the next branch from the newly updated main.

## 20. Current next steps

The ordered list below records the remote-main/Phase 3 reconciliation recommendation from an earlier audit. On the current `feature/phase-9-ai-chat` checkout, Phase 9 is implemented as recorded in section 3.4.12. First configure the backend AI provider and manually verify chat creation, persistence after refresh, model availability, provider failure, and cancellation. Then proceed to Phase 10 (AI developer tools) as defined above. Phase 9 does not complete Phase 10 or Phase 11.

1. Reconcile the developer-reported Phase 3 local implementation with the remote repository. The audited remote \`main\) currently shows the earlier mock-based project pages and does not include the reported project API/service/test files.
2. Ensure Phase 3 is pushed or merged through the agreed feature-branch workflow, not by silently editing main.
3. Re-audit the actual Phase 3 service, controller, routes, API client, dashboard/list/create/detail pages, tests, and updated documentation.
4. Confirm tests and build/lint results from the branch that actually contains those files.
5. Once Phase 3 is merged and tested, create a fresh branch for Phase 4.
6. Phase 4 should focus on existing file/document pages and their current models; do not add new pages.

## 21. Documentation maintenance checklist

When updating this file:
- Preserve useful existing context and route inventory.
- Correct outdated statements only after checking source code.
- Separate source-verified facts, user-reported local work, and planned work.
- Update the phase status and feature matrix.
- Update API/model details when they change.
- Record tests only if they were actually run.
- Document any mock-only subviews and unresolved integration gaps.
- Never include secrets or private credentials.
- Avoid arbitrary line-count targets; optimize for correctness, navigability, and usefulness to the next developer/agent.
- Keep the file detailed enough to prevent accidental architecture changes, but link to focused reference documents if it grows unwieldy.

---

## Appendix A — High-value files for a coding agent to inspect

### Frontend
- \`app/layout.jsx\`
- \`app/globals.css\`
- \`app/dashboard/layout.jsx\`
- \`app/dashboard/page.jsx\`
- \`app/dashboard/projects/page.jsx\`
- \`app/dashboard/projects/create/page.jsx\`
- \`app/dashboard/projects/[projectId]/page.jsx\`
- \`components/dashboard-ui.jsx\`
- \`components/workspace-primitives.jsx\`
- \`components/auth-ui.jsx\`
- \`components/ai-ui.jsx\`
- \`lib/api.js\`
- \`lib/dashboard-data.js\`
- \`lib/mock/\`

### Backend
- \`backend/src/app.js\`
- \`backend/src/server.js\`
- \`backend/src/config/db.js\`
- \`backend/src/config/passport.js\`
- \`backend/src/config/redis.js\`
- \`backend/src/config/imagekit.js\`
- \`backend/src/routes/auth.routes.js\`
- \`backend/src/controllers/auth/auth.controller.js\`
- \`backend/src/services/auth/auth.service.js\`
- \`backend/src/middlewares/auth.js\`
- \`backend/src/middlewares/validate.js\`
- \`backend/src/middlewares/errorHandler.js\`
- \`backend/src/validators/auth.validator.js\`
- \`backend/src/models/\`
- \`backend/src/utils/\`
- \`backend/src/__tests__/\`

## Appendix B — Important implementation reminders

- A route is not a feature completion signal.
- A model is not a CRUD API.
- An OAuth login provider is not automatically a GitHub repository integration.
- Socket.IO bootstrap is not full realtime collaboration.
- Installed Redis/BullMQ dependencies are not a running job system.
- An AI UI is not a model-backed AI service.
- A deployment mock is not a real deployment.
- A billing page is not a billing integration.
- A green build does not prove authorization correctness.
- A mock fallback must not disguise API failure.
- Existing pages are the product surface; integrate them instead of growing the route count.
- Update this context after every phase so the next implementation begins from an accurate baseline.

### 3.4.5 Phase 6 — Real-Time Collaboration (local branch audit, 2026-10-26)

**Status: Partial — core task, project activity, and notification flows are implemented; team membership and workspace activity integration remain incomplete.** This audit describes the local branch `feature/phase-6-realtime-system`. It does not revise the historical remote-main audit above.

#### Verified implementation

- Socket.IO is attached to the existing Express HTTP server in `backend/src/server.js`; the `/health` endpoint and existing MongoDB lifecycle remain on the same server.
- `FRONTEND_URL` is now required at backend startup and is used for CORS and Socket.IO origin checks. The browser client uses existing `NEXT_PUBLIC_API_URL` and the HTTP-only access-token cookie; no token is placed in a URL or socket payload.
- Handshakes verify the access JWT with the existing verifier and load the user from MongoDB. The server joins the user room and only those workspace/project rooms found from that user's ownership or membership records. Room access is reconciled every 30 seconds; revocation can therefore take up to that interval to remove an already-connected socket.
- Access-token expiry disconnects the socket. The shared client reconnects and invokes the existing authenticated `/me` API path, which can refresh through the existing HTTP-only refresh cookie.
- Task create, update, delete, and comment controller flows publish after the service has completed persistence. Task activity uses the existing `Activity` model and is emitted to authorized workspace/project rooms. Notifications reuse the existing `Notification` model and are persisted before delivery to the recipient's user room for task assignment changes and comments to task participants.
- `GET /api/projects/:projectId/activity` reads persisted activity after project authorization. The notification API supports listing, marking read/unread, marking all read, and deletion, with ownership scoped to the authenticated recipient.
- Existing workspace and project task boards listen to task events and refetch from REST after events/reconnects. The project activity page loads persisted activity and reconciles on `activity.created`. The notification center and dashboard notification indicator load persisted records and listen for notification events. No route or navigation item was added.

#### Event contract

Domain event names are centralized in `backend/src/realtime/events.js`. Events use an event ID, type, ISO timestamp, workspace/project scope, actor summary, resource summary, and minimum event data where applicable.

| Event | Delivery | Purpose/data |
|---|---|---|
| `connection.ready` | Connecting socket | Authenticated user ID and connection timestamp. |
| `task.created`, `task.updated`, `task.deleted` | Authorized workspace and project rooms | Task ID and summary (title, status, priority, assignee summary, update timestamp); deletion is emitted only after deletion succeeds. |
| `task.comment.created` | Authorized workspace and project rooms | Task resource and comment ID, text, author summary, and creation timestamp. |
| `activity.created` | Authorized workspace and project rooms | Persisted activity record, actor, task resource, action, and timestamp. |
| `notification.created` | Recipient's `user:<id>` room | Persisted notification record for the task participant. |
| `notification.read`, `notification.read-all` | Authenticated recipient's user room | Persisted read-state change. |
| `notification.deleted` | Authenticated recipient's user room | Persisted notification deletion. |

Clients do not submit room IDs or authoritative domain events. REST remains authoritative; reconnecting clients refetch data because the implementation does not persist or replay missed socket events.

#### Page coverage and limitations

- Live-backed: `/dashboard/tasks`, `/dashboard/projects/[projectId]/tasks`, `/dashboard/projects/[projectId]/activity`, `/dashboard/notifications`, and the dashboard notification preview/count.
- Partial or mock-only: `/dashboard/team` and `/dashboard/team/activity` still contain mock/hybrid surfaces. No current backend member add/remove workflow exists to publish member events. Project activity currently includes persisted activity records available from the existing task flows; AI, Git, deployment, and file activity remains outside this integration.
- Notification triggers are limited to task assignment changes and task comments. Notification writes are best-effort after the task/activity mutation; without a transaction or outbox, a database failure in that follow-up can leave the mutation saved without a notification. There is no durable socket replay, and room membership revocation can take up to 30 seconds to reconcile.
- No Mongoose model or schema changed. Existing `Activity`, `Notification`, membership, task, and comment models are reused.
- Added the frontend dependency `socket.io-client`. No Redis adapter or new infrastructure was added.
- The new Socket.IO tests cover missing, query-only, invalid, expired, and valid cookie credentials plus workspace/project room isolation. End-to-end event delivery, task notification persistence, and multi-browser UI behavior still need integration verification.

#### Files changed

- Backend: `backend/src/realtime/events.js`, `backend/src/realtime/socketAuth.js`, `backend/src/server.js`, `backend/src/app.js`, `backend/src/controllers/task.controller.js`, `backend/src/controllers/project.controller.js`, `backend/src/controllers/notification.controller.js`, `backend/src/routes/project.routes.js`, `backend/src/routes/notification.routes.js`, `backend/src/services/notification.service.js`, and `backend/src/__tests__/realtime.auth.test.js`.
- Frontend: `lib/realtime.js`, `lib/api.js`, `package.json`, `package-lock.json`, `app/dashboard/layout.jsx`, `app/dashboard/tasks/page.jsx`, `app/dashboard/projects/[projectId]/tasks/page.jsx`, `app/dashboard/projects/[projectId]/activity/page.jsx`, and `app/dashboard/notifications/page.jsx`.
- Configuration/docs: `backend/README.md` documents `FRONTEND_URL` and cookie-based sockets. No `.env` file was added or modified.

#### Validation record

- `cd backend && npm test -- --runInBand` — the final run passed 4 suites and 15 tests. An earlier run failed before executing the new suite because its ESM test file omitted the explicit Jest import; that import was added before the passing run.
- `npm run lint` — passed with two existing `<img>` optimization warnings in file pages. The lint script also reports that `next lint` is deprecated by the installed Next.js version.
- `npm run build` — passed and generated the existing route inventory without adding routes. The build reported the same lint warnings.
- `git diff --check` — passed.
- `socket.io-client` is a frontend dependency and a backend test-only dependency for independent authenticated integration clients. Backend startup requires `FRONTEND_URL`; no new runtime service or schema was added.
- Installing the backend test dependency reported 11 dependency audit findings (3 moderate, 7 high, 1 critical). No audit fix was run as part of this phase.

#### Next phase

Phase 7 — GitHub Integration remains the next planned phase after the outstanding Phase 6 coverage and integration verification are addressed.

### 3.4.7 Workspace and project invitations (2026-10-27)

**Status: Implemented and backend-tested on `feature/invite-member`; real SMTP delivery and browser-based invitation flows were not manually verified.** This invitation work does not complete Phase 6. Phase 6 remains **PARTIAL** and Phase 7 remains blocked on the outstanding Phase 6 preflight and two-browser verification. `feature/invite-member` is the intentional working branch for this task; no branch switch or Git history operation was performed.

#### Lifecycle and access behavior

- Added the `Invitation` Mongoose model. Invitations store normalized recipient email, workspace and optional project references, scope, inviter, requested role, a SHA-256 token hash, status, expiry, optional message, and acceptance metadata. A partial unique index prevents duplicate pending invitations for the same workspace/project scope and recipient while allowing new invitations after a prior one is accepted, declined, revoked, or expired.
- Workspace invitations grant `WorkspaceMember` access on explicit acceptance. Existing pending/invited workspace membership rows are activated; active or blocked membership is not duplicated or bypassed. Project invitations grant `ProjectMember` access only. This matches the existing project authorization model, where project membership independently grants access and does not require workspace membership.
- Workspace roles are `admin`, `member`, and `viewer`; project roles are `admin`, `editor`, and `viewer`. The existing project form maps Admin → `admin`, Developer → `editor`, and Viewer → `viewer`. Neither invitation API permits assigning `owner`.
- Workspace owners and active workspace owners/admins can manage workspace invitations. Project owners and project owners/admins can manage project invitations. Project/workspace relationships are resolved from MongoDB; the client cannot choose an alternate workspace for a project invitation.
- Invitation tokens use 32 random bytes, are single use, expire after seven days by default (`INVITATION_EXPIRY_DAYS` can override the duration), and are only stored as hashes. Acceptance checks authenticated email equality and requires verified local accounts. Details, accept, and decline require authentication; recipient actions use POST bodies. Pending invitations can be revoked by an authorized manager.
- Invitation email links carry the token in the URL fragment so browsers do not include it in HTTP requests or referrers. Existing login, registration, and email verification pages carry the token in memory, remove the fragment from the address bar, then send it to authenticated details/accept/decline APIs. No acceptance route/page was added. A persisted notification is created for the inviter after acceptance on a best-effort basis; membership and invitation state remain authoritative if notification persistence fails.
- SMTP absence returns a delivery failure for invitations; failed delivery removes the pending invitation, and the UI reports success only after a successful email send and API response. Existing auth email callers remain compatible with the helper's `{ sent: false }` result when SMTP is unconfigured. SMTP delivery was not tested against a live provider.

#### API surface and files

- `POST` / `GET` `/api/invitations/workspaces/:workspaceId` — create/list workspace invitations.
- `POST` / `GET` `/api/invitations/projects/:projectId` — create/list project invitations.
- `DELETE` `/api/invitations/:invitationId` — revoke a pending invitation.
- `POST` `/api/invitations/details`, `/accept`, and `/decline` — fetch recipient context or complete an explicit recipient decision.
- Added `backend/src/models/Invitation.js`, invitation controller/service/router/validator, and focused lifecycle tests. Mounted the router in `backend/src/app.js` and exported the model from `backend/src/models/index.js`.
- Connected `lib/api.js`, `/dashboard/team/members`, `/dashboard/team`, and `/dashboard/projects/[projectId]/team` to real invitation/member APIs. Project member role changes and removals remain explicitly unsupported. Workspace selection still follows the existing page behavior of resolving the first project workspace; users without an accessible project still have no workspace selector. OAuth provider redirects do not currently carry invitation context; password login and the local registration/email-verification flow do.
- Updated existing auth registration and verification handling to preserve invitation context without adding a page. The verification email link carries the fragment invitation token so registration followed by email verification can continue to login and acceptance.
- Environment variable names involved: `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and optional `INVITATION_EXPIRY_DAYS`. No secret values were added to documentation.

#### Validation record

- `cd backend && npm test -- --runInBand` -> passed: 3 test suites, 11 tests total.
- `npm run lint` -> no blocking errors; one non-blocking warning remains about using a plain `<img>` element in the file preview modal.

Current limitation: the preview modal still uses a plain HTML image element, which triggers a Next.js optimization warning but does not block the real files/documents functionality or the test suite.

### 3.4.8 Phase 6 manual verification update (2026-10-27)

The user confirmed that the previously required two-browser verification was completed and directed work to proceed with Phase 7. Detailed browser observations or a separate verification artifact were not supplied in this audit, so this is recorded as user-confirmed rather than independently reproduced. This update satisfies the stated Phase 7 preflight gate; it does not change the historical Phase 6 audit or claim the unsupported Phase 6 team workflows are complete. Phase 6 remains **PARTIAL** for those documented limitations.

### 3.4.9 Phase 7 — GitHub Integration (implementation audit, 2026-10-27)

**Status: Partial.** The current branch is `feature/phase-7-github-integration`; the working tree changes are uncommitted. GitHub behavior below was validated with service tests using a mocked provider, not with configured GitHub credentials or live GitHub API requests.

#### 1. Status and audit scope

- Replaced mock data on the existing GitHub dashboard, repository list/detail, branches, commits, pull requests, issues, and releases surfaces with the shared authenticated frontend API and Express integration.
- No route, page, navigation item, dependency, or database infrastructure was added beyond the existing route family. Unsupported create/delete/write actions from the mock screens were removed.
- The integration is user-scoped: every data route uses the authenticated DevFlow user and their own GitHub connection. It does not accept workspace/project IDs or link repositories to `Project.repository`; no workspace/project GitHub operation is exposed.

#### 2. Branch and implementation baseline

- Branch: `feature/phase-7-github-integration`.
- The Phase 6 two-browser check is user-confirmed complete (see 3.4.8); its detailed results were not independently available in this audit.
- Existing GitHub Passport login remains a separate sign-in mechanism and is not used for repository API credentials.

#### 3. Verified connection architecture

- Selected a separate GitHub OAuth App web authorization flow because the backend already uses OAuth App credentials and this integration is user-account based. Authorization uses a random single-use state record tied to the authenticated DevFlow user, a ten-minute expiry, and PKCE S256. Callback errors are checked and OAuth denial consumes and validates state.
- GitHub OAuth Apps require the broad `repo` scope to read private repositories; this permission also allows writes at GitHub's grant level. DevFlow exposes read operations only. A GitHub App with read-only repository permissions is the narrower production option.
- Access tokens (and optional refresh tokens) are encrypted with AES-256-GCM using `GITHUB_TOKEN_ENCRYPTION_KEY`; token fields are excluded from default Mongoose selection and never sent to the browser. Expiring tokens are refreshed when possible; revoked/expired credentials are removed and require reconnection.
- Disconnect deletes local credentials and pending state. It does not revoke the remote GitHub OAuth grant; users can revoke that in GitHub settings.

#### 4. Backend API implementation

- `GET /api/github/connect` — authenticated OAuth start.
- `GET /api/github/callback` — state/PKCE authorization callback, account lookup, encrypted connection persistence, and redirect to the existing dashboard.
- `GET /api/github/status` and `DELETE /api/github/connection` — connection status and local disconnect.
- `GET /api/github/repositories?page=&perPage=` — accessible repository listing from GitHub, capped at 100 per page.
- `POST /api/github/sync` — fetches up to 1,000 accessible repositories from GitHub, stores repository metadata and reports count, timestamp, and whether the cap was reached.
- `GET /api/github/repositories/:owner/:repo/:resource` — live repository detail, branches, commits, pull requests, issues, or releases. Issue results filter out GitHub pull request entries in the frontend.
- All API data routes require existing `requireAuth`; query and resource parameters use Zod validation. API failures are returned as errors, with expired credentials removed on 401 responses.

#### 5. Database and credential storage

- Added `GitHubIntegration` for one integration per user, encrypted access/refresh token fields, GitHub account summary, synchronization time, and cached repository metadata.
- Added `GitHubOAuthState` with unique hashed state, user, PKCE verifier, and TTL expiry.
- No changes were made to User, Workspace, Project, or their membership schemas. No workspace/project repository association was implemented.

#### 6. Frontend page integration

- Existing `/dashboard/github` includes connect, status, sync, and disconnect controls plus repository summary.
- Existing repositories list and numeric detail route load actual GitHub metadata. Branches, commits, pull requests, issues, and releases use a shared resource view and select from the user's accessible repositories.
- Loading, disconnected, empty, and request error states are present. Repository pagination is available; resource responses currently use GitHub's first page and do not expose full resource pagination controls.
- Mock imports and fake success actions were removed from the connected GitHub screens. Styling/layout was replaced with simpler existing primitives in the feature route components; visual equivalence to the former screens was not manually checked.

#### 7. Authorization and security

- Authenticated user identity comes from existing access-cookie/bearer `requireAuth`; client-supplied user IDs are not accepted.
- Connections and repository metadata are keyed to that user, and tokens are never returned to the frontend. GitHub OAuth login remains separate.
- Workspace/project permission checks are not applicable to the user-owned GitHub browsing endpoints as currently designed; no project-scoped read/write endpoints exist. Adding project linking or sharing requires explicit project/workspace authorization checks.
- GitHub API 401 responses clear the local integration; 403 responses are reported as an upstream permission/rate-limit failure. Token encryption key rotation requires users to reconnect because no key-version/key-ring migration was added.

#### 8. Files changed in this continuation

- Backend: `backend/src/app.js`, `backend/src/controllers/github.controller.js`, `backend/src/models/GitHubIntegration.js`, `backend/src/models/GitHubOAuthState.js`, `backend/src/routes/github.routes.js`, `backend/src/services/github.service.js`, `backend/src/validators/github.validator.js`.
- Frontend: `lib/api.js`, `components/github-resource-page.jsx`, `app/dashboard/github/page.jsx`, `app/dashboard/github/repositories/page.jsx`, `app/dashboard/github/repositories/[repoId]/page.jsx`, `app/dashboard/github/branches/page.jsx`, `app/dashboard/github/commits/page.jsx`, `app/dashboard/github/pull-requests/page.jsx`, `app/dashboard/github/issues/page.jsx`, and `app/dashboard/github/releases/page.jsx`.
- Tests: `backend/src/__tests__/github.integration.test.js`.
- Configuration/documentation: `backend/.env.example`, `backend/README.md`, and this context record.

#### 9. Environment configuration

- Added `GITHUB_INTEGRATION_CLIENT_ID`, `GITHUB_INTEGRATION_CLIENT_SECRET`, `GITHUB_INTEGRATION_CALLBACK_URL`, and `GITHUB_TOKEN_ENCRYPTION_KEY` to `backend/.env.example` and documented setup in `backend/README.md`. No secret values were recorded here.
- OAuth callback default is `http://localhost:5000/api/github/callback`; it must exactly match the GitHub OAuth App callback URL. The encryption key must be 32 random bytes encoded as 64 hexadecimal characters.

#### 10. Automated validation record

- `cd backend && npm test -- --runInBand` — passed: 7 suites, 31 tests. GitHub tests use mocked `fetch` responses and an in-memory MongoDB; they cover PKCE challenge/verifier, state binding/replay, per-user isolation, encrypted token redaction, repository/resource pagination and empty arrays, invalid page parameters, permission/rate-limit errors, and local disconnect. These are automated mocked tests, not live provider verification.
- `cd backend && npm test -- --runInBand src/__tests__/github.integration.test.js` — passed: 1 suite, 4 tests.
- `npm run lint` — passed. Existing warnings: two `<img>` optimization warnings in file preview pages. Next.js reports that `next lint` is deprecated.
- `npm run build` — passed; 72 existing frontend routes generated, with no new route. Same two existing image warnings.
- `git diff --check` — passed after the documentation update. Git printed informational LF-to-CRLF working-copy warnings for newly patched files; no whitespace errors were reported.

#### Remaining work

Phase 7 remains **Partial** until a dedicated OAuth App is configured and real-account authorization/API behavior is verified. Resource pagination, original page layout restoration, and local automated checks are implemented and pass. Consider a GitHub App migration before production to reduce grant permissions. No Phase 8 work was started.

### 3.4.10 Phase 7 progress update (2026-10-27)

**Status: Implemented; live provider verification remains incomplete.** This entry supersedes the earlier Phase 7 statements about simplified layouts and missing resource pagination. The earlier entries remain as historical audit records.

#### Layout restoration and frontend behavior

- Recovered the original GitHub page components from the current branch's Git history, then wired them back to the authenticated API while preserving their page hierarchy, visual styles, cards, tabs, and resource views. Updated existing screens: `/dashboard/github`, repositories list/detail, branches, commits, pull requests, issues, and releases.
- Added a shared repository picker and data hook to the existing resource pages. The hook aborts stale requests on unmount or context changes; selecting a repository resets its resource page. The screens retain their search/filter behavior and now show loading, error/retry, empty, and page navigation states.
- Removed the unused simplified `components/github-resource-page.jsx` replacement. No routes, pages, navigation items, or TypeScript files were added.
- Read-only integration actions are presented as disabled where the original mock UI offered writes. GitHub links remain available for supported actions. Branch author and timestamp are shown as unavailable because the branch-list response does not include those fields.

#### Pagination behavior

- `GET /api/github/repositories?page=&perPage=` and list resources under `GET /api/github/repositories/:owner/:repo/:resource?page=&perPage=` return arrays with `{ page, perPage, nextPage, previousPage, firstPage, lastPage, hasNext, hasPrevious }` parsed from GitHub's `Link` header. The frontend navigates using the returned next/previous page values, does not prefetch every page, and keeps the selected repository and current filters in place.
- Supported paginated resources: branches, commits, pull requests, issues, and releases. Repository pages use a default of 30 and a maximum of 100 items. Resource pages use a default of 30 and maximum of 100; page inputs are bounded by Zod validators. Languages and repository detail are object responses, so they do not use list pagination.
- `POST /api/github/sync` remains the deliberate exception that follows pages automatically; it follows Link metadata up to ten pages of 100 repositories (1,000 maximum) and reports whether more pages remain. Page reads do not change synchronization timestamps.
- The shared frontend hook passes `AbortSignal` to both repository and resource requests, ignores aborted failures, and shows errors with retry. Issue pages filter pull-request entries returned by GitHub's issue endpoint; this filter is applied to the current page.

#### OAuth, authorization, and permissions

- The dedicated integration OAuth flow requests `repo` only. The GitHub user profile endpoint used here is available without `read:user`. OAuth App `repo` permission still grants broad write authority at GitHub even though DevFlow exposes read-only repository/resource operations. A GitHub App with read-only Contents, Metadata, and relevant Issues/Pull requests permissions is the recommended production direction; migration is a separate product/configuration change and was not performed.
- Connection initiation generates random state and a PKCE S256 verifier/challenge, stores only a hash of the single-use state with the authenticated DevFlow user and a ten-minute expiry, and binds the callback to that same authenticated user. Token exchange uses the stored verifier and fixed configured callback URL. Production callback URLs must use HTTPS; query strings and fragments are rejected.
- Access and refresh tokens are AES-256-GCM encrypted in MongoDB, token fields are excluded from normal model selection, and status responses contain account metadata only. Callback logs emit only a generic error name; no token or secret is logged. A provider 401 clears the local integration; rate-limited 403 maps to 429; other 403 responses report permission failure. Local disconnect clears the credential and pending OAuth states but does not revoke the GitHub grant.
- Authenticated routes resolve the integration only by `req.user._id`; cross-user repository access is not authorized by client identifiers. GitHub endpoint owner/repository paths are syntax validated, while GitHub itself authorizes the connected account's requested resource.
- Encryption-key rotation still makes existing records unreadable and currently requires users to disconnect/reconnect; no key-version/key-ring migration exists. The production OAuth App scope remains broader than the read-only feature needs.

#### Configuration and live verification

- Required backend configuration names: `GITHUB_INTEGRATION_CLIENT_ID`, `GITHUB_INTEGRATION_CLIENT_SECRET`, `GITHUB_INTEGRATION_CALLBACK_URL`, and `GITHUB_TOKEN_ENCRYPTION_KEY`. The callback must exactly match the GitHub OAuth App setting. The encryption key must be 32 random bytes encoded as 64 hex characters. No secret values are recorded here.
- The existing `backend/.env` was checked by variable name only; it has the legacy GitHub login settings but none of the four integration settings above. Therefore no real OAuth authorization, callback, account connection, live repository/resource request, cancellation/denial flow, revocation, or real rate-limit behavior was attempted or verified.
- To perform live checks, configure a dedicated OAuth App and the four backend variables (plus the exact frontend origin/session setup), restart the backend, then connect in the browser and verify account identity, private/accessible repositories, a paginated resource, denial/invalid-state behavior, disconnect, and absence of tokens from browser storage/responses/logs. Revoke the OAuth App grant separately in GitHub settings when checking remote revocation behavior.

#### Validation record

- `cd backend && npm test -- --runInBand` — passed: 7 suites, 31 tests. GitHub tests use mocked `fetch` responses and an in-memory MongoDB; they cover PKCE challenge/verifier, state binding/replay, per-user isolation, encrypted token redaction, repository/resource pagination and empty arrays, invalid page parameters, permission/rate-limit errors, and local disconnect. These are automated mocked tests, not live provider verification.
- `cd backend && npm test -- --runInBand src/__tests__/github.integration.test.js` — passed: 1 suite, 4 tests.
- `npm run lint` — passed. Existing warnings: two `<img>` optimization warnings in file preview pages. Next.js reports that `next lint` is deprecated.
- `npm run build` — passed; 72 existing frontend routes generated, with no new route. Same two existing image warnings.
- `git diff --check` — passed after the documentation update. Git printed informational LF-to-CRLF working-copy warnings for newly patched files; no whitespace errors were reported.

#### Remaining work

Phase 7 remains **Partial** until a dedicated OAuth App is configured and real-account authorization/API behavior is verified. Resource pagination, original page layout restoration, and local automated checks are implemented and pass. Consider a GitHub App migration before production to reduce grant permissions. No Phase 8 work was started.

### 3.4.11 Phase 8 — Centralized AI Infrastructure (2026-10-28)

**Status: Implemented; live provider verification and usage persistence remain incomplete.** This entry records the local `feature/phase-8-ai-infrastructure` checkout. No commit or push was made.

#### Initial audit and scope

- Branch at start: `feature/phase-8-ai-infrastructure`. `git status --short` was empty; no uncommitted changes were present.
- No backend AI provider SDK, direct AI API call, AI endpoint, AI usage model, token accounting service, or streaming utility was found. Existing AI pages use simulated responses and `lib/mock/ai.js`; `lib/api.js` had no live AI request methods. No API key environment configuration existed in the backend. Existing authentication, Express routes, Zod validation, structured errors, and `express-rate-limit` conventions were available.
- The scope was a server-side reusable service and one provider adapter. AI Chat and the other individual AI tools, public routes, streaming, persistence, billing, quotas, and background processing remain outside this phase.

#### Architecture and implementation

- Centralized tracking is implemented in `backend/src/services/ai-execution.service.js`. A single `recordExecution()` function is called from both `ai-chat.service.js` and `ai-tools.service.js` after each AI generation attempt. It never throws — analytics failures are logged safely and do not block AI responses.
- `ai-chat.service.js` calls `recordExecution` for completed, failed, and cancelled chat and regeneration requests.
- `ai-tools.service.js` calls `recordExecution` for all six tools for completed, failed, and cancelled outcomes.
- History and usage routes are mounted at `/api/ai` alongside the existing chat routes via a new `ai-history.routes.js`. No existing route was changed.

#### 5. Database models and indexes

**New model: `AIExecution`** (`backend/src/models/AIExecution.js`)

Fields: `owner` (User ref, required), `conversation` (AIConversation ref, optional), `message` (AIMessage ref, optional), `project` (Project ref, optional), `tool` (enum: chat/code-generator/code-review/documentation/bug-fixer/backend-generator/sql-generator), `provider`, `model`, `status` (enum: pending/processing/completed/failed/cancelled), `inputTokens` (nullable, min 0), `outputTokens` (nullable, min 0), `totalTokens` (nullable, min 0), `usageSource` (enum: provider/unavailable), `requestDurationMs` (nullable, min 0), `errorCode`, `startedAt`, `completedAt`, timestamps.

Indexes: `{ owner, createdAt }`, `{ owner, tool, createdAt }`, `{ owner, status, createdAt }`, `{ project, createdAt }` (sparse), `{ conversation, createdAt }` (sparse).

Token accounting rules: tokens are stored only when `usageSource === "provider"`. `totalTokens` is computed from `inputTokens + outputTokens` only when both are non-null. Missing usage is stored as `null` with `usageSource: "unavailable"` — never fabricated as zero. `AIConversation` and `AIMessage` remain the source of truth for conversational content.

#### 6. API endpoints

All endpoints require `requireAuth`. User identity is derived from `req.user._id`. All query parameters are validated with Zod.

| Method | Path | Description |
|---|---|---|
| GET | `/api/ai/history` | Paginated execution history. Supports: `page`, `limit` (max 100), `search`, `tool`, `provider`, `model`, `status`, `projectId`, `from`, `to`, `sort`. |
| GET | `/api/ai/history/:id` | Single execution record. Returns 404 if not owned by authenticated user. |
| DELETE | `/api/ai/history/:id` | Deletes execution record only. Does NOT delete associated conversations or messages. |
| GET | `/api/ai/usage/summary` | Aggregated totals: total, completed, failed, cancelled, inputTokens, outputTokens, totalTokens (null when unavailable), tokensAvailable, avgRequestDurationMs, mostUsedTool, mostUsedModel. Supports `from`, `to`, `projectId`. |
| GET | `/api/ai/usage/timeseries` | Daily/weekly/monthly aggregated counts. Supports `from`, `to`, `interval`, `projectId`. |
| GET | `/api/ai/usage/by-tool` | Grouped by tool: total, completed, failed, totalTokens, avgDurationMs. |
| GET | `/api/ai/usage/by-model` | Grouped by provider+model. |
| GET | `/api/ai/usage/by-project` | Grouped by project (sparse — only records with a project reference). |

#### 7. Frontend integrations

**`app/dashboard/ai/history/page.jsx`** — fully replaced mock data with real API:
- Loads execution history from `api.ai.history.list()` with pagination, tool filter, and debounced search.
- Loads usage summary from `api.ai.usage.summary()` for four stat cards (Total Requests, Completed, Failed, Avg Duration). Fabricated "This week", "Openable", and "Time saved" stats replaced with real values.
- Open: navigates to the existing AI Chat page with the conversation query parameter when a conversation reference exists; shows an honest unavailable message for tool executions (no output is persisted).
- Duplicate: navigates to the appropriate existing tool page without auto-executing.
- Delete: inline confirmation, calls `api.ai.history.delete()`, refreshes list and summary.
- New session: navigates to `/dashboard/ai/chat`.
- Loading skeleton, empty state, error state with retry, and pagination controls present.

**`app/dashboard/analytics/page.jsx`** — integrated real AI usage data:
- Added `useCallback`/`useEffect` to load `api.ai.usage.summary()` and `api.ai.usage.byTool()` on mount and on time filter change.
- AI Requests stat card shows real `aiSummary.total` and `aiSummary.completed` for the selected period.
- AI Usage Analytics panel shows real Most Used Model, Total Tokens (honest "unavailable" when no provider-reported tokens exist), Avg Response Time, Success Rate, and By Tool breakdown.
- All non-AI sections (Tasks Completed, Total Commits, Deployments, Languages Used, Coding Activity heatmap, Deployment Stats, Team Leaderboard) remain unchanged and continue to use their existing mock data — not claimed as live.

**`lib/api.js`** — added under the existing `api.ai` object:
- `api.ai.history.list(params)`, `api.ai.history.get(id)`, `api.ai.history.delete(id)`
- `api.ai.usage.summary(params)`, `api.ai.usage.timeseries(params)`, `api.ai.usage.byTool(params)`, `api.ai.usage.byModel(params)`, `api.ai.usage.byProject(params)`

#### 8. Usage accounting and cost limitations

- Token counts stored only when the provider reports them (`usageSource: "provider"`).
- Missing usage represented as `null` and `usageSource: "unavailable"` — never as zero.
- `totalTokens` computed from `inputTokens + outputTokens` only when both are non-null.
- No monetary cost calculation implemented. No model pricing configuration added. Ollama local inference is not represented as a provider API charge.
- Failed and cancelled requests tracked separately; not counted as successful generations.

#### 9. Security and authorization

- All endpoints require `requireAuth`; user identity comes only from `req.user._id`.
- Every history query and aggregation is scoped to `{ owner: req.user._id }` — cross-user access is impossible.
- Delete verifies ownership via `findOneAndDelete({ _id, owner })`.
- No prompts, generated content, API keys, or provider secrets are stored in `AIExecution` records.
- Analytics failures in `recordExecution` are caught and logged with only the error name.

#### 10. Files created

- `backend/src/models/AIExecution.js`
- `backend/src/services/ai-execution.service.js`
- `backend/src/controllers/ai-history.controller.js`
- `backend/src/routes/ai-history.routes.js`
- `backend/src/validators/aiHistory.validator.js`
- `backend/src/__tests__/ai.history.test.js`

#### 11. Files modified

- `backend/src/services/ai-chat.service.js` — added `recordExecution` calls for completed/failed/cancelled chat and regeneration flows.
- `backend/src/services/ai-tools.service.js` — added `recordExecution` calls for all six tools.
- `backend/src/app.js` — imported and mounted `ai-history.routes.js` at `/api/ai`.
- `backend/src/models/index.js` — exported `AIExecution`.
- `lib/api.js` — added `api.ai.history` and `api.ai.usage` method groups.
- `app/dashboard/ai/history/page.jsx` — replaced mock API with real backend integration.
- `app/dashboard/analytics/page.jsx` — integrated real AI usage data; preserved all existing non-AI content.

#### 12. Environment configuration

No new environment variables are required for Phase 11. The existing AI provider variables are sufficient. `backend/.env.example` was not changed.

#### 13. Automated validation

- `cd backend && npm test -- --runInBand` — passed: 11 suites, 102 tests. The new `ai.history.test.js` contributes 36 tests. The Node experimental VM Modules warning appeared as before.
- `npm run lint` — passed. Existing warnings: two `<img>` optimization warnings in file preview pages. Next.js reports that `next lint` is deprecated.
- `npm run build` — passed; 72 existing frontend routes generated, with no new route. Same two existing image warnings.
- `git diff --check` — passed after the documentation update. No real-provider/manual browser verification was performed. Changes remain uncommitted; no commit or push was made.

#### 14. Manual verification

Manual browser and live-provider verification have not been performed. Outstanding checks:
1. Start backend with a configured AI provider; send a chat message and a tool request; confirm `AIExecution` records appear in `/api/ai/history`.
2. Verify the history page loads real records, filters work, pagination works, Open navigates to the correct conversation, Duplicate navigates to the tool page without auto-executing, and Delete removes the record with confirmation.
3. Verify the analytics page AI Requests stat card and AI Usage Analytics panel update when the time filter changes.
4. Verify that a second user cannot access the first user's history or usage data.

#### 15. Known limitations

- Project-level usage attribution is stored when a `project` field is provided, but no current AI tool or chat flow passes a project reference. Project-level analytics will show empty results until a future phase wires project context into AI requests.
- The misleading "Save view" toast button was removed from the history page; no persistent saved-view system exists.
- All changes remain uncommitted on `feature/phase-11-ai-analytics`; no commit or push was made.

#### 16. Remaining work

- Wire a `project` reference into AI tool and chat requests when a project context is selected (future phase).
- Manual browser and live-provider verification.
- Consider adding project membership authorization to `/api/ai/usage/by-project` when project-scoped AI requests are implemented.

#### 17. Next phase

Phase 12 — Editor and Playground. Before starting Phase 12, manually verify all six tools in the browser with a configured AI provider, confirm the documentation tool's assumption disclaimer is visible, and verify the SQL safety label renders correctly after generation.

### 3.4.12 Phase 12 editor/snippet/playground completion notes

### 12.1 Verified fixes implemented during current work

- The shared frontend API client in `lib/api.js` was completed with real editor, snippet, and playground endpoint wrappers.
- The editor page in `app/dashboard/editor/page.jsx` now prevents empty file saves, uses a user-entered filename instead of a stale auto-filled value, and keeps the shared confirmation dialog pattern for delete actions.
- The snippet page in `app/dashboard/editor/snippets/page.jsx` now opens a blank create form instead of creating a dummy snippet, validates required title and content before save, shows copy success notifications, and uses the app confirmation dialog for deletes.
- The underlying editor service at `backend/src/services/editor.service.js` no longer strips `content` from list results, which preserves file bodies when the editor refreshes or switches between files.
- The project build was validated with `npm run build` and compiled successfully, with warnings limited to unrelated `mockApi` import errors in deployment/analytics pages already outside the editor scope.

### 12.2 Remaining known warnings outside the editor scope

- Several deployment and analytics routes still import `mockApi` from `@/lib/api`, which is not exported in the real API client. These are non-editor issues but still surface as build warnings. They do not block the editor feature implementation or the verified editor/snippet fix work in this phase.
