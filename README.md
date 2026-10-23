# IT Helpdesk & Computer Repair System
### ระบบแจ้งซ่อมคอมพิวเตอร์และบริการไอทีสำหรับองค์กร

ระบบสารสนเทศเพื่อการจัดการคำขอบริการไอที แจ้งซ่อมคอมพิวเตอร์ อุปกรณ์สำนักงาน และระบบเครือข่าย พัฒนาขึ้นด้วยสถาปัตยกรรมระดับ Production-Ready ครอบคลุมทั้ง **User Portal (พนักงานทั่วไป)** และ **Admin Portal (ทีมสนับสนุนไอทีและผู้ดูแลระบบ)** ออกแบบตามมาตรฐานความปลอดภัยทางไซเบอร์ รองรับการใช้งานผ่าน Visual Studio Code บนระบบปฏิบัติการ Windows และ Linux

---

## 1. คุณสมบัติเด่นของระบบ (Key Features)

### A. พอร์ทัลพนักงาน (User Portal)
1. **ระบบยืนยันตัวตน**: เข้าสู่ระบบและลงทะเบียนพนักงานใหม่ (กำหนดสิทธิ์ User อัตโนมัติเพื่อความปลอดภัย)
2. **แดชบอร์ดส่วนบุคคล**: แสดงสถานะงานซ่อมที่เปิดอยู่, งานที่กำลังซ่อม, และงานที่รอการตรวจสอบ
3. **เปิดคำขอแจ้งซ่อม (New Ticket)**:
   - สุ่มสร้างรหัสตั๋วอัตโนมัติ (เช่น `TK-202610-0001`)
   - 6 หมวดหมู่อุปกรณ์: คอมพิวเตอร์/โน้ตบุ๊ก, เครื่องพิมพ์, ระบบเครือข่าย, ซอฟต์แวร์, อีเมล/บัญชี, อุปกรณ์อื่นๆ
   - เลือกรหัสทรัพย์สิน (Asset Number) หรือพิมพ์ระบุเอง
   - เลือกระดับความสำคัญ (Low, Normal, High, Critical)
   - อัปโหลดรูปภาพหลักฐานและไฟล์เอกสาร (PNG, JPG, WEBP, PDF) พร้อมระบบตรวจสอบขนาดไม่เกิน 5MB
4. **ติดตามความคืบหน้า (Real-time Timeline)**: ดูสถานะ 7 ขั้นตอน (แจ้งใหม่, รับเรื่องแล้ว, กำลังดำเนินการ, รอผู้ใช้ตรวจสอบ, แก้ไขเสร็จสิ้น, ปิดงาน, ยกเลิก)
5. **การสื่อสารกับช่าง**: พูดคุยสอบถามความคืบหน้าผ่านกล่องข้อความ
6. **การประเมินความพึงพอใจ**: ให้คะแนนดาว (1-5 ดาว) พร้อมข้อเสนอแนะเมื่อช่างซ่อมงานเสร็จสิ้น

### B. พอร์ทัลผู้ดูแลระบบและช่างเทคนิค (Admin & IT Support Portal)
1. **แดชบอร์ดศูนย์ปฏิบัติการไอที (IT Command Center)**:
   - ตัวชี้วัดสำคัญ 6 การ์ด: ตั๋วทั้งหมด, แจ้งใหม่, กำลังซ่อม, รอลูกค้า, ซ่อมเสร็จ, งานเกินกำหนด (Overdue SLA)
   - แถบแจ้งเตือนงานด่วนระดับวิกฤต (Critical Priority Alerts)
   - สถิติแจกแจงตามหมวดหมู่งานและแผนก
   - ตารางภาระงานช่างเทคนิค (Technician Workload & MTTR)
2. **จัดการตั๋วงานไอที (Ticket Management)**:
   - ระบบค้นหาและตัวกรองละเอียด (สถานะ, ระดับความสำคัญ, หมวดหมู่, แผนก, ช่างผู้รับผิดชอบ, ช่วงวันที่)
   - หน้าต่างมอบหมายช่างเทคนิค (Assign Technician)
   - อัปเดตสถานะ, บันทึกผลการตรวจวินิจฉัย (Diagnosis), ขั้นตอนการซ่อม (Repair Actions), และบันทึกปิดงาน
3. **ระบบบันทึกภายใน (Internal Notes)**: จดบันทึกทางเทคนิคที่มองเห็นเฉพาะทีม IT พนักงานทั่วไปจะไม่เห็นข้อมูลนี้
4. **ทะเบียนทรัพย์สินไอที (Hardware & Asset Inventory)**:
   - จัดการอุปกรณ์คอมพิวเตอร์, ซีเรียลนัมเบอร์, ยี่ห้อ/รุ่น, แผนกที่ใช้งาน, และวันหมดประกัน
5. **จัดการผู้ใช้งานและสิทธิ์ (Users & RBAC)**:
   - กำหนดสิทธิ์ Admin, Technician, User
   - เปิดหรือระงับการใช้งานบัญชี (Active/Inactive)
6. **รายงานสถิติและการส่งออกไฟล์ (Reports & CSV Export)**:
   - กรองข้อมูลตามเงื่อนไขและส่งออกเป็นไฟล์ CSV รองรับภาษาไทยบน Microsoft Excel (UTF-8 BOM)
7. **บันทึกประวัติความปลอดภัย (Audit Logs)**:
   - บันทึกการกระทำสำคัญ เช่น การเข้าสู่ระบบ, การสร้างตั๋ว, การจ่ายงาน, การเปลี่ยนสิทธิ์ พร้อม IP Address

---

## 2. โครงสร้างโปรเจกต์ (Project Structure)

```text
├── .env.example                     # ไฟล์ตัวอย่างการตั้งค่า Environment Variables
├── index.html                       # HTML Entry Point
├── package.json                     # รายการ Dependencies และ Scripts
├── server.ts                        # Full-stack Server (Express + Vite Middlewares)
├── server/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # PostgreSQL DDL Schema (9 ตาราง, FK, Constraints, Indexes)
│   ├── seeds/
│   │   └── 001_seed_data.sql        # PostgreSQL SQL Data Seeding
│   ├── src/
│   │   ├── controllers/             # Request Handlers (auth, ticket, asset, user, report, audit)
│   │   ├── db/
│   │   │   ├── database.ts          # Database Adapter (รองรับทั้ง PostgreSQL และ Embedded Engine)
│   │   │   └── seedData.ts          # ข้อมูลจำลองตั้งต้นภาษาไทย
│   │   ├── middleware/              # Authentication, Upload (Multer), RateLimiter
│   │   ├── routes/                  # REST API Endpoints (/api/*)
│   │   ├── types/                   # TypeScript Domain Interfaces
│   │   └── validators/              # Input Validation Rules
│   └── tests/                       # Automated Test Suites (Node.js Test Runner)
├── src/                             # React Client
│   ├── components/
│   │   ├── common/                  # StatusBadge, PriorityBadge, CategoryBadge
│   │   └── layout/                  # Navbar (พร้อมปุ่ม Demo Switcher), Sidebar
│   ├── context/
│   │   └── AuthContext.tsx          # Authentication State & Demo Account Switching
│   ├── pages/
│   │   ├── LoginPage.tsx            # หน้าเข้าสู่ระบบและลงทะเบียนพนักงาน
│   │   ├── UserPortal/              # พอร์ทัลพนักงาน (Dashboard, NewTicket, Detail, History)
│   │   └── AdminPortal/             # พอร์ทัลไอที (Dashboard, Tickets, Assets, Users, Reports, Audit)
│   ├── services/
│   │   └── api.ts                   # Fetch API Client พร้อม Token Handling
│   └── types/
└── uploads/                         # โฟลเดอร์จัดเก็บไฟล์แนบอย่างปลอดภัย
```

---

## 3. ข้อมูลบัญชีผู้ใช้งานสำหรับทดสอบ (Demo Credentials)

ระบบได้เตรียมบัญชีทดสอบครอบคลุมทุกบทบาท โดยสามารถกดปุ่ม **"สลับบัญชีทดสอบ (Demo Switcher)"** บนแถบเมนูด้านบน หรือเข้าสู่ระบบด้วยรหัสผ่านต่อไปนี้:

| บทบาท (Role) | ชื่อผู้ใช้งาน (Username) | รหัสผ่าน (Password) | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| **ผู้ดูแลระบบ (Admin)** | `admin` | `Admin@123` | สิทธิ์สูงสุด จัดการตั๋ว ทรัพย์สิน รายงาน และสิทธิ์ผู้ใช้ |
| **ช่างเทคนิค (Technician)** | `tech.wichai` | `Tech@123` | ช่างซ่อมฮาร์ดแวร์ ตรวจสอบวินิจฉัย และอัปเดตงาน |
| **ช่างเทคนิค (Technician)** | `tech.narin` | `Tech@123` | ช่างเทคนิคระบบเครือข่ายและซอฟต์แวร์ |
| **พนักงาน (Employee - HR)** | `user.kanya` | `User@123` | คุณกัญญา (ฝ่าย HR) มีเคสแจ้งซ่อมโน้ตบุ๊กหน้าจอฟ้า |
| **พนักงาน (Employee - ACC)** | `user.pricha` | `User@123` | คุณปรีชา (ฝ่ายการเงิน) มีเคสเครื่องพิมพ์รอการตรวจงาน |

---

## 4. วิธีการติดตั้งและรันระบบบน Windows และ Visual Studio Code

### ข้อกำหนดเบื้องต้น (Prerequisites):
1. **Node.js**: เวอร์ชัน 20.x หรือ 22.x ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
2. **Visual Studio Code**: พร้อมส่วนขยาย Tailwind CSS IntelliSense และ Prettier (แนะนำ)
3. **PostgreSQL** (ไม่บังคับ): เวอร์ชัน 14, 15 หรือ 16 (หากยังไม่ได้ติดตั้ง PostgreSQL ระบบจะสลับไปใช้ In-Memory Relational Engine อัตโนมัติ ทำให้รันได้ทันทีโดยไม่ต้องตั้งค่าฐานข้อมูล!)

### ขั้นตอนที่ 1: เปิดโปรเจกต์ใน Visual Studio Code
1. แตกไฟล์หรือโคลนโปรเจกต์มาไว้ที่โฟลเดอร์ในเครื่อง เช่น `C:\Projects\it-helpdesk`
2. เปิดโปรแกรม **Visual Studio Code**
3. เลือกเมนู **File** > **Open Folder...** แล้วเลือกโฟลเดอร์โปรเจกต์
4. เปิด Terminal ใน VS Code โดยกดคีย์ลัด ``Ctrl + ` `` หรือไปที่เมนู **Terminal** > **New Terminal**

### ขั้นตอนที่ 2: ติดตั้ง Dependencies
พิมพ์คำสั่งใน Terminal (PowerShell หรือ Git Bash):
```powershell
npm install
```

### ขั้นตอนที่ 3: กำหนดค่า Environment Variables (.env)
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```powershell
Copy-Item .env.example .env
```
*(กรณีใช้ Command Prompt หรือ Bash ให้ใช้คำสั่ง `cp .env.example .env`)*

หากต้องการเชื่อมต่อกับฐานข้อมูล PostgreSQL ในเครื่อง ให้เปิดไฟล์ `.env` แล้วแก้ `DATABASE_URL`:
```ini
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/it_helpdesk_db
```

### ขั้นตอนที่ 4: (กรณีใช้ PostgreSQL) รัน Migration และ Seed ข้อมูล
สร้างฐานข้อมูลใน PostgreSQL:
```sql
CREATE DATABASE it_helpdesk_db;
```
จากนั้นรันไฟล์ SQL ผ่านโปรแกรม `psql` หรือ `pgAdmin`:
```powershell
psql -U postgres -d it_helpdesk_db -f server/migrations/001_initial_schema.sql
psql -U postgres -d it_helpdesk_db -f server/seeds/001_seed_data.sql
```

### ขั้นตอนที่ 5: เริ่มต้นการทำงานของระบบ (Start Application)
รันเซิร์ฟเวอร์แบบ Full-stack (รองรับทั้ง Express Backend และ Vite Frontend ในหน้าต่างเดียว):
```powershell
npm run dev
```

เปิดเว็บเบราว์เซอร์ไปที่:
👉 **http://localhost:3000**

---

## 5. การทดสอบระบบอัตโนมัติ (Automated Testing)

ระบบมาพร้อมชุดทดสอบ Unit Tests ครอบคลุมการทำงานของ Password Hashing, Session Token (HMAC-SHA256), Ticket Number Sequencing, Input Validation, และ User Isolation Rules:

รันคำสั่งทดสอบใน Terminal:
```powershell
npm test
```
ผลลัพธ์การทดสอบจะแสดงผลว่าผ่านทั้งหมด (15/15 tests passed):
- `bcrypt hashes and verifies passwords correctly`
- `generateToken creates valid HMAC-signed tokens`
- `verifyToken rejects tampered signatures`
- `database generates properly formatted ticket numbers (TK-YYYYMM-XXXX)`
- `user portal only returns tickets created by the logged-in user`
- `admin portal returns all tickets across all departments`
- `input validation rules for login, register, tickets, comments, feedback`

---

## 6. แนวทางแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

1. **Port 3000 มีการใช้งานอยู่แล้ว (EADDRINUSE: address already in use :::3000)**:
   - ปิดโปรแกรมอื่นที่ใช้พอร์ต 3000 หรือเปลี่ยนพอร์ตในไฟล์ `.env` เช่น `PORT=3001`
   - คำสั่งตรวจสอบบน Windows PowerShell:
     ```powershell
     Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
     ```

2. **ปัญหาภาษาไทยเพี้ยนในไฟล์ Excel เมื่อดาวน์โหลด CSV**:
   - ระบบของเรารองรับการใส่ **UTF-8 BOM (`\uFEFF`)** ที่หัวไฟล์ CSV ไว้เรียบร้อยแล้ว ทำให้สามารถเปิดผ่าน Microsoft Excel ได้โดยตรงโดยไม่ต้องแปลง Encoding

3. **ข้อผิดพลาดเกี่ยวกับสิทธิ์การอัปโหลดไฟล์**:
   - โฟลเดอร์ `uploads/` จะถูกสร้างขึ้นให้อัตโนมัติหากยังไม่มีอยู่ ตรวจสอบให้แน่ใจว่า Process มีสิทธิ์เขียนไฟล์ในโฟลเดอร์โปรเจกต์
