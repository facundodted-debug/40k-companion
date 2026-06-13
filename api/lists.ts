import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { sql } from './_db';
import { getUserId } from './_session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserId(req, res);

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT id, data FROM lists WHERE user_id = ${userId} ORDER BY created_at ASC
    `;
    return res.status(200).json(rows.map(r => ({ ...(r.data as object), id: r.id })));
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const id = (body.id as string) ?? randomUUID();
    const data = { ...body, id };
    await sql`
      INSERT INTO lists (id, user_id, data)
      VALUES (${id}, ${userId}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const id = (req.query.id as string) ?? (req.body as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'missing id' });
    await sql`DELETE FROM lists WHERE id = ${id} AND user_id = ${userId}`;
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).end();
}
