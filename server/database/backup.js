/**
 * Online SQLite backup (safe while the server is running, WAL-aware).
 *
 * Usage:  npm run db:backup            -> database/backups/portfolio-<timestamp>.db
 *         node database/backup.js <dir>
 */
const fs = require('fs');
const path = require('path');
const { getDb, closeDb, DB_PATH } = require('./schema');

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

async function backupDatabase({ dir, label = 'portfolio' } = {}) {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`No database found at ${DB_PATH}; nothing to back up.`);
  }
  const targetDir = dir || path.join(path.dirname(DB_PATH), 'backups');
  fs.mkdirSync(targetDir, { recursive: true });
  const target = path.join(targetDir, `${label}-${timestamp()}.db`);
  await getDb().backup(target);
  return target;
}

if (require.main === module) {
  backupDatabase({ dir: process.argv[2] })
    .then((file) => {
      console.log(`Backup written to ${file}`);
      closeDb();
    })
    .catch((error) => {
      console.error(`Backup failed: ${error.message}`);
      closeDb();
      process.exit(1);
    });
}

module.exports = { backupDatabase };
