import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ticket, User, Department, TicketStatus, TicketPriority } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StatusBadge, STATUS_CONFIG } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  CheckCircle,
  Clock,
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';

interface TicketManagementPageProps {
  onSelectTicket: (id: number) => void;
}

export const TicketManagementPage: React.FC<TicketManagementPageProps> = ({ onSelectTicket }) => {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Quick Action Modal (Status & Diagnosis Update)
  const [activeModalTicket, setActiveModalTicket] = useState<Ticket | null>(null);
  const [modalStatus, setModalStatus] = useState<TicketStatus>('in_progress');
  const [modalPriority, setModalPriority] = useState<TicketPriority>('normal');
  const [modalTechId, setModalTechId] = useState<string>('');
  const [modalDiagnosis, setModalDiagnosis] = useState('');
  const [modalRepairActions, setModalRepairActions] = useState('');
  const [modalResolutionNotes, setModalResolutionNotes] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [tData, techs, depts] = await Promise.all([
        api.getTickets({
          search,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          departmentId: deptFilter !== 'all' ? deptFilter : undefined,
          technicianId: techFilter !== 'all' ? techFilter : undefined,
          startDate,
          endDate,
        }),
        api.getTechnicians(),
        api.getDepartments(),
      ]);
      setTickets(tData);
      setTechnicians(techs);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, deptFilter, techFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const openUpdateModal = (ticket: Ticket) => {
    setActiveModalTicket(ticket);
    setModalStatus(ticket.status);
    setModalPriority(ticket.priority);
    setModalTechId(ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : '');
    setModalDiagnosis(ticket.diagnosis || '');
    setModalRepairActions(ticket.repairActions || '');
    setModalResolutionNotes(ticket.resolutionNotes || '');
    setModalNote('');
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTicket) return;

    setModalSubmitting(true);
    try {
      // 1. Assign tech if changed
      if (modalTechId && Number(modalTechId) !== activeModalTicket.assignedTechnicianId) {
        await api.assignTechnician(activeModalTicket.id, Number(modalTechId));
      }

      // 2. Update priority if changed
      if (modalPriority !== activeModalTicket.priority) {
        await api.updateTicketPriority(activeModalTicket.id, modalPriority);
      }

      // 3. Update status & notes
      await api.updateTicketStatus(activeModalTicket.id, {
        status: modalStatus,
        notes: modalNote || `อัปเดตสถานะเป็น ${modalStatus}`,
        diagnosis: modalDiagnosis,
        repairActions: modalRepairActions,
        resolutionNotes: modalResolutionNotes,
      });

      setActiveModalTicket(null);
      await fetchTickets();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            ระบบจัดการรายการแจ้งซ่อมทั้งหมด
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ค้นหา ตรวจสอบ มอบหมายช่างเทคนิค และติดตามสถานะงานซ่อมบำรุงในองค์กร
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTickets}
          className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล ({tickets.length})</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาตามเลขที่ใบแจ้งซ่อม, ชื่อผู้แจ้ง, รายละเอียดปัญหา, รหัสทรัพย์สิน..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              ค้นหา
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">สถานะ (Status)</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="new">แจ้งใหม่</option>
                <option value="accepted">รับเรื่องแล้ว</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="waiting_user">รอตรวจสอบ</option>
                <option value="resolved">แก้ไขแล้วเสร็จ</option>
                <option value="closed">ปิดงานแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">ระดับความสำคัญ</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">ทุกระดับ</option>
                <option value="critical">วิกฤต (Critical)</option>
                <option value="high">สูง (High)</option>
                <option value="normal">ปกติ (Normal)</option>
                <option value="low">ต่ำ (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">หมวดหมู่งาน</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">ทุกหมวดหมู่</option>
                <option value="computer_laptop">คอมพิวเตอร์ / โน้ตบุ๊ก</option>
                <option value="printer">เครื่องพิมพ์</option>
                <option value="network_internet">ระบบเครือข่าย</option>
                <option value="software">ซอฟต์แวร์</option>
                <option value="email_account">อีเมล / บัญชี</option>
                <option value="other_equipment">อุปกรณ์อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">แผนก</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">ทุกแผนก</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">ช่างเทคนิค</label>
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="all">ทุกคน</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                  setDeptFilter('all');
                  setTechFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Tickets Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดข้อมูลรายการแจ้งซ่อม...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold">ไม่พบรายการแจ้งซ่อมตามเงื่อนไข</div>
            <p className="text-xs text-slate-400 mt-1">ลองปรับตัวกรองหรือล้างคำค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">เลขที่ใบแจ้งซ่อม</th>
                  <th className="px-4 py-3.5">ผู้แจ้ง & แผนก</th>
                  <th className="px-4 py-3.5">หมวดหมู่</th>
                  <th className="px-4 py-3.5">หัวข้อปัญหา & ทรัพย์สิน</th>
                  <th className="px-4 py-3.5">ความสำคัญ</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                  <th className="px-4 py-3.5">วันที่แจ้ง</th>
                  <th className="px-4 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => onSelectTicket(t.id)}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                      {t.ticketNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{t.requesterName}</div>
                      <div className="text-[11px] text-slate-400">{t.departmentName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-medium text-slate-900 truncate" title={t.title}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {t.assetNumber ? `Asset: ${t.assetNumber} • ` : ''}{t.location}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {t.assignedTechnicianName ? (
                        <span className="font-medium text-slate-800">
                          {t.assignedTechnicianName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          รอจ่ายงาน
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => openUpdateModal(t)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition"
                      >
                        อัปเดตงาน
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectTicket(t.id)}
                        className="px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs transition"
                      >
                        ดูข้อมูล
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Status & Diagnosis Update Modal */}
      {activeModalTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs text-blue-600 font-mono font-bold">
                  {activeModalTicket.ticketNumber}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  อัปเดตสถานะและการซ่อมแซม (Update Repair Progress)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTicket(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    1. สถานะการทำงาน (Status) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as TicketStatus)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="new">แจ้งใหม่ (New)</option>
                    <option value="accepted">รับเรื่องแล้ว (Accepted)</option>
                    <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                    <option value="waiting_user">รอตรวจสอบจากผู้ใช้ (Waiting User)</option>
                    <option value="resolved">แก้ไขแล้วเสร็จ (Resolved)</option>
                    <option value="closed">ปิดงานแล้ว (Closed)</option>
                    <option value="cancelled">ยกเลิก (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    2. ช่างเทคนิคผู้รับผิดชอบ
                  </label>
                  <select
                    value={modalTechId}
                    onChange={(e) => setModalTechId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="">-- ยังไม่มอบหมาย --</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Selection */}
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
                      onClick={() => setModalPriority(p.id)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        modalPriority === p.id
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

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  4. ผลการวินิจฉัยปัญหา (Diagnosis)
                </label>
                <textarea
                  rows={2}
                  value={modalDiagnosis}
                  onChange={(e) => setModalDiagnosis(e.target.value)}
                  placeholder="เช่น ตรวจพบ Bad Sector บน SSD, ไดรเวอร์การ์ดจอมีปัญหา..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  5. การดำเนินการซ่อมแซม (Repair Actions)
                </label>
                <textarea
                  rows={2}
                  value={modalRepairActions}
                  onChange={(e) => setModalRepairActions(e.target.value)}
                  placeholder="เช่น สำรองข้อมูลสำคัญ, ติดตั้งไดรเวอร์ใหม่, เปลี่ยนชุดลูกยางดึงกระดาษ..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  6. หมายเหตุการปิดงาน (Resolution Notes)
                </label>
                <textarea
                  rows={2}
                  value={modalResolutionNotes}
                  onChange={(e) => setModalResolutionNotes(e.target.value)}
                  placeholder="เช่น ทดสอบพิมพ์ผ่านแล้ว ผู้ใช้งานทดสอบเข้า Windows ใช้งานได้ปกติ..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalTicket(null)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 cursor-pointer transition disabled:opacity-50"
                >
                  {modalSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
