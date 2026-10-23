import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UserRole } from '../types/index.ts';
import { db } from '../db/database.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'it-helpdesk-jwt-secret-key-prod-2026';

export interface TokenPayload {
  userId: number;
  username: string;
  role: UserRole;
  fullName: string;
  exp: number;
}

export function generateToken(user: { id: number; username: string; role: UserRole; fullName: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload: TokenPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/auth_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (payload) {
    // Verify user is still active in database
    const user = await db.getUserById(payload.userId);
    if (user && user.isActive) {
      req.user = payload;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)',
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Authentication required)',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการเข้าถึงส่วนงานนี้ (Forbidden: insufficient privileges)',
      });
    }

    next();
  };
}
