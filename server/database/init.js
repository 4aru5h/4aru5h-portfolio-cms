/**
 * Database initialisation.
 *
 *   npm run db:init            Create tables, apply migrations, seed ONLY if the database is empty.
 *   npm run db:init -- --force Back up the database, then restore the original seed content
 *                              (replaces skills, categories, certifications, experiences,
 *                              navigation and default text).
 *
 * Safe to run repeatedly: without --force it never modifies existing content.
 */
const fs = require('fs');
const { initializeDatabase, closeDb, DB_PATH } = require('./schema');
const { seedDatabase } = require('./seed');
const { backupDatabase } = require('./backup');

async function main() {
  const force = process.argv.includes('--force');
  const existed = fs.existsSync(DB_PATH);

  if (force && existed) {
    const backupFile = await backupDatabase({ label: 'portfolio-before-reseed' });
    console.log(`Backup written to ${backupFile}`);
  }

  const migration = await initializeDatabase();
  console.log(`Database ready at ${DB_PATH} (schema v${migration.to}, ${migration.applied} migration(s) applied).`);

  const result = await seedDatabase({ force });
  console.log(result.seeded ? 'Seeded original portfolio content.' : result.reason);
}

main()
  .then(() => closeDb())
  .catch((err) => {
    console.error('Database initialisation failed:', err.message);
    closeDb();
    process.exit(1);
  });
