import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wrench, Shield, Lock, User, Mail, Phone, Building, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, switchDemoAccount } = useAuth();
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Admin@123');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regDepartmentId, setRegDepartmentId] = useState('2');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login({ username: loginUsername, password: loginPassword });
    } catch (err: any) {
      setErrorMessage(err.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        departmentId: Number(regDepartmentId),
        phone: regPhone,
        location: regLocation,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถลงทะเบียนได้');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'tech_wichai' | 'user_kanya' | 'user_pricha') => {
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
          IT Helpdesk & Computer Repair
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          ระบบแจ้งซ่อมคอมพิวเตอร์และบริการไอทีสำหรับองค์กร
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          {/* Quick Demo Accounts Banner */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>เข้าสู่ระบบด่วนด้วยบัญชีทดสอบ (1-Click Demo Login)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  ผู้ดูแลระบบ (Admin)
                </div>
                <div className="text-[11px] text-slate-500">สิทธิ์แอดมินสูงสุด</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('tech_wichai')}
                className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  ช่างเทคนิค (Technician)
                </div>
                <div className="text-[11px] text-slate-500">สิทธิ์ซ่อมและอัปเดตงาน</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('user_kanya')}
                className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  พนักงาน HR (กัญญา)
                </div>
                <div className="text-[11px] text-slate-500">มีโน้ตบุ๊กแจ้งซ่อมค้าง</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('user_pricha')}
                className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition shadow-xs"
              >
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  พนักงานการเงิน (ปรีชา)
                </div>
                <div className="text-[11px] text-slate-500">รอตรวจเช็คเครื่องพิมพ์</div>
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterTab(false);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-center text-sm font-medium border-b-2 transition ${
                !isRegisterTab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterTab(true);
                setErrorMessage(null);
              }}
              className={`flex-1 py-2.5 text-center text-sm font-medium border-b-2 transition ${
                isRegisterTab
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              ลงทะเบียนพนักงานใหม่ (Register)
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isRegisterTab ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน หรือ อีเมล (Username or Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="เช่น admin, tech.wichai, user.kanya"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="รหัสผ่านของคุณ"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุลจริง
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="user.somchai"
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมลบริษัท
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="somchai@company.co.th"
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แผนกสังกัด
                  </label>
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="1">ฝ่ายเทคโนโลยีสารสนเทศ (IT)</option>
                    <option value="2">ฝ่ายทรัพยากรบุคคล (HR)</option>
                    <option value="3">ฝ่ายการเงินและบัญชี (ACC)</option>
                    <option value="4">ฝ่ายการตลาดและประชาสัมพันธ์ (MKT)</option>
                    <option value="5">ฝ่ายขายและการบริการลูกค้า (SALES)</option>
                    <option value="6">ฝ่ายปฏิบัติการและจัดซื้อ (OPS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรติดต่อ
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานที่ทำงาน / โต๊ะ
                  </label>
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="อาคาร B ชั้น 2"
                    className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                🔒 ตามนโยบายความปลอดภัย บัญชีที่ลงทะเบียนจะได้รับสิทธิ์พนักงานแจ้งซ่อม (User Role) บัญชีผู้ดูแลระบบหรือช่างเทคนิคต้องได้รับการแต่งตั้งจากผู้ดูแลระบบไอทีเท่านั้น
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนและเข้าสู่ระบบ'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          ฝ่ายเทคโนโลยีสารสนเทศ (IT Department) © 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
};
