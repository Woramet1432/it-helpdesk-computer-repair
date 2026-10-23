-- ====================================================================
-- IT Helpdesk & Computer Repair System - Seed Data (PostgreSQL)
-- ระบบแจ้งซ่อมคอมพิวเตอร์และบริการไอทีสำหรับองค์กร
-- Demo credentials:
--   admin / Admin@123 (Administrator)
--   tech.narin / Tech@123 (Technician)
--   tech.wichai / Tech@123 (Technician)
--   user.kanya / User@123 (Employee - HR)
--   user.pricha / User@123 (Employee - Accounting)
--   user.wipha / User@123 (Employee - Marketing)
-- ====================================================================

-- 1. Departments
INSERT INTO departments (id, name, code, description) VALUES
(1, 'ฝ่ายเทคโนโลยีสารสนเทศ (IT)', 'IT', 'ดูแลระบบสารสนเทศ โครงสร้างพื้นฐาน และอุปกรณ์คอมพิวเตอร์'),
(2, 'ฝ่ายทรัพยากรบุคคล (HR)', 'HR', 'บริหารงานบุคคล สวัสดิการ และการสรรหา'),
(3, 'ฝ่ายการเงินและบัญชี (ACC)', 'ACC', 'การเงิน บัญชี ภาษี และงบประมาณ'),
(4, 'ฝ่ายการตลาดและประชาสัมพันธ์ (MKT)', 'MKT', 'การตลาด สื่อโฆษณา และการสื่อสารภาพลักษณ์องค์กร'),
(5, 'ฝ่ายขายและการบริการลูกค้า (SALES)', 'SALES', 'งานขายและประสานงานลูกค้า'),
(6, 'ฝ่ายปฏิบัติการและจัดซื้อ (OPS)', 'OPS', 'งานปฏิบัติการ คลังสินค้า และจัดซื้อจัดจ้าง')
ON CONFLICT (id) DO NOTHING;

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 2. Users (Password hashes generated via bcrypt)
-- 'Admin@123' -> $2a$10$X8c49e7pZ4eS7e3yPtu5OQz1t3s1iZ4Q4VfWfG9sK1l9bF5wDEMOA
-- 'Tech@123'  -> $2a$10$Y8c49e7pZ4eS7e3yPtu5OQz1t3s1iZ4Q4VfWfG9sK1l9bF5wDEMOT
-- 'User@123'  -> $2a$10$Z8c49e7pZ4eS7e3yPtu5OQz1t3s1iZ4Q4VfWfG9sK1l9bF5wDEMOU
INSERT INTO users (id, username, email, password_hash, full_name, role, department_id, phone, location, is_active) VALUES
(1, 'admin', 'admin@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e1', 'วรเมธ ดีแล้ว', 'admin', 1, '123', 'อาคาร A ชั้น 4 ห้อง IT Operations', TRUE),
(2, 'tech.narin', 'narin.k@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e2', 'พิชิต เพ่งเเจ่ม', 'technician', 1, '123', 'อาคาร A ชั้น 4 IT Support Desk', TRUE),
(3, 'tech.wichai', 'wichai.s@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e2', 'ภูมินทร์', 'technician', 1, '123', 'อาคาร A ชั้น 4 IT Repair Lab', TRUE),
(4, 'user.kanya', 'kanya.m@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e3', 'กัญญา มณีฉาย', 'user', 2, '02-123-4210', 'อาคาร B ชั้น 2 แผนก HR', TRUE),
(5, 'user.pricha', 'pricha.t@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e3', 'ปรีชา ตั้งมั่นคง', 'user', 3, '02-123-4315', 'อาคาร B ชั้น 3 แผนกการเงิน', TRUE),
(6, 'user.wipha', 'wipha.r@company.co.th', '$2a$10$Y7LqH5.t6vL3hKz4Qy7D8.X2J4tB3m0n9v8w7x6y5z4a3b2c1d0e3', 'วิภา รัตนโชติ', 'user', 4, '02-123-4420', 'อาคาร A ชั้น 2 แผนกการตลาด', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 3. Assets
INSERT INTO assets (id, asset_number, name, category, brand_model, serial_number, department_id, assigned_user_id, status, purchase_date, warranty_expire, notes) VALUES
(1, 'AST-NB-2025-010', 'Dell Latitude 5430 (Laptop)', 'computer_laptop', 'Dell Latitude 5430 Core i7 / 16GB / 512GB', 'DL5430-TH-88219', 2, 4, 'active', '2025-03-15', '2028-03-15', 'เครื่องประจำตำแหน่ง กัญญา (HR)'),
(2, 'AST-PR-2024-004', 'HP LaserJet Enterprise M507x', 'printer', 'HP LaserJet M507x Monochrome', 'HP-M507-99120', 3, NULL, 'in_repair', '2024-06-10', '2027-06-10', 'เครื่องพิมพ์ประจำแผนกการเงิน ชั้น 3'),
(3, 'AST-PC-2024-022', 'Lenovo ThinkCentre M70s (Desktop)', 'computer_laptop', 'Lenovo M70s Core i5 / 16GB / 512GB', 'LN-M70S-33102', 3, 5, 'active', '2024-08-01', '2027-08-01', 'คอมพิวเตอร์ตั้งโต๊ะ ปรีชา (บัญชี)'),
(4, 'AST-SW-2025-031', 'Cisco Catalyst 1000 24-Port Switch', 'network_internet', 'Cisco C1000-24T-4G-L', 'FOC2518W09Z', 1, NULL, 'active', '2025-01-10', '2028-01-10', 'ตู้ Rack ชั้น 2 อาคาร B'),
(5, 'AST-NB-2025-045', 'MacBook Pro 14 M3 Pro', 'computer_laptop', 'Apple MacBook Pro 14 M3 Pro 18GB', 'C02GQ35NMD6R', 4, 6, 'active', '2025-05-20', '2027-05-20', 'เครื่องงานกราฟิก วิภา (การตลาด)')
ON CONFLICT (id) DO NOTHING;

SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets));

-- 4. Tickets
INSERT INTO tickets (id, ticket_number, requester_id, department_id, asset_id, category, priority, status, title, description, location, contact_phone, assigned_technician_id, diagnosis, repair_actions, resolution_notes, created_at, accepted_at, resolved_at, closed_at) VALUES
(1, 'TK-202610-0001', 4, 2, 1, 'computer_laptop', 'high', 'in_progress', 'โน้ตบุ๊กเปิดเครื่องแล้วขึ้นหน้าจอฟ้า (Blue Screen) ขณะรันโปรแกรมเงินเดือน', 'ขณะกำลังเปิดโปรแกรมคำนวณเงินเดือนรอบสิ้นเดือน หน้าจอโน้ตบุ๊กดับและแสดงหน้าจอฟ้ารหัส CRITICAL_PROCESS_DIED', 'อาคาร B ชั้น 2 แผนก HR', '081-987-6543 (กัญญา)', 3, 'ตรวจสอบพบปัญหาเกิดจากไดรเวอร์ NVMe SSD อัปเดตค้าง', 'กำลังบูตผ่าน WinPE เพื่อสำรองข้อมูลสำคัญ', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '47 hours', NULL, NULL),
(2, 'TK-202610-0002', 5, 3, 2, 'printer', 'normal', 'waiting_user', 'เครื่องพิมพ์ HP แผนกบัญชีกระดาษติดบ่อย และมีคราบหมึกเปื้อนเป็นแถบดำ', 'เครื่องพิมพ์พิมพ์เอกสารใบกำกับภาษีแล้วกระดาษติดที่ถาด 2 บ่อยมาก และพบแถบหมึกดำเลอะหน้ากระดาษ', 'อาคาร B ชั้น 3 แผนกบัญชี', '082-345-6789 (ปรีชา)', 2, 'ลูกยางดึงกระดาษเสื่อมสภาพ และ Drum Unit มีรอยขีดข่วน', 'เปลี่ยนชุด Drum Unit ใหม่แล้ว ทดสอบพิมพ์เทสหน้าแรกผ่านดี', 'รอลูกค้ามาทดสอบสั่งพิมพ์จริง', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days 23 hours', NULL, NULL),
(3, 'TK-202610-0003', 6, 4, NULL, 'network_internet', 'critical', 'new', 'สัญญาณ Wi-Fi ชั้น 2 อาคาร A หลุดบ่อยมาก ไม่สามารถอัปโหลดไฟล์วิดีโองานลูกค้าได้', 'สัญญาณ Wi-Fi หลุดทุก 5-10 นาที ขณะนี้มีงาน Live สดและส่งมอบไฟล์ขนาด 10GB ให้ลูกค้าด่วนมาก', 'อาคาร A ชั้น 2 แผนกการตลาด', '089-112-2334 (วิภา)', NULL, NULL, NULL, NULL, NOW() - INTERVAL '6 hours', NULL, NULL, NULL),
(4, 'TK-202610-0004', 4, 2, NULL, 'email_account', 'normal', 'resolved', 'ขอรีเซ็ตรหัสผ่านอีเมลบริษัท Outlook และตั้งค่า Two-Factor Authentication', 'เปลี่ยนโทรศัพท์มือถือเครื่องใหม่ ไม่สามารถล็อกอินเข้า Webmail และ Teams ได้', 'อาคาร B ชั้น 2 แผนก HR', '081-987-6543 (กัญญา)', 2, 'MFA Session ผูกกับมือถือเครื่องเก่าที่รีเซ็ตไปแล้ว', 'รีเซ็ต MFA ในระบบและส่งลิงก์ Temporary Access Pass', 'ผู้ใช้งานลงทะเบียนยืนยันตัวตนใหม่สำเร็จ ใช้งาน Outlook ได้ปกติ', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 23 hours', NOW() - INTERVAL '6 days', NULL),
(5, 'TK-202610-0005', 5, 3, 3, 'software', 'low', 'closed', 'ขอติดตั้งโปรแกรม Adobe Acrobat Pro สำหรับเปิดอ่านและเซ็นเอกสารดิจิทัล', 'จำเป็นต้องลงนามเอกสารสัญญาจัดซื้อของบริษัทในรูปแบบ Digital Signature', 'อาคาร B ชั้น 3 แผนกการเงิน', '082-345-6789 (ปรีชา)', 3, 'เครื่องมีสเปกพร้อมรองรับ License Adobe Creative Cloud', 'ทำการ Remote ติดตั้งโปรแกรมและติดตั้ง Certificate', 'ติดตั้งและทดสอบฟังก์ชัน Digital Sign เรียบร้อย', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days 23 hours', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('tickets_id_seq', (SELECT MAX(id) FROM tickets));

-- 5. Ticket Comments
INSERT INTO ticket_comments (id, ticket_id, user_id, is_internal, comment, created_at) VALUES
(1, 1, 3, FALSE, 'ได้รับเครื่องเรียบร้อยแล้วครับ กำลังสำรองข้อมูลไฟล์งานที่หน้า Desktop และโฟลเดอร์ Documents ให้ก่อนการตรวจสอบฮาร์ดดิสก์ครับ', NOW() - INTERVAL '47 hours'),
(2, 1, 4, FALSE, 'ฝากไฟล์ Excel ในโฟลเดอร์ "Payroll_Oct2026" ด้วยนะคะ สำคัญมากเลยค่ะ ขอบคุณค่ะ', NOW() - INTERVAL '46 hours'),
(3, 1, 3, TRUE, '[Internal Note] ตรวจพบ SSD สุขภาพเหลือ 68% คาดว่าอีกไม่เกิน 2 เดือนควรทำเรื่องเบิกงบเปลี่ยนเป็น Samsung 1TB', NOW() - INTERVAL '30 hours'),
(4, 2, 2, FALSE, 'ช่างได้เข้ามาทำความสะอาดชุดลูกกลิ้งและเปลี่ยน Drum ใหม่แล้วครับ รบกวนคุณปรีชาทดลองสั่งพิมพ์จากเครื่องคอมพิวเตอร์ดูนะครับ', NOW() - INTERVAL '24 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval('ticket_comments_id_seq', (SELECT MAX(id) FROM ticket_comments));

-- 6. Ticket Feedback
INSERT INTO ticket_feedback (id, ticket_id, user_id, rating, comment, created_at) VALUES
(1, 4, 4, 5, 'ช่างนรินทร์ให้บริการรวดเร็วมาก แนะนำวิธีการตั้งค่า OTP ชัดเจน ขอบคุณมากค่ะ', NOW() - INTERVAL '5 days 20 hours'),
(2, 5, 5, 5, 'ติดตั้งเร็วมาก ไม่รบกวนเวลาทำงานเลย เยี่ยมครับ', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('ticket_feedback_id_seq', (SELECT MAX(id) FROM ticket_feedback));

-- 7. Audit Logs
INSERT INTO audit_logs (id, user_id, action, target_type, target_id, ip_address, details, created_at) VALUES
(1, 1, 'SYSTEM_BOOTSTRAP', 'SYSTEM', '0', '127.0.0.1', '{"message": "Database initialized with seed data"}', NOW() - INTERVAL '14 days'),
(2, 1, 'TICKET_ASSIGNED', 'TICKET', '1', '192.168.1.10', '{"ticketNumber": "TK-202610-0001", "assignedTo": "วิชัย"}', NOW() - INTERVAL '47 hours'),
(3, 2, 'TICKET_RESOLVED', 'TICKET', '4', '192.168.1.12', '{"ticketNumber": "TK-202610-0004", "status": "resolved"}', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
