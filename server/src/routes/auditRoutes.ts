import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

// Only admin can access system audit logs
router.use(requireAuth, requireRole(['admin']));

router.get('/', listAuditLogs);

export default router;
