/*
  Supabase is NOT used by the app today — the active DB is Neon (see db/index.ts). This Supabase
  Postgres instance is kept on standby as a backup/migration target in case the project moves off
  Neon. Free-tier projects auto-pause after 7 days with no activity, and since nothing uses it, it
  would otherwise get paused every week.

  Runs a single read-only `select 1` against it — enough to register as activity, touches no data,
  creates/reads/writes nothing. Scheduled weekly via .github/workflows/supabase-keepalive.yml.

  TODO (one-time, manual — not done yet): the weekly workflow won't work until the
  SUPABASE_KEEPALIVE_DATABASE_URL secret is added on GitHub — Settings > Secrets and variables >
  Actions > New repository secret. Value: same connection string as POSTGRES_URL_NON_POOLING (or
  POSTGRES_URL) in .env.local. Locally, just set the same var in .env.local instead.
*/
import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const connectionString = process.env.SUPABASE_KEEPALIVE_DATABASE_URL;
  if (!connectionString) {
    throw new Error('Missing SUPABASE_KEEPALIVE_DATABASE_URL (Supabase Postgres connection string).');
  }

  // prepare: false — Supabase's connection pooler (Supavisor, transaction mode) doesn't support
  // prepared statements, which the `postgres` client uses by default.
  const sql = postgres(connectionString, { max: 1, idle_timeout: 5, connect_timeout: 10, prepare: false });

  try {
    const rows = await sql`select 1 as ping`;
    console.log('Supabase keep-alive ping ok:', rows[0]);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error('Supabase keep-alive ping failed:', err);
  process.exit(1);
});
