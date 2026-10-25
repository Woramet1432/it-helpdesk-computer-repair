import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { ShieldAlert, RefreshCw, Clock, Terminal, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            บันทึกประวัติความปลอดภัยและการปฏิบัติงาน (Security Audit Logs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            เก็บบันทึกประวัติการเข้าสู่ระบบ การแจ้งซ่อมใหม่ การมอบหมายงาน และการเปลี่ยนแปลงสิทธิ์เพื่อการตรวจสอบย้อนหลัง
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชประวัติ</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดข้อมูล Audit Logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Terminal className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold">ยังไม่มีบันทึก Audit Log</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">วัน-เวลา</th>
                  <th className="px-4 py-3.5">ผู้ปฏิบัติการ</th>
                  <th className="px-4 py-3.5">การกระทำ (Action)</th>
                  <th className="px-4 py-3.5">เป้าหมาย (Target)</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">รายละเอียดข้อมูล (Payload)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-sans">
                      {new Date(log.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-slate-900">{log.userName || 'ระบบ (System)'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userRole || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate text-[11px]" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '-'}
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
