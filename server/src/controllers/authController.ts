import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { validateLogin, validateRegister } from '../validators/index.ts';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.ts';

export async function login(req: AuthenticatedRequest, res: Response) {
  const { username, password } = req.body;

  const validation = validateLogin(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง',
      errors: validation.errors,
    });
  }

  // Find user by username or email
  let user = await db.getUserByUsername(username);
  if (!user) {
    user = await db.getUserByEmail(username);
  }

  if (!user || !user.passwordHash) {
    return res.status(401).json({
      success: false,
      message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (Invalid username or password)',
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อแผนกไอที',
    });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (Invalid username or password)',
    });
  }

  // Security Policy: Only admin and technician are permitted to login
  if (user.role !== 'admin' && user.role !== 'technician') {
    return res.status(403).json({
      success: false,
      message: 'ระบบเข้าสู่ระบบสงวนสิทธิ์เฉพาะผู้ดูแลระบบและช่างเทคนิคเท่านั้น (พนักงานทั่วไปสามารถแจ้งซ่อมและติดตามงานได้ทันทีโดยไม่ต้องล็อกอิน)',
    });
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  });

  // Set auth cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  await db.addAuditLog({
    userId: user.id,
    action: 'USER_LOGIN',
    targetType: 'AUTH',
    targetId: String(user.id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    details: { username: user.username, role: user.role },
  });

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    data: {
      token,
      user: safeUser,
    },
  });
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  if (req.user) {
    await db.addAuditLog({
      userId: req.user.userId,
      action: 'USER_LOGOUT',
      targetType: 'AUTH',
      targetId: String(req.user.userId),
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    });
  }

  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'ออกจากระบบเรียบร้อยแล้ว',
  });
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const user = await db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' });
  }

  const { passwordHash: _, ...safeUser } = user;
  return res.json({
    success: true,
    data: safeUser,
  });
}

export async function register(req: AuthenticatedRequest, res: Response) {
  const validation = validateRegister(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลการสมัครไม่ถูกต้อง',
      errors: validation.errors,
    });
  }

  const existingUsername = await db.getUserByUsername(req.body.username);
  if (existingUsername) {
    return res.status(409).json({
      success: false,
      message: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว',
      errors: { username: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว' },
    });
  }

  const existingEmail = await db.getUserByEmail(req.body.email);
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      message: 'อีเมลนี้ถูกใช้งานแล้ว',
      errors: { email: 'อีเมลนี้ถูกใช้งานแล้ว' },
    });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  // Security requirement: public registration NEVER allows admin or technician roles
  const newUser = await db.createUser({
    username: req.body.username.trim(),
    email: req.body.email.trim().toLowerCase(),
    passwordHash,
    fullName: req.body.fullName.trim(),
    role: 'user', // strictly regular user
    departmentId: req.body.departmentId ? Number(req.body.departmentId) : undefined,
    phone: req.body.phone,
    location: req.body.location,
    isActive: true,
  });

  await db.addAuditLog({
    userId: newUser.id,
    action: 'USER_REGISTERED',
    targetType: 'USER',
    targetId: String(newUser.id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { username: newUser.username, email: newUser.email },
  });

  const token = generateToken({
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    fullName: newUser.fullName,
  });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: 'ลงทะเบียนพนักงานสำเร็จ',
    data: {
      token,
      user: newUser,
    },
  });
}
