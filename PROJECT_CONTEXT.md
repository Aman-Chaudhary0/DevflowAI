# Devflow AI Project Context

## 1) Project Summary

Devflow AI is a premium, dark-first developer workspace UI built with Next.js App Router and JavaScript. The product is intentionally frontend-first at this stage: pages use local state, mock datasets, simulated actions, and polished visual feedback so every route can be explored before backend integration begins.

The workspace includes:

- Public marketing pages
- Authentication pages
- Dashboard workspace pages
- Project-scoped dashboard pages
- GitHub, deployment, workflow, editor, billing, and team views
- Admin screens
- Frontend-only AI, help, feedback, and search experiences
- A separate Express backend scaffold for auth and future API work

The core goal is visual completeness, consistent interaction design, and route correctness. Real backend behavior is being staged behind mock helpers, not exposed directly to users yet.

---

## 2) Product Goal and Current Phase

### Primary goal

Every page should work visually before backend integration begins.

### What that means here

- All major routes should render without broken layout.
- Buttons should trigger local state changes, drawers, toasts, or confirmations.
- Forms should have loading, validation, success, and error simulations.
- Empty states, loading states, and error states should be standardized.
- Navigation should route to real pages, not placeholders.
- Theme switching should work in both light and dark modes.
- Mobile layouts should remain usable.
- Protected dashboard routes should redirect when auth fails.

### What is still simulated

- AI generation and review flows
- Project actions
- GitHub actions
- Deployment actions
- Forms that are frontend-only
- Search/filtering/sorting across workspace pages

---

## 3) Technology Stack

### Frontend

| Area | Stack |
| --- | --- |
| Framework | Next.js 15 App Router |
| Language | JavaScript + JSX |
| Styling | CSS variables + Tailwind v4 utility classes |
| Icons | Lucide React |
| Markdown | react-markdown, remark-gfm, rehype-highlight |
| Syntax highlighting | react-syntax-highlighter |

### Backend scaffold

| Area | Stack |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT access/refresh tokens |
| Password hashing | bcryptjs |
| Validation | Zod |
| Cookies | cookie-parser |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Morgan |
| Email | Nodemailer |
| OAuth | Passport.js |
| Queue/cache/realtime | BullMQ, Redis, Socket.io |

### Current implementation style

- UI-first components
- Local state and fake async delays
- Shared design tokens and card primitives
- Minimal reliance on runtime APIs

---

## 4) Design System and UX Rules

### Visual language

- Dark-first default theme
- Light mode available via theme toggle
- Clean, minimal, premium, developer-focused styling
- Rounded cards, softer borders, restrained gradients
- Strong emphasis on density, legibility, and fast scanning

### Core theme tokens

- Background: `#0B0F19`
- Secondary surface: `#111827`
- Card surface: `#1A2235`
- Border: `#273244`
- Primary text: `#F8FAFC`
- Muted text: theme-driven CSS variable
- Primary accent: `#3B82F6`

### Typography

- Headings: Space Grotesk
- Body: Inter
- Code: JetBrains Mono

### Spacing and shape

- Cards: 18px radius
- Buttons: 14px radius
- Inputs: 12px radius
- Layouts should remain grid-based and responsive

### UX interaction standards

- Loading states should use skeletons where possible.
- Empty states should be explicit, friendly, and actionable.
- Destructive actions should use confirmation dialogs.
- Simulated actions should display toast feedback.
- Search, filter, sort, and tabs should work locally.
- Forms should show success and failure states rather than silently doing nothing.

---

## 5) Frontend Route Map

## 5.1 Public Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/pricing` | Pricing and comparison |
| `/features` | Feature showcase |
| `/about` | Company story and values |
| `/blog` | Blog index |
| `/blog/ai-workspaces` | Blog detail page |
| `/docs` | Documentation landing page |
| `/contact` | Contact page with form |
| `/privacy` | Privacy policy |
| `/terms` | Terms and conditions |
| `/search` | Public workspace search |
| `/feedback` | Public feedback form |
| `/help` | Public help center |
| `/not-found` | Custom 404 page |

## 5.2 Authentication Pages

| Route | Purpose |
| --- | --- |
| `/login` | Login form |
| `/register` | Sign-up form |
| `/verify-email` | Email verification flow |
| `/forgot-password` | Password reset request |
| `/reset-password/[token]` | Secure password reset |
| `/reset-password/demo-token` | Preview token route |
| `/2fa` | Two-factor authentication UI |

## 5.3 Dashboard Home and Core Workspace

| Route | Purpose |
| --- | --- |
| `/dashboard` | Main dashboard home |
| `/dashboard/projects` | Project listing |
| `/dashboard/projects/create` | Project creation wizard |
| `/dashboard/projects/[projectId]` | Project overview |
| `/dashboard/files` | Workspace file manager |
| `/dashboard/tasks` | Workspace task board |
| `/dashboard/notifications` | Notification center |
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Workspace settings |
| `/dashboard/team` | Team dashboard |
| `/dashboard/team/members` | Member management |
| `/dashboard/team/activity` | Team activity timeline |
| `/dashboard/team/calendar` | Team calendar |
| `/dashboard/editor` | Editor hub |
| `/dashboard/editor/snippets` | Snippet library |
| `/dashboard/editor/playground` | Safe code playground |
| `/dashboard/workflows` | Workflow list |
| `/dashboard/workflows/create` | Workflow builder |
| `/dashboard/workflows/[id]` | Workflow detail |
| `/dashboard/billing` | Subscription dashboard |
| `/dashboard/billing/history` | Billing history |
| `/dashboard/developer/api-keys` | API key manager |
| `/dashboard/developer/webhooks` | Webhook manager |

## 5.4 AI Pages

| Route | Purpose |
| --- | --- |
| `/dashboard/ai` | AI hub |
| `/dashboard/ai/chat` | AI chat |
| `/dashboard/ai/code-generator` | Code generator |
| `/dashboard/ai/code-review` | AI code review |
| `/dashboard/ai/docs-generator` | Documentation generator |
| `/dashboard/ai/bug-fixer` | Bug fixer |
| `/dashboard/ai/backend-generator` | Backend blueprint generator |
| `/dashboard/ai/sql-generator` | SQL generator |
| `/dashboard/ai/history` | AI history |

## 5.5 GitHub Pages

| Route | Purpose |
| --- | --- |
| `/dashboard/github` | GitHub workspace hub |
| `/dashboard/github/repositories` | Repository list |
| `/dashboard/github/repositories/[repoId]` | Repository detail |
| `/dashboard/github/pull-requests` | Pull requests |
| `/dashboard/github/commits` | Commit history |
| `/dashboard/github/branches` | Branch management |
| `/dashboard/github/releases` | Release management |
| `/dashboard/github/issues` | Issue management |

## 5.6 Deployment and Domain Pages

| Route | Purpose |
| --- | --- |
| `/dashboard/deployments` | Deployment list |
| `/dashboard/deployments/[id]` | Deployment detail |
| `/dashboard/deployments/domains` | Domain management |

## 5.7 Admin Pages

| Route | Purpose |
| --- | --- |
| `/admin` | Admin overview |
| `/admin/users` | User management |
| `/admin/ai-usage` | AI usage monitoring |
| `/admin/subscriptions` | Subscription administration |
| `/admin/reports` | Reports dashboard |
| `/admin/audit-logs` | Audit logs |

---

## 6) Shared UI Architecture

## 6.1 Global shell and layout

### `app/layout.jsx`

- Root layout for the entire application
- Applies global metadata and theme defaults
- Wraps content in the shared public shell

### `components/site-shell.jsx`

- Shows the public navbar and footer on marketing pages
- Hides the public shell on auth routes and dashboard/admin routes

### `app/dashboard/layout.jsx`

- Provides the dashboard shell
- Handles sidebar navigation, top bar, notifications, user menu, theme toggle, and mobile overlay
- Redirects to `/login` if authentication fails

### `app/admin/layout.jsx`

- Lightweight admin-specific shell
- Keeps admin pages separate from the public shell

## 6.2 Shared public components

### `components/navbar.jsx`

- Public header navigation
- Logo, main links, theme toggle, login CTA, start free CTA
- Responsive mobile menu panel

### `components/footer.jsx`

- Public footer with route-based link groups
- Social links and newsletter signup
- Uses local toast feedback for simulated subscription

### `components/ui-blocks.jsx`

- Shared marketing primitives:
  - `PageHero`
  - `FeatureGrid`
  - `PricingCards`
  - `DashboardPreview`
  - `SearchBar`
  - `CodeBlock`
  - `Rating`

### `components/header-copy.jsx`

- Shared heading/subheading block used by both marketing and dashboard headers
- Reduces duplicate title/subtitle rendering logic

## 6.3 Shared dashboard components

### `components/dashboard-ui.jsx`

Reusable primitives used across dashboard and admin screens:

- `Skeleton`, `SkeletonCard`, `SkeletonRow`
- `EmptyState`
- `toast`, `ToastContainer`
- `ConfirmDialog`
- `StatCard`
- `ProgressBar`
- `ProgressRing`
- `Avatar`, `AvatarGroup`
- `StatusBadge`
- `PageHeader`
- `FilterBar`
- `MiniBarChart`
- `Sparkline`

### `components/workspace-primitives.jsx`

- `Crumb` breadcrumb component
- `Drawer` accessible side panel
- Breadcrumbs support linked objects with `{ label, href }`

## 6.4 Domain-specific page groups

### `components/remaining-pages.jsx`

- Holds the frontend-only implementations for the later public/dashboard-adjacent pages
- Includes the SQL generator, help center, integration-style workspace surfaces, and other product extensions

### `components/final-pages.jsx`

- Centralizes the final batch of workspace simulations:
  - webhooks
  - integrations
  - search
  - feedback
  - help/admin-style experiences
- Uses drawers, confirmations, and mock state to simulate product flows

### `components/auth-ui.jsx`

- Auth shell and reusable auth states
- Inputs, social login buttons, password meter, verification panel, success states, OTP handling

### `components/ai-ui.jsx`

- AI-specific interactive controls and workspace layouts

---

## 7) Data Layer and Mock API Structure

## 7.1 Shared UI data

### `lib/data.js`

Contains marketing and shell data:

- `navItems`
- `features`
- `pricingPlans`
- `posts`
- `stats`
- `footerGroups`

## 7.2 Dashboard data

### `lib/dashboard-data.js`

Contains dashboard-facing mock entities:

- `mockUser`
- `mockProjects`
- `mockTasks`
- `mockActivity`
- `mockNotifications`
- `mockTeamMembers`
- `mockFiles`
- `mockAnalytics`
- `mockDocs`
- `getGreeting()`

## 7.3 Frontend-only mock API

### `lib/api.js`

Exports two layers:

#### Real backend-facing API wrapper

- `api.register()`
- `api.login()`
- `api.logout()`
- `api.me()`
- `api.forgotPassword()`
- `api.resetPassword()`
- `api.verifyEmail()`
- `api.resendVerification()`

#### Mock API helpers

- `mockApi.ai.*`
- `mockApi.github.*`
- `mockApi.projects.*`
- `mockApi.deployments.*`
- `mockApi.domains.*`

These helpers use timed promises so pages can behave like real async product surfaces without reaching a backend.

## 7.4 Mock datasets by domain

### AI mocks

- `lib/mock/ai.js`

### GitHub mocks

- `lib/mock/github.js`

### Project tasks and analytics

- `lib/mock/tasks.js`
- `lib/mock/analytics.js`

### Deployment and domain mocks

- `lib/mock/deployments.js`
- `lib/mock/domains.js`

### Other curated workspace mocks

- `lib/mock/workspace.js`
- `lib/mock/remaining-pages.js`
- `lib/mock/final-pages.js`

## 7.5 Data conventions

- Mock route IDs should match route params whenever possible.
- Use route-friendly keys for project-level lookups.
- Keep mock rows and cards consistent across lists, details, and drawers.

---

## 8) Backend Architecture

The backend is a separate Express project under `backend/` and is designed for auth and future product APIs.

### Folder structure

| Path | Responsibility |
| --- | --- |
| `backend/src/app.js` | Express app setup |
| `backend/src/server.js` | HTTP bootstrap and Socket.io |
| `backend/src/config/` | DB, Redis, Passport, ImageKit configuration |
| `backend/src/controllers/` | HTTP controllers |
| `backend/src/services/` | Business logic |
| `backend/src/routes/` | API route definitions |
| `backend/src/models/` | Mongoose models |
| `backend/src/middlewares/` | Auth, validation, error handling |
| `backend/src/validators/` | Zod schemas |
| `backend/src/utils/` | Shared helper utilities |

### Auth endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh-token` | Refresh token pair |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Complete password reset |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification email |
| GET | `/api/auth/google` | Google OAuth start |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/github` | GitHub OAuth start |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |

### User model highlights

- `name`
- `email`
- `password`
- `avatar`
- `role`
- `provider`
- `providerId`
- `isVerified`
- `refreshToken`
- `emailVerificationToken`
- `emailVerificationExpires`
- `passwordResetToken`
- `passwordResetExpires`

### Environment variables

The backend expects environment variables for:

- Server port and environment
- MongoDB URI
- JWT secrets and expiries
- Frontend URL
- SMTP/email configuration
- Google and GitHub OAuth
- ImageKit
- Redis

---

## 9) Navigation and Routing Conventions

### Public shell rules

- Public navbar and footer should appear on marketing and content pages.
- Auth routes should not show the public shell.
- Dashboard and admin routes should bypass the public shell.

### Dashboard shell rules

- Dashboard routes use a persistent shell with:
  - left sidebar
  - top action bar
  - theme toggle
  - notification menu
  - user menu
  - mobile overlay sidebar

### Breadcrumb rules

- Breadcrumbs should be clickable for parent navigation.
- Detail pages should expose the parent route and current section clearly.
- Use linked breadcrumb objects for dynamic route names when the label is not static.

### Protected route rules

- Dashboard auth failure should redirect to `/login`.
- Auth should not silently fall back to a fake user for protected routes.

### Route naming rules

- Prefer `projectId` for project-scoped routes.
- Keep `id` only where the route family already uses it, such as deployments.
- Avoid mixing route param conventions inside the same subtree.

---

## 10) State and Interaction Standards

### Loading states

- Use `SkeletonCard` or equivalent skeleton UI for loading.
- Loading should be explicit rather than a blank screen.
- Long-running AI or deployment flows should show staged progress.

### Empty states

- Use `EmptyState` for no data, no results, or empty filtered views.
- Empty states should explain the condition and provide an action when possible.

### Error states

- Use visible error or not-found surfaces for invalid route data.
- Error states should provide a recovery action such as returning to a parent route.

### Button states

- Buttons should either trigger a visible action or be intentionally disabled.
- If a button simulates an async operation, show loading text/spinner feedback.

### Form states

- Forms should include:
  - local validation
  - loading state
  - success state
  - error state

### Modal and drawer states

- Destructive flows should use confirmation dialogs.
- Detail views should use drawers when the page already contains a list or grid.

### Theme behavior

- Dark mode is the default design language.
- Light mode must remain readable and intentional.
- Theme toggle should remain available in the public and dashboard shells.

### Mobile responsiveness

- Desktop-first layouts must collapse cleanly on smaller screens.
- Sidebars should become overlays or drawers on mobile.
- Tables should use horizontal scrolling instead of breaking layout.

---

## 11) Important Files to Know

### Root and global files

- `app/layout.jsx`
- `app/globals.css`
- `components/site-shell.jsx`

### Marketing and public-facing files

- `components/navbar.jsx`
- `components/footer.jsx`
- `components/ui-blocks.jsx`
- `components/header-copy.jsx`
- `app/page.jsx`
- `app/features/page.jsx`
- `app/pricing/page.jsx`
- `app/about/page.jsx`
- `app/blog/page.jsx`
- `app/blog/ai-workspaces/page.jsx`
- `app/docs/page.jsx`
- `app/contact/page.jsx`
- `app/privacy/page.jsx`
- `app/terms/page.jsx`

### Dashboard and workspace files

- `app/dashboard/layout.jsx`
- `components/dashboard-ui.jsx`
- `components/workspace-primitives.jsx`
- `components/remaining-pages.jsx`
- `components/final-pages.jsx`
- `app/dashboard/page.jsx`
- `app/dashboard/projects/page.jsx`
- `app/dashboard/projects/[projectId]/page.jsx`
- `app/dashboard/projects/[projectId]/files/page.jsx`
- `app/dashboard/projects/[projectId]/docs/page.jsx`
- `app/dashboard/projects/[projectId]/team/page.jsx`
- `app/dashboard/projects/[projectId]/activity/page.jsx`
- `app/dashboard/projects/[projectId]/settings/page.jsx`

### AI and GitHub files

- `app/dashboard/ai/*`
- `app/dashboard/github/*`

### Deployment and admin files

- `app/dashboard/deployments/*`
- `app/admin/*`

### Data and backend files

- `lib/api.js`
- `lib/data.js`
- `lib/dashboard-data.js`
- `lib/mock/*`
- `backend/src/*`

---

## 12) Run Instructions

### Frontend

```bash
npm run dev
```

Frontend dev server:

- `http://localhost:3000`

### Backend

```bash
cd backend
npm run dev
```

Backend dev server:

- `http://localhost:5000`

### Backend health check

- `GET http://localhost:5000/health`

---

## 13) Current Implementation Notes

- Dashboard project routes use mock project data and simulated async helpers.
- Deployment detail pages resolve missing IDs with an empty/not-found state.
- Breadcrumbs are now navigable and should be used consistently on detail pages.
- Public forms and newsletter actions are local simulations unless wired to backend behavior.
- The dashboard shell now redirects unauthenticated access to `/login`.
- Shared header/title rendering is centralized to avoid duplicate page chrome.

---

## 14) Future Work

- Replace mock data with backend APIs gradually.
- Connect AI pages to real model-backed endpoints.
- Wire search, contact, feedback, and newsletter forms to backend flows.
- Add production-grade loading and error boundaries across the app.
- Replace remaining simulated actions with persisted CRUD behavior.
- Add stronger auth enforcement, session handling, and token refresh logic.
- Add real dashboards, charts, and analytics pipelines once backend data is ready.
