import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Phone,
  Laptop,
  Printer,
  Wifi,
  FileCode,
  Mail,
  HardDrive,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight,
  KeyRound,
  Server,
} from 'lucide-react';
import { TicketCategory } from '../../types/index.ts';

interface PublicHomeProps {
  onNavigateNewTicket: (prefill?: { category?: TicketCategory; symptom?: string; requestType?: 'incident' | 'request' }) => void;
  onNavigateTrackTicket: (ticketNumber?: string) => void;
  onNavigateGuide: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onNavigateNewTicket,
  onNavigateTrackTicket,
  onNavigateGuide,
}) => {

  const serviceCatalog = [
    {
      id: 'computer_laptop' as TicketCategory,
      title: 'คอมพิวเตอร์ & โน้ตบุ๊ก',
      titleEn: 'Workstations & Notebooks',
      desc: 'เครื่องเปิดไม่ติด, จอฟ้า (Blue Screen), บูตไม่ขึ้น, เครื่องช้าผิดปกติ, ขออัปเกรด RAM/SSD',
      icon: Laptop,
      badge: 'ฮาร์ดแวร์ & OS',
    },
    {
      id: 'printer' as TicketCategory,
      title: 'เครื่องพิมพ์ & ปริ้นเตอร์',
      titleEn: 'Network Printers & Scanners',
      desc: 'เครื่องพิมพ์เครือข่ายสั่งไม่ออก, กระดาษติด, หมึกหมด, เชื่อมต่อเครื่องพิมพ์ไม่ได้',
      icon: Printer,
      badge: 'อุปกรณ์ส่วนกลาง',
    },
    {
      id: 'network_internet' as TicketCategory,
      title: 'อินเทอร์เน็ต & เครือข่าย',
      titleEn: 'Corporate LAN / Wi-Fi / VPN',
      desc: 'ต่อสาย LAN แล้วไฟไม่ขึ้น, เชื่อมต่อ Wi-Fi ไม่ได้, ปัญหาการเข้าถึง VPN สำหรับทำงาน',
      icon: Wifi,
      badge: 'เครือข่าย & เชื่อมต่อ',
    },
    {
      id: 'software' as TicketCategory,
      title: 'โปรแกรม & ระบบงาน',
      titleEn: 'Licensed Software & Applications',
      desc: 'ขอติดตั้งโปรแกรมมาตรฐาน (MS Office, Adobe, AutoCAD), อัปเดตแพตช์ความปลอดภัย',
      icon: FileCode,
      badge: 'ซอฟต์แวร์ลิขสิทธิ์',
    },
    {
      id: 'email_account' as TicketCategory,
      title: 'อีเมล & บัญชีผู้ใช้',
      titleEn: 'Active Directory / Email 365',
      desc: 'ปลดล็อคบัญชีพนักงาน, รีเซ็ตรหัสผ่าน, ขอเปิดอีเมลใหม่, สิทธิ์เข้าถึง File Share',
      icon: KeyRound,
      badge: 'ระบบ & ความปลอดภัย',
    },
    {
      id: 'other_equipment' as TicketCategory,
      title: 'อุปกรณ์ไอทีอื่น ๆ',
      titleEn: 'IT Equipment & Peripherals',
      desc: 'ขอยืมโน้ตบุ๊กสำรองออกนอกสถานที่, จอเสริม, สายแปลงสัญญาณ HDMI/Type-C, Adapter ชาร์จไฟ',
      icon: HardDrive,
      badge: 'บริการยืมอุปกรณ์',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Exact Hero Section from reference image */}
      <section className="relative overflow-hidden rounded-[28px] sm:rounded-3xl bg-[#1d4ed8] text-white shadow-xl px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6">
        {/* Subtle background glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-4">
          {/* Top Pill from reference */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 text-white text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ศูนย์บริการไอที & ซ่อมคอมพิวเตอร์องค์กร (ไม่ต้องสมัครสมาชิก)</span>
          </div>

          {/* Headline from reference */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            แจ้งซ่อมคอมพิวเตอร์ & อุปกรณ์ไอที
          </h1>

          {/* Subtitle from reference */}
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-normal leading-relaxed">
            แจ้งปัญหาอุปกรณ์ไอทีได้ทันทีใน 1 นาที ไม่ต้องล็อกอิน ไม่ต้องจำรหัสผ่าน เจ้าหน้าที่ไอทีพร้อมดูแลและประสานงานให้คุณอย่างรวดเร็ว
          </p>
        </div>
      </section>

      {/* The 3 Core Cards from Reference Image */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: แจ้งซ่อมทันที */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group">
          {/* Top-Right circle decorative accent matching screenshot */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-blue-50/80 pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <PlusCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-xs font-bold text-blue-600 mt-5">สะดวก & รวดเร็ว</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">แจ้งซ่อมทันที</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              เปิดคำขอแจ้งซ่อมอุปกรณ์คอมพิวเตอร์ ปริ้นเตอร์ อินเทอร์เน็ต หรือโปรแกรม ไม่ต้องใช้บัญชีผู้ใช้ รับเลขที่ใบแจ้งซ่อมทันที
            </p>
          </div>

          <div className="pt-6 relative">
            <button
              type="button"
              onClick={() => onNavigateNewTicket()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>กรอกแบบฟอร์มแจ้งซ่อม</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: ติดตามงานซ่อม */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group">
          {/* Top-Right circle decorative accent matching screenshot */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-50/80 pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <Search className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-5">เช็คความคืบหน้า</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">ติดตามงานซ่อม</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              ดูขั้นตอนการซ่อม ช่างผู้รับผิดชอบ เวลาที่คาดว่าจะเสร็จ พร้อมช่องทางสอบถามหรือคุยกับช่างได้โดยตรง
            </p>
          </div>

          <div className="pt-6 relative">
            <button
              type="button"
              onClick={() => onNavigateTrackTicket()}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-200/80 cursor-pointer"
            >
              <span>ตรวจสอบสถานะงาน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 3: คู่มือ & เบอร์ติดต่อ IT */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group">
          {/* Top-Right circle decorative accent matching screenshot */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-50/80 pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-xs font-bold text-amber-600 mt-5">ช่วยเหลือฉุกเฉิน</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">คู่มือ & เบอร์ติดต่อ IT</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              เบอร์โทรสายด่วน เบอร์ต่อภายใน ที่ตั้งห้องไอที และวิธีแก้ปัญหาเบื้องต้นก่อนแจ้งช่าง
            </p>
          </div>

          <div className="pt-6 relative">
            <button
              type="button"
              onClick={onNavigateGuide}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2 border border-slate-200/80 cursor-pointer"
            >
              <span>ดูเบอร์ติดต่อ & คู่มือ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Corporate IT Service Catalog (6 Core Categories) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              หมวดหมู่อุปกรณ์ & ปัญหาที่พบบ่อย
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              เลือกตามประเภทอุปกรณ์เพื่อแจ้งซ่อม
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              คลิกเลือกประเภทอุปกรณ์เพื่อเริ่มกรอกข้อมูลแจ้งซ่อมได้อย่างรวดเร็ว
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateNewTicket()}
            className="self-start sm:self-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group cursor-pointer"
          >
            <span>เปิดแบบฟอร์มแจ้งซ่อม</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceCatalog.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onNavigateNewTicket({
                    category: item.id,
                    symptom: item.title,
                  })
                }
                className="text-left p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.titleEn}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>เลือกหมวดนี้</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Internal IT Helpdesk Contact & Escalation */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Server className="w-3.5 h-3.5" />
            <span>จุดบริการไอที (IT Support Center)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            ฝ่ายเทคโนโลยีสารสนเทศ ชั้น 2 อาคารสำนักงาน
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            โทรศัพท์ภายใน: <strong className="text-slate-900">เบอร์ต่อ 100, 101, 102</strong> · อีเมลกลาง:{' '}
            <strong className="text-blue-600 font-mono">it-helpdesk@company.local</strong>
          </p>
          <div className="text-xs text-slate-500">
            เวลาเปิดทำการ: วันจันทร์ - ศุกร์ 08:30 - 17:30 น. (นอกเวลาทำการติดต่อช่างเวรฉุกเฉิน)
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateGuide}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition border border-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>ดูเบอร์ติดต่อ & คู่มือ</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateNewTicket()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เปิดใบแจ้งซ่อม</span>
          </button>
        </div>
      </section>
    </div>
  );
};
