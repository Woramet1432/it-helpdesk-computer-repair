import React, { useState, useEffect } from 'react';
import { Asset, Department, User, TicketCategory, AssetStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CategoryBadge } from '../../components/common/CategoryBadge.tsx';
import {
  Laptop,
  PlusCircle,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AssetManagementPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [modalAssetNumber, setModalAssetNumber] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalCategory, setModalCategory] = useState<TicketCategory>('computer_laptop');
  const [modalBrandModel, setModalBrandModel] = useState('');
  const [modalSerialNumber, setModalSerialNumber] = useState('');
  const [modalDeptId, setModalDeptId] = useState<string>('');
  const [modalUserId, setModalUserId] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<AssetStatus>('active');
  const [modalPurchaseDate, setModalPurchaseDate] = useState('');
  const [modalWarrantyExpire, setModalWarrantyExpire] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const [aData, dData, uData] = await Promise.all([
        api.getAssets({ search, category: categoryFilter, status: statusFilter }),
        api.getDepartments(),
        api.getUsers(),
      ]);
      setAssets(aData);
      setDepartments(dData);
      setUsers(uData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const openCreateModal = () => {
    setEditingAsset(null);
    setModalAssetNumber(`AST-NB-${new Date().getFullYear()}-${String(assets.length + 10).padStart(3, '0')}`);
    setModalName('');
    setModalCategory('computer_laptop');
    setModalBrandModel('');
    setModalSerialNumber('');
    setModalDeptId('');
    setModalUserId('');
    setModalStatus('active');
    setModalPurchaseDate(new Date().toISOString().split('T')[0]);
    setModalWarrantyExpire('');
    setModalNotes('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setModalAssetNumber(asset.assetNumber);
    setModalName(asset.name);
    setModalCategory(asset.category);
    setModalBrandModel(asset.brandModel || '');
    setModalSerialNumber(asset.serialNumber || '');
    setModalDeptId(asset.departmentId ? String(asset.departmentId) : '');
    setModalUserId(asset.assignedUserId ? String(asset.assignedUserId) : '');
    setModalStatus(asset.status);
    setModalPurchaseDate(asset.purchaseDate || '');
    setModalWarrantyExpire(asset.warrantyExpire || '');
    setModalNotes(asset.notes || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const payload: Partial<Asset> = {
        assetNumber: modalAssetNumber.trim(),
        name: modalName.trim(),
        category: modalCategory,
        brandModel: modalBrandModel.trim(),
        serialNumber: modalSerialNumber.trim(),
        departmentId: modalDeptId ? Number(modalDeptId) : null,
        assignedUserId: modalUserId ? Number(modalUserId) : null,
        status: modalStatus,
        purchaseDate: modalPurchaseDate || undefined,
        warrantyExpire: modalWarrantyExpire || undefined,
        notes: modalNotes.trim(),
      };

      if (editingAsset) {
        await api.updateAsset(editingAsset.id, payload);
      } else {
        await api.createAsset(payload);
      }

      setShowModal(false);
      await fetchAssets();
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถบันทึกข้อมูลอุปกรณ์ได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id: number, assetNumber: string) => {
    if (!confirm(`คุณต้องการลบอุปกรณ์รหัส ${assetNumber} ใช่หรือไม่?`)) return;
    try {
      await api.deleteAsset(id);
      await fetchAssets();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบได้');
    }
  };

  const getStatusBadge = (st: AssetStatus) => {
    const map: Record<AssetStatus, { label: string; bg: string; text: string }> = {
      active: { label: 'พร้อมใช้งาน', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
      in_repair: { label: 'กำลังส่งซ่อม', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' },
      reserved: { label: 'เครื่องสำรอง', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      retired: { label: 'ปลดประจำการ', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' },
    };
    const c = map[st] || map.active;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            ทะเบียนทรัพย์สินไอที (IT Hardware & Assets)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการอุปกรณ์คอมพิวเตอร์ โน้ตบุ๊ก ปริ้นเตอร์ และอุปกรณ์เครือข่ายขององค์กร
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มอุปกรณ์ใหม่ (+ Add Asset)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาตามรหัสทรัพย์สิน, ยี่ห้อ/รุ่น, Serial Number, ชื่ออุปกรณ์..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="computer_laptop">คอมพิวเตอร์ / โน้ตบุ๊ก</option>
              <option value="printer">เครื่องพิมพ์</option>
              <option value="network_internet">ระบบเครือข่าย</option>
              <option value="software">ซอฟต์แวร์</option>
              <option value="other_equipment">อุปกรณ์อื่นๆ</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">พร้อมใช้งาน</option>
              <option value="in_repair">กำลังส่งซ่อม</option>
              <option value="reserved">เครื่องสำรอง</option>
              <option value="retired">ปลดประจำการ</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              ค้นหา
            </button>

            <button
              type="button"
              onClick={fetchAssets}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="รีเฟรช"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            กำลังโหลดข้อมูลทะเบียนทรัพย์สิน...
          </div>
        ) : assets.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Laptop className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold">ไม่พบรายการอุปกรณ์</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">รหัสทรัพย์สิน</th>
                  <th className="px-4 py-3.5">หมวดหมู่</th>
                  <th className="px-4 py-3.5">ชื่ออุปกรณ์ & ยี่ห้อ/รุ่น</th>
                  <th className="px-4 py-3.5">Serial Number</th>
                  <th className="px-4 py-3.5">แผนก & ผู้ถือครอง</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-4 py-3.5">ประกันหมดอายุ</th>
                  <th className="px-4 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                      {a.assetNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <CategoryBadge category={a.category} />
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900">{a.name}</div>
                      <div className="text-[11px] text-slate-400">{a.brandModel || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {a.serialNumber || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{a.assignedUserName || 'ส่วนกลาง'}</div>
                      <div className="text-[11px] text-slate-400">{a.departmentName || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(a.status)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {a.warrantyExpire ? (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {a.warrantyExpire}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(a)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-600"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(a.id, a.assetNumber)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingAsset ? 'แก้ไขข้อมูลทรัพย์สินไอที' : 'ลงทะเบียนอุปกรณ์ใหม่เข้าสู่ระบบ'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveAsset} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสทรัพย์สิน (Asset Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalAssetNumber}
                    onChange={(e) => setModalAssetNumber(e.target.value)}
                    placeholder="เช่น AST-NB-2026-001"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    หมวดหมู่ (Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as TicketCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="computer_laptop">คอมพิวเตอร์ / โน้ตบุ๊ก</option>
                    <option value="printer">เครื่องพิมพ์ / พริ้นเตอร์</option>
                    <option value="network_internet">ระบบเครือข่าย / เน็ต</option>
                    <option value="software">ซอฟต์แวร์</option>
                    <option value="other_equipment">อุปกรณ์อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่ออุปกรณ์ (Device Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="เช่น Dell Latitude 5430 (Laptop), HP LaserJet Enterprise M507x"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ยี่ห้อ / รุ่น / สเปกย่อ
                  </label>
                  <input
                    type="text"
                    value={modalBrandModel}
                    onChange={(e) => setModalBrandModel(e.target.value)}
                    placeholder="Core i7 / 16GB / 512GB"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={modalSerialNumber}
                    onChange={(e) => setModalSerialNumber(e.target.value)}
                    placeholder="SN-12345678"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    แผนกที่ใช้งาน
                  </label>
                  <select
                    value={modalDeptId}
                    onChange={(e) => setModalDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- ส่วนกลาง --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ผู้ถือครองอุปกรณ์
                  </label>
                  <select
                    value={modalUserId}
                    onChange={(e) => setModalUserId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- ไม่ระบุผู้ใช้ --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    สถานะอุปกรณ์
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as AssetStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="active">พร้อมใช้งาน (Active)</option>
                    <option value="in_repair">กำลังส่งซ่อม (In Repair)</option>
                    <option value="reserved">เครื่องสำรอง (Reserved)</option>
                    <option value="retired">ปลดประจำการ (Retired)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันที่จัดซื้อ (Purchase Date)
                  </label>
                  <input
                    type="date"
                    value={modalPurchaseDate}
                    onChange={(e) => setModalPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    วันหมดอายุประกัน (Warranty Expire)
                  </label>
                  <input
                    type="date"
                    value={modalWarrantyExpire}
                    onChange={(e) => setModalWarrantyExpire(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม (Notes)
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="เช่น ตำแหน่งที่วาง, ข้อมูลผู้ขาย, เบอร์ Call Center ประกัน..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
