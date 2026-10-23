import { Router } from 'express';
import { getDashboard, getReportData, exportCsv } from '../controllers/reportController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

// Staff (admin and technician) can view reports and metrics
router.use(requireAuth, requireRole(['admin', 'technician']));

router.get('/dashboard', getDashboard);
router.get('/data', getReportData);
router.get('/export-csv', exportCsv);

export default router;
