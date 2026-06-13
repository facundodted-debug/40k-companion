import { sql } from '@vercel/postgres';

let initialized: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!initialized) {
    initialized = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      await sql`CREATE TABLE IF NOT EXISTS lists (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      await sql`CREATE TABLE IF NOT EXISTS matchups (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      await sql`CREATE TABLE IF NOT EXISTS profiles (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;

      await sql`CREATE INDEX IF NOT EXISTS lists_user_id_idx ON lists(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS matchups_user_id_created_at_idx ON matchups(user_id, created_at DESC)`;
    })();
  }
  return initialized;
}

export { sql };
