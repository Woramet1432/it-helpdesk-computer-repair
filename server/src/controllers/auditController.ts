import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function listAuditLogs(req: AuthenticatedRequest, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const logs = await db.getAuditLogs(limit);
  return res.json({
    success: true,
    data: logs,
  });
}
