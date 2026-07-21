# Devflow AI Project Context

## Project Summary

Devflow AI is a dark-first, premium, minimal developer workspace UI. It is designed as an AI-powered product interface for developers and teams that need project dashboards, AI chat, documentation, analytics, workflow management, and polished public pages.

The frontend is fully built (UI-only). The backend authentication system is fully implemented with Express.js, MongoDB, and JWT.

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

| Category | Technology | Why |
| --- | --- | --- |
| Framework | Next.js 15 App Router | Fast, SEO-friendly, production-ready routing |
| Language | JavaScript JSX | User requested JavaScript instead of TypeScript |
| Styling | Tailwind CSS v4 plus CSS tokens | Utility-ready setup with explicit theme variables |
| Icons | Lucide React | Clean, consistent SVG icon system |
| Animations | CSS micro-interactions, Framer Motion dependency available | Smooth hover and floating effects; Framer Motion can be layered in later |
| Charts | Recharts dependency available | Intended for future analytics implementation |
| Forms | React Hook Form and Zod dependencies available | Ready for future validated forms |
| Tables | TanStack Table dependency available | Ready for future advanced tables |
| Drag and Drop | dnd-kit dependencies available | Ready for future Kanban interactions |
| Code Editor | Monaco dependency available | Ready for future VS Code-style editor page |
| Markdown | react-markdown dependency available | Ready for future AI and docs rendering |
| Theme | CSS variables and client theme toggle | Dark-first with light mode support |

---

## Backend Technology Choices

| Category | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Language | JavaScript ES Modules |
| Database | MongoDB + Mongoose |
| Authentication | JWT Access Token + Refresh Token (httpOnly cookies) |
| Password Hashing | bcryptjs (cost factor 12) |
| Validation | Zod |
| Cookies | cookie-parser |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Morgan |
| File Upload | Multer |
| Storage | ImageKit |
| Queue | BullMQ |
| Cache | Redis |
| Realtime | Socket.io |
| Email | Nodemailer |
| OAuth | Passport.js (Google, GitHub) |
| Environment | dotenv |

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

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register with name, email, password. Sends verification email. |
| POST | `/api/auth/login` | Public | Login with email + password. Sets httpOnly cookies. |
| POST | `/api/auth/logout` | Required | Clears cookies and invalidates refresh token. |
| POST | `/api/auth/refresh-token` | Public | Issues new token pair from refresh token cookie. |
| GET | `/api/auth/me` | Required | Returns current authenticated user. |
| POST | `/api/auth/forgot-password` | Public | Sends password reset link to email. |
| POST | `/api/auth/reset-password` | Public | Resets password using token from email link. |
| POST | `/api/auth/verify-email` | Public | Verifies email using token from verification email. |
| POST | `/api/auth/resend-verification` | Public | Resends email verification link. |
| GET | `/api/auth/google` | Public | Initiates Google OAuth flow. |
| GET | `/api/auth/google/callback` | Public | Google OAuth callback. |
| GET | `/api/auth/github` | Public | Initiates GitHub OAuth flow. |
| GET | `/api/auth/github/callback` | Public | GitHub OAuth callback. |

---

## User Model Fields

| Field | Type | Notes |
| --- | --- | --- |
| name | String | Required, 2–80 chars |
| email | String | Required, unique, indexed |
| password | String | Required for local provider, bcrypt hashed, select: false |
| avatar | String | URL, default empty |
| role | String | `user` or `admin`, default `user` |
| provider | String | `local`, `google`, or `github` |
| providerId | String | OAuth provider user ID |
| isVerified | Boolean | Email verified flag |
| refreshToken | String | Hashed, select: false |
| emailVerificationToken | String | SHA-256 hashed, select: false |
| emailVerificationExpires | Date | 1 hour TTL |
| passwordResetToken | String | SHA-256 hashed, select: false |
| passwordResetExpires | Date | 15 minute TTL |

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

## Future Work

- Wire frontend auth forms to backend API (replace mock states with real fetch/axios calls).
- Add 2FA (TOTP) support to backend — `/api/auth/2fa/setup`, `/api/auth/2fa/verify`.
- Replace placeholder terminal/image blocks with real product screenshots.
- Wire contact/newsletter forms to backend actions.
- Add Framer Motion page transitions and scroll reveal animations.
- Build authenticated dashboard pages for AI chat, code editor, Kanban, analytics, notifications, profile, and project details.
- Add real legal copy for Privacy and Terms before launch.
- Add Redis-backed rate limiting and session blacklisting on logout.
- Implement BullMQ email queue for reliable email delivery.
