import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.ts';
import { TicketCategory, TicketPriority, Ticket } from '../../types/index.ts';
import {
  Laptop,
  Printer,
  Wifi,
  FileCode,
  Mail,
  HardDrive,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Phone,
  MapPin,
  Building,
  User,
  PlusCircle,
  Paperclip,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface PublicNewTicketProps {
  initialCategory?: TicketCategory;
  initialSymptom?: string;
  initialRequestType?: 'incident' | 'request';
  onBack: () => void;
  onNavigateTrackTicket: (ticketNumber: string, trackingCode?: string) => void;
}

export const PublicNewTicket: React.FC<PublicNewTicketProps> = ({
  initialCategory,
  initialSymptom,
  onBack,
  onNavigateTrackTicket,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Form Fields
  const [requesterName, setRequesterName] = useState('');
  const [departmentId, setDepartmentId] = useState(''); // Numeric input only
  const [contactPhone, setContactPhone] = useState('');
  const [category, setCategory] = useState<TicketCategory>(initialCategory || 'computer_laptop');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [title, setTitle] = useState(initialSymptom ? `แจ้งซ่อม: ${initialSymptom}` : '');
  const [location, setLocation] = useState('');

  // Additional Fields (Collapsible, placed under submit button)
  const [showAdditional, setShowAdditional] = useState(false);
  const [assetNumberCustom, setAssetNumberCustom] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If initial props change
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialSymptom) setTitle(`แจ้งซ่อม: ${initialSymptom}`);
  }, [initialCategory, initialSymptom]);

  const categories = [
    { id: 'computer_laptop' as TicketCategory, label: 'คอมพิวเตอร์ / แล็ปท็อป', icon: Laptop },
    { id: 'printer' as TicketCategory, label: 'เครื่องพิมพ์ / ปริ้นเตอร์', icon: Printer },
    { id: 'network_internet' as TicketCategory, label: 'อินเทอร์เน็ต / เครือข่าย', icon: Wifi },
    { id: 'software' as TicketCategory, label: 'โปรแกรม / ระบบงาน', icon: FileCode },
    { id: 'email_account' as TicketCategory, label: 'อีเมล / บัญชีผู้ใช้', icon: Mail },
    { id: 'other_equipment' as TicketCategory, label: 'อุปกรณ์ไอทีอื่น ๆ', icon: HardDrive },
  ];

  const quickPresets = [
    { cat: 'computer_laptop' as TicketCategory, label: 'เปิดเครื่องไม่ติด', title: 'คอมพิวเตอร์เปิดไม่ติด ไฟไม่เข้าเครื่อง' },
    { cat: 'computer_laptop' as TicketCategory, label: 'เครื่องช้า / ค้าง', title: 'คอมพิวเตอร์ทำงานช้ามาก หมุนค้างบ่อย' },
    { cat: 'printer' as TicketCategory, label: 'ปริ้นเตอร์ไม่ออก', title: 'เครื่องพิมพ์สั่งพิมพ์แล้วไม่ออก / กระดาษติด' },
    { cat: 'network_internet' as TicketCategory, label: 'ต่อเน็ตไม่ได้', title: 'เชื่อมต่ออินเทอร์เน็ต / Wi-Fi ไม่ได้' },
    { cat: 'email_account' as TicketCategory, label: 'ลืมรหัส / อีเมลล็อค', title: 'เข้าใช้อีเมลไม่ได้ / รหัสผ่านถูกระงับ' },
  ];

  const handleSelectPreset = (preset: typeof quickPresets[0]) => {
    setCategory(preset.cat);
    setTitle(preset.title);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setDepartmentId(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const newErrors: Record<string, string> = { ...errors };

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        newErrors.files = `ไฟล์ ${f.name} มีขนาดเกิน 5MB กรุณาเลือกไฟล์ขนาดเล็กลง`;
        continue;
      }
      validFiles.push(f);
    }

    if (attachments.length + validFiles.length > 5) {
      newErrors.files = 'สามารถแนบรูปภาพได้สูงสุด 5 รูป';
      setErrors(newErrors);
      return;
    }

    const combined = [...attachments, ...validFiles];
    setAttachments(combined);

    // Create preview URLs
    const previews = combined.map((f) => URL.createObjectURL(f));
    setAttachmentPreviews(previews);

    if (validFiles.length > 0) {
      delete newErrors.files;
    }
    setErrors(newErrors);
  };

  const handleRemoveFile = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    const updatedPreviews = attachmentPreviews.filter((_, i) => i !== index);
    setAttachmentPreviews(updatedPreviews);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!requesterName.trim() || requesterName.trim().length < 2) {
      errs.requesterName = 'กรุณาระบุชื่อ-นามสกุลผู้แจ้งซ่อม (อย่างน้อย 2 ตัวอักษร)';
    }

    const deptNum = parseInt(departmentId, 10);
    if (!departmentId.trim() || isNaN(deptNum) || deptNum <= 0) {
      errs.departmentId = 'กรุณากรอกรหัสแผนกเป็นตัวเลข เช่น 1, 2, 3';
    }

    const cleanPhone = contactPhone.replace(/[-\s]/g, '');
    if (!cleanPhone || cleanPhone.length < 3) {
      errs.contactPhone = 'กรุณาระบุเบอร์โทรศัพท์มือถือ หรือเบอร์ต่อภายใน เช่น 081-234-5678 หรือ 102';
    }

    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'กรุณากรอกหัวข้อปัญหาหรือสรุปอาการเสีย (อย่างน้อย 5 ตัวอักษร)';
    }

    if (!location.trim() || location.trim().length < 2) {
      errs.location = 'กรุณาระบุสถานที่ตั้งของอุปกรณ์ เช่น อาคาร 1 ชั้น 3 โต๊ะบัญชี';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requesterName', requesterName.trim());
      formData.append('departmentId', departmentId.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('title', title.trim());
      formData.append('description', title.trim()); // Fallback for backend schema
      formData.append('location', location.trim());
      formData.append('contactPhone', contactPhone.trim());

      // Optional fields
      if (assetNumberCustom.trim()) {
        formData.append('assetNumberCustom', assetNumberCustom.trim());
      }

      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.createPublicTicket(formData);
      setCreatedTicket(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (createdTicket?.ticketNumber) {
      navigator.clipboard.writeText(createdTicket.ticketNumber);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleCopyPin = () => {
    if (createdTicket?.trackingCode) {
      navigator.clipboard.writeText(createdTicket.trackingCode);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  // SUCCESS CONFIRMATION RECEIPT SCREEN
  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 text-center space-y-8 animate-in fade-in duration-300">
          {/* Green Check Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ส่งใบแจ้งซ่อมสำเร็จเรียบร้อย</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ระบบได้รับคำขอแจ้งซ่อมของคุณแล้ว
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              เจ้าหน้าที่ไอทีได้รับแจ้งปัญหาแล้ว และจะติดต่อกลับตามเบอร์โทรศัพท์ที่ท่านระบุไว้เพื่อดำเนินการแก้ไข
            </p>
          </div>

          {/* Ticket Number & Tracking PIN Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-2xl border-2 border-blue-200 text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  หมายเลข Ticket (Ticket Number)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {createdTicket.ticketNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedTicket ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>คัดลอกหมายเลข</span>
                  </>
                )}
              </button>
            </div>

            {createdTicket.trackingCode && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    รหัสติดตามความปลอดภัย (Tracking PIN)
                  </div>
                  <div className="text-xl font-bold text-slate-800 font-mono">
                    {createdTicket.trackingCode}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    *ใช้คู่กับหมายเลข Ticket หรือใช้เบอร์โทรศัพท์เพื่อตรวจเช็กสถานะ
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedPin ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกรหัส</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Ticket Summary Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">ผู้แจ้งซ่อม:</span>
              <span className="font-semibold text-slate-900">{createdTicket.requesterName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">รหัสแผนก:</span>
              <span className="font-semibold text-slate-900 font-mono">{createdTicket.departmentId || departmentId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">หัวข้อปัญหา:</span>
              <span className="font-semibold text-slate-900">{createdTicket.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">สถานที่:</span>
              <span className="font-semibold text-slate-900">{createdTicket.location}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">เบอร์ติดต่อ:</span>
              <span className="font-semibold text-slate-900">{createdTicket.contactPhone}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                onNavigateTrackTicket(createdTicket.ticketNumber, createdTicket.trackingCode)
              }
              className="flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>ติดตามสถานะงานซ่อมนี้ทันที</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreatedTicket(null);
                setTitle('');
                setAttachments([]);
                setAttachmentPreviews([]);
                setAssetNumberCustom('');
                setShowAdditional(false);
              }}
              className="py-3.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>แจ้งซ่อมเพิ่มอีกเคส</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REPAIR FORM VIEW
  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Top Breadcrumb & Heading */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าแรก</span>
        </button>

        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>แจ้งซ่อมได้ทันที ไม่ต้องมีบัญชี</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            แบบฟอร์มแจ้งซ่อมคอมพิวเตอร์ & อุปกรณ์ไอที
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            กรอกข้อมูลสั้น ๆ เพื่อให้เจ้าหน้าที่ไอทีเข้าตรวจสอบและแก้ไขปัญหาให้ท่านได้อย่างรวดเร็ว
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">เกิดข้อผิดพลาด</div>
              <div>{errors.general}</div>
            </div>
          </div>
        )}

        {/* Quick Symptom Chips Presets */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>เลือกอาการด่วนเพื่อช่วยเติมข้อมูล (Quick Fill):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition cursor-pointer"
              >
                + {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Contact Information */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>1. ข้อมูลผู้แจ้งซ่อม (จำเป็น)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requester Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  ชื่อ-นามสกุล ผู้แจ้งซ่อม <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.requesterName
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-blue-200'
                    }`}
                  />
                </div>
                {errors.requesterName && (
                  <p className="text-xs text-rose-600 font-medium">{errors.requesterName}</p>
                )}
              </div>

              {/* Department Code - Numeric Only Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  รหัสแผนก <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={departmentId}
                    onChange={handleDepartmentChange}
                    placeholder="กรอกตัวเลขรหัสแผนก เช่น 1, 2, 3"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white ${
                      errors.departmentId
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-blue-200'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  *กรอกเฉพาะตัวเลขรหัสแผนก
                </div>
                {errors.departmentId && (
                  <p className="text-xs text-rose-600 font-medium">{errors.departmentId}</p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  เบอร์โทรศัพท์ / เบอร์ต่อภายใน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678 หรือ เบอร์ต่อ 102"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.contactPhone
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-blue-200'
                    }`}
                  />
                </div>
                {errors.contactPhone && (
                  <p className="text-xs text-rose-600 font-medium">{errors.contactPhone}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  สถานที่ตั้งของอุปกรณ์ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น อาคาร A ชั้น 2 แผนกจัดซื้อ โต๊ะหน้าห้องประชุม"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      errors.location
                        ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:ring-blue-200'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-rose-600 font-medium">{errors.location}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Equipment Category */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" />
              <span>2. ประเภทอุปกรณ์ที่พบปัญหา <span className="text-rose-500">*</span></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Problem Summary (Single Short Field) */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3. หัวข้อปัญหาหรือสรุปอาการเสีย <span className="text-rose-500">*</span></span>
            </div>

            {/* Single Short Input for Problem Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                หัวข้อปัญหาหรือสรุปอาการเสีย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น เปิดเครื่องไม่ติด พัดลมไม่หมุน, เข้าอีเมลไม่ได้, ปริ้นเตอร์ไม่ออก"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-blue-200'
                }`}
              />
              <div className="text-[11px] text-slate-400">
                ระบุสรุปปัญหาหรืออาการสั้น ๆ ที่พบ
              </div>
              {errors.title && <p className="text-xs text-rose-600 font-medium">{errors.title}</p>}
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">ระดับความเร่งด่วน</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'normal' as TicketPriority, label: 'ปกติ (Normal)', desc: 'ยังพอทำงานอื่นได้' },
                  { id: 'high' as TicketPriority, label: 'ด่วน (High)', desc: 'งานหลักสะดุด' },
                  { id: 'critical' as TicketPriority, label: 'วิกฤต (Critical)', desc: 'หยุดชะงักทั้งแผนก' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      priority === p.id
                        ? p.id === 'critical'
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300 font-bold'
                          : p.id === 'high'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300 font-bold'
                          : 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* MAIN SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งข้อมูลใบแจ้งซ่อม...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ส่งแจ้งซ่อม</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              เมื่อส่งแล้ว คุณจะได้รับหมายเลข Ticket และรหัสติดตาม สำหรับตรวจสอบความคืบหน้าได้ตลอด 24 ชม.
            </p>
          </div>

          {/* COLLAPSIBLE SECTION: "เพิ่มเติม (ไม่บังคับ)" PLACED UNDER SUBMIT BUTTON */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAdditional(!showAdditional)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition" />
                <span className="text-slate-800 text-xs sm:text-sm">เพิ่มเติม (ไม่บังคับ)</span>
                <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
                  — ระบุรหัสทรัพย์สิน หรือแนบรูปภาพประกอบ
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="text-[11px] font-medium text-slate-400">
                  {showAdditional ? 'ยุบส่วนนี้' : 'แตะเพื่อเปิด'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAdditional ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </div>
            </button>

            {/* EXPANDED CONTENT: รหัสทรัพย์สิน & แนบรูปภาพ */}
            {showAdditional && (
              <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-5 animate-in fade-in duration-200">
                {/* 1. Asset Number (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      1. รหัสทรัพย์สิน (ไม่บังคับ)
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (ไม่บังคับ - ดูได้จากสติกเกอร์ IT บนตัวเครื่อง)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={assetNumberCustom}
                    onChange={(e) => setAssetNumberCustom(e.target.value)}
                    placeholder="เช่น IT-NB-2024-001 หรือ IT-PRN-05"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  />
                  <div className="text-[11px] text-slate-400">
                    หากไม่ทราบรหัสทรัพย์สิน สามารถเว้นว่างไว้ได้
                  </div>
                </div>

                {/* 2. Photo Attachments (Optional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                      <span>2. แนบรูปภาพประกอบ (ไม่บังคับ)</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      (ไม่บังคับ - สูงสุด 5 รูป ขนาดไม่เกิน 5MB ต่อรูป)
                    </span>
                  </div>

                  {/* Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition space-y-2 bg-white"
                  >
                    <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-700">
                      คลิกเพื่อเลือกรูปภาพ หรือถ่ายรูปด้วยมือถือ (ไม่บังคับ)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      รองรับไฟล์ JPG, PNG, WEBP หรือ PDF (สูงสุด 5 รูป)
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {errors.files && <p className="text-xs text-rose-600 font-medium">{errors.files}</p>}

                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100"
                        >
                          {file.type.startsWith('image/') ? (
                            <img
                              src={attachmentPreviews[idx]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 p-1 text-center">
                              PDF Doc
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(idx);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
