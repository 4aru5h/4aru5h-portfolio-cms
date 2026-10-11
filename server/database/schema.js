const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { config } = require('../config');

const DB_PATH = config.databasePath;

let sharedDb = null;

function attachHelpers(db) {
  // Small promise-free helpers kept for compatibility with the existing route code.
  db.all = (sql, params = []) => {
    const p = Array.isArray(params) ? params : [params];
    return db.prepare(sql).all(...p);
  };
  db.get = (sql, params = []) => {
    const p = Array.isArray(params) ? params : [params];
    return db.prepare(sql).get(...p);
  };
  db.run = (sql, params = []) => {
    const p = Array.isArray(params) ? params : [params];
    const info = db.prepare(sql).run(...p);
    return { lastID: Number(info.lastInsertRowid), changes: info.changes };
  };
  return db;
}

function openDatabase(filePath = DB_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return attachHelpers(db);
}

/**
 * Returns the process-wide SQLite connection.
 *
 * better-sqlite3 is synchronous and safe to share across requests; previously a new
 * connection was opened for every request and never closed, leaking file handles.
 */
function getDb() {
  if (!sharedDb || !sharedDb.open) {
    sharedDb = openDatabase();
  }
  return sharedDb;
}

function closeDb() {
  if (sharedDb && sharedDb.open) {
    sharedDb.close();
  }
  sharedDb = null;
}

const BASE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    section TEXT NOT NULL DEFAULT 'general',
    content_type TEXT NOT NULL DEFAULT 'text',
    display_order INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skill_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon_color TEXT DEFAULT 'var(--accent-cyan)',
    icon_svg TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    proficiency TEXT DEFAULT '',
    icon_url TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon_color TEXT DEFAULT 'var(--accent-cyan)',
    icon_svg TEXT DEFAULT '',
    badge_text TEXT DEFAULT 'Verified',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    date_range TEXT NOT NULL,
    description TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    technologies TEXT DEFAULT '[]',
    github_url TEXT DEFAULT '',
    live_url TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    category TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    reading_time INTEGER DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT DEFAULT '',
    setting_type TEXT DEFAULT 'text',
    label TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS navigation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    is_visible INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(content_key);
  CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
  CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
  CREATE INDEX IF NOT EXISTS idx_sessions_expired ON sessions(expired);
`;

/**
 * Ordered, additive, idempotent migrations. Each runs once and bumps PRAGMA user_version.
 * Never put destructive statements here without a documented backup step.
 */
const MIGRATIONS = [
  {
    version: 1,
    description: 'Base schema',
    up: (db) => db.exec(BASE_SCHEMA),
  },
  {
    version: 2,
    description: 'Projects section toggle + editable projects headings; blog published index',
    up: (db) => {
      db.prepare(
        "INSERT OR IGNORE INTO sections (section_key, label, display_order) VALUES ('projects', 'Projects', 7)"
      ).run();
      const insertContent = db.prepare(
        'INSERT OR IGNORE INTO site_content (content_key, label, value, section) VALUES (?, ?, ?, ?)'
      );
      insertContent.run('projects_label', 'Projects Section Label', 'Selected Work', 'projects');
      insertContent.run('projects_title', 'Projects Section Title', 'Projects', 'projects');
      insertContent.run('projects_desc', 'Projects Section Description', 'Tools, experiments, and builds across security and software engineering.', 'projects');
      db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(status, published_at)');
    },
  },
];

function runMigrations(db = getDb()) {
  const current = db.pragma('user_version', { simple: true });
  const pending = MIGRATIONS.filter((m) => m.version > current);
  for (const migration of pending) {
    db.transaction(() => {
      migration.up(db);
      db.pragma(`user_version = ${migration.version}`);
    })();
  }
  return { from: current, to: db.pragma('user_version', { simple: true }), applied: pending.length };
}

/**
 * Creates tables (if missing) and applies pending migrations. Safe to run repeatedly
 * and never deletes data.
 */
function initializeDatabase() {
  const db = getDb();
  // The base schema uses IF NOT EXISTS, so existing databases created before
  // migrations were tracked (user_version = 0) are upgraded in place.
  db.exec(BASE_SCHEMA);
  return runMigrations(db);
}

module.exports = { getDb, closeDb, openDatabase, initializeDatabase, runMigrations, DB_PATH };
