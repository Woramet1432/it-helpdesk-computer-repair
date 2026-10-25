import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ticket, User, TicketStatus, TicketPriority } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Laptop,
  CheckCircle2,
  Send,
  MessageSquare,
  History,
  Lock,
  UserCheck,
  FileText,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Star,
} from 'lucide-react';

interface AdminTicketDetailPageProps {
  ticketId: number;
  onBack: () => void;
}

export const AdminTicketDetailPage: React.FC<AdminTicketDetailPageProps> = ({ ticketId, onBack }) => {
  const { user, isAdmin } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Status & details editing
  const [status, setStatus] = useState<TicketStatus>('in_progress');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [assignedTechId, setAssignedTechId] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState('');
  const [repairActions, setRepairActions] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTicket = async () => {
    try {
      const [data, techs] = await Promise.all([
        api.getTicketById(ticketId),
        api.getTechnicians(),
      ]);
      setTicket(data);
      setTechnicians(techs);
      setStatus(data.status);
      setPriority(data.priority);
      setAssignedTechId(data.assignedTechnicianId ? String(data.assignedTechnicianId) : '');
      setDiagnosis(data.diagnosis || '');
      setRepairActions(data.repairActions || '');
      setResolutionNotes(data.resolutionNotes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSaveWorkbench = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    setSaveSuccess(false);

    try {
      if (assignedTechId && Number(assignedTechId) !== ticket?.assignedTechnicianId) {
        await api.assignTechnician(ticketId, Number(assignedTechId));
      }

      if (priority !== ticket?.priority) {
        await api.updateTicketPriority(ticketId, priority);
      }

      await api.updateTicketStatus(ticketId, {
        status,
        diagnosis,
        repairActions,
        resolutionNotes,
        notes: `อัปเดตข้อมูลโดย ${user?.fullName}`,
      });

      setSaveSuccess(true);
      await fetchTicket();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถบันทึกได้');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.addComment(ticketId, commentText.trim(), isInternal);
      setCommentText('');
      await fetchTicket();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถส่งข้อความได้');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <div className="text-sm font-semibold">กำลังโหลดข้อมูลการทำงาน #{ticketId}...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">ไม่พบรายการแจ้งซ่อม</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs">
          กลับหน้ารายการ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายการแจ้งซ่อมทั้งหมด</span>
        </button>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-white text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold shadow-2xs">
            {ticket.ticketNumber}
          </span>
          {ticket.trackingCode && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-xl border border-blue-200 font-mono font-semibold">
              PIN: {ticket.trackingCode}
            </span>
          )}
          <button
            type="button"
            onClick={fetchTicket}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs cursor-pointer transition"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details + Right Technician Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ticket Info, Problem Details, Files & Communication */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Ticket Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CategoryBadge category={ticket.category} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <StatusBadge status={ticket.status} size="lg" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {ticket.title}
              </h1>

              {/* Requester Contact Grid Card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-slate-400">ผู้แจ้ง:</span>{' '}
                    <span className="font-bold text-slate-900">{ticket.requesterName}</span>
                    {ticket.departmentName && (
                      <span className="text-slate-500"> ({ticket.departmentName})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400">เบอร์ติดต่อ:</span>{' '}
                    <a href={`tel:${ticket.contactPhone}`} className="font-bold text-blue-700 hover:underline">
                      {ticket.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-slate-400">สถานที่:</span>{' '}
                    <span className="font-medium text-slate-800">{ticket.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-slate-400">รหัสทรัพย์สิน:</span>{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {ticket.assetNumber || 'ไม่ได้ระบุ'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                รายละเอียดปัญหาที่ผู้ใช้แจ้ง (User Problem Description):
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200/80 font-normal">
                {ticket.description}
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>ไฟล์แนบและรูปถ่ายประกอบ ({ticket.attachments.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.attachments.map((att) => {
                    const isImg = att.mimeType.startsWith('image/');
                    return (
                      <a
                        key={att.id}
                        href={att.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group block"
                      >
                        {isImg ? (
                          <div className="w-full h-24 bg-slate-100 rounded-xl overflow-hidden mb-1.5">
                            <img
                              src={att.filePath}
                              alt={att.originalName}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-1.5">
                            <FileText className="w-8 h-8 text-blue-500" />
                          </div>
                        )}
                        <div className="text-[11px] font-medium text-slate-700 truncate group-hover:text-blue-600">
                          {att.originalName}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Card if rated by user */}
          {ticket.feedback && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-sm font-bold text-slate-900">
                  ผลการประเมินความพึงพอใจจากผู้แจ้งซ่อม (Rating: {ticket.feedback.rating}/5 ดาว)
                </h3>
              </div>
              <div className="text-xs text-slate-700 bg-white/70 p-3.5 rounded-xl border border-amber-100 italic">
                "{ticket.feedback.comment || 'ไม่มีข้อเสนอแนะเพิ่มเติม'}"
              </div>
            </div>
          )}

          {/* Comments & Communication Thread */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  ข้อความการสื่อสาร & บันทึกภายในทีม IT
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {ticket.comments?.length || 0} ข้อความ
              </span>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีข้อความ สามารถพิมพ์ตอบกลับผู้ใช้งาน หรือบันทึกภายในสำหรับทีม IT ได้ที่ช่องด้านล่าง
                </div>
              ) : (
                ticket.comments.map((c) => {
                  const isInt = c.isInternal;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl text-xs border ${
                        isInt
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                          : c.userRole === 'user'
                          ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-bold flex items-center gap-2">
                          <span>{c.userName}</span>
                          {isInt && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              บันทึกภายใน (Internal Note)
                            </span>
                          )}
                          {!isInt && (c.userRole === 'technician' || c.userRole === 'admin') && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                              เจ้าหน้าที่ไอที
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-700">{c.comment}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>บันทึกภายในสำหรับทีม IT เท่านั้น (ผู้ใช้ไม่เห็น)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'บันทึกข้อมูลทางเทคนิค, เบิกอะไหล่, ข้อมูลภายใน...'
                      : 'ตอบกลับผู้ใช้งาน (ผู้แจ้งจะเห็นข้อความนี้)...'
                  }
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่ง</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Technician Workbench (Redesigned like User Form) */}
        <div className="space-y-6">
          {/* Main Technician Workbench Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Technician Workbench
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  แผงบันทึกการทำงาน & วินิจฉัย
                </h2>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>บันทึกการทำงานและสถานะเรียบร้อยแล้ว</span>
              </div>
            )}

            <form onSubmit={handleSaveWorkbench} className="space-y-4">
              {/* 1. Status Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. สถานะใบแจ้งซ่อม (Status) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="new">แจ้งใหม่ (New)</option>
                  <option value="accepted">รับเรื่องแล้ว (Accepted)</option>
                  <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                  <option value="waiting_user">รอตรวจสอบจากผู้ใช้ (Waiting for User)</option>
                  <option value="resolved">แก้ไขแล้วเสร็จ (Resolved)</option>
                  <option value="closed">ปิดงานสมบูรณ์ (Closed)</option>
                  <option value="cancelled">ยกเลิก (Cancelled)</option>
                </select>
              </div>

              {/* 2. Assigned Technician */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. ช่างเทคนิคผู้รับผิดชอบ (Assigned Tech)
                </label>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="">-- ยังไม่ได้มอบหมาย --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Priority Selector (User-like segmented buttons) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. ระดับความสำคัญ (Priority)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal' as TicketPriority, label: 'ปกติ (Normal)', desc: 'งานทั่วไป' },
                    { id: 'high' as TicketPriority, label: 'ด่วน (High)', desc: 'งานสะดุด' },
                    { id: 'critical' as TicketPriority, label: 'วิกฤต (Critical)', desc: 'หยุดชะงัก' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        priority === p.id
                          ? p.id === 'critical'
                            ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 font-bold'
                            : p.id === 'high'
                            ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300 font-bold'
                            : 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. ผลการวินิจฉัยปัญหา (Diagnosis)
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="สาเหตุของปัญหา เช่น RAM เสีย, ไดรเวอร์ไม่เข้ากัน, สาย LAN ชำรุด..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              {/* 5. Repair Actions */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  5. ขั้นตอนการซ่อมแซม (Repair Actions)
                </label>
                <textarea
                  rows={2}
                  value={repairActions}
                  onChange={(e) => setRepairActions(e.target.value)}
                  placeholder="สิ่งที่ทำไป เช่น สลับ slot RAM, คลีนไดรฟ์ C:, เปลี่ยนสายแพร..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              {/* 6. Resolution Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  6. หมายเหตุการปิดงาน (Resolution Notes)
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="สรุปผลการซ่อม ให้ผู้แจ้งรับทราบ..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={savingDetails}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingDetails ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>บันทึกการทำงาน (Save Changes)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Status Timeline Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                ประวัติการดำเนินการ (Audit Timeline)
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              {ticket.history?.map((h, i) => (
                <div key={h.id} className="relative pl-6 pb-2">
                  {i !== (ticket.history?.length || 0) - 1 && (
                    <div className="absolute left-2.5 top-2.5 -bottom-2.5 w-0.5 bg-slate-200" />
                  )}
                  <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="font-semibold text-slate-800">
                    <StatusBadge status={h.toStatus} size="sm" />
                  </div>
                  {h.notes && (
                    <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                      {h.notes}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-1">
                    โดย {h.changedByName} • {new Date(h.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
