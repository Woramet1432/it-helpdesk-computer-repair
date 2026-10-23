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
        <h2 className="text-base font-bold text-slate-900">ไม่พบตั๋วแจ้งซ่อม</h2>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs">
          กลับหน้ารายการ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้ารายการตั๋วทั้งหมด (Back to Tickets)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border font-mono">
            {ticket.ticketNumber}
          </span>
          <button
            type="button"
            onClick={fetchTicket}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="รีเฟรช"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left details + Right workbench form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ticket Info & Comments & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CategoryBadge category={ticket.category} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <StatusBadge status={ticket.status} size="lg" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {ticket.title}
              </h1>

              {/* Requester Contact Strip */}
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">ผู้แจ้ง:</span>{' '}
                  <span className="font-semibold text-slate-900">{ticket.requesterName}</span>
                  <span className="text-slate-500"> ({ticket.departmentName})</span>
                </div>
                <div>
                  <span className="text-slate-400">เบอร์ติดต่อ:</span>{' '}
                  <span className="font-semibold text-blue-700">{ticket.contactPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400">สถานที่:</span>{' '}
                  <span className="text-slate-800">{ticket.location}</span>
                </div>
                <div>
                  <span className="text-slate-400">รหัสทรัพย์สิน:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800">
                    {ticket.assetNumber || 'ไม่ได้ระบุ'}
                  </span>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-1">
                รายละเอียดปัญหาที่ผู้ใช้แจ้ง (User Problem Description):
              </div>
              <div className="p-4 rounded-xl bg-slate-50 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-200">
                {ticket.description}
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
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
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group block"
                      >
                        {isImg ? (
                          <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden mb-1.5">
                            <img
                              src={att.filePath}
                              alt={att.originalName}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-1.5">
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

          {/* Feedback Card if resolved/closed */}
          {ticket.feedback && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  ผลการประเมินความพึงพอใจจากผู้แจ้งซ่อม (Rating: {ticket.feedback.rating}/5)
                </h3>
              </div>
              <div className="text-xs text-slate-700">
                "{ticket.feedback.comment || 'ไม่มีข้อเสนอแนะเพิ่มเติม'}"
              </div>
            </div>
          )}

          {/* Comments & Internal Notes Thread */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  ข้อความการสื่อสาร & บันทึกภายใน (Communication & Internal Notes)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {ticket.comments?.length || 0} ข้อความ
              </span>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {(!ticket.comments || ticket.comments.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  ยังไม่มีข้อความ สามารถเพิ่มบันทึกภายในหรือตอบกลับผู้ใช้งานได้ด้านล่าง
                </div>
              ) : (
                ticket.comments.map((c) => {
                  const isInt = c.isInternal;
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl text-xs border ${
                        isInt
                          ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                          : c.userRole === 'user'
                          ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>{c.userName}</span>
                          {isInt && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              บันทึกภายใน (Internal Only - ผู้ใช้ไม่เห็น)
                            </span>
                          )}
                          {!isInt && (c.userRole === 'technician' || c.userRole === 'admin') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              ช่างเทคนิค
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
                      <div className="whitespace-pre-wrap">{c.comment}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>บันทึกภายในสำหรับทีม IT เท่านั้น (Internal Note)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isInternal
                      ? 'บันทึกข้อมูลทางเทคนิค, เบิกอุปกรณ์, บันทึกความลับ...'
                      : 'ตอบกลับผู้ใช้งาน (ผู้แจ้งจะสามารถเห็นข้อความนี้)...'
                  }
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งข้อความ</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Technician Workbench Form & History */}
        <div className="space-y-6">
          {/* Workbench Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                แผงควบคุมการซ่อม (Technician Workbench)
              </h2>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>บันทึกการทำงานเรียบร้อยแล้ว</span>
              </div>
            )}

            <form onSubmit={handleSaveWorkbench} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. สถานะใบแจ้งซ่อม (Status)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. มอบหมายช่างเทคนิค (Technician)
                </label>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- ยังไม่ได้มอบหมาย --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. ระดับความสำคัญ (Priority)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">ต่ำ (Low)</option>
                  <option value="normal">ปกติ (Normal)</option>
                  <option value="high">สูง (High)</option>
                  <option value="critical">วิกฤต (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. ผลการวินิจฉัย (Diagnosis)
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="สาเหตุของปัญหา เช่น RAM เสีย, ไดรเวอร์ไม่เข้ากัน..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. ขั้นตอนการซ่อมแซม (Repair Actions)
                </label>
                <textarea
                  rows={2}
                  value={repairActions}
                  onChange={(e) => setRepairActions(e.target.value)}
                  placeholder="สิ่งที่ทำไป เช่น สลับ slot RAM, คลีนไดรฟ์ C:..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. หมายเหตุการปิดงาน (Resolution Notes)
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="สรุปผลการซ่อม ให้ผู้แจ้งรับทราบ..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingDetails}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                {savingDetails ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการทำงาน (Save Changes)'}
              </button>
            </form>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <History className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-900">
                ประวัติการดำเนินการ (Audit Timeline)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              {ticket.history?.map((h, i) => (
                <div key={h.id} className="relative pl-5 pb-2">
                  {i !== (ticket.history?.length || 0) - 1 && (
                    <div className="absolute left-2 top-2 -bottom-2 w-0.5 bg-slate-200" />
                  )}
                  <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="font-semibold text-slate-800">
                    <StatusBadge status={h.toStatus} size="sm" />
                  </div>
                  {h.notes && (
                    <div className="text-slate-600 text-[11px] mt-0.5 leading-snug">
                      {h.notes}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    โดย {h.changedByName} • {new Date(h.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
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
