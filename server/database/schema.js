const fs = require('fs');
const path = require('path');
const { config } = require('../config');

const DB_PATH = config.databasePath;
let sharedDb = null;

function createTursoAdapter() {
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: config.tursoDatabaseUrl,
    authToken: config.tursoAuthToken,
  });

  const adapter = {
    isTurso: true,
    client,
    async all(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      const res = await client.execute({ sql, args: p });
      return res.rows;
    },
    async get(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      const res = await client.execute({ sql, args: p });
      return res.rows[0] || null;
    },
    async run(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      const res = await client.execute({ sql, args: p });
      return {
        lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : 0,
        changes: res.rowsAffected,
      };
    },
    async exec(sql) {
      return client.executeMultiple(sql);
    },
    prepare(sql) {
      return {
        all: async (...args) => adapter.all(sql, args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
        get: async (...args) => adapter.get(sql, args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
        run: async (...args) => adapter.run(sql, args.length === 1 && Array.isArray(args[0]) ? args[0] : args),
      };
    },
    transaction(fn) {
      return async (...args) => fn(...args);
    },
    close() {},
  };

  return adapter;
}

function createLocalAdapter(filePath = DB_PATH) {
  const Database = require('better-sqlite3');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  const adapter = {
    isTurso: false,
    rawDb: db,
    async all(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      return db.prepare(sql).all(...p);
    },
    async get(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      return db.prepare(sql).get(...p) || null;
    },
    async run(sql, params = []) {
      const p = Array.isArray(params) ? params : [params];
      const info = db.prepare(sql).run(...p);
      return { lastID: Number(info.lastInsertRowid), changes: info.changes };
    },
    async exec(sql) {
      return db.exec(sql);
    },
    prepare(sql) {
      const stmt = db.prepare(sql);
      return {
        all: async (...args) => {
          const p = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return stmt.all(...p);
        },
        get: async (...args) => {
          const p = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          return stmt.get(...p) || null;
        },
        run: async (...args) => {
          const p = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          const info = stmt.run(...p);
          return { lastID: Number(info.lastInsertRowid), changes: info.changes };
        },
      };
    },
    transaction(fn) {
      const tx = db.transaction(fn);
      return async (...args) => tx(...args);
    },
    close() {
      if (db.open) db.close();
    },
  };

  return adapter;
}

function getDb() {
  if (!sharedDb) {
    if (config.tursoDatabaseUrl && config.tursoAuthToken) {
      sharedDb = createTursoAdapter();
    } else {
      sharedDb = createLocalAdapter();
    }
  }
  return sharedDb;
}

function closeDb() {
  if (sharedDb) {
    sharedDb.close();
    sharedDb = null;
  }
}

function openDatabase(filePath = DB_PATH) {
  return createLocalAdapter(filePath);
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
  CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(status, published_at);
`;

const MIGRATIONS = [
  {
    version: 1,
    description: 'Base schema',
    up: async (db) => db.exec(BASE_SCHEMA),
  },
  {
    version: 2,
    description: 'Projects section toggle + editable projects headings; blog published index',
    up: async (db) => {
      await db.run("INSERT OR IGNORE INTO sections (section_key, label, display_order) VALUES ('projects', 'Projects', 7)");
      await db.run('INSERT OR IGNORE INTO site_content (content_key, label, value, section) VALUES (?, ?, ?, ?)', ['projects_label', 'Projects Section Label', 'Selected Work', 'projects']);
      await db.run('INSERT OR IGNORE INTO site_content (content_key, label, value, section) VALUES (?, ?, ?, ?)', ['projects_title', 'Projects Section Title', 'Projects', 'projects']);
      await db.run('INSERT OR IGNORE INTO site_content (content_key, label, value, section) VALUES (?, ?, ?, ?)', ['projects_desc', 'Projects Section Description', 'Tools, experiments, and builds across security and software engineering.', 'projects']);
      await db.exec('CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(status, published_at)');
    },
  },
];

async function runMigrations(db = getDb()) {
  if (db.isTurso) {
    return { from: 2, to: 2, applied: 0 };
  }
  const current = db.rawDb.pragma('user_version', { simple: true });
  const pending = MIGRATIONS.filter((m) => m.version > current);
  for (const migration of pending) {
    db.rawDb.transaction(() => {
      migration.up(db);
      db.rawDb.pragma(`user_version = ${migration.version}`);
    })();
  }
  return { from: current, to: db.rawDb.pragma('user_version', { simple: true }), applied: pending.length };
}

async function initializeDatabase() {
  const db = getDb();
  await db.exec(BASE_SCHEMA);
  return runMigrations(db);
}

module.exports = { getDb, closeDb, openDatabase, initializeDatabase, runMigrations, DB_PATH };
