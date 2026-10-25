import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ticket } from '../../types/index.ts';
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
  Star,
  FileText,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface TicketDetailPageProps {
  ticketId: number;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ ticketId, onBack }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchTicket = async () => {
    try {
      const data = await api.getTicketById(ticketId);
      setTicket(data);
      if (data.feedback) {
        setRating(data.feedback.rating);
        setFeedbackComment(data.feedback.comment || '');
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await api.addComment(ticketId, commentText.trim(), false);
      setCommentText('');
      await fetchTicket();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถส่งข้อความได้');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(ticketId, rating, feedbackComment);
      setFeedbackSuccess(true);
      await fetchTicket();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถบันทึกการประเมินได้');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!confirm('คุณต้องการยกเลิกคำขอแจ้งซ่อมนี้ใช่หรือไม่?')) return;
    try {
      await api.updateTicketStatus(ticketId, { status: 'cancelled', notes: 'ผู้ใช้ยกเลิกคำขอด้วยตนเอง' });
      await fetchTicket();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถยกเลิกได้');
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <div className="text-sm font-medium">กำลังโหลดข้อมูลใบแจ้งซ่อม #{ticketId}...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">ไม่พบข้อมูลใบแจ้งซ่อม</h2>
        <p className="text-xs text-slate-500 mt-1">รายการแจ้งซ่อมอาจถูกลบหรือคุณไม่มีสิทธิ์ในการเข้าถึง</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const isResolvedOrClosed = ticket.status === 'resolved' || ticket.status === 'closed';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการ (Back to list)</span>
        </button>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {ticket.status === 'new' && (
            <button
              type="button"
              onClick={handleCancelTicket}
              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
            >
              ยกเลิกคำขอนี้
            </button>
          )}
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

      {/* Main Ticket Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base sm:text-lg font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {ticket.ticketNumber}
            </span>
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div>
            <StatusBadge status={ticket.status} size="lg" />
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {ticket.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                วันที่แจ้ง:{' '}
                {new Date(ticket.createdAt).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>สถานที่: {ticket.location}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>เบอร์ติดต่อ: {ticket.contactPhone}</span>
            </div>

            {ticket.assetNumber && (
              <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                <Laptop className="w-3.5 h-3.5 text-blue-600" />
                <span>รหัสทรัพย์สิน: {ticket.assetNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Problem Description */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            รายละเอียดปัญหาที่ระบุ:
          </div>
          {ticket.description}
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>ไฟล์แนบและภาพประกอบ ({ticket.attachments.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ticket.attachments.map((att) => {
                const isImage = att.mimeType.startsWith('image/');
                return (
                  <a
                    key={att.id}
                    href={att.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition group block"
                  >
                    {isImage ? (
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
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{(att.fileSize / 1024).toFixed(0)} KB</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Technician Diagnosis & Action Report */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              IT
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                ข้อมูลการซ่อมแซมและการวินิจฉัย (Technician Report)
              </div>
              <div className="text-xs text-slate-500">
                ช่างผู้รับผิดชอบ:{' '}
                <span className="font-semibold text-slate-800">
                  {ticket.assignedTechnicianName || 'ยังไม่ได้มอบหมายเจ้าหน้าที่'}
                </span>
              </div>
            </div>
          </div>

          {ticket.status === 'in_progress' && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium animate-pulse">
              ● ช่างกำลังดำเนินการซ่อม
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-600 mb-1">1. ผลการตรวจวินิจฉัย (Diagnosis)</div>
            <div className="text-xs text-slate-800">
              {ticket.diagnosis || (
                <span className="text-slate-400 italic">อยู่ระหว่างการตรวจสอบหน้าเครื่อง</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-600 mb-1">2. การดำเนินการซ่อม (Repair Actions)</div>
            <div className="text-xs text-slate-800">
              {ticket.repairActions || (
                <span className="text-slate-400 italic">รอเริ่มขั้นตอนการซ่อมแซม</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-900 mb-1">3. หมายเหตุการปิดงาน (Resolution Notes)</div>
            <div className="text-xs text-slate-800">
              {ticket.resolutionNotes || (
                <span className="text-slate-400 italic">ยังไม่ปิดงาน</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Feedback Section (When Resolved or Closed) */}
      {isResolvedOrClosed && (
        <div className="bg-gradient-to-r from-amber-50/70 to-blue-50/70 rounded-2xl border border-amber-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              การประเมินความพึงพอใจการให้บริการ (Customer Satisfaction Feedback)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            งานซ่อมนี้ได้รับการแก้ไขเรียบร้อยแล้ว กรุณาให้คะแนนความพึงพอใจเพื่อพัฒนาคุณภาพการบริการของทีมไอที
          </p>

          {feedbackSuccess && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการประเมินความพึงพอใจสำเร็จ ขอบคุณสำหรับข้อเสนอแนะค่ะ</span>
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ระดับคะแนนความพึงพอใจ:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="p-1 focus:outline-none transition transform hover:scale-110"
                    title={`${val} ดาว`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        val <= rating
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300 fill-transparent'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-700 ml-2">
                  {rating === 5
                    ? 'ยอดเยี่ยมมาก (5/5)'
                    : rating === 4
                    ? 'ดีมาก (4/5)'
                    : rating === 3
                    ? 'ปานกลาง (3/5)'
                    : rating === 2
                    ? 'ควรปรับปรุง (2/5)'
                    : 'ไม่พึงพอใจ (1/5)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ข้อเสนอแนะเพิ่มเติมสำหรับช่างเทคนิค:
              </label>
              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="ระบุความคิดเห็น เช่น ซ่อมรวดเร็วมาก แนะนำวิธีแก้ปัญหาชัดเจน..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingFeedback}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
            >
              {submittingFeedback ? 'กำลังบันทึก...' : ticket.feedback ? 'อัปเดตการประเมิน' : 'ส่งการประเมิน'}
            </button>
          </form>
        </div>
      )}

      {/* Two Column Section: Comments & Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Comments and Communications (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                การสนทนาและการตอบกลับ (Comments)
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
                ยังไม่มีข้อความ สามารถพิมพ์สอบถามสถานะกับช่างได้ที่กล่องด้านล่าง
              </div>
            ) : (
              ticket.comments.map((c) => {
                const isMe = c.userId === user?.id;
                const isTech = c.userRole === 'technician' || c.userRole === 'admin';
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl text-xs ${
                      isMe
                        ? 'bg-blue-50/70 border border-blue-200 ml-4'
                        : isTech
                        ? 'bg-slate-50 border border-slate-200 mr-4'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{c.userName}</span>
                        {isTech && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-normal">
                            ช่างไอที
                          </span>
                        )}
                        {isMe && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-normal">
                            คุณ
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
                    <div className="text-slate-700 whitespace-pre-wrap">{c.comment}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Send comment form */}
          <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="พิมพ์ข้อความสอบถามหรือข้อมูลเพิ่มเติมถึงช่าง..."
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่ง</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Status Timeline (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              ลำดับความคืบหน้า (Timeline)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {ticket.history && ticket.history.map((h, i) => (
              <div key={h.id} className="relative pl-6 pb-2">
                {/* Timeline vertical line */}
                {i !== (ticket.history?.length || 0) - 1 && (
                  <div className="absolute left-2.5 top-3 -bottom-3 w-0.5 bg-slate-200" />
                )}
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />

                <div className="font-semibold text-slate-900">
                  <StatusBadge status={h.toStatus} size="sm" />
                </div>
                {h.notes && (
                  <div className="text-slate-600 text-[11px] mt-1 leading-snug">
                    {h.notes}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-0.5">
                  โดย {h.changedByName} • {new Date(h.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
