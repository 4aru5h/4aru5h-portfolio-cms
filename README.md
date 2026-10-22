# 4aru5h Portfolio CMS

A personal portfolio website with a built-in content management system (CMS), allowing the site owner to manage portfolio content through an admin dashboard.

**Live Website:** [https://4aru5h.in](https://4aru5h.in)  
**Repository:** [https://github.com/4aru5h/4aru5h-portfolio-cms](https://github.com/4aru5h/4aru5h-portfolio-cms)

## Features

- **Portfolio Website** — Responsive personal portfolio for showcasing skills, projects, certifications, and other information.
- **Admin Dashboard** — Manage supported website content without manually editing source files.
- **Content Management** — Update portfolio details and publish blog posts, where supported by the current implementation.
- **Authentication** — Password-based admin authentication with hashed passwords.
- **Security Controls** — Helmet security headers, rate limiting, CSRF protection, origin validation, and secure session handling.
- **Database** — SQLite storage for application data.
- **Production Deployment** — Express can serve the built frontend, allowing the application to run as a single service.

## Tech Stack

### Frontend
- React
- Vite
- React Router

### Backend
- Node.js
- Express.js
- SQLite (`better-sqlite3`)

### Security
- bcrypt
- express-session
- Helmet
- CSRF protection
- Rate limiting
- SQLite-backed session storage

## Project Structure

```text
4aru5h-portfolio-cms/
├── client/             # React frontend
├── server/             # Express backend and API
├── package.json        # Root scripts
├── .env.example        # Environment variable template
└── README.md
```

## Getting Started

### Prerequisites

Install:
- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/4aru5h/4aru5h-portfolio-cms.git
cd 4aru5h-portfolio-cms
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

Create the required environment configuration using `.env.example` as a reference. Configure the variables required by the backend, including:

- Admin credentials
- Session secret
- Database path
- Production configuration

**Never commit real passwords, session secrets, API keys, or other sensitive values to Git.**

Use strong, unique credentials for the admin account.

### 4. Start the application

Follow the development scripts defined in the root and server `package.json` files. The backend can be started with:

```bash
cd server
npm start
```

If the frontend runs separately during development, start it using the appropriate script in `client/package.json`.

## Production Build

Build the frontend from the project root:

```bash
npm run build
```

For a single-service deployment, configure the backend to serve the generated frontend build using:

```env
SERVE_CLIENT=true
```

Set this variable in the production environment rather than relying on development defaults.

## Deployment on Render

This project can be deployed as a **Render Web Service**.

### Recommended configuration

- **Build command:** `npm run install:all && npm run build`
- **Start command:** `cd server && npm start`
- **Persistent disk:** Configure a persistent disk for SQLite data.
- **Database path:** Set `DATABASE_PATH` to a location on the persistent disk.
- **Frontend serving:** Set `SERVE_CLIENT=true`.
- **Environment variables:** Configure production credentials and secrets in the Render dashboard.

Check the application's configuration and startup scripts before deploying to confirm that the build and start commands match the current repository.

### Important deployment notes

- SQLite data may be lost during redeploys or restarts if it is stored outside persistent storage.
- Use a strong production session secret.
- Never use default or example credentials on a public deployment.
- Verify cookie settings, HTTPS, CSRF protection, and allowed origins in production.
- Test admin login, content updates, and session persistence after deployment.

## Security

Security is an important part of this project. The backend includes several protections, such as:

- Password hashing
- Session-based authentication
- CSRF protection
- Rate limiting
- Helmet security headers
- Content Security Policy
- Origin validation

These controls reduce risk but do not guarantee that the application is free from vulnerabilities.

**Before deploying:**
1. Remove real credentials from documentation and source control.
2. Rotate any credentials or secrets that may have been exposed.
3. Store production secrets in Render environment variables.
4. Keep dependencies updated.
5. Test authentication, authorization, and session behavior.
6. Confirm that administrative API routes cannot be accessed without proper authentication.

## Development

Frontend dependencies and scripts are defined in `client/package.json`. Backend dependencies and scripts are defined in `server/package.json`.

For development commands, refer to those files and the root `package.json`.

## Future Improvements

Potential improvements include:

- More flexible portfolio content management
- Improved mobile usability
- Richer project and certification sections
- Blog editing and publishing improvements
- Automated testing and deployment checks
- Additional security testing

## License

Unless a license file is included in this repository, all rights are reserved by the repository owner. Contact the owner before redistributing or reusing the project.

---

**Built and maintained by 4aru5h.**
