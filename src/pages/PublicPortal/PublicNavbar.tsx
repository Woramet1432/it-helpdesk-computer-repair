import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Wrench,
  Search,
  PlusCircle,
  HelpCircle,
  Shield,
  LayoutDashboard,
  Home,
  ArrowRight,
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  IT HELPDESK
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                  แจ้งซ่อมคอมพิวเตอร์
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-normal">
                ศูนย์บริการช่วยเหลือและแจ้งซ่อมไอทีสำหรับพนักงาน
              </div>
            </div>
          </button>

          {/* Center Navigation Links (Matching screenshot) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าแรก</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('new_ticket')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer ${
                activeTab === 'new_ticket'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>แจ้งซ่อมทันที</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('track_ticket')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer ${
                activeTab === 'track_ticket'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>ติดตามงานซ่อม</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('guide')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>วิธีใช้งาน & ติดต่อ IT</span>
            </button>
          </nav>

          {/* Right: Staff Login Button / Dashboard */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {isStaff && onGoToStaffDashboard && (
                  <button
                    type="button"
                    onClick={onGoToStaffDashboard}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">แดชบอร์ดเจ้าหน้าที่ IT</span>
                    <span className="sm:hidden">IT Admin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 leading-tight">{user.fullName}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenStaffLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition cursor-pointer shadow-2xs"
                title="สำหรับเจ้าหน้าที่ฝ่ายเทคโนโลยีสารสนเทศเข้าสู่ระบบจัดการงาน"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>เข้าสู่ระบบเจ้าหน้าที่ IT</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'home' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>หน้าแรก</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('new_ticket')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 font-semibold ${
              activeTab === 'new_ticket' ? 'text-white bg-blue-600' : 'text-blue-600 bg-blue-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>แจ้งซ่อมทันที</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track_ticket')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'track_ticket' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>ติดตามงานซ่อม</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('guide')}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'guide' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>วิธีใช้งาน & ติดต่อ IT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
