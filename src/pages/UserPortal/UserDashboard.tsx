import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Ticket } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Laptop,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';

interface UserDashboardProps {
  onNavigateNewTicket: () => void;
  onSelectTicket: (ticketId: number) => void;
  onNavigateHistory: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigateNewTicket,
  onSelectTicket,
  onNavigateHistory,
}) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const totalCount = tickets.length;
  const inProgressCount = tickets.filter(
    (t) => t.status === 'in_progress' || t.status === 'accepted' || t.status === 'new'
  ).length;
  const waitingUserCount = tickets.filter((t) => t.status === 'waiting_user').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-xs text-blue-300 font-medium tracking-wide uppercase">
            ศูนย์บริการแจ้งซ่อมและสนับสนุนงานไอที (IT Helpdesk Portal)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            ยินดีต้อนรับ, คุณ{user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            แผนก: {user?.departmentName || 'ไม่ระบุ'} • หากพบปัญหาคอมพิวเตอร์ อุปกรณ์ หรือระบบเครือข่าย สามารถเปิดคำขอได้ตลอดเวลา
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchUserTickets}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center gap-1.5"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>

          <button
            type="button"
            onClick={onNavigateNewTicket}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 font-semibold text-xs sm:text-sm text-white shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แจ้งซ่อมใหม่</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">รายการแจ้งซ่อมทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">รวมทุกสถานะ</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">อยู่ระหว่างดำเนินการ</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">แจ้งใหม่ & กำลังซ่อม</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">รอการตรวจสอบจากคุณ</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">{waitingUserCount}</div>
            <div className="text-[11px] text-purple-600/80 mt-0.5">ช่างซ่อมเสร็จเบื้องต้น</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">ซ่อมเสร็จสมบูรณ์</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">แก้ไขแล้ว & ปิดงาน</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Urgent Action Banner if Waiting for User */}
      {waitingUserCount > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold text-purple-900">
              มี {waitingUserCount} รายการที่ช่างเทคนิคกำลังรอให้คุณตรวจสอบผลการซ่อม
            </div>
            <div className="text-xs text-purple-700 mt-0.5">
              กรุณาเข้าไปตรวจสอบความเรียบร้อยของเครื่องหรืออุปกรณ์ และประเมินความพึงพอใจเพื่อปิดงาน
            </div>
          </div>
        </div>
      )}

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              รายการแจ้งซ่อมของฉัน (Recent Requests)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ติดตามสถานะความคืบหน้าของปัญหาและอุปกรณ์ที่แจ้งซ่อมไว้
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHistory}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <span>ดูทั้งหมด ({totalCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            กำลังโหลดข้อมูลรายการแจ้งซ่อม...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <Laptop className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700">ยังไม่มีประวัติการแจ้งซ่อม</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              หากพบปัญหาการใช้งานคอมพิวเตอร์ ปริ้นเตอร์ หรือระบบเครือข่าย สามารถกดปุ่มด้านล่างเพื่อแจ้งทีมไอทีได้ทันที
            </p>
            <button
              type="button"
              onClick={onNavigateNewTicket}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              + สร้างใบแจ้งซ่อมแรก
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">เลขที่ใบแจ้งซ่อม</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">หัวข้อปัญหา</th>
                  <th className="px-4 py-3">ความสำคัญ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">ช่างผู้ดูแล</th>
                  <th className="px-4 py-3">วันที่แจ้ง</th>
                  <th className="px-4 py-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.slice(0, 5).map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => onSelectTicket(t.id)}
                  >
                    <td className="px-4 py-3.5 font-mono font-semibold text-blue-700">
                      {t.ticketNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-medium text-slate-900 truncate" title={t.title}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {t.location} {t.assetNumber ? `• ${t.assetNumber}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {t.assignedTechnicianName ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(t.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition"
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
