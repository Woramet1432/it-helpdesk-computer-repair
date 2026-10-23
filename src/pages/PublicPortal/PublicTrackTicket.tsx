import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api.ts';
import { Ticket, TicketStatus, TicketCategory, Department } from '../../types/index.ts';
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
  ChevronRight,
  Info,
  Check,
  Building2,
  Server,
  FileText,
  Filter,
  RefreshCw,
  PlusCircle,
  Tag,
  SlidersHorizontal,
  X,
  Laptop,
  Printer,
  Wifi,
  FileCode,
  Mail,
  HardDrive,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';

interface PublicTrackTicketProps {
  initialTicketNumber?: string;
  initialTrackingCode?: string;
  onBack: () => void;
  onNavigateNewTicket: () => void;
}

export const PublicTrackTicket: React.FC<PublicTrackTicketProps> = ({
  initialTicketNumber,
  onBack,
  onNavigateNewTicket,
}) => {
  // All tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Selected ticket for full detail view
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Comment state inside detail view
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Feedback state inside detail view
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Fetch all tickets and departments on mount
  const fetchTickets = async () => {
    setLoadingList(true);
    try {
      const [ticketsData, deptsData] = await Promise.all([
        api.getPublicTickets(),
        api.getDepartments().catch(() => []),
      ]);
      setTickets(ticketsData);
      setDepartments(deptsData);

      // If initial ticket number was passed, open its detail automatically
      if (initialTicketNumber) {
        const match = ticketsData.find(
          (t) => t.ticketNumber.toLowerCase() === initialTicketNumber.toLowerCase()
        );
        if (match) {
          loadTicketDetail(match.ticketNumber);
        }
      }
    } catch (err) {
      console.error('Failed to load public tickets:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [initialTicketNumber]);

  // Load complete ticket detail (including full comments, attachments, feedback)
  const loadTicketDetail = async (ticketNumberOrId: string | number) => {
    setLoadingDetail(true);
    try {
      const data = await api.getPublicTicketDetail(ticketNumberOrId);
      setSelectedTicket(data);
      if (data.requesterName && !commenterName) {
        setCommenterName(data.requesterName);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to load ticket detail:', err);
      // Fallback: look in local list
      const fallback = tickets.find(
        (t) => t.id === Number(ticketNumberOrId) || t.ticketNumber === String(ticketNumberOrId)
      );
      if (fallback) setSelectedTicket(fallback);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filtered tickets calculation
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesNumber = t.ticketNumber.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesReq = t.requesterName?.toLowerCase().includes(q);
        const matchesLoc = t.location?.toLowerCase().includes(q);
        const matchesAsset = t.assetNumber?.toLowerCase().includes(q);
        const matchesDept = t.departmentName?.toLowerCase().includes(q);
        const matchesTech = t.assignedTechnicianName?.toLowerCase().includes(q);

        if (
          !matchesNumber &&
          !matchesTitle &&
          !matchesDesc &&
          !matchesReq &&
          !matchesLoc &&
          !matchesAsset &&
          !matchesDept &&
          !matchesTech
        ) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Department
      if (departmentFilter !== 'all' && String(t.departmentId) !== departmentFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter, departmentFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const isNew = tickets.filter((t) => t.status === 'new').length;
    const inProgress = tickets.filter(
      (t) => t.status === 'in_progress' || t.status === 'accepted' || t.status === 'waiting_user'
    ).length;
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
    return { total, isNew, inProgress, resolved };
  }, [tickets]);

  // Send Public Comment
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    setSendingComment(true);
    try {
      const newComment = await api.addPublicCommentDirect(
        selectedTicket.ticketNumber,
        commentText.trim(),
        commenterName.trim() || selectedTicket.requesterName
      );

      setSelectedTicket({
        ...selectedTicket,
        comments: [...(selectedTicket.comments || []), newComment],
      });
      setCommentText('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3500);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถส่งข้อความได้');
    } finally {
      setSendingComment(false);
    }
  };

  // Submit Satisfaction Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingFeedback(true);
    try {
      const fb = await api.submitPublicFeedbackDirect(
        selectedTicket.ticketNumber,
        rating,
        feedbackComment.trim()
      );

      setSelectedTicket({
        ...selectedTicket,
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

  // ==========================================
  // DETAIL VIEW (When a ticket is selected)
  // ==========================================
  if (selectedTicket) {
    const currentStep = getStatusStepIndex(selectedTicket.status);

    return (
      <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
        {/* Navigation back to all tickets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setSelectedTicket(null)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← กลับไปหน้ารายการแจ้งซ่อมทั้งหมด</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Ticket ID: <strong className="text-slate-800">{selectedTicket.ticketNumber}</strong>
            </span>
            <button
              type="button"
              onClick={() => loadTicketDetail(selectedTicket.ticketNumber)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${loadingDetail ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {selectedTicket.ticketNumber}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    statusDescriptions[selectedTicket.status]?.badgeClass || 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {statusDescriptions[selectedTicket.status]?.label || selectedTicket.status}
                </span>
                <CategoryBadge category={selectedTicket.category} />
                <PriorityBadge priority={selectedTicket.priority} />
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {selectedTicket.title}
              </h1>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <div>วันที่แจ้ง: {new Date(selectedTicket.createdAt).toLocaleDateString('th-TH')}</div>
              <div className="text-slate-400">
                เวลา:{' '}
                {new Date(selectedTicket.createdAt).toLocaleTimeString('th-TH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                น.
              </div>
            </div>
          </div>

          {/* Visual Status Progress */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ลำดับขั้นตอนการปฏิบัติงาน (Workflow Progress)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {steps.map((st, idx) => {
                const isDone = currentStep >= idx && currentStep !== -1;
                const isCurrent = currentStep === idx;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500/30'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-1.5 text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
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

            <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-slate-700 flex items-start gap-2.5 mt-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">สถานะปัจจุบัน: </span>
                <span>{statusDescriptions[selectedTicket.status]?.desc}</span>
              </div>
            </div>
          </div>

          {/* Requester, Assigned Technician, Workplace Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>พนักงานผู้แจ้งซ่อม</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{selectedTicket.requesterName}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>ฝ่าย/แผนก: {selectedTicket.departmentName || 'ไม่ระบุแผนก'}</span>
              </div>
              <div className="text-slate-600 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>เบอร์โทร: {selectedTicket.contactPhone || '-'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>ช่างผู้รับผิดชอบงาน</span>
              </div>
              {selectedTicket.assignedTechnicianName ? (
                <>
                  <div className="font-bold text-blue-700 text-sm">
                    {selectedTicket.assignedTechnicianName}
                  </div>
                  <div className="text-[11px] text-slate-500">ทีมปฏิบัติการเทคนิคไอที (IT Operations)</div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>รับเรื่องและกำลังดำเนินการ</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 py-1 text-xs italic">
                  กำลังจัดสรรเจ้าหน้าที่ตามลำดับคิวงาน...
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-slate-500 font-semibold uppercase text-[10px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>สถานที่ & อุปกรณ์</span>
              </div>
              <div className="font-semibold text-slate-900">{selectedTicket.location}</div>
              {selectedTicket.assetNumber && (
                <div className="text-slate-600 font-mono">
                  รหัสครุภัณฑ์: <strong className="text-blue-700">{selectedTicket.assetNumber}</strong>
                </div>
              )}
              {selectedTicket.assetName && (
                <div className="text-[11px] text-slate-500">
                  อุปกรณ์: {selectedTicket.assetName}
                </div>
              )}
            </div>
          </div>

          {/* Description & Technical Findings */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700">รายละเอียดอาการเสียที่ระบุ:</div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Technical Diagnosis & Resolution Notes if available */}
            {(selectedTicket.diagnosis || selectedTicket.repairActions || selectedTicket.resolutionNotes) && (
              <div className="space-y-3 p-5 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs">
                <div className="font-bold text-blue-900 uppercase text-[11px] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>บันทึกผลการปฏิบัติงานของฝ่ายเทคโนโลยีสารสนเทศ</span>
                </div>

                {selectedTicket.diagnosis && (
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="font-bold text-slate-700 block mb-0.5">ผลการตรวจวินิจฉัย:</span>
                    <span className="text-slate-800">{selectedTicket.diagnosis}</span>
                  </div>
                )}

                {selectedTicket.repairActions && (
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="font-bold text-slate-700 block mb-0.5">การดำเนินการแก้ไข:</span>
                    <span className="text-slate-800">{selectedTicket.repairActions}</span>
                  </div>
                )}

                {selectedTicket.resolutionNotes && (
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                    <span className="font-bold text-slate-700 block mb-0.5">คำแนะนำการใช้งาน:</span>
                    <span className="text-slate-800">{selectedTicket.resolutionNotes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Attached Photos */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-700">รูปภาพประกอบที่แนบไว้:</div>
                <div className="flex flex-wrap gap-3">
                  {selectedTicket.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 block bg-slate-100 hover:ring-2 hover:ring-blue-500 transition shadow-2xs"
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
        {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
          <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>ประเมินความพึงพอใจการให้บริการ (IT Service Satisfaction Survey)</span>
            </div>
            <p className="text-xs text-slate-600">
              งานแจ้งซ่อมนี้ได้รับการดำเนินการเรียบร้อยแล้ว กรุณาให้คะแนนการทำงานของเจ้าหน้าที่เพื่อนำไปพัฒนาบริการ
            </p>

            {selectedTicket.feedback || feedbackSuccess ? (
              <div className="p-4 rounded-2xl bg-white border border-amber-200 text-xs text-slate-800 space-y-1.5 shadow-2xs">
                <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกผลการประเมินความพึงพอใจเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็นครับ</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= (selectedTicket.feedback?.rating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold ml-2 text-slate-800">
                    {selectedTicket.feedback?.rating || rating} / 5 คะแนน
                  </span>
                </div>
                {(selectedTicket.feedback?.comment || feedbackComment) && (
                  <div className="text-slate-600 italic pt-1">
                    "{selectedTicket.feedback?.comment || feedbackComment}"
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3.5 bg-white p-5 rounded-2xl border border-amber-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 mr-2">ให้คะแนนการบริการ:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-115 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-300 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  {submittingFeedback ? 'กำลังบันทึก...' : 'ส่งแบบประเมินความพึงพอใจ'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Discussion & Messaging with IT Staff */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>กระดานสื่อสารและสอบถามกับเจ้าหน้าที่ฝ่ายไอที</span>
          </div>

          <div className="space-y-3">
            {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
              selectedTicket.comments.map((c) => {
                const isTech = c.userRole === 'technician' || c.userRole === 'admin';
                return (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                      isTech
                        ? 'bg-blue-50/80 border-blue-200 ml-2 sm:ml-8'
                        : 'bg-slate-50 border-slate-200 mr-2 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className={isTech ? 'text-blue-900 font-bold' : 'text-slate-800'}>
                          {c.userName}
                        </span>
                        {isTech && (
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
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
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
                ยังไม่มีข้อความสนทนาใน Ticket นี้ สามารถพิมพ์สอบถามหรือระบุข้อมูลเพิ่มเติมได้ด้านล่าง
              </div>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSendComment} className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder="ชื่อของคุณ (เช่น คุณสมชาย)"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="sm:col-span-3 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="พิมพ์ข้อความสอบถามความคืบหน้า หรือแจ้งข้อมูลเพิ่มเติมถึงเจ้าหน้าที่..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendingComment || !commentText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งข้อความ</span>
                </button>
              </div>
            </div>

            {commentSuccess && (
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>ส่งข้อความถึงเจ้าหน้าที่ฝ่ายไอทีเรียบร้อยแล้ว</span>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // LIST VIEW (Browse all repair tickets)
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลักบริการ</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ระบบติดตามสถานะคำขอบริการไอที (Track IT Request)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            รายการงานแจ้งซ่อมและสถานะการดำเนินงานของฝ่ายเทคโนโลยีสารสนเทศทั้งหมด
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTickets}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="รีเฟรชรายการ"
          >
            <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onNavigateNewTicket}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เปิดแจ้งซ่อมใหม่</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">งานแจ้งซ่อมทั้งหมด</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">รายการทั้งหมด</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('new')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'new'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">รอดำเนินการ (New)</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.isNew}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">รอจัดสรรช่าง</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">กำลังปฏิบัติงาน</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.inProgress}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">ช่างกำลังตรวจซ่อม</div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500">เสร็จสิ้นสมบูรณ์</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.resolved}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">พร้อมใช้งานแล้ว</div>
        </button>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วยหมายเลข Ticket (เช่น TK-202610-0001), ชื่องานซ่อม, ชื่อผู้แจ้ง, แผนก, อาคาร/สถานที่ หรือรหัสครุภัณฑ์..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              กรองตามสถานะงาน (Status)
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">สถานะทั้งหมด (All Statuses)</option>
              <option value="new">รอดำเนินการ (New)</option>
              <option value="accepted">รับเรื่องแล้ว (Acknowledged)</option>
              <option value="in_progress">กำลังปฏิบัติงาน (In Progress)</option>
              <option value="waiting_user">รอข้อมูล/อะไหล่ (Waiting)</option>
              <option value="resolved">ดำเนินการเสร็จสิ้น (Resolved)</option>
              <option value="closed">ปิดคำขอสมบูรณ์ (Closed)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              กรองตามหมวดหมู่อุปกรณ์ (Category)
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">หมวดหมู่ทั้งหมด (All Categories)</option>
              <option value="computer_laptop">คอมพิวเตอร์ / แล็ปท็อป</option>
              <option value="printer">เครื่องพิมพ์ / ปริ้นเตอร์</option>
              <option value="network_internet">อินเทอร์เน็ต / เครือข่าย</option>
              <option value="software">โปรแกรม / ซอฟต์แวร์</option>
              <option value="email_account">อีเมล / บัญชีผู้ใช้</option>
              <option value="other_equipment">อุปกรณ์ไอทีอื่น ๆ</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              กรองตามแผนกผู้แจ้ง (Department)
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">แผนกทั้งหมด (All Departments)</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || departmentFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              พบ <strong className="text-slate-800">{filteredTickets.length}</strong> รายการที่ตรงกับตัวกรอง
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setDepartmentFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Ticket List Table */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>รายการงานแจ้งซ่อมทั้งหมด ({filteredTickets.length} รายการ)</span>
          <span>คลิกที่แถวหรือปุ่มเพื่อดูรายละเอียดและขั้นตอนการปฏิบัติงาน</span>
        </div>

        {loadingList ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <div className="font-semibold text-slate-700">กำลังโหลดรายการงานแจ้งซ่อม...</div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">ไม่พบรายการแจ้งซ่อมที่ค้นหา</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองสถานะและแผนกเพื่อค้นหาใหม่อีกครั้ง
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setDepartmentFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 whitespace-nowrap">หมายเลข Ticket / วันที่แจ้ง</th>
                    <th className="py-3.5 px-4 min-w-[220px]">หัวข้อแจ้งซ่อม & รายละเอียด</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">หมวดหมู่</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">ความสำคัญ</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ผู้แจ้ง & แผนก</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">สถานที่</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">ช่างผู้รับผิดชอบ</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">สถานะ</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => loadTicketDetail(t.ticketNumber)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block">
                          {t.ticketNumber}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {new Date(t.createdAt).toLocaleDateString('th-TH')}{' '}
                            {new Date(t.createdAt).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            น.
                          </span>
                        </div>
                      </td>

                      {/* Issue Title & Description */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-xs sm:text-sm">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {t.description}
                        </div>
                        {t.assetNumber && (
                          <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-mono border border-slate-200/60">
                            รหัสครุภัณฑ์: {t.assetNumber}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                        <CategoryBadge category={t.category} />
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                        <PriorityBadge priority={t.priority} />
                      </td>

                      {/* Requester & Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t.requesterName}</span>
                        </div>
                        {t.departmentName && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {t.departmentName}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                        {t.location ? (
                          <div className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{t.location}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Assigned Technician */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        {t.assignedTechnicianName ? (
                          <div className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 text-[11px]">
                            <Wrench className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{t.assignedTechnicianName}</span>
                          </div>
                        ) : (
                          <span className="inline-block text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] border border-amber-200 font-medium">
                            รอจัดสรรช่าง
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadTicketDetail(t.ticketNumber);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 border border-blue-200 group-hover:border-transparent cursor-pointer shadow-2xs"
                        >
                          <span>ดูข้อมูล</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
