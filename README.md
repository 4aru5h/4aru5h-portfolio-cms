# 4aru5h Portfolio & CMS — Production-Ready Architecture

A full-stack, cybersecurity-themed personal portfolio website and Content Management System (CMS) featuring a React/Vite frontend and an Express/SQLite-powered backend.

---

## Technical Architecture

- **Frontend:** React 18, Vite 5, React Router 6, custom cybersecurity theme, accessible command palette, interactive terminal CTF challenge.
- **Backend:** Node.js, Express 4, SQLite via `better-sqlite3`, synchronous WAL-mode connection.
- **Session & Security:**
  - `express-session` with SQLite-backed session store (`connect-sqlite3`).
  - Session Fixation protection via `req.session.regenerate()`.
  - CSRF synchronization tokens (`X-CSRF-Token`) + strict origin validation.
  - Salted bcrypt password hashing (cost factor 12) with transparent re-hashing.
  - Constant-time password verification to prevent username enumeration timing attacks.
  - Multi-tier rate limiting for login authentication and public API endpoints.
  - Strict Content Security Policy (CSP), HTTP security headers via Helmet.
  - URL sanitization protecting against `javascript:`/`vbscript:` XSS vectors.

---

## Quick Start (Development)

### 1. Prerequisites
- Node.js `18.0.0` or higher (tested on Node v22.14.0)
- npm `9.0.0` or higher

### 2. Installation
Clone or open the repository directory:
```bash
cd 4aru5h-portfolio-cms
npm run install:all
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the root folder:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Bash / Linux:
cp .env.example .env
```
Ensure `.env` contains:
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=a-secure-random-string-at-least-32-characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AM5landing742762
CLIENT_URL=http://localhost:5173
```

### 4. Database Setup & Non-Destructive Initialization
```bash
# Runs migrations safely; seeds only if the database is uninitialized
npm run db:init

# Optional: To reset or re-sync admin password from .env
npm run admin:reset
```

### 5. Running Development Servers
```bash
# Starts both Express (:5000) and Vite (:5173) concurrently
npm run dev
```

- Public Portfolio: [http://localhost:5173](http://localhost:5173)
- CMS Login: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- Admin Dashboard: [http://localhost:5173/admin](http://localhost:5173/admin)

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs both backend and frontend development servers concurrently. |
| `npm run server` | Starts Express backend in dev mode (`node --watch`). |
| `npm run client` | Starts Vite frontend dev server. |
| `npm run build` | Builds the React frontend into `client/dist`. |
| `npm run lint` | Runs ESLint validation across frontend codebase. |
| `npm test` | Executes backend security, CSRF, and API integration tests. |
| `npm run db:init` | Runs database migrations and seeds initial records if empty. |
| `npm run db:backup` | Creates an online timestamped SQLite backup in `database/backups/`. |
| `npm run setup` | Creates initial admin user if not already present. |
| `npm run admin:reset` | Resets admin password to the value configured in `.env`. |

---

## Security Hardening Details

1. **Password Storage & Transmission:**
   - Passwords are never committed or hardcoded in source files.
   - Verified on server exclusively; hashed with salted bcrypt (cost factor 12).
   - Login responses never return password hashes, session IDs, or private internal errors.
2. **Session Handling:**
   - Session cookies are configured with `HttpOnly: true`, `SameSite: strict` (production) / `lax` (development), and `Secure: true` in production.
   - Sessions regenerate upon successful login to prevent fixation attacks.
3. **Cross-Site Request Forgery (CSRF):**
   - Public GET routes remain accessible without CSRF friction.
   - All state-changing CMS operations (`POST`, `PUT`, `DELETE`) require a valid `X-CSRF-Token` header matching the active session token.
4. **Rate Limiting:**
   - Authentication endpoint (`/api/auth/login`) is strictly rate-limited to 5 attempts per 15 minutes per IP.
   - Public API endpoints are guarded with a 600 req / 15 min bucket.
5. **Database Protection:**
   - `npm run db:init` is non-destructive by default.
   - Schema versioning tracks migrations safely.

---

## Public Deployment Guide

### Option A: Single Node.js Container / VPS / Host (Railway, Render, DigitalOcean, VPS)
1. Build the frontend during deployment:
   ```bash
   npm run install:all
   npm run build
   ```
2. Set Environment Variables in your hosting dashboard:
   - `NODE_ENV=production`
   - `PORT=5000` (or provided port)
   - `SESSION_SECRET=<random-32+-char-secret>`
   - `CLIENT_URL=https://your-domain.com`
   - `TRUST_PROXY=1` (if behind Cloudflare, Nginx, or hosting load balancer)
   - `SERVE_CLIENT=true` (enables Express to serve `client/dist` directly as a Single Page Application)
   - `DATABASE_PATH=/persistent-volume/portfolio.db` (mount a persistent disk so SQLite data persists across redeployments)
3. Start command:
   ```bash
   cd server && npm start
   ```

### Option B: Decoupled (Vercel/Netlify Frontend + Render/Railway Backend)
1. Host frontend on Vercel/Netlify with output directory `client/dist`.
2. Configure `CLIENT_URL=https://your-frontend-domain.com` on the backend.
3. Configure API proxy or base URL pointing to the backend domain with `credentials: 'include'`.
