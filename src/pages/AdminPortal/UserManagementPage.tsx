import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { User, Department, UserRole } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Users,
  Shield,
  UserCheck,
  Building,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Lock,
  Phone,
  Mail,
  MapPin,
  Check,
  ShieldAlert,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    departmentId: '',
    phone: '',
    location: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uData, dData] = await Promise.all([api.getUsers(), api.getDepartments()]);
      setUsers(uData);
      setDepartments(dData);
    } catch (err: any) {
      console.error(err);
      showNotification('error', err.message || 'ไม่สามารถโหลดรายชื่อผู้ใช้งานได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: 'user',
      departmentId: '',
      phone: '',
      location: '',
      isActive: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      password: '', // blank by default for edit
      role: user.role || 'user',
      departmentId: user.departmentId ? String(user.departmentId) : '',
      phone: user.phone || '',
      location: user.location || '',
      isActive: user.isActive ?? true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'กรุณากรอกชื่อ-นามสกุล (อย่างน้อย 2 ตัวอักษร)';
    }

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      errors.username = 'ชื่อผู้ใช้ (Username) ต้องมีอย่างน้อย 3 ตัวอักษร';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Username ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง (_) เท่านั้น';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'กรุณากรอกอีเมลให้ถูกต้อง';
    }

    if (!editingUser) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      }
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingUser) {
        // Edit User
        const payload: any = {
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          departmentId: formData.departmentId ? Number(formData.departmentId) : null,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          isActive: formData.isActive,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        await api.updateUser(editingUser.id, payload);
        showNotification('success', `อัปเดตข้อมูลผู้ใช้งาน ${formData.fullName} สำเร็จ`);
      } else {
        // Create User
        await api.createUser({
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password.trim(),
          role: formData.role,
          departmentId: formData.departmentId ? Number(formData.departmentId) : null,
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          isActive: formData.isActive,
        });
        showNotification('success', `เพิ่มผู้ใช้งาน ${formData.fullName} เรียบร้อยแล้ว`);
      }

      setShowModal(false);
      await fetchUsers();
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        setFormErrors({ general: err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);

    try {
      await api.deleteUser(deletingUser.id);
      showNotification('success', `ลบผู้ใช้งาน ${deletingUser.fullName} สำเร็จ`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบผู้ใช้งานได้');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    if (!isAdmin) return;
    try {
      await api.updateUserRole(userId, { role: newRole });
      showNotification('success', 'เปลี่ยนบทบาทผู้ใช้งานสำเร็จ');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถปรับเปลี่ยนสิทธิ์ได้');
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await api.updateUserRole(userId, { isActive: !currentStatus });
      showNotification('success', 'เปลี่ยนสถานะผู้ใช้งานสำเร็จ');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchDept = deptFilter === 'all' || String(u.departmentId) === deptFilter;
    return matchSearch && matchRole && matchDept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>สิทธิ์เฉพาะผู้ดูแลระบบ (Admin Access Only)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            จัดการผู้ใช้งานและสิทธิ์ในระบบ (Users & Roles)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            เพิ่ม ลบ แก้ไข ข้อมูลผู้ใช้งาน และกำหนดสิทธิ์การเข้าถึงระบบไอที
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช ({users.length})</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>เพิ่มผู้ใช้งานใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ-นามสกุล, Username, อีเมล, หรือเบอร์โทร..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกบทบาท (All Roles)</option>
            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            <option value="technician">ช่างเทคนิค (Technician)</option>
            <option value="user">พนักงานแจ้งซ่อม (User)</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกแผนก (All Depts)</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>กำลังโหลดรายชื่อผู้ใช้งาน...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <div className="text-base font-bold text-slate-700">ไม่พบผู้ใช้งานตามเงื่อนไข</div>
            <div className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">ผู้ใช้งาน (User)</th>
                  <th className="px-5 py-4">อีเมล & เบอร์โทร</th>
                  <th className="px-5 py-4">แผนกสังกัด</th>
                  <th className="px-5 py-4">บทบาท (Role)</th>
                  <th className="px-5 py-4">สถานะบัญชี</th>
                  <th className="px-5 py-4 text-center">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isMainAdmin = u.id === 1;
                  const isSelf = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition group">
                      {/* Name & Username */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : u.role === 'technician'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {isMainAdmin && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                                  Super Admin
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                  (คุณ)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="px-5 py-4">
                        <div className="text-slate-800 font-medium text-xs sm:text-sm">{u.email}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone || '-'}</span>
                          {u.location && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 truncate max-w-[140px]">{u.location}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{u.departmentName || 'ไม่ระบุแผนก'}</span>
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        {isAdmin && !isMainAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                              u.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : u.role === 'technician'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                            <option value="technician">ช่างเทคนิค (Technician)</option>
                            <option value="user">พนักงานทั่วไป (User)</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${
                              u.role === 'admin'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : u.role === 'technician'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {u.role === 'admin' ? 'ผู้ดูแลระบบ' : u.role === 'technician' ? 'ช่างเทคนิค' : 'พนักงานทั่วไป'}
                          </span>
                        )}
                      </td>

                      {/* Account Status Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={!isAdmin || isMainAdmin}
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition ${
                            !isAdmin || isMainAdmin
                              ? 'cursor-not-allowed opacity-80'
                              : 'cursor-pointer'
                          } ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>เปิดใช้งาน</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>ถูกระงับ</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons: Edit & Delete */}
                      <td className="px-5 py-4 text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                              title="แก้ไขข้อมูลผู้ใช้"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={isMainAdmin || isSelf}
                              onClick={() => setDeletingUser(u)}
                              className={`p-2 rounded-xl border transition ${
                                isMainAdmin || isSelf
                                  ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 cursor-pointer'
                              }`}
                              title={
                                isMainAdmin
                                  ? 'ไม่สามารถลบบัญชี Super Admin ได้'
                                  : isSelf
                                  ? 'ไม่สามารถลบบัญชีตัวเองได้'
                                  : 'ลบผู้ใช้งาน'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">เฉพาะ Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {editingUser ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {editingUser ? `แก้ไข: ${editingUser.fullName}` : 'สร้างบัญชีผู้ใช้งานใหม่'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.general && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="เช่น สมชาย ใจดี"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      formErrors.fullName ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-[11px] text-rose-600">{formErrors.fullName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น somchai_j"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono ${
                      formErrors.username ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.username && <p className="text-[11px] text-rose-600">{formErrors.username}</p>}
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    อีเมล (Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@company.local"
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      formErrors.email ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.email && <p className="text-[11px] text-rose-600">{formErrors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    รหัสผ่าน {editingUser ? '(เว้นว่างไว้หากไม่เปลี่ยน)' : <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '•••••••• (ไม่เปลี่ยนไม่ต้องกรอก)' : 'อย่างน้อย 6 ตัวอักษร'}
                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      formErrors.password ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {formErrors.password && <p className="text-[11px] text-rose-600">{formErrors.password}</p>}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  บทบาทในระบบ (Role) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'user' as UserRole, label: 'พนักงานทั่วไป (User)', desc: 'แจ้งซ่อม/ติดตามงาน' },
                    { id: 'technician' as UserRole, label: 'ช่างเทคนิค (Tech)', desc: 'รับงาน/ซ่อมอุปกรณ์' },
                    { id: 'admin' as UserRole, label: 'ผู้ดูแล (Admin)', desc: 'สิทธิ์เต็มทุกส่วน' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      disabled={editingUser?.id === 1 && r.id !== 'admin'}
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        formData.role === r.id
                          ? r.id === 'admin'
                            ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 font-bold'
                            : r.id === 'technician'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300 font-bold'
                            : 'border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-300 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  แผนกสังกัด (Department)
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- ไม่ระบุแผนก --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">เบอร์โทรศัพท์ / ต่อภายใน</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 081-234-5678 หรือ 102"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">สถานที่ / โต๊ะทำงาน</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="เช่น อาคาร A ชั้น 2 แผนกจัดซื้อ"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Active Account Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    disabled={editingUser?.id === 1}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>เปิดใช้งานบัญชีผู้ใช้นี้ (Active Account)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingUser ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้งาน'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบผู้ใช้งาน</h3>
              <p className="text-xs text-slate-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน{' '}
                <strong className="text-slate-800 font-semibold">{deletingUser.fullName}</strong> (@{deletingUser.username})?
                การดำเนินการนี้ไม่สามารถยกเลิกได้
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/25 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>ยืนยันการลบ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
