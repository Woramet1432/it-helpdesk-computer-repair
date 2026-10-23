import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import {
  validateTicketCreate,
  validateComment,
  validateFeedback,
  VALID_STATUSES,
  VALID_PRIORITIES,
} from '../validators/index.ts';

export async function listTickets(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const { status, priority, category, departmentId, technicianId, search, startDate, endDate } = req.query;

  const tickets = await db.getTickets({
    userId: req.user.userId,
    role: req.user.role,
    status: status as string,
    priority: priority as string,
    category: category as string,
    departmentId: departmentId ? Number(departmentId) : undefined,
    technicianId: technicianId ? Number(technicianId) : undefined,
    search: search as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });

  return res.json({
    success: true,
    data: tickets,
  });
}

export async function getTicketById(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'รหัสตั๋วไม่ถูกต้อง' });
  }

  const isStaff = req.user.role === 'admin' || req.user.role === 'technician';
  const ticket = await db.getTicketById(id, isStaff);

  if (!ticket) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบแจ้งซ่อม' });
  }

  // Security check: normal user can ONLY access their own ticket!
  if (req.user.role === 'user' && ticket.requesterId !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์ในการดูข้อมูลใบแจ้งซ่อมของผู้อื่น (Access Denied)',
    });
  }

  return res.json({
    success: true,
    data: ticket,
  });
}

export async function createTicket(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const validation = validateTicketCreate(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'ข้อมูลการแจ้งซ่อมไม่ถูกต้อง',
      errors: validation.errors,
    });
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const attachmentFiles = files.map((f) => ({
    filename: f.filename,
    originalName: f.originalname,
    mimeType: f.mimetype,
    fileSize: f.size,
    filePath: `/api/uploads/${f.filename}`,
  }));

  const user = await db.getUserById(req.user.userId);
  const departmentId = req.body.departmentId ? Number(req.body.departmentId) : user?.departmentId || null;

  const ticket = await db.createTicket({
    requesterId: req.user.userId,
    departmentId,
    assetId: req.body.assetId ? Number(req.body.assetId) : null,
    assetNumberCustom: req.body.assetNumberCustom || undefined,
    category: req.body.category,
    priority: req.body.priority || 'normal',
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    location: req.body.location.trim(),
    contactPhone: req.body.contactPhone.trim(),
    attachmentFiles,
  });

  await db.addAuditLog({
    userId: req.user.userId,
    action: 'TICKET_CREATED',
    targetType: 'TICKET',
    targetId: String(ticket.id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: {
      ticketNumber: ticket.ticketNumber,
      category: ticket.category,
      priority: ticket.priority,
      attachmentsCount: attachmentFiles.length,
    },
  });

  return res.status(201).json({
    success: true,
    message: `สร้างใบแจ้งซ่อมสำเร็จ หมายเลข: ${ticket.ticketNumber}`,
    data: ticket,
  });
}

export async function updateTicketStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const id = Number(req.params.id);
  const { status, notes, diagnosis, repairActions, resolutionNotes } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'สถานะที่ระบุไม่ถูกต้อง' });
  }

  const ticket = await db.getTicketById(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
  }

  // Regular users can only cancel their own tickets if still 'new'
  if (req.user.role === 'user') {
    if (ticket.requesterId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์แก้ไขใบแจ้งซ่อมนี้' });
    }
    if (status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'ผู้ใช้งานทั่วไปสามารถยกเลิกคำขอได้เท่านั้น' });
    }
    if (ticket.status !== 'new') {
      return res.status(400).json({ success: false, message: 'ไม่สามารถยกเลิกใบแจ้งซ่อมที่เริ่มดำเนินการแล้วได้' });
    }
  }

  // Update status & notes
  const updatedTicket = await db.updateTicketStatus(id, req.user.userId, status, notes);

  if (diagnosis !== undefined || repairActions !== undefined || resolutionNotes !== undefined) {
    await db.updateTicketDetails(id, {
      diagnosis,
      repairActions,
      resolutionNotes,
    });
  }

  await db.addAuditLog({
    userId: req.user.userId,
    action: 'TICKET_STATUS_UPDATED',
    targetType: 'TICKET',
    targetId: String(id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { fromStatus: ticket.status, toStatus: status, notes },
  });

  const refreshed = await db.getTicketById(id, req.user.role !== 'user');
  return res.json({
    success: true,
    message: 'อัปเดตสถานะใบแจ้งซ่อมสำเร็จ',
    data: refreshed,
  });
}

export async function assignTechnician(req: AuthenticatedRequest, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถมอบหมายงานได้' });
  }

  const id = Number(req.params.id);
  const { technicianId } = req.body;

  if (!technicianId) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุช่างเทคนิคที่ต้องการมอบหมาย' });
  }

  const tech = await db.getUserById(Number(technicianId));
  if (!tech || (tech.role !== 'technician' && tech.role !== 'admin')) {
    return res.status(400).json({ success: false, message: 'ผู้ใช้งานที่เลือกไม่ใช่ช่างเทคนิคหรือผู้ดูแลระบบ' });
  }

  const updated = await db.assignTechnician(id, req.user.userId, Number(technicianId));
  if (!updated) {
    return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
  }

  await db.addAuditLog({
    userId: req.user.userId,
    action: 'TICKET_ASSIGNED',
    targetType: 'TICKET',
    targetId: String(id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { assignedTechnicianId: technicianId, technicianName: tech.fullName },
  });

  return res.json({
    success: true,
    message: `มอบหมายงานให้ ${tech.fullName} เรียบร้อยแล้ว`,
    data: updated,
  });
}

export async function updatePriority(req: AuthenticatedRequest, res: Response) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'technician')) {
    return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์เปลี่ยนระดับความสำคัญ' });
  }

  const id = Number(req.params.id);
  const { priority } = req.body;

  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ success: false, message: 'ระดับความสำคัญไม่ถูกต้อง' });
  }

  const updated = await db.updateTicketDetails(id, { priority });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
  }

  await db.addAuditLog({
    userId: req.user.userId,
    action: 'TICKET_PRIORITY_UPDATED',
    targetType: 'TICKET',
    targetId: String(id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { priority },
  });

  return res.json({
    success: true,
    message: 'ปรับระดับความสำคัญเรียบร้อยแล้ว',
    data: updated,
  });
}

export async function addComment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const id = Number(req.params.id);
  const ticket = await db.getTicketById(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
  }

  // User permission check
  if (req.user.role === 'user' && ticket.requesterId !== req.user.userId) {
    return res.status(403).json({ success: false, message: 'คุณไม่มีสิทธิ์ส่งความคิดเห็นในตั๋วนี้' });
  }

  const validation = validateComment(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: 'ข้อความไม่ถูกต้อง', errors: validation.errors });
  }

  // Security: Only admin or technician can create internal notes
  let isInternal = Boolean(req.body.isInternal);
  if (req.user.role === 'user') {
    isInternal = false;
  }

  const comment = await db.addComment({
    ticketId: id,
    userId: req.user.userId,
    comment: req.body.comment.trim(),
    isInternal,
  });

  await db.addAuditLog({
    userId: req.user.userId,
    action: isInternal ? 'COMMENT_INTERNAL_ADDED' : 'COMMENT_ADDED',
    targetType: 'TICKET',
    targetId: String(id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { isInternal },
  });

  return res.status(201).json({
    success: true,
    message: 'ส่งข้อความเรียบร้อยแล้ว',
    data: comment,
  });
}

export async function submitFeedback(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' });
  }

  const id = Number(req.params.id);
  const ticket = await db.getTicketById(id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
  }

  // Only the original requester can submit feedback
  if (ticket.requesterId !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'เฉพาะผู้แจ้งซ่อมเท่านั้นที่สามารถประเมินความพึงพอใจได้' });
  }

  // Ticket must be resolved or closed
  if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
    return res.status(400).json({ success: false, message: 'สามารถประเมินได้เฉพาะงานที่ได้รับการแก้ไขหรือปิดงานแล้ว' });
  }

  const validation = validateFeedback(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: 'คะแนนการประเมินไม่ถูกต้อง', errors: validation.errors });
  }

  const feedback = await db.addFeedback({
    ticketId: id,
    userId: req.user.userId,
    rating: Number(req.body.rating),
    comment: req.body.comment?.trim(),
  });

  await db.addAuditLog({
    userId: req.user.userId,
    action: 'FEEDBACK_SUBMITTED',
    targetType: 'TICKET',
    targetId: String(id),
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    details: { rating: feedback.rating },
  });

  return res.status(201).json({
    success: true,
    message: 'ขอบคุณสำหรับการประเมินความพึงพอใจ',
    data: feedback,
  });
}
