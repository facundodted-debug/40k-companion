import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { sql } from './_db';
import { getUserId } from './_session';

const MAX_RECORDS = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserId(req, res);

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT id, data, created_at FROM matchups
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${MAX_RECORDS}
    `;
    return res.status(200).json(
      rows.map(r => ({ ...(r.data as object), id: r.id, date: (r.created_at as Date).toISOString() }))
    );
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = randomUUID();
    await sql`
      INSERT INTO matchups (id, user_id, data)
      VALUES (${id}, ${userId}, ${JSON.stringify(body)}::jsonb)
    `;
    await sql`
      DELETE FROM matchups
      WHERE user_id = ${userId}
        AND id NOT IN (
          SELECT id FROM matchups WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${MAX_RECORDS}
        )
    `;
    return res.status(200).json({ ...body, id, date: new Date().toISOString() });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
