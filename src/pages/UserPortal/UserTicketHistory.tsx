import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ticket } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Clock,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface UserTicketHistoryProps {
  onSelectTicket: (id: number) => void;
  onNavigateNewTicket: () => void;
}

export const UserTicketHistory: React.FC<UserTicketHistoryProps> = ({
  onSelectTicket,
  onNavigateNewTicket,
}) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
      });
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            ประวัติการแจ้งซ่อมของฉัน (Ticket History)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            รายการคำขอบริการไอทีทั้งหมดที่คุณเคยสร้างไว้ในระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateNewTicket}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>แจ้งซ่อมใหม่ (+ Create Ticket)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามเลขที่ตั๋ว, หัวข้อปัญหา, รหัสทรัพย์สิน..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">ทุกสถานะ (All Statuses)</option>
              <option value="new">แจ้งใหม่ (New)</option>
              <option value="accepted">รับเรื่องแล้ว (Accepted)</option>
              <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
              <option value="waiting_user">รอตรวจสอบ (Waiting for User)</option>
              <option value="resolved">แก้ไขเสร็จสิ้น (Resolved)</option>
              <option value="closed">ปิดงานแล้ว (Closed)</option>
              <option value="cancelled">ยกเลิก (Cancelled)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">ทุกหมวดหมู่ (All Categories)</option>
              <option value="computer_laptop">คอมพิวเตอร์ / โน้ตบุ๊ก</option>
              <option value="printer">เครื่องพิมพ์ / พริ้นเตอร์</option>
              <option value="network_internet">ระบบเครือข่าย / เน็ต</option>
              <option value="software">โปรแกรมและซอฟต์แวร์</option>
              <option value="email_account">อีเมลและบัญชีผู้ใช้</option>
              <option value="other_equipment">อุปกรณ์ไอทีอื่นๆ</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              ค้นหา
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="ล้างตัวกรอง"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดข้อมูล...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold">ไม่พบรายการแจ้งซ่อมตามเงื่อนไขที่เลือก</div>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรองหรือคำค้นหาใหม่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">เลขที่ตั๋ว</th>
                  <th className="px-4 py-3.5">หมวดหมู่</th>
                  <th className="px-4 py-3.5">หัวข้อปัญหา</th>
                  <th className="px-4 py-3.5">รหัสทรัพย์สิน</th>
                  <th className="px-4 py-3.5">ความสำคัญ</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                  <th className="px-4 py-3.5">วันที่แจ้ง</th>
                  <th className="px-4 py-3.5 text-right">ดำเนินการ</th>
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
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-medium text-slate-900 truncate" title={t.title}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {t.location}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {t.assetNumber || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {t.assignedTechnicianName ? (
                        <span className="font-medium text-slate-900">
                          {t.assignedTechnicianName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">รอจ่ายงาน</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
