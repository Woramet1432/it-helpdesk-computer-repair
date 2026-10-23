import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import authRoutes from './authRoutes.ts';
import ticketRoutes from './ticketRoutes.ts';
import assetRoutes from './assetRoutes.ts';
import userRoutes from './userRoutes.ts';
import reportRoutes from './reportRoutes.ts';
import auditRoutes from './auditRoutes.ts';
import uploadRoutes from './uploadRoutes.ts';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/assets', assetRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/uploads', uploadRoutes);

apiRouter.get('/export-project-zip', (_req, res) => {
  const zipPath = path.resolve(process.cwd(), 'it-helpdesk-project.zip');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="it-helpdesk-project.zip"');
  return res.sendFile(zipPath);
});

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'IT Helpdesk & Computer Repair API',
  });
});

export default apiRouter;
