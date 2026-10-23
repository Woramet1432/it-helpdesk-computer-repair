import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

const CATEGORY_NAMES_TH: Record<string, string> = {
  computer_laptop: 'คอมพิวเตอร์ / โน้ตบุ๊ก',
  printer: 'เครื่องพิมพ์ / พริ้นเตอร์',
  network_internet: 'ระบบเครือข่าย / อินเทอร์เน็ต',
  software: 'โปรแกรมและซอฟต์แวร์',
  email_account: 'อีเมลและบัญชีผู้ใช้',
  other_equipment: 'อุปกรณ์ไอทีอื่นๆ',
};

const STATUS_NAMES_TH: Record<string, string> = {
  new: 'แจ้งใหม่',
  accepted: 'รับเรื่องแล้ว',
  in_progress: 'กำลังดำเนินการ',
  waiting_user: 'รอข้อมูล/ตรวจสอบจากผู้ใช้',
  resolved: 'แก้ไขเสร็จสิ้น',
  closed: 'ปิดงานสมบูรณ์',
  cancelled: 'ยกเลิกคำขอ',
};

const PRIORITY_NAMES_TH: Record<string, string> = {
  low: 'ต่ำ (Low)',
  normal: 'ปกติ (Normal)',
  high: 'สูง (High)',
  critical: 'วิกฤต (Critical)',
};

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  const metrics = await db.getDashboardMetrics();
  return res.json({
    success: true,
    data: metrics,
  });
}

export async function getReportData(req: AuthenticatedRequest, res: Response) {
  const { startDate, endDate, departmentId, category, technicianId, status } = req.query;

  const tickets = await db.getTickets({
    startDate: startDate as string,
    endDate: endDate as string,
    departmentId: departmentId ? Number(departmentId) : undefined,
    category: category as string,
    technicianId: technicianId ? Number(technicianId) : undefined,
    status: status as string,
  });

  return res.json({
    success: true,
    data: tickets,
  });
}

export async function exportCsv(req: AuthenticatedRequest, res: Response) {
  const { startDate, endDate, departmentId, category, technicianId, status } = req.query;

  const tickets = await db.getTickets({
    startDate: startDate as string,
    endDate: endDate as string,
    departmentId: departmentId ? Number(departmentId) : undefined,
    category: category as string,
    technicianId: technicianId ? Number(technicianId) : undefined,
    status: status as string,
  });

  // Prepare CSV header and rows
  const headers = [
    'หมายเลขตั๋ว',
    'วันที่แจ้ง',
    'ผู้แจ้งซ่อม',
    'แผนก',
    'เบอร์ติดต่อ',
    'หมวดหมู่อุปกรณ์',
    'รหัสทรัพย์สิน (Asset No.)',
    'ระดับความสำคัญ',
    'สถานะปัจจุบัน',
    'หัวข้อปัญหา',
    'รายละเอียดปัญหา',
    'ช่างเทคนิคผู้ดูแล',
    'ผลการวินิจฉัย',
    'การดำเนินการซ่อม',
    'วันที่แก้ไขเสร็จ',
    'คะแนนความพึงพอใจ',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tickets.map((t) => [
    escapeCsv(t.ticketNumber),
    escapeCsv(new Date(t.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })),
    escapeCsv(t.requesterName || '-'),
    escapeCsv(t.departmentName || '-'),
    escapeCsv(t.contactPhone || '-'),
    escapeCsv(CATEGORY_NAMES_TH[t.category] || t.category),
    escapeCsv(t.assetNumber || '-'),
    escapeCsv(PRIORITY_NAMES_TH[t.priority] || t.priority),
    escapeCsv(STATUS_NAMES_TH[t.status] || t.status),
    escapeCsv(t.title),
    escapeCsv(t.description),
    escapeCsv(t.assignedTechnicianName || 'ยังไม่ได้มอบหมาย'),
    escapeCsv(t.diagnosis || '-'),
    escapeCsv(t.repairActions || '-'),
    escapeCsv(t.resolvedAt ? new Date(t.resolvedAt).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'),
    escapeCsv(t.feedback ? `${t.feedback.rating}/5 ดาว (${t.feedback.comment || 'ไม่มีข้อเสนอแนะ'})` : '-'),
  ]);

  // Include UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility with Thai characters
  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  await db.addAuditLog({
    userId: req.user?.userId,
    action: 'REPORT_CSV_EXPORTED',
    targetType: 'REPORT',
    details: { totalRows: tickets.length },
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="IT_Helpdesk_Report_${Date.now()}.csv"`);
  return res.send(csvContent);
}
