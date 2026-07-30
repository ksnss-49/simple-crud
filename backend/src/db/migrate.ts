import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is missing!');
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Standard for cloud DBs like Neon/RDS to accept certificates
    },
  });

  const db = drizzle(pool);
  console.log('Applying migrations from ./drizzle directory...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration execution failed with error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigration();
