import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../src/middleware/auth.ts';

test('bcrypt hashes and verifies passwords correctly', async () => {
  const password = 'SuperSecretPassword@2026';
  const hash = await bcrypt.hash(password, 10);
  assert.notEqual(hash, password);
  assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));

  const isValid = await bcrypt.compare(password, hash);
  assert.equal(isValid, true);

  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isInvalid, false);
});

test('generateToken creates valid HMAC-signed tokens and verifyToken extracts payload', () => {
  const user = {
    id: 42,
    username: 'tester',
    role: 'technician' as const,
    fullName: 'ทดสอบ ช่างไอที',
  };

  const token = generateToken(user);
  assert.ok(token);
  assert.equal(token.split('.').length, 2);

  const payload = verifyToken(token);
  assert.ok(payload);
  assert.equal(payload.userId, 42);
  assert.equal(payload.username, 'tester');
  assert.equal(payload.role, 'technician');
  assert.equal(payload.fullName, 'ทดสอบ ช่างไอที');
  assert.ok(payload.exp > Date.now());
});

test('verifyToken rejects tampered signatures', () => {
  const token = generateToken({
    id: 1,
    username: 'admin',
    role: 'admin',
    fullName: 'Admin',
  });

  const [data, signature] = token.split('.');
  // Modify one character in signature
  const badSignature = signature.slice(0, -1) + (signature.slice(-1) === 'a' ? 'b' : 'a');
  const tampered = `${data}.${badSignature}`;

  assert.equal(verifyToken(tampered), null);
});

test('verifyToken rejects malformed tokens', () => {
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('invalid-token-string'), null);
  assert.equal(verifyToken('part1.part2.part3'), null);
});
