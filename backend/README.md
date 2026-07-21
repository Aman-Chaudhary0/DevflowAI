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
```

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
