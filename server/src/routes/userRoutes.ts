import { Router } from 'express';
import {
  listUsers,
  listTechnicians,
  listDepartments,
  updateUserRole,
} from '../controllers/userController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

// Departments can be viewed by all authenticated users (needed for ticket submission)
router.get('/departments', requireAuth, listDepartments);

// Technicians list can be viewed by authenticated users (needed for filtering and assignment)
router.get('/technicians', requireAuth, listTechnicians);

// Full user list and role management is restricted to Admins
router.get('/', requireRole(['admin']), listUsers);
router.patch('/:id/role', requireRole(['admin']), updateUserRole);

export default router;
