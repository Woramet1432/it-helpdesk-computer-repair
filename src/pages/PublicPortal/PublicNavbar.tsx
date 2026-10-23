import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  HelpCircle,
  Shield,
  LayoutDashboard,
  Home,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';

export type PublicActiveTab = 'home' | 'new_ticket' | 'track_ticket' | 'guide';

interface PublicNavbarProps {
  activeTab: PublicActiveTab;
  onNavigate: (tab: PublicActiveTab) => void;
  onOpenStaffLogin: () => void;
  onGoToStaffDashboard?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  activeTab,
  onNavigate,
  onOpenStaffLogin,
  onGoToStaffDashboard,
}) => {
  const { user, isStaff } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Organization System Status Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] text-slate-400 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>ระบบไอทีส่วนกลางเปิดให้บริการปกติ</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              LAN & Wi-Fi: 100% · ERP Server: ปกติ · Email 365: ปกติ
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">เวลาทำการฝ่าย IT: จันทร์ - ศุกร์ 08:30 - 17:30 น.</span>
            <span className="text-slate-300 font-semibold">Hotline ภายใน: 1101, 1102</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Corporate Brand */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/40 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>IT SERVICE DESK</span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wide uppercase text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
                  ฝ่ายเทคโนโลยีสารสนเทศ
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block font-normal">
                พอร์ทัลบริการไอทีและแจ้งเหตุขัดข้องสำหรับพนักงานภายในองค์กร
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลักบริการ</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('new_ticket')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'new_ticket'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-blue-600/90 text-white hover:bg-blue-500 font-medium'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>ยื่นคำขอบริการ / แจ้งปัญหา</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('track_ticket')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'track_ticket'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>ติดตามสถานะ Ticket</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('guide')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>สารบัญบริการ & ติดต่อ IT</span>
            </button>
          </nav>

          {/* Right: Staff Controls / Login */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {isStaff && onGoToStaffDashboard && (
                  <button
                    type="button"
                    onClick={onGoToStaffDashboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">แดชบอร์ดเจ้าหน้าที่ IT</span>
                    <span className="sm:hidden">IT Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-700 text-xs text-slate-300">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100 leading-tight">{user.fullName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenStaffLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                title="สำหรับเจ้าหน้าที่ฝ่ายเทคโนโลยีสารสนเทศเข้าสู่ระบบจัดการงาน"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>สำหรับเจ้าหน้าที่ IT</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`py-1 px-2 rounded-md flex items-center gap-1 ${
              activeTab === 'home' ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>หน้าหลัก</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('new_ticket')}
            className={`py-1 px-2.5 rounded-md flex items-center gap-1 font-semibold ${
              activeTab === 'new_ticket' ? 'text-white bg-blue-600' : 'text-blue-300 bg-blue-950/60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>แจ้งขอรับบริการ</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track_ticket')}
            className={`py-1 px-2 rounded-md flex items-center gap-1 ${
              activeTab === 'track_ticket' ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>ตรวจสถานะ</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className={`py-1 px-2 rounded-md flex items-center gap-1 ${
              activeTab === 'guide' ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ติดต่อ IT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
