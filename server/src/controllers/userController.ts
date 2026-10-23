import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { UserRole } from '../types/index.ts';

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  const users = await db.getUsers();
  return res.json({
    success: true,
    data: users,
  });
}

export async function listTechnicians(req: AuthenticatedRequest, res: Response) {
  const users = await db.getUsers();
  const technicians = users.filter((u) => u.role === 'technician' || u.role === 'admin');
  return res.json({
    success: true,
    data: technicians,
  });
}

export async function listDepartments(req: AuthenticatedRequest, res: Response) {
  const departments = await db.getDepartments();
  return res.json({
    success: true,
    data: departments,
  });
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const { role, isActive, departmentId } = req.body;

  const validRoles: UserRole[] = ['admin', 'technician', 'user'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'บทบาทผู้ใช้ไม่ถูกต้อง' });
  }

  const user = await db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
  }

  // Prevent admin from locking out the main admin user
  if (user.id === 1 && (role !== 'admin' || isActive === false)) {
    return res.status(400).json({
      success: false,
      message: 'ไม่สามารถลดระดับหรือระงับสิทธิ์บัญชีผู้ดูแลระบบหลักได้',
    });
  }

  const updatePayload: any = {};
  if (role) updatePayload.role = role;
  if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
  if (departmentId !== undefined) updatePayload.departmentId = Number(departmentId) || null;

  const updated = await db.updateUser(id, updatePayload);

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'USER_ROLE_UPDATED',
    targetType: 'USER',
    targetId: String(id),
    details: { targetUsername: user.username, newRole: role, isActive },
  });

  return res.json({
    success: true,
    message: 'ปรับปรุงข้อมูลผู้ใช้งานสำเร็จ',
    data: updated,
  });
}
