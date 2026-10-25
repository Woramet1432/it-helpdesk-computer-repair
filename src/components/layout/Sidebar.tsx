import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  Ticket,
  Laptop,
  Users,
  BarChart3,
  ShieldAlert,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

export type ActivePage =
  | 'user_dashboard'
  | 'new_ticket'
  | 'my_tickets'
  | 'admin_dashboard'
  | 'admin_tickets'
  | 'assets'
  | 'users'
  | 'reports'
  | 'audit_logs';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  open: boolean;
  onClose: () => void;
  newTicketCount?: number;
  inProgressCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  open,
  onClose,
  newTicketCount = 0,
  inProgressCount = 0,
}) => {
  const { user, isAdmin, isStaff } = useAuth();

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Main User Portal Section */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>พอร์ทัลพนักงาน (User Portal)</span>
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => handleNav('user_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activePage === 'user_dashboard'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>หน้าหลักของฉัน</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('new_ticket')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activePage === 'new_ticket'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-blue-50/70 text-blue-700 hover:bg-blue-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className={`w-4 h-4 ${activePage === 'new_ticket' ? 'text-white' : 'text-blue-600'}`} />
                  <span>แจ้งซ่อมใหม่</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${activePage === 'new_ticket' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'}`}>
                  +สร้าง
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('my_tickets')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activePage === 'my_tickets'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>ประวัติการแจ้งซ่อม</span>
              </button>
            </nav>
          </div>

          {/* IT Staff & Admin Section */}
          {isStaff && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
                <span>ระบบบริหารจัดการ (IT Support)</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">STAFF</span>
              </div>
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNav('admin_dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'admin_dashboard'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    <span>แดชบอร์ดงานไอที</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('admin_tickets')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'admin_tickets'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-amber-500" />
                    <span>จัดการรายการแจ้งซ่อม</span>
                  </div>
                  {newTicketCount > 0 && (
                    <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {newTicketCount} ใหม่
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('assets')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'assets'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-emerald-500" />
                  <span>ทะเบียนทรัพย์สินไอที</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('reports')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                    activePage === 'reports'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>รายงานสถิติ & ส่งออก</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleNav('users')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                        activePage === 'users'
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4 text-sky-500" />
                      <span>จัดการผู้ใช้และสิทธิ์</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav('audit_logs')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                        activePage === 'audit_logs'
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>บันทึกความปลอดภัย (Audit)</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Service Status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-500 space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-700">
            <span>สถานะระบบไอที</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              พร้อมให้บริการ
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            เบอร์ภายใน IT Support: 4501, 4502
          </div>
        </div>
      </aside>
    </>
  );
};
