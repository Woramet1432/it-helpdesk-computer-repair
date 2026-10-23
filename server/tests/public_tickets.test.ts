import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/database.ts';
import {
  validatePublicTicketCreate,
  validateTrackTicket,
} from '../src/validators/index.ts';

test('validatePublicTicketCreate enforces required guest fields and numeric departmentId', () => {
  const invalid = validatePublicTicketCreate({});
  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.requesterName);
  assert.ok(invalid.errors.departmentId);
  assert.ok(invalid.errors.contactPhone);
  assert.ok(invalid.errors.category);
  assert.ok(invalid.errors.title);
  assert.equal(invalid.errors.description, undefined);
  assert.ok(invalid.errors.location);

  const nonNumericDept = validatePublicTicketCreate({
    requesterName: 'สมใจ ทำงานดี',
    departmentId: 'abc',
    category: 'computer_laptop',
    title: 'คอมพิวเตอร์เปิดไม่ติด',
    location: 'อาคาร A ชั้น 2',
    contactPhone: '081-234-5678',
  });
  assert.equal(nonNumericDept.isValid, false);
  assert.ok(nonNumericDept.errors.departmentId);

  const validNoDesc = validatePublicTicketCreate({
    requesterName: 'สมใจ ทำงานดี',
    departmentId: '1',
    category: 'computer_laptop',
    title: 'คอมพิวเตอร์เปิดไม่ติด',
    location: 'อาคาร A ชั้น 2',
    contactPhone: '081-234-5678',
  });
  assert.equal(validNoDesc.isValid, true);
  assert.equal(Object.keys(validNoDesc.errors).length, 0);

  const valid = validatePublicTicketCreate({
    requesterName: 'สมใจ ทำงานดี',
    departmentId: 1,
    category: 'computer_laptop',
    title: 'คอมพิวเตอร์เปิดไม่ติด',
    description: 'กดปุ่มเปิดแล้วไม่มีไฟเข้า พัดลมไม่หมุน',
    location: 'อาคาร A ชั้น 2',
    contactPhone: '081-234-5678',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('validateTrackTicket validates ticket number and verification code', () => {
  const empty = validateTrackTicket({});
  assert.equal(empty.isValid, false);
  assert.ok(empty.errors.ticketNumber);
  assert.ok(empty.errors.verificationCode);

  const valid = validateTrackTicket({
    ticketNumber: 'TK-202610-0001',
    verificationCode: 'TRK-9X4K2P',
  });
  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('db.createPublicTicket creates guest ticket with tracking code and null requesterId', async () => {
  const created = await db.createPublicTicket({
    requesterName: 'มานะ อดทน',
    departmentId: 2,
    category: 'printer',
    title: 'เครื่องพิมพ์กระดาษติดบ่อยมาก',
    description: 'สั่งพิมพ์งานแล้วกระดาษติดทุกแผ่น มีไฟกะพริบสีแดงเตือน',
    location: 'ชั้น 3 โต๊ะการเงิน',
    contactPhone: '089-111-2233',
    assetNumberCustom: 'IT-PRN-09',
  });

  assert.ok(created.id);
  assert.ok(created.ticketNumber.startsWith('TK-'));
  assert.ok(created.trackingCode?.startsWith('TRK-'));
  assert.equal(created.requesterId, null);
  assert.equal(created.requesterName, 'มานะ อดทน');
  assert.equal(created.requesterRole, 'guest');
  assert.equal(created.category, 'printer');
  assert.equal(created.status, 'new');

  // Verify can be tracked using trackingCode
  const trackedByCode = await db.getTicketByTracking(created.ticketNumber, created.trackingCode!);
  assert.ok(trackedByCode);
  assert.equal(trackedByCode.id, created.id);
  assert.equal(trackedByCode.requesterName, 'มานะ อดทน');

  // Verify can be tracked using phone number
  const trackedByPhone = await db.getTicketByTracking(created.ticketNumber, '0891112233');
  assert.ok(trackedByPhone);
  assert.equal(trackedByPhone.id, created.id);

  // Security test: Wrong verification code must be REJECTED!
  const wrongTracking = await db.getTicketByTracking(created.ticketNumber, 'WRONG_CODE_999');
  assert.equal(wrongTracking, null);
});

test('db.createPublicTicket succeeds without description and defaults description to title', async () => {
  const minimalTicket = await db.createPublicTicket({
    requesterName: 'สายชล น้ำใจดี',
    departmentId: 3,
    category: 'network_internet',
    title: 'WiFi ชั้น 2 หลุดบ่อยมาก',
    location: 'ชั้น 2 โต๊ะประชุม',
    contactPhone: '081-999-8888',
  });

  assert.ok(minimalTicket.id);
  assert.equal(minimalTicket.title, 'WiFi ชั้น 2 หลุดบ่อยมาก');
  assert.equal(minimalTicket.description, 'WiFi ชั้น 2 หลุดบ่อยมาก');
});

test('db.addPublicComment and submitPublicFeedback succeed with tracking verification', async () => {
  const guestTicket = await db.createPublicTicket({
    requesterName: 'วิภา สดใส',
    departmentId: 1,
    category: 'network_internet',
    title: 'เน็ตหลุดเข้าแชร์ไดรฟ์ไม่ได้',
    description: 'ไม่สามารถเปิดไฟล์ในไดรฟ์ Z ได้ สัญญาณเครือข่ายหลุด',
    location: 'ห้องฝ่ายบุคคล',
    contactPhone: '085-555-4321',
  });

  const code = guestTicket.trackingCode!;

  // Add comment as guest
  const comment = await db.addPublicComment(
    guestTicket.ticketNumber,
    code,
    'ลองเสียบสายแลนใหม่แล้วยังเข้าไม่ได้ค่ะ'
  );
  assert.ok(comment);
  assert.equal(comment.userRole, 'guest');
  assert.equal(comment.isInternal, false);
  assert.equal(comment.comment, 'ลองเสียบสายแลนใหม่แล้วยังเข้าไม่ได้ค่ะ');

  // Reject comment if wrong tracking code
  const rejectedComment = await db.addPublicComment(
    guestTicket.ticketNumber,
    'INVALID_PIN',
    'แฮกเกอร์พยายามส่งข้อความ'
  );
  assert.equal(rejectedComment, null);

  // Submit feedback as guest
  const feedback = await db.submitPublicFeedback(
    guestTicket.ticketNumber,
    code,
    5,
    'ช่างมาแก้ไขรวดเร็วมาก บริการประทับใจค่ะ'
  );
  assert.ok(feedback);
  assert.equal(feedback.rating, 5);
  assert.equal(feedback.comment, 'ช่างมาแก้ไขรวดเร็วมาก บริการประทับใจค่ะ');
});
