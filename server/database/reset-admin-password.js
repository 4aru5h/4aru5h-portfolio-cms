/**
 * Sets the password of ADMIN_USERNAME to the current ADMIN_PASSWORD value (.env),
 * creating the account if it does not exist. Existing sessions for the account are
 * invalidated by the server's session store expiry; restart the server afterwards
 * to force all sessions to re-authenticate (see README).
 *
 *   npm run admin:reset
 */
const { initializeDatabase, closeDb } = require('./schema');
const { resetAdminPassword } = require('../auth/admin');

if (require.main === module) {
  initializeDatabase();
  resetAdminPassword()
    .then((result) => {
      console.log(`Admin password ${result.action} for '${result.username}'.`);
      // Invalidate all active sessions so any old session cookies cannot be used
      const path = require('path');
      const fs = require('fs');
      const sessionDbPath = path.join(__dirname, '..', '..', 'database', 'sessions.db');
      if (fs.existsSync(sessionDbPath)) {
        const Database = require('better-sqlite3');
        const sdb = new Database(sessionDbPath);
        sdb.prepare('DELETE FROM sessions').run();
        sdb.close();
        console.log('All active sessions invalidated.');
      }
      closeDb();
    })
    .catch((error) => {
      console.error(error.message);
      closeDb();
      process.exit(1);
    });
}

module.exports = { resetAdminPassword };
