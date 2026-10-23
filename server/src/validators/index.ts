import { TicketCategory, TicketPriority, TicketStatus, UserRole } from '../types/index.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.username || typeof body.username !== 'string' || body.username.trim().length === 0) {
    errors.username = 'กรุณากรอกชื่อผู้ใช้งาน หรือ อีเมล (Username or Email is required)';
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.password = 'กรุณากรอกรหัสผ่าน (Password is required)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegister(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 3) {
    errors.username = 'ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
  } else if (!/^[a-zA-Z0-9._-]+$/.test(body.username)) {
    errors.username = 'ชื่อผู้ใช้งานสามารถใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข จุด ขีดล่าง และยัติภังค์';
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }

  if (!body.fullName || typeof body.fullName !== 'string' || body.fullName.trim().length < 2) {
    errors.fullName = 'กรุณาระบุชื่อ-นามสกุลจริง';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const VALID_CATEGORIES: TicketCategory[] = [
  'computer_laptop',
  'printer',
  'network_internet',
  'software',
  'email_account',
  'other_equipment',
];

export const VALID_PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'critical'];

export const VALID_STATUSES: TicketStatus[] = [
  'new',
  'accepted',
  'in_progress',
  'waiting_user',
  'resolved',
  'closed',
  'cancelled',
];

export function validateTicketCreate(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 5) {
    errors.title = 'กรุณากรอกหัวข้อปัญหาอย่างน้อย 5 ตัวอักษร';
  } else if (body.title.length > 200) {
    errors.title = 'หัวข้อปัญหาต้องไม่เกิน 200 ตัวอักษร';
  }

  if (!body.description || typeof body.description !== 'string' || body.description.trim().length < 10) {
    errors.description = 'กรุณาระบุรายละเอียดปัญหาที่พบให้ชัดเจน (อย่างน้อย 10 ตัวอักษร)';
  }

  if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
    errors.category = 'กรุณาเลือกหมวดหมู่ปัญหาที่ถูกต้อง';
  }

  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    errors.priority = 'ระดับความสำคัญไม่ถูกต้อง';
  }

  if (!body.location || typeof body.location !== 'string' || body.location.trim().length === 0) {
    errors.location = 'กรุณาระบุสถานที่หรือจุดติดตั้งอุปกรณ์ เช่น ชั้น/อาคาร/โต๊ะทำงาน';
  }

  if (!body.contactPhone || typeof body.contactPhone !== 'string' || body.contactPhone.trim().length < 9) {
    errors.contactPhone = 'กรุณาระบุเบอร์โทรศัพท์หรือเบอร์ภายในที่สามารถติดต่อได้';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateComment(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.comment || typeof body.comment !== 'string' || body.comment.trim().length === 0) {
    errors.comment = 'กรุณากรอกข้อความความคิดเห็น';
  } else if (body.comment.length > 2000) {
    errors.comment = 'ข้อความต้องไม่เกิน 2,000 ตัวอักษร';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateFeedback(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  const rating = Number(body.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    errors.rating = 'คะแนนความพึงพอใจต้องอยู่ระหว่าง 1 ถึง 5 ดาว';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
