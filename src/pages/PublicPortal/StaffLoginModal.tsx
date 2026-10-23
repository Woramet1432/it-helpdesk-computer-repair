import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Server,
  Lock,
  User,
  X,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, switchDemoAccount } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login({ username, password });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'tech_wichai' | 'user_kanya' | 'user_pricha') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await switchDemoAccount(role);
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบด้วยบัญชีทดสอบได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Server className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">เข้าสู่ระบบเจ้าหน้าที่ฝ่ายไอที</h2>
              <div className="text-xs text-slate-400">
                สำหรับผู้ดูแลระบบและเจ้าหน้าที่ฝ่ายเทคโนโลยีสารสนเทศ
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Demo 1-Click Buttons */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>เข้าสู่ระบบด่วนเพื่อทดสอบระบบ (Demo Accounts):</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition cursor-pointer"
              >
                <div className="font-bold text-slate-900">IT Administrator</div>
                <div className="text-[10px] text-slate-500">จัดการระบบ, มอบหมายงาน, รายงาน</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tech_wichai')}
                className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition cursor-pointer"
              >
                <div className="font-bold text-blue-700">IT Specialist (ช่างวิชัย)</div>
                <div className="text-[10px] text-slate-500">รับงานซ่อม, ตรวจเช็ก, บันทึกผล</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อผู้ใช้งาน หรือ อีเมล (Username / Corporate Email)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin หรือ tech_wichai"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบจัดการไอที</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              กลับสู่หน้าพอร์ทัลบริการพนักงาน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
