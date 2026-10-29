# Devflow AI Backend

Express.js backend for Devflow AI with MongoDB, JWT access tokens, refresh-token cookies, Zod validation, email verification, password reset, Passport OAuth hooks, and Socket.io bootstrap.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Fill these required values before starting:

```env
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=http://localhost:3000
```

Socket.IO is attached to the same HTTP server as Express. Browser connections authenticate with the HTTP-only `accessToken` cookie; configure `FRONTEND_URL` to the exact frontend origin. Sockets are disconnected when that access token expires and reconnect through the existing refresh-cookie flow.

## Auth API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`

OAuth routes are available at `/api/auth/google` and `/api/auth/github` once their client IDs and secrets are configured.

## GitHub repository integration

GitHub login (`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`) is separate from repository access. Configure a dedicated GitHub OAuth App with:

```env
GITHUB_INTEGRATION_CLIENT_ID=
GITHUB_INTEGRATION_CLIENT_SECRET=
GITHUB_INTEGRATION_CALLBACK_URL=http://localhost:5000/api/github/callback
GITHUB_TOKEN_ENCRYPTION_KEY=<32-byte key encoded as 64 hex characters>
```

The callback URL must exactly match the OAuth App setting. The integration requests the `repo` scope to read private repositories and repository metadata; the GitHub user profile endpoint is available without `read:user`. GitHub OAuth App's `repo` scope also permits write operations at GitHub's authorization layer; this implementation exposes only read operations. For production, consider migrating to a GitHub App with read-only repository permissions for a narrower grant.

OAuth authorization uses single-use, ten-minute state records and PKCE S256. Access tokens are encrypted with AES-256-GCM before MongoDB storage and are never returned to the browser. Rotating `GITHUB_TOKEN_ENCRYPTION_KEY` makes existing stored credentials unreadable; disconnect and reconnect those integrations after rotation. GitHub API routes are authenticated and scoped to the signed-in DevFlow user. Disconnect removes the locally stored credential; the user can also revoke the OAuth grant in GitHub settings.

Routes: `GET /api/github/connect`, `GET /api/github/callback`, `GET /api/github/status`, `DELETE /api/github/connection`, `GET /api/github/repositories`, `POST /api/github/sync`, `GET /api/github/repositories/by-id/:repositoryId`, and `GET /api/github/repositories/:owner/:repo/:resource` for detail, branches, commits, pull requests, issues, releases, contributors, and languages. Repository and list-resource endpoints accept `page` and `perPage` query parameters and return pagination metadata parsed from GitHub's `Link` response header. Page sizes are limited to 100; list pages default to 30. Repository synchronization is the only operation that follows multiple pages automatically, capped at 1,000 repositories.

## AI Chat (Phases 8-9)

The authenticated chat API reuses the centralized AI service and supports local Ollama or OpenAI. Local development defaults to Ollama at the fixed loopback endpoint `http://127.0.0.1:11434`, using `qwen3:1.7b`. Start Ollama and pull the model before starting a chat:

```bash
ollama pull qwen3:1.7b
```

The `/api/ai/models` endpoint checks that the configured Ollama model is installed before offering it to the UI. If it is unavailable, start Ollama or pull the model; no provider credentials are needed for local Ollama.

To use OpenAI later, change `AI_PROVIDER` to `openai`, set `AI_MODEL` to a supported model, and provide `AI_API_KEY` in the backend's private `.env`. Never use a `NEXT_PUBLIC_` variable or commit the secret. Provider endpoints are fixed in the backend; the browser cannot set a provider URL or key.

```env
AI_PROVIDER=ollama
AI_MODEL=qwen3:1.7b
AI_API_KEY=
AI_REQUEST_TIMEOUT_MS=120000
AI_MAX_INPUT_LENGTH=20000
AI_MAX_OUTPUT_LENGTH=40000
AI_MAX_OUTPUT_TOKENS=2048
```

Timeout is limited to 120 seconds; configurable input/output lengths and output tokens have hard upper bounds. Ollama requests use `/api/chat` with streaming disabled and `num_predict` bounded by the server output limit. Its token counts are reported only when returned by Ollama. OpenAI uses Chat Completions and requires provider-reported API usage when available. Chat routes require authentication, validate input with Zod, enforce user ownership, and rate-limit generation. Streaming and persisted usage analytics are not implemented. Mocked provider tests do not verify a live Ollama or OpenAI runtime.
