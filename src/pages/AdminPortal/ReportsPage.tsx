import React, { useState, useEffect } from 'react';
import { Ticket, Department, User, DashboardMetrics } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.tsx';
import {
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  Users,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [reportTickets, setReportTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [category, setCategory] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [status, setStatus] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [m, tList, dList, techList] = await Promise.all([
        api.getDashboardMetrics(),
        api.getReportData({
          startDate,
          endDate,
          departmentId,
          category,
          technicianId,
          status,
        }),
        api.getDepartments(),
        api.getTechnicians(),
      ]);
      setMetrics(m);
      setReportTickets(tList);
      setDepartments(dList);
      setTechnicians(techList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [departmentId, category, technicianId, status]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleExportCsv = () => {
    const url = api.exportReportCsvUrl({
      startDate,
      endDate,
      departmentId,
      category,
      technicianId,
      status,
    });
    window.location.href = url;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            รายงานสถิติ & วิเคราะห์งานไอที (Reports & Analytics)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลสถิติใบแจ้งซ่อม ปริมาณงานรายแผนก และส่งออกไฟล์รายงานในรูปแบบ Excel CSV
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ส่งออกรายงาน CSV (Export to Excel)</span>
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleApplyFilter} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ตั้งแต่วันที่ (Start Date)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ถึงวันที่ (End Date)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                แผนก (Department)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">ทุกแผนก</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                หมวดหมู่ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">ทุกหมวดหมู่</option>
                <option value="computer_laptop">คอมพิวเตอร์ / โน้ตบุ๊ก</option>
                <option value="printer">เครื่องพิมพ์</option>
                <option value="network_internet">ระบบเครือข่าย</option>
                <option value="software">ซอฟต์แวร์</option>
                <option value="email_account">อีเมล / บัญชี</option>
                <option value="other_equipment">อุปกรณ์อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                ช่างผู้รับผิดชอบ
              </label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">ทุกคน</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                กรองข้อมูล
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setDepartmentId('');
                  setCategory('');
                  setTechnicianId('');
                  setStatus('');
                }}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-xs"
                title="ล้าง"
              >
                ล้าง
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">จำนวนคำขอตามเงื่อนไข</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{reportTickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">รายการที่ค้นพบ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">เวลาเฉลี่ยในการแก้ไข (MTTR)</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {metrics?.averageResolutionHours} ชม.
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Mean Time to Resolve</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">แก้ไขเสร็จสมบูรณ์</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {reportTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">งานเรียบร้อย</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">งานที่อยู่ระหว่างทำ</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {reportTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">ค้างดำเนินการ</div>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            สถิติการแจ้งซ่อมจำแนกตามแผนก (Requests by Department)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics?.departmentBreakdown.map((dept, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs font-semibold text-slate-700 truncate" title={dept.departmentName}>
                {dept.departmentName}
              </div>
              <div className="text-xl font-bold text-blue-700 mt-1.5">{dept.count}</div>
              <div className="text-[10px] text-slate-400">คำขอแจ้งซ่อม</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtered Tickets Output Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            ตารางข้อมูลผลลัพธ์รายงาน (Report Dataset)
          </div>
          <div className="text-xs text-slate-500">
            แสดง {reportTickets.length} รายการ
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดข้อมูลรายงาน...
          </div>
        ) : reportTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            ไม่พบข้อมูลตั๋วตรงตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">เลขที่ตั๋ว</th>
                  <th className="px-4 py-3">วันที่แจ้ง</th>
                  <th className="px-4 py-3">ผู้แจ้ง</th>
                  <th className="px-4 py-3">แผนก</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">หัวข้อปัญหา</th>
                  <th className="px-4 py-3">ระดับ</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">ช่างผู้ดูแล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{t.ticketNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">{t.requesterName}</td>
                    <td className="px-4 py-3">{t.departmentName}</td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={t.category} />
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={t.title}>
                      {t.title}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3">{t.assignedTechnicianName || '-'}</td>
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
