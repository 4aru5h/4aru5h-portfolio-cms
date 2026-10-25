# 4aru5h Portfolio & Content Management System

A production personal portfolio website with an integrated content management system (CMS), enabling administrative content management through a secured admin dashboard without manual code deployments.

- **Live Production Site:** [4aru5h.in](https://4aru5h.in)
- **Repository:** [github.com/4aru5h/4aru5h-portfolio-cms](https://github.com/4aru5h/4aru5h-portfolio-cms)

---

## Architecture & Core Features

```text
+--------------------------------------------------------------------------+
|                             React Frontend Client                        |
|   (Vite, Tailwind / Custom Styling, Interactive CTF Terminal, Palette)   |
+--------------------------------------------------------------------------+
                                     |
                                     | RESTful JSON API
                                     v
+--------------------------------------------------------------------------+
|                          Express.js Backend API                          |
|  - Password-based authentication with bcrypt hashing                     |
|  - Session management backed by SQLite / persistent storage              |
|  - Security: Helmet headers, origin validation, CSRF, rate limiting      |
|  - Dynamic blog publishing, project records, and skills management       |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
|                         Database Persistence Layer                       |
|           (Structured schema for projects, experience, articles)         |
+--------------------------------------------------------------------------+
```

### 1. Client Features
- **Responsive Portfolio Showcase:** Dynamic rendering of projects, work experience, certifications, and technical proficiencies.
- **Interactive CTF Terminal:** Embedded browser terminal interface allowing visitors to explore security challenges and execute terminal commands.
- **Command Palette:** Keyboard-driven quick navigation system (`Ctrl+K` / `Cmd+K`).
- **Administrative Portal:** Protected routes (`/admin`) for editing website content, modifying section configurations, and drafting blog articles.

### 2. Backend & Security Controls
- **Authentication:** Salted bcrypt password hashing with secure session persistence.
- **CSRF Defense:** Synchronizer token validation on state-altering administrative requests.
- **Rate Limiting:** Protects authentication and public API endpoints against brute-force attacks.
- **Security Headers:** Enforced Helmet policy configuring Content Security Policy (CSP), frame guards, and XSS filtering.
- **Static Frontend Serving:** Express production mode can serve the compiled React bundle directly as a unified monolithic service (`SERVE_CLIENT=true`).

---

## Tech Stack

### Frontend
- React 18
- Vite
- React Router 6

### Backend
- Node.js
- Express.js
- SQLite (`better-sqlite3`) / PostgreSQL support

### Security
- bcrypt
- express-session
- Helmet
- CSRF middleware
- express-rate-limit

---

## Local Setup & Development

### 1. Clone repository
```bash
git clone https://github.com/4aru5h/4aru5h-portfolio-cms.git
cd 4aru5h-portfolio-cms
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Environment Configuration
Create a local `.env` file following `.env.example`:
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_development_session_secret
ADMIN_PASSWORD=your_secure_admin_password
DATABASE_PATH=./database/portfolio.db
```

### 4. Run application
To run the server and client concurrently:
```bash
# Start backend API
cd server
npm start

# In a separate terminal, start frontend client
cd client
npm run dev
```

---

## Production Deployment on Render

This project is configured for deployment as a **Render Web Service** via `render.yaml`:

- **Build Command:** `npm run install:all && npm run build`
- **Start Command:** `cd server && npm start`
- **Environment Settings:**
  - `SERVE_CLIENT=true`
  - `NODE_ENV=production`
  - `SESSION_SECRET`: Strong cryptographically random key
  - `DATABASE_PATH`: Set to a mounted Render Persistent Disk path to prevent data loss across restarts

---

## License

Distributed under the [MIT License](LICENSE).
