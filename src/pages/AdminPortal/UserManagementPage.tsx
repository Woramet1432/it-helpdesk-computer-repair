import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uData, dData] = await Promise.all([api.getUsers(), api.getDepartments()]);
      setUsers(uData);
      setDepartments(dData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, { role: newRole });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถปรับเปลี่ยนสิทธิ์ได้');
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await api.updateUserRole(userId, { isActive: !currentStatus });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้');
    }
  };

  const handleDepartmentChange = async (userId: number, deptId: string) => {
    try {
      await api.updateUserRole(userId, { departmentId: deptId ? Number(deptId) : null });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเปลี่ยนแผนกได้');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            จัดการผู้ใช้งานและสิทธิ์ในระบบ (Users & Roles)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดบทบาทผู้ดูแลระบบ (Admin), ช่างเทคนิค (Technician), หรือพนักงานทั่วไป (User)
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชรายชื่อ ({users.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาตามชื่อ-นามสกุล, Username, หรืออีเมล..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
        >
          <option value="all">ทุกบทบาท (All Roles)</option>
          <option value="admin">ผู้ดูแลระบบ (Admin)</option>
          <option value="technician">ช่างเทคนิค (Technician)</option>
          <option value="user">พนักงานแจ้งซ่อม (User)</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดรายชื่อผู้ใช้...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold">ไม่พบผู้ใช้งานตามเงื่อนไข</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">ชื่อ-นามสกุล / Username</th>
                  <th className="px-4 py-3.5">อีเมล & เบอร์โทร</th>
                  <th className="px-4 py-3.5">แผนกสังกัด</th>
                  <th className="px-4 py-3.5">บทบาท (Role)</th>
                  <th className="px-4 py-3.5">สถานะบัญชี</th>
                  <th className="px-4 py-3.5">วันที่ลงทะเบียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.departmentId ? String(u.departmentId) : ''}
                        onChange={(e) => handleDepartmentChange(u.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="">-- ไม่ระบุ --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={u.role}
                        disabled={u.id === 1} // protect main admin
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className={`px-2.5 py-1 text-xs border rounded-lg font-medium ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : u.role === 'technician'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-50 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        <option value="technician">ช่างเทคนิค (Technician)</option>
                        <option value="user">พนักงานทั่วไป (User)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        disabled={u.id === 1}
                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>เปิดใช้งาน</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ถูกระงับ</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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
