import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLogin,
  validateRegister,
  validateTicketCreate,
  validateComment,
  validateFeedback,
} from '../src/validators/index.ts';

test('validateLogin rejects empty credentials', () => {
  const result = validateLogin({ username: '', password: '' });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.username);
  assert.ok(result.errors.password);
});

test('validateLogin accepts valid credentials', () => {
  const result = validateLogin({ username: 'admin', password: 'Password@123' });
  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
});

test('validateRegister validates username length and characters', () => {
  const shortResult = validateRegister({
    username: 'ab',
    email: 'user@example.com',
    password: 'Password@123',
    fullName: 'ทดสอบ ผู้ใช้',
  });
  assert.equal(shortResult.isValid, false);
  assert.ok(shortResult.errors.username);

  const specialCharResult = validateRegister({
    username: 'user<invalid>',
    email: 'user@example.com',
    password: 'Password@123',
    fullName: 'ทดสอบ ผู้ใช้',
  });
  assert.equal(specialCharResult.isValid, false);
  assert.ok(specialCharResult.errors.username);
});

test('validateRegister validates email format', () => {
  const badEmail = validateRegister({
    username: 'validuser',
    email: 'not-an-email',
    password: 'Password@123',
    fullName: 'ทดสอบ ผู้ใช้',
  });
  assert.equal(badEmail.isValid, false);
  assert.ok(badEmail.errors.email);
});

test('validateTicketCreate enforces required title, category, and contact info (description optional)', () => {
  const empty = validateTicketCreate({});
  assert.equal(empty.isValid, false);
  assert.ok(empty.errors.title);
  assert.equal(empty.errors.description, undefined);
  assert.ok(empty.errors.category);
  assert.ok(empty.errors.location);
  assert.ok(empty.errors.contactPhone);

  const validWithoutDesc = validateTicketCreate({
    title: 'คอมพิวเตอร์จอฟ้าเปิดไม่ติด',
    category: 'computer_laptop',
    priority: 'high',
    location: 'ชั้น 3 อาคาร B',
    contactPhone: '0812345678',
  });
  assert.equal(validWithoutDesc.isValid, true);
  assert.equal(Object.keys(validWithoutDesc.errors).length, 0);

  const valid = validateTicketCreate({
    title: 'คอมพิวเตอร์จอฟ้าเปิดไม่ติด',
    description: 'เครื่องขึ้นหน้าจอฟ้า CRITICAL_PROCESS_DIED ขณะเปิดโปรแกรมบัญชี',
    category: 'computer_laptop',
    priority: 'high',
    location: 'ชั้น 3 อาคาร B',
    contactPhone: '0812345678',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateComment enforces non-empty string', () => {
  assert.equal(validateComment({ comment: '' }).isValid, false);
  assert.equal(validateComment({ comment: '    ' }).isValid, false);
  assert.equal(validateComment({ comment: 'ช่างมาตรวจสอบแล้ว ขอบคุณครับ' }).isValid, true);
});

test('validateFeedback requires rating between 1 and 5', () => {
  assert.equal(validateFeedback({ rating: 0 }).isValid, false);
  assert.equal(validateFeedback({ rating: 6 }).isValid, false);
  assert.equal(validateFeedback({ rating: 3 }).isValid, true);
  assert.equal(validateFeedback({ rating: 5 }).isValid, true);
});
