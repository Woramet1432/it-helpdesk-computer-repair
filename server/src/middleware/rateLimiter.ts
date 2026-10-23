import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

export function loginRateLimiter(maxAttempts = 10, windowMs = 5 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record || now > record.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `คุณพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารออีก ${waitSeconds} วินาทีแล้วลองใหม่อีกครั้ง (Too many login attempts)`,
      });
    }

    record.count++;
    next();
  };
}
