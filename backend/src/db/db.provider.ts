import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

export const DRIZZLE = 'DRIZZLE';

export type DrizzleDB = NodePgDatabase<typeof schema>;

export const dbProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({
      connectionString,
    });
    return drizzle(pool, { schema });
  },
};
