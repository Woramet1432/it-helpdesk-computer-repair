-- ====================================================================
-- Migration 002: Support Guest Repair Requests without registration
-- รองรับการแจ้งซ่อมแบบ Guest โดยไม่ต้องลงทะเบียนผู้ใช้
-- ====================================================================

-- 1. Make requester_id optional for tickets created by public guests
ALTER TABLE tickets ALTER COLUMN requester_id DROP NOT NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS requester_name VARCHAR(100);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(50);

-- 2. Allow comments from guest users
ALTER TABLE ticket_comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);

-- 3. Allow feedback from guest users
ALTER TABLE ticket_feedback ALTER COLUMN user_id DROP NOT NULL;

-- 4. Allow attachments from guest users
ALTER TABLE ticket_attachments ALTER COLUMN uploader_id DROP NOT NULL;

-- 5. Add index for quick tracking search
CREATE INDEX IF NOT EXISTS idx_tickets_tracking_code ON tickets(tracking_code);
CREATE INDEX IF NOT EXISTS idx_tickets_phone ON tickets(contact_phone);
