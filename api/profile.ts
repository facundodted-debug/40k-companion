import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { getUserId } from './_session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserId(req, res);

  if (req.method === 'GET') {
    const { rows } = await sql`SELECT data FROM profiles WHERE user_id = ${userId}`;
    return res.status(200).json(rows[0]?.data ?? null);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    await sql`
      INSERT INTO profiles (user_id, data)
      VALUES (${userId}, ${JSON.stringify(body)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return res.status(200).json(body);
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).end();
}
