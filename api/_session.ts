import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { ensureSchema, sql } from './_db';

const COOKIE_NAME = 'session_id';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

/**
 * Returns the anonymous user id for this request, creating a new session
 * cookie + user row if none exists yet.
 */
export async function getUserId(req: VercelRequest, res: VercelResponse): Promise<string> {
  await ensureSchema();

  const cookies = parseCookies(req.headers.cookie);
  const existing = cookies[COOKIE_NAME];

  if (existing) {
    const { rows } = await sql`SELECT id FROM users WHERE id = ${existing}`;
    if (rows.length > 0) return existing;
  }

  const userId = randomUUID();
  await sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`;

  const isLocal = (req.headers.host ?? '').startsWith('localhost') || (req.headers.host ?? '').startsWith('127.0.0.1');
  const secure = isLocal ? '' : ' Secure;';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${userId}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax; HttpOnly;${secure}`);

  return userId;
}
