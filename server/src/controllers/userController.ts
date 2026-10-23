import { Response } from 'express';
import bcrypt from 'bcryptjs';
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

export async function createUser(req: AuthenticatedRequest, res: Response) {
  const { username, email, password, fullName, role, departmentId, phone, location, isActive } = req.body;

  // Validation
  const errors: Record<string, string> = {};
  if (!username || username.trim().length < 3) {
    errors.username = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.username = 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) เท่านั้น';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!password || password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = 'กรุณาระบุชื่อ-นามสกุล';
  }

  const validRoles: UserRole[] = ['admin', 'technician', 'user'];
  const assignedRole: UserRole = validRoles.includes(role) ? role : 'user';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลผู้ใช้งานไม่ถูกต้อง',
      errors,
    });
  }

  // Check unique username
  const existingUser = await db.getUserByUsername(username.trim());
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'ชื่อผู้ใช้งาน (Username) นี้มีอยู่ในระบบแล้ว',
      errors: { username: 'Username นี้ถูกใช้งานแล้ว' },
    });
  }

  // Check unique email
  const existingEmail = await db.getUserByEmail(email.trim());
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'อีเมลนี้ถูกใช้งานแล้วในระบบ',
      errors: { email: 'อีเมลนี้ถูกใช้งานแล้ว' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await db.createUser({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    fullName: fullName.trim(),
    role: assignedRole,
    departmentId: departmentId ? Number(departmentId) : undefined,
    phone: phone?.trim() || undefined,
    location: location?.trim() || undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'USER_CREATED',
    targetType: 'USER',
    targetId: String(newUser.id),
    details: { username: newUser.username, role: newUser.role, createdBy: req.user?.username },
  });

  return res.status(201).json({
    success: true,
    message: 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว',
    data: newUser,
  });
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const { username, email, password, fullName, role, departmentId, phone, location, isActive } = req.body;

  const user = await db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
  }

  // Prevent admin from locking out the main admin user
  if (user.id === 1 && (role && role !== 'admin' || isActive === false)) {
    return res.status(400).json({
      success: false,
      message: 'ไม่สามารถลดระดับหรือระงับสิทธิ์บัญชีผู้ดูแลระบบหลักได้',
    });
  }

  const errors: Record<string, string> = {};

  if (username !== undefined) {
    if (username.trim().length < 3) {
      errors.username = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      errors.username = 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) เท่านั้น';
    } else if (username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const existing = await db.getUserByUsername(username.trim());
      if (existing && existing.id !== id) {
        errors.username = 'Username นี้ถูกใช้งานแล้ว';
      }
    }
  }

  if (email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const existing = await db.getUserByEmail(email.trim());
      if (existing && existing.id !== id) {
        errors.email = 'อีเมลนี้ถูกใช้งานแล้ว';
      }
    }
  }

  if (password && password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }

  if (fullName !== undefined && fullName.trim().length < 2) {
    errors.fullName = 'กรุณาระบุชื่อ-นามสกุล';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลผู้ใช้งานไม่ถูกต้อง',
      errors,
    });
  }

  const updatePayload: any = {};
  if (username !== undefined) updatePayload.username = username.trim();
  if (email !== undefined) updatePayload.email = email.trim().toLowerCase();
  if (fullName !== undefined) updatePayload.fullName = fullName.trim();
  if (phone !== undefined) updatePayload.phone = phone.trim() || null;
  if (location !== undefined) updatePayload.location = location.trim() || null;
  if (departmentId !== undefined) updatePayload.departmentId = departmentId ? Number(departmentId) : null;
  if (role !== undefined) {
    const validRoles: UserRole[] = ['admin', 'technician', 'user'];
    if (validRoles.includes(role)) {
      updatePayload.role = role;
    }
  }
  if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

  if (password && password.trim().length >= 6) {
    updatePayload.passwordHash = await bcrypt.hash(password.trim(), 10);
  }

  const updated = await db.updateUser(id, updatePayload);

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'USER_UPDATED',
    targetType: 'USER',
    targetId: String(id),
    details: { targetUsername: user.username, changes: Object.keys(updatePayload) },
  });

  return res.json({
    success: true,
    message: 'ปรับปรุงข้อมูลผู้ใช้งานสำเร็จ',
    data: updated,
  });
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);

  if (id === 1) {
    return res.status(400).json({
      success: false,
      message: 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้',
    });
  }

  if (req.user?.userId === id) {
    return res.status(400).json({
      success: false,
      message: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้',
    });
  }

  const user = await db.getUserById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งาน' });
  }

  const success = await db.deleteUser(id);
  if (!success) {
    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
  }

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'USER_DELETED',
    targetType: 'USER',
    targetId: String(id),
    details: { targetUsername: user.username, deletedBy: req.user?.username },
  });

  return res.json({
    success: true,
    message: `ลบผู้ใช้งาน ${user.fullName} (@${user.username}) เรียบร้อยแล้ว`,
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
