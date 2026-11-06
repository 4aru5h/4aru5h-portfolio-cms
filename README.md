# 4aru5h Portfolio & CMS

My personal portfolio website with a built-in content management system, so I can update projects, experience, and articles through a private dashboard without touching code or redeploying.

- **Live Site:** [4aru5h.in](https://4aru5h.in)

---

## Features

- **Frontend:** Responsive project and experience showcase, keyboard command palette (`Ctrl+K`), and a hidden in-browser CTF terminal.
- **Backend:** Express API with bcrypt password hashing, session-based authentication, CSRF protection, rate limiting, and Helmet security headers.
- **Persistence:** SQLite (`better-sqlite3` / LibSQL) storing articles, project metadata, and site configuration.

---

## Tech Stack

- **Client:** React 18, Vite, React Router
- **Server:** Node.js, Express
- **Database:** SQLite (`better-sqlite3` / LibSQL)
- **Security:** bcrypt, express-session, Helmet, rate-limiting middleware

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/4aru5h/4aru5h-portfolio-cms.git
cd 4aru5h-portfolio-cms

# Install root, client, and server dependencies
npm run install:all

# Configure environment
cp .env.example .env
```

Set `SESSION_SECRET`, `ADMIN_PASSWORD`, and `DATABASE_PATH` in `.env`, then run:

```bash
# Start backend server
cd server
npm start

# In another terminal, start client
cd client
npm run dev
```

---

## Deployment

Configured for deployment on Render via `render.yaml`:

- **Build:** `npm run install:all && npm run build`
- **Start:** `cd server && npm start`
- Uses a persistent disk mount for the SQLite database so data persists across rebuilds.

---

## License

Distributed under the [MIT License](LICENSE).
