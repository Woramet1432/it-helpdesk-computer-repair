import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wrench, Shield, Lock, User, Sparkles, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onBackToPublic?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToPublic }) => {
  const { login, switchDemoAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Admin@123');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login({ username: loginUsername, password: loginPassword });
    } catch (err: any) {
      setErrorMessage(err.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง หรือคุณไม่มีสิทธิ์เข้าใช้งานระบบจัดการนี้');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'tech_wichai') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await switchDemoAccount(role);
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบด้วยบัญชีทดสอบได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4 ring-4 ring-blue-500/20">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          เข้าสู่ระบบเจ้าหน้าที่ไอที
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          สำหรับผู้ดูแลระบบและช่างเทคนิคฝ่ายสารสนเทศ (Admin & Technician Portal)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100 space-y-6">
          {/* Notice: Users don't need login */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-blue-800">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>สิทธิ์การเข้าสู่ระบบเฉพาะเจ้าหน้าที่ไอที:</span>
            </div>
            <span>
              ระบบล็อกอินนี้อนุญาตเฉพาะ <strong>ผู้ดูแลระบบ (Admin)</strong> และ <strong>ช่างเทคนิค (Technician)</strong> เท่านั้น พนักงานทั่วไปสามารถแจ้งซ่อมและติดตามสถานะงานได้โดยตรงโดยไม่ต้องใช้บัญชีผู้ใช้หรืออีเมลล็อกอิน
            </span>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>เข้าสู่ระบบด่วนด้วยบัญชีทดสอบ (1-Click Demo Login):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs cursor-pointer"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  ผู้ดูแลระบบ (Admin)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">คุณวรเมธ ดีแล้ว (admin)</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-1">สิทธิ์ดูแลระบบและจัดการผู้ใช้</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tech_wichai')}
                className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs cursor-pointer"
              >
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  ช่างเทคนิค (Technician)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">ช่างภูมินทร์ (tech.wichai)</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-1">สิทธิ์รับงานซ่อมและบันทึกผล</div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อผู้ใช้งาน หรือ อีเมลเจ้าหน้าที่ (Username or Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin หรือ tech.wichai"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="รหัสผ่านของคุณ"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบเจ้าหน้าที่ไอที</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link back to public user portal */}
          {onBackToPublic && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onBackToPublic}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าหลักสำหรับพนักงาน (แจ้งซ่อม / ติดตามงาน)</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          ฝ่ายเทคโนโลยีสารสนเทศ (IT Department) © 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
};
