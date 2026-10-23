import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Wrench,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  Menu,
  Building2,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onSwitchToPublicPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onSwitchToPublicPortal }) => {
  const { user, logout, switchDemoAccount, isAdmin, isTechnician } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleLabel = isAdmin
    ? 'ผู้ดูแลระบบ (Admin)'
    : isTechnician
    ? 'ช่างเทคนิคไอที (Technician)'
    : 'พนักงานผู้แจ้ง (User)';

  const roleBg = isAdmin
    ? 'bg-rose-100 text-rose-800 border-rose-300'
    : isTechnician
    ? 'bg-blue-100 text-blue-800 border-blue-300'
    : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="เปิดเมนูนำทาง"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base tracking-wide flex items-center gap-2">
                <span>IT HELPDESK</span>
                <span className="hidden sm:inline-block text-xs font-normal text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                  ระบบแจ้งซ่อมคอมพิวเตอร์
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                ระบบจัดการคำขอบริการไอทีและติดตามสถานะงานซ่อม
              </div>
            </div>
          </div>
        </div>

        {/* Right: Public View Switcher, Quick Demo Switcher, User Info & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onSwitchToPublicPortal && (
            <button
              type="button"
              onClick={onSwitchToPublicPortal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/50 transition cursor-pointer"
              title="สลับไปดูหน้าพนักงานแจ้งซ่อม (Public Portal View)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">ดูหน้าแจ้งซ่อมทั่วไป</span>
            </button>
          )}

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition shadow-sm"
              title="สลับบัญชีทดสอบเพื่อดูสิทธิ์ User Portal หรือ Admin Portal"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">สลับบัญชีทดสอบ (Demo Switcher)</span>
              <span className="md:hidden">สลับผู้ใช้</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 text-slate-800 border border-slate-200"
                onClick={() => setShowDemoMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  เลือกบทบาทเจ้าหน้าที่ไอที (Staff Switch)
                </div>

                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => switchDemoAccount('admin')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                      user?.username === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">👑 ผู้ดูแลระบบ (Admin IT)</div>
                      <div className="text-[11px] text-slate-500">วรเมธ ดีแล้ว (admin) • จัดการตั๋ว, ผู้ใช้งาน, รายงาน</div>
                    </div>
                    {user?.username === 'admin' && <span className="text-xs text-blue-600">✓ ใช้งานอยู่</span>}
                  </button>

                  <button
                    onClick={() => switchDemoAccount('tech_wichai')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                      user?.username === 'tech.wichai' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">🔧 ช่างเทคนิค (Technician)</div>
                      <div className="text-[11px] text-slate-500">ภูมินทร์ (tech.wichai) • วินิจฉัย, ซ่อมแซม, อัปเดตงาน</div>
                    </div>
                    {user?.username === 'tech.wichai' && <span className="text-xs text-blue-600">✓ ใช้งานอยู่</span>}
                  </button>

                  <button
                    onClick={() => switchDemoAccount('tech_narin')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                      user?.username === 'tech.narin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">🔧 ช่างเทคนิค (Technician)</div>
                      <div className="text-[11px] text-slate-500">พิชิต เพ่งเเจ่ม (tech.narin) • งานระบบและอุปกรณ์</div>
                    </div>
                    {user?.username === 'tech.narin' && <span className="text-xs text-blue-600">✓ ใช้งานอยู่</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-800 transition"
              aria-label="เมนูผู้ใช้งาน"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-medium text-xs">
                {user?.fullName?.charAt(0) || <UserIcon className="w-4 h-4" />}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.fullName}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>{user?.departmentName || 'ทั่วไป'}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 text-slate-800 border border-slate-200"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-medium text-slate-900 text-sm">{user?.fullName}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                  <div className="mt-2">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border ${roleBg}`}>
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-2 text-xs text-slate-600 border-b border-slate-100 space-y-1">
                  {user?.phone && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">โทร:</span> {user.phone}
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">สถานที่:</span> {user.location}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ (Logout)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
