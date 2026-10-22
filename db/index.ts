import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Active database: Neon (DATABASE_URL), through the Neon serverless HTTP driver.
// Supabase is NOT used today — it's a standby Postgres kept only as a future backup/migration
// target (kept awake by scripts/keep-supabase-alive.ts). Switching to it would mean pointing
// DATABASE_URL at Supabase and replacing neon-http with drizzle-orm/postgres-js (the Neon driver
// only talks to Neon).
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
