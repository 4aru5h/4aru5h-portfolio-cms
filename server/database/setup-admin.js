/**
 * Creates the first admin account from ADMIN_USERNAME / ADMIN_PASSWORD (.env).
 * Does nothing if an admin account already exists. The server also does this
 * automatically on start-up, so running this script is optional.
 *
 *   npm run setup
 */
const { initializeDatabase, closeDb } = require('./schema');
const { ensureAdminUser } = require('../auth/admin');

async function setupAdmin() {
  initializeDatabase();
  const result = await ensureAdminUser();
  if (result.created) {
    console.log(`Admin user '${result.username}' created (password stored as a bcrypt hash).`);
  } else if (result.reason === 'exists') {
    console.log('An admin user already exists. Use `npm run admin:reset` to change the password.');
  } else {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env to create the admin user.');
  }
}

if (require.main === module) {
  setupAdmin()
    .then(() => closeDb())
    .catch((error) => {
      console.error(error.message);
      closeDb();
      process.exit(1);
    });
}

module.exports = { setupAdmin };
