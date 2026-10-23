import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Ticket, TicketStatus } from '../../types/index.ts';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  User,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  Star,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  Info,
  Check,
  Building2,
  Server,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface PublicTrackTicketProps {
  initialTicketNumber?: string;
  initialTrackingCode?: string;
  onBack: () => void;
  onNavigateNewTicket: () => void;
}

export const PublicTrackTicket: React.FC<PublicTrackTicketProps> = ({
  initialTicketNumber,
  initialTrackingCode,
  onBack,
  onNavigateNewTicket,
}) => {
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber || '');
  const [verificationCode, setVerificationCode] = useState(initialTrackingCode || '');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Comment state
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Auto-search if initial parameters provided
  useEffect(() => {
    if (initialTicketNumber && initialTrackingCode) {
      handleSearch(initialTicketNumber, initialTrackingCode);
    }
  }, [initialTicketNumber, initialTrackingCode]);

  const handleSearch = async (tNum = ticketNumber, vCode = verificationCode) => {
    if (!tNum.trim()) {
      setErrorMessage('กรุณาระบุหมายเลข Ticket เช่น TK-202610-0001');
      return;
    }
    if (!vCode.trim()) {
      setErrorMessage('กรุณาระบุรหัสติดตาม (Tracking Code) หรือเบอร์โทรศัพท์ที่ใช้แจ้ง');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await api.trackTicket(tNum.trim(), vCode.trim());
      setTicket(data);
      if (data.requesterName && !commenterName) {
        setCommenterName(data.requesterName);
      }
    } catch (err: any) {
      setTicket(null);
      setErrorMessage(
        err.message || 'ไม่พบข้อมูล Ticket หรือรหัสยืนยัน / เบอร์โทรศัพท์ไม่ตรงกับข้อมูลในระบบฝ่ายไอที'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !commentText.trim()) return;

    setSendingComment(true);
    try {
      const newComment = await api.addPublicComment(
        ticket.ticketNumber,
        verificationCode.trim(),
        commentText.trim(),
        commenterName.trim() || ticket.requesterName
      );

      setTicket({
        ...ticket,
        comments: [...(ticket.comments || []), newComment],
      });
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถส่งข้อความได้');
    } finally {
      setSendingComment(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setSubmittingFeedback(true);
    try {
      const fb = await api.submitPublicFeedback(
        ticket.ticketNumber,
        verificationCode.trim(),
        rating,
        feedbackComment.trim()
      );

      setTicket({
        ...ticket,
        feedback: fb,
      });
      setFeedbackSuccess(true);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถส่งการประเมินได้');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusStepIndex = (status: TicketStatus): number => {
    switch (status) {
      case 'new':
        return 0;
      case 'accepted':
        return 1;
      case 'in_progress':
        return 2;
      case 'waiting_user':
        return 2;
      case 'resolved':
        return 3;
      case 'closed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const statusDescriptions: Record<TicketStatus, { label: string; desc: string; badgeClass: string }> = {
    new: {
      label: 'รอดำเนินการ (New)',
      desc: 'คำขอบันทึกเข้าระบบแล้ว กำลังรอหัวหน้าฝ่ายไอทีมอบหมายเจ้าหน้าที่ผู้เชี่ยวชาญ',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    accepted: {
      label: 'รับเรื่องแล้ว (Acknowledged)',
      desc: 'เจ้าหน้าที่ไอทีรับผิดชอบเคสนี้แล้ว กำลังจัดเตรียมอุปกรณ์ เครื่องมือ หรือเข้าตรวจสอบตามคิวงาน',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    in_progress: {
      label: 'กำลังปฏิบัติงาน (In Progress)',
      desc: 'เจ้าหน้าที่ไอทีกำลังตรวจสอบ วิเคราะห์สาเหตุ หรือดำเนินการแก้ไข/ติดตั้งตามคำขอ',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    waiting_user: {
      label: 'รอข้อมูล/อะไหล่ (Waiting)',
      desc: 'รอข้อมูลเพิ่มเติมจากพนักงาน หรือรออุปกรณ์/อะไหล่ทดแทนจากคลังครุภัณฑ์',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    resolved: {
      label: 'ดำเนินการเสร็จสิ้น (Resolved)',
      desc: 'เจ้าหน้าที่ไอทีได้แก้ไขปัญหาหรือติดตั้งระบบเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานตามปกติ',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    closed: {
      label: 'ปิดคำขอสมบูรณ์ (Closed)',
      desc: 'พนักงานยืนยันผลการทำงานและปิดรอบคำขอตามเกณฑ์ SLA ขององค์กร',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    cancelled: {
      label: 'ยกเลิกคำขอ (Cancelled)',
      desc: 'คำขอถูกยกเลิกเนื่องจากเหตุผลที่ระบุในบันทึก',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  };

  const steps = [
    { title: 'บันทึกคำขอ', desc: 'ระบบรับเรื่อง' },
    { title: 'มอบหมายเจ้าหน้าที่', desc: 'มีผู้ดูแลรับผิดชอบ' },
    { title: 'กำลังปฏิบัติงาน', desc: 'ตรวจเช็ก & แก้ไข' },
    { title: 'ดำเนินการเรียบร้อย', desc: 'ทดสอบ & ส่งมอบ' },
    { title: 'ปิดคำขอสมบูรณ์', desc: 'เสร็จสิ้นตาม SLA' },
  ];

  const currentStep = ticket ? getStatusStepIndex(ticket.status) : 0;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลักบริการ</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ระบบติดตามสถานะคำขอบริการไอที (Track IT Request)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบความคืบหน้าการทำงานของเจ้าหน้าที่ฝ่ายเทคโนโลยีสารสนเทศ
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateNewTicket}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <span>ยื่นคำขอใหม่</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="text-xs font-semibold text-slate-700">
          ค้นหาด้วยหมายเลข Ticket และข้อมูลยืนยันตัวตน
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              หมายเลข Ticket (Ticket ID)
            </label>
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="เช่น TK-202610-0001"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              รหัสติดตาม (Tracking Code) หรือ เบอร์โทรศัพท์ที่แจ้ง
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="เช่น TRK-7X2K4N หรือ 081-234-5678"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer h-[38px] shadow-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>ค้นหา</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 mt-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">ไม่พบข้อมูลคำขอ</div>
              <div className="mt-0.5">{errorMessage}</div>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Display if found */}
      {ticket && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {ticket.ticketNumber}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      statusDescriptions[ticket.status].badgeClass
                    }`}
                  >
                    {statusDescriptions[ticket.status].label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ระดับความสำคัญ:{' '}
                    <strong className="text-slate-800 uppercase">{ticket.priority}</strong>
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {ticket.title}
                </h2>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 shrink-0">
                <div>วันที่บันทึก: {new Date(ticket.createdAt).toLocaleDateString('th-TH')}</div>
                <div className="text-slate-400">
                  เวลา:{' '}
                  {new Date(ticket.createdAt).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  น.
                </div>
              </div>
            </div>

            {/* Visual Status Progress */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ลำดับขั้นตอนการปฏิบัติงาน (Workflow Progress)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {steps.map((st, idx) => {
                  const isDone = currentStep >= idx && currentStep !== -1;
                  const isCurrent = currentStep === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-center transition ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                            : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className={`text-xs font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                        {st.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2 mt-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">คำอธิบายสถานะปัจจุบัน: </span>
                  <span>{statusDescriptions[ticket.status].desc}</span>
                </div>
              </div>
            </div>

            {/* Requester, Assigned Technician, Workplace Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>พนักงานผู้ยื่นคำขอ</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{ticket.requesterName}</div>
                <div className="text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>ฝ่าย/แผนก: {ticket.departmentName || 'ไม่ระบุแผนก'}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ticket.contactPhone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>เจ้าหน้าที่ฝ่ายไอทีผู้รับผิดชอบ</span>
                </div>
                {ticket.assignedTechnicianName ? (
                  <>
                    <div className="font-bold text-blue-700 text-sm">
                      {ticket.assignedTechnicianName}
                    </div>
                    <div className="text-[11px] text-slate-500">ทีมปฏิบัติการเทคนิคไอที (IT Operations)</div>
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>รับเรื่องเข้าคิวปฏิบัติการแล้ว</span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 py-1 italic">
                    กำลังจัดสรรเจ้าหน้าที่ตามลำดับคิวงาน...
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>ตำแหน่งที่ตั้ง & ครุภัณฑ์</span>
                </div>
                <div className="font-semibold text-slate-900">{ticket.location}</div>
                {ticket.assetNumber && (
                  <div className="text-slate-600 font-mono">
                    IT Asset Tag: <strong className="text-blue-700">{ticket.assetNumber}</strong>
                  </div>
                )}
                <div className="text-[11px] text-slate-500">
                  หมวดหมู่: {ticket.category}
                </div>
              </div>
            </div>

            {/* Problem Description & IT Technical Notes */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700">รายละเอียดคำขอ / อาการเสียที่ระบุ:</div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </div>
              </div>

              {/* Technical Diagnosis & Resolution Notes if available */}
              {(ticket.diagnosis || ticket.repairActions || ticket.resolutionNotes) && (
                <div className="space-y-2.5 p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
                  <div className="font-bold text-blue-900 uppercase text-[11px] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span>บันทึกผลการปฏิบัติงานของฝ่ายเทคโนโลยีสารสนเทศ</span>
                  </div>

                  {ticket.diagnosis && (
                    <div>
                      <span className="font-bold text-slate-700">ผลการตรวจวินิจฉัย: </span>
                      <span className="text-slate-800">{ticket.diagnosis}</span>
                    </div>
                  )}

                  {ticket.repairActions && (
                    <div>
                      <span className="font-bold text-slate-700">การดำเนินการแก้ไข: </span>
                      <span className="text-slate-800">{ticket.repairActions}</span>
                    </div>
                  )}

                  {ticket.resolutionNotes && (
                    <div>
                      <span className="font-bold text-slate-700">คำแนะนำการใช้งาน: </span>
                      <span className="text-slate-800">{ticket.resolutionNotes}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Attached Photos */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-slate-700">รูปภาพประกอบที่แนบไว้:</div>
                  <div className="flex flex-wrap gap-2.5">
                    {ticket.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 block bg-slate-100 hover:ring-2 hover:ring-blue-400 transition"
                      >
                        <img
                          src={att.filePath}
                          alt={att.originalName}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Section (if Resolved or Closed) */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>ประเมินความพึงพอใจการให้บริการ (IT Service Satisfaction Survey)</span>
              </div>
              <p className="text-xs text-slate-600">
                คำขอนี้ได้รับการดำเนินการเรียบร้อยแล้ว กรุณาให้คะแนนเพื่อใช้ปรับปรุงคุณภาพการบริการของฝ่ายไอที
              </p>

              {ticket.feedback || feedbackSuccess ? (
                <div className="p-3.5 rounded-lg bg-white border border-amber-200 text-xs text-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>บันทึกผลการประเมินความพึงพอใจเรียบร้อยแล้ว ขอบคุณครับ</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= (ticket.feedback?.rating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="font-bold ml-1 text-slate-700">
                      {ticket.feedback?.rating || rating} / 5 คะแนน
                    </span>
                  </div>
                  {(ticket.feedback?.comment || feedbackComment) && (
                    <div className="text-slate-600 italic pt-0.5">
                      "{ticket.feedback?.comment || feedbackComment}"
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-2">
                      {rating === 5
                        ? 'ยอดเยี่ยมมาก (5 ดาว)'
                        : rating === 4
                        ? 'ดีมาก (4 ดาว)'
                        : rating === 3
                        ? 'พอใช้ (3 ดาว)'
                        : rating === 2
                        ? 'ต้องปรับปรุง (2 ดาว)'
                        : 'ไม่พึงพอใจ (1 ดาว)'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนาบริการ..."
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                  >
                    {submittingFeedback ? 'กำลังบันทึก...' : 'ส่งแบบประเมินความพึงพอใจ'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Discussion & Messaging with IT Staff */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>การติดต่อประสานงานกับเจ้าหน้าที่ฝ่ายไอที (Ticket Activity Feed)</span>
            </div>

            <div className="space-y-2.5">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((c) => {
                  const isTech = c.userRole === 'technician' || c.userRole === 'admin';
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                        isTech
                          ? 'bg-blue-50/70 border-blue-200 ml-3 sm:ml-8'
                          : 'bg-slate-50 border-slate-200 mr-3 sm:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold flex items-center gap-1.5">
                          <span className={isTech ? 'text-blue-900' : 'text-slate-800'}>
                            {c.userName}
                          </span>
                          {isTech && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                              เจ้าหน้าที่ไอที
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString('th-TH')}{' '}
                          {new Date(c.createdAt).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {c.comment}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  ยังไม่มีข้อความสนทนาใน Ticket นี้ สามารถพิมพ์สอบถามหรือระบุข้อมูลเพิ่มเติมได้ด้านล่าง
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} className="pt-2 space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="พิมพ์ข้อความสอบถามความคืบหน้า หรือแจ้งข้อมูลเพิ่มเติมถึงเจ้าหน้าที่..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingComment || !commentText.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งข้อความ</span>
                </button>
              </div>

              {commentSuccess && (
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ส่งข้อความถึงเจ้าหน้าที่ฝ่ายไอทีเรียบร้อยแล้ว</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
