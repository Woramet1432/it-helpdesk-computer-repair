import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { TicketCategory, TicketPriority, Asset, Department } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  Laptop,
  Printer,
  Wifi,
  Code2,
  Mail,
  Cpu,
  UploadCloud,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface NewTicketPageProps {
  onBack: () => void;
  onSuccess: (ticketId: number) => void;
}

const CATEGORIES: { id: TicketCategory; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'computer_laptop',
    title: 'คอมพิวเตอร์ / โน้ตบุ๊ก',
    desc: 'เครื่องเปิดไม่ติด, จอฟ้า, ช้าผิดปกติ, ฮาร์ดดิสก์เต็ม, คีย์บอร์ดเสีย',
    icon: <Laptop className="w-6 h-6 text-sky-600" />,
  },
  {
    id: 'printer',
    title: 'เครื่องพิมพ์ / พริ้นเตอร์',
    desc: 'กระดาษติด, หมึกหมด, พิมพ์ไม่ออก, ขึ้นรหัส Error, แถบหมึกเลอะ',
    icon: <Printer className="w-6 h-6 text-indigo-600" />,
  },
  {
    id: 'network_internet',
    title: 'ระบบเครือข่าย / อินเทอร์เน็ต',
    desc: 'Wi-Fi หลุดบ่อย, สายแลนต่อไม่ติด, เข้าเว็บภายในไม่ได้, VPN ใช้งานไม่ได้',
    icon: <Wifi className="w-6 h-6 text-blue-600" />,
  },
  {
    id: 'software',
    title: 'โปรแกรม / ซอฟต์แวร์',
    desc: 'ติดตั้งโปรแกรมทำงาน, License หมดอายุ, โปรแกรมค้าง, ปัญหา ERP/บัญชี',
    icon: <Code2 className="w-6 h-6 text-violet-600" />,
  },
  {
    id: 'email_account',
    title: 'อีเมล / บัญชีผู้ใช้งาน',
    desc: 'รีเซ็ตรหัสผ่าน, ขอสิทธิ์เข้าถึงโฟลเดอร์, Two-Factor Authentication, Outlook',
    icon: <Mail className="w-6 h-6 text-teal-600" />,
  },
  {
    id: 'other_equipment',
    title: 'อุปกรณ์ไอทีอื่นๆ',
    desc: 'จอ Monitor, เมาส์, หูฟังประชุม, เครื่องสำรองไฟ UPS, โปรเจคเตอร์',
    icon: <Cpu className="w-6 h-6 text-slate-600" />,
  },
];

export const NewTicketPage: React.FC<NewTicketPageProps> = ({ onBack, onSuccess }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [category, setCategory] = useState<TicketCategory>('computer_laptop');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [departmentId, setDepartmentId] = useState<string>(user?.departmentId ? String(user.departmentId) : '2');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [customAssetNumber, setCustomAssetNumber] = useState('');
  const [location, setLocation] = useState(user?.location || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ name: string; size: string; url?: string }[]>([]);

  useEffect(() => {
    // Load departments
    api.getDepartments().then(setDepartments).catch(console.error);

    // Load assets belonging to user or departments
    api.getAssets().then((assets) => {
      // Filter assets assigned to this user or department
      const relevant = assets.filter(
        (a) => a.assignedUserId === user?.id || (user?.departmentId && a.departmentId === user.departmentId)
      );
      setUserAssets(relevant.length > 0 ? relevant : assets);
      if (relevant.length > 0) {
        setSelectedAssetId(String(relevant[0].id));
      }
    }).catch(console.error);
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const validFiles: File[] = [];
    const previews: { name: string; size: string; url?: string }[] = [...filePreviews];

    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          files: `ไฟล์ ${file.name} มีขนาดเกิน 5MB กรุณาเลือกไฟล์ขนาดไม่เกิน 5MB`,
        }));
        continue;
      }

      validFiles.push(file);
      const isImg = file.type.startsWith('image/');
      previews.push({
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        url: isImg ? URL.createObjectURL(file) : undefined,
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'กรุณากรอกหัวข้อปัญหาอย่างน้อย 5 ตัวอักษร';
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = 'กรุณาระบุรายละเอียดปัญหาที่พบให้ชัดเจน (อย่างน้อย 10 ตัวอักษร)';
    }
    if (!location.trim()) {
      newErrors.location = 'กรุณาระบุสถานที่ เช่น ชั้น/อาคาร/โต๊ะทำงาน';
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 9) {
      newErrors.contactPhone = 'กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('departmentId', departmentId);
      formData.append('location', location.trim());
      formData.append('contactPhone', contactPhone.trim());

      if (selectedAssetId && selectedAssetId !== 'custom') {
        formData.append('assetId', selectedAssetId);
      } else if (customAssetNumber.trim()) {
        formData.append('assetNumberCustom', customAssetNumber.trim());
      }

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const newTicket = await api.createTicket(formData);
      onSuccess(newTicket.id);
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'ไม่สามารถส่งข้อมูลการแจ้งซ่อมได้' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก (Back)</span>
        </button>

        <div className="text-xs text-slate-400">
          ระบบจะสร้างเลขที่ตั๋วอัตโนมัติ (เช่น TK-202610-XXXX)
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            แบบฟอร์มเปิดคำขอแจ้งซ่อมและบริการไอที (New IT Request)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กรุณาระบุรายละเอียดของปัญหาเพื่อให้ทีมช่างเทคนิควิเคราะห์และจัดเตรียมอุปกรณ์ซ่อมแซมได้อย่างรวดเร็ว
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              1. เลือกหมวดหมู่ปัญหา (Issue Category) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    category === cat.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-xs shrink-0">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{cat.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {cat.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
          </div>

          {/* 2. Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. หัวข้อปัญหาหรือสรุปอาการ (Subject) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น โน้ตบุ๊กเปิดเครื่องแล้วขึ้นหน้าจอฟ้า, เครื่องพิมพ์ HP กระดาษติดที่ถาด 2"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. รายละเอียดปัญหาและอาการที่พบ (Detailed Description) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุข้อความแจ้งเตือน Error Code ที่ปรากฏ, ขั้นตอนที่เกิดขึ้นก่อนพบปัญหา, หรือผลกระทบต่องานด่วน..."
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* 3. Asset and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. อุปกรณ์หรือรหัสทรัพย์สิน (Asset Number)
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">-- ไม่ระบุ / ไม่ใช่อุปกรณ์เฉพาะ --</option>
                {userAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetNumber} - {asset.name}
                  </option>
                ))}
                <option value="custom">+ ระบุรหัสทรัพย์สินเอง (Manual Asset Number)</option>
              </select>

              {selectedAssetId === 'custom' && (
                <input
                  type="text"
                  value={customAssetNumber}
                  onChange={(e) => setCustomAssetNumber(e.target.value)}
                  placeholder="พิมพ์รหัสทรัพย์สิน เช่น AST-NB-2025-XXX"
                  className="mt-2 w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                5. ระดับความสำคัญของงาน (Priority) <span className="text-rose-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="low">ต่ำ (Low) - สอบถามข้อมูล หรือแจ้งล่วงหน้า</option>
                <option value="normal">ปกติ (Normal) - ใช้งานได้บางส่วน รอดำเนินการตามคิว</option>
                <option value="high">สูง (High) - ทำงานไม่ได้ มีผลกระทบต่องานประจำวัน</option>
                <option value="critical">วิกฤต (Critical) - ระบบล่ม งานส่วนรวมหยุดชะงัก</option>
              </select>
            </div>
          </div>

          {/* 4. Location and Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                6. แผนกสังกัด (Department)
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                7. สถานที่ตั้ง / โต๊ะทำงาน (Location) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น อาคาร B ชั้น 2 โต๊ะ 24"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                8. เบอร์ติดต่อกลับ (Contact Phone) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="เบอร์มือถือ หรือ เบอร์ต่อภายใน"
                className={`w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.contactPhone && <p className="text-xs text-rose-600 mt-1">{errors.contactPhone}</p>}
            </div>
          </div>

          {/* 5. File Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              9. แนบรูปภาพปัญหาหรือเอกสารประกอบ (Supporting Attachments)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">
                คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                รองรับไฟล์ PNG, JPG, JPEG, WEBP หรือ PDF (สูงสุด 5 ไฟล์, ไม่เกิน 5MB ต่อไฟล์)
              </div>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs"
              >
                เลือกไฟล์จากเครื่อง
              </label>
            </div>
            {errors.files && <p className="text-xs text-rose-600 mt-1">{errors.files}</p>}

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filePreviews.map((f, i) => (
                  <div
                    key={i}
                    className="relative p-2 rounded-xl border border-slate-200 bg-white shadow-xs group"
                  >
                    {f.url ? (
                      <img
                        src={f.url}
                        alt={f.name}
                        className="w-full h-20 object-cover rounded-lg mb-1"
                      />
                    ) : (
                      <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mb-1">
                        <FileText className="w-8 h-8" />
                      </div>
                    )}
                    <div className="text-[11px] font-medium text-slate-700 truncate" title={f.name}>
                      {f.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{f.size}</div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 hover:bg-rose-600 text-white transition"
                      title="ลบไฟล์นี้"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ยกเลิก (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันการแจ้งซ่อม (Submit Request)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
