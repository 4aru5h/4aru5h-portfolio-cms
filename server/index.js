const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { config, validateConfig } = require('./config');
const { initializeDatabase } = require('./database/schema');
const { ensureAdminUser } = require('./auth/admin');
const { csrfProtection } = require('./middleware/csrf');

// Validate environment variables & config
validateConfig();

// Initialize database schema & migrations
initializeDatabase();

// Auto-seed default portfolio content if database is brand new (non-destructive)
try {
  const { seedDatabase } = require('./database/seed');
  seedDatabase();
} catch (err) {
  console.warn('Auto-seed check skipped or encountered issue:', err.message);
}

// Bootstrap initial admin if credentials exist in .env and table is empty
ensureAdminUser().catch((err) => {
  console.warn('Admin user auto-initialization skipped or encountered issue:', err.message);
});

// Route imports
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const skillRoutes = require('./routes/skills');
const categoryRoutes = require('./routes/categories');
const certRoutes = require('./routes/certifications');
const experienceRoutes = require('./routes/experiences');
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const settingsRoutes = require('./routes/settings');
const navigationRoutes = require('./routes/navigation');
const sectionRoutes = require('./routes/sections');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Trust reverse proxy if configured (crucial for accurate client IP in rate limiting & secure cookies)
if (config.trustProxy) {
  app.set('trust proxy', config.trustProxy);
}

// Security Middleware: Helmet with customized CSP for client scripts & styles
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", ...config.allowedOrigins],
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.some(o => o.toLowerCase() === origin.toLowerCase())) {
      return callback(null, true);
    }
    callback(new Error('CORS origin not allowed: ' + origin));
  },
  credentials: true
}));

// Body Parsing with sensible payload limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Ensure upload directory exists and serve
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Ensure session directory exists
if (!fs.existsSync(config.sessionDir)) {
  fs.mkdirSync(config.sessionDir, { recursive: true });
}

// Session Configuration
app.use(session({
  store: new SQLiteStore({
    dir: config.sessionDir,
    db: 'sessions.db'
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.sessionMaxAgeMs,
    httpOnly: true,
    sameSite: config.isProduction ? 'strict' : 'lax',
    secure: config.isProduction
  }
}));

// General Rate Limiting
const generalLimiter = rateLimit({
  windowMs: config.apiRateLimit.windowMs,
  max: config.apiRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Authentication Rate Limiting
const authLimiter = rateLimit({
  windowMs: config.loginRateLimit.windowMs,
  max: config.loginRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

// Apply rate limits
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// CSRF Protection across all API routes
app.use('/api/', csrfProtection);

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/certifications', certRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production (or when SERVE_CLIENT=true)
if (config.serveClient && fs.existsSync(config.clientDistDir)) {
  app.use(express.static(config.clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(config.clientDistDir, 'index.html'));
  });
}

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS origin not allowed')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: config.isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error'
  });
});

// Start Server if run directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} (${config.env})`);
  });
}

module.exports = app;
