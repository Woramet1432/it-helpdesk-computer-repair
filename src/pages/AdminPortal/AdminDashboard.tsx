import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { DashboardMetrics, Ticket, User } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Hourglass,
  Layers,
  ArrowRight,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  BarChart,
  UserPlus,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTicket: (id: number) => void;
  onNavigateTickets: () => void;
  onNavigateReports: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectTicket,
  onNavigateTickets,
  onNavigateReports,
}) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [m, t, techs] = await Promise.all([
        api.getDashboardMetrics(),
        api.getTickets(),
        api.getTechnicians(),
      ]);
      setMetrics(m);
      setRecentTickets(t);
      setTechnicians(techs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAssign = async (ticketId: number, techId: number) => {
    try {
      await api.assignTechnician(ticketId, techId);
      setAssigningId(null);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถมอบหมายงานได้');
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <div className="text-sm font-semibold">กำลังประมวลผลข้อมูลแดชบอร์ดงานไอที...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold tracking-wider uppercase">
              IT Operations Command Center
            </span>
            <span className="text-xs text-slate-400">
              อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1.5">
            แดชบอร์ดบริหารจัดการงานไอที (IT Service Desk)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ภาพรวมงานซ่อมบำรุง, ความคืบหน้างานของช่างเทคนิค, และการติดตาม SLA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition text-xs flex items-center gap-1.5 border border-slate-700"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>

          <button
            type="button"
            onClick={onNavigateReports}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs sm:text-sm text-white shadow-sm transition flex items-center gap-1.5"
          >
            <BarChart className="w-4 h-4" />
            <span>ดูรายงานเชิงลึก & ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">รายการแจ้งซ่อมทั้งหมด</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics?.totalTickets || 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ทุกประเภทงาน</div>
        </div>

        {/* New */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-[11px] font-semibold text-blue-700">แจ้งใหม่ (New)</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{metrics?.newTickets || 0}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">รอรับเรื่อง/จ่ายงาน</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-800">กำลังดำเนินการ</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{metrics?.inProgressTickets || 0}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">ช่างรับงานแล้ว</div>
        </div>

        {/* Waiting User */}
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs bg-purple-50/20">
          <div className="text-[11px] font-semibold text-purple-700">รอผู้ใช้ตรวจงาน</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{metrics?.waitingUserTickets || 0}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">รอฟีดแบ็ค</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-semibold text-emerald-800">แก้ไขแล้วเสร็จ</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics?.resolvedTickets || 0}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">งานเสร็จสิ้น</div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/30">
          <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
            <Hourglass className="w-3.5 h-3.5" />
            <span>เกินกำหนด (Overdue)</span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{metrics?.overdueTickets || 0}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">&gt; 3 วันยังไม่เสร็จ</div>
        </div>
      </div>

      {/* Critical Alert Warning if Critical Tickets Pending */}
      {(metrics?.criticalPending || 0) > 0 && (
        <div className="p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-rose-600 animate-bounce" />
            <div>
              <div className="font-bold text-xs sm:text-sm">
                มีงานด่วนระดับวิกฤต (Critical Priority) ค้างอยู่ {metrics?.criticalPending} งาน!
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5">
                กรุณามอบหมายช่างเทคนิคเพื่อเข้าตรวจสอบหน้างานทันทีเพื่อป้องกันระบบหยุดชะงัก
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateTickets}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition"
          >
            เปิดดูรายการวิกฤต
          </button>
        </div>
      )}

      {/* Technician Workload & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technician Workload (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                ภาระงานช่างเทคนิค (Technician Workload)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">งานที่กำลังทำ</span>
          </div>

          <div className="space-y-3">
            {metrics?.technicianWorkload.map((tech, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800">{tech.technicianName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    งานที่ปิดแล้ว: {tech.resolvedCount} งาน
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs ${
                      tech.activeCount === 0
                        ? 'bg-slate-200 text-slate-700'
                        : tech.activeCount <= 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tech.activeCount} งานค้าง
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>เวลาแก้ไขเฉลี่ย (MTTR):</span>
            <span className="font-semibold text-slate-700">
              {metrics?.averageResolutionHours} ชั่วโมง
            </span>
          </div>
        </div>

        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                สถิติปัญหาตามหมวดหมู่อุปกรณ์ (Issues by Category)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">การแจกแจงคำขอ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics?.categoryBreakdown.map((cat, i) => {
              const percent = metrics.totalTickets > 0 ? Math.round((cat.count / metrics.totalTickets) * 100) : 0;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between"
                >
                  <div>
                    <CategoryBadge category={cat.category} />
                    <div className="text-xl font-bold text-slate-900 mt-2">{cat.count}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>สัดส่วน</span>
                    <span className="font-semibold text-slate-700">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tickets Table with Quick Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              รายการแจ้งซ่อมล่าสุด & จัดการมอบหมายช่าง (Recent Requests & Quick Assign)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกที่แถวเพื่อเข้าสู่หน้าทำงานของช่าง หรือเลือกจ่ายงานให้ช่างเทคนิคได้ทันที
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateTickets}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <span>เปิดหน้าจัดการรายการแจ้งซ่อม</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">เลขที่ใบแจ้งซ่อม</th>
                <th className="px-4 py-3">ผู้แจ้ง & แผนก</th>
                <th className="px-4 py-3">หัวข้อปัญหา</th>
                <th className="px-4 py-3">ความสำคัญ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">ช่างผู้ดูแล (Quick Assign)</th>
                <th className="px-4 py-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTickets.slice(0, 6).map((t) => (
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
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={t.assignedTechnicianId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleQuickAssign(t.id, Number(val));
                      }}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="">-- รอจ่ายงาน --</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.fullName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTicket(t.id);
                      }}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition"
                    >
                      เปิดงาน
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
