import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../drizzle/schema';
import * as relations from '../drizzle/relations';

let db: ReturnType<typeof drizzle<typeof schema & typeof relations>>;

declare global {
  var __db__: ReturnType<typeof drizzle<typeof schema & typeof relations>> | undefined;
}

if (!global.__db__) {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  global.__db__ = drizzle(pool, { schema: { ...schema, ...relations } });
}

db = global.__db__;

export { db };
