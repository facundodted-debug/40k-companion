import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserId } from './_session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserId(req, res);
  return res.status(200).json({ userId });
}
