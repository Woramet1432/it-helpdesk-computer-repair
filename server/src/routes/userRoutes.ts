import { Router } from 'express';
import {
  listUsers,
  listTechnicians,
  listDepartments,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} from '../controllers/userController.ts';
import { requireAuth, requireRole } from '../middleware/auth.ts';

const router = Router();

// Departments can be viewed publicly (needed for repair form department selection)
router.get('/departments', listDepartments);

// Technicians list can be viewed by authenticated users (needed for filtering and assignment)
router.get('/technicians', requireAuth, listTechnicians);

// Full user management (List, Create, Edit, Delete, Update Role) is restricted to Admins only
router.get('/', requireRole(['admin']), listUsers);
router.post('/', requireRole(['admin']), createUser);
router.put('/:id', requireRole(['admin']), updateUser);
router.delete('/:id', requireRole(['admin']), deleteUser);
router.patch('/:id/role', requireRole(['admin']), updateUserRole);

export default router;
