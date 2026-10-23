import React, { useState } from 'react';
import {
  Server,
  Search,
  PlusCircle,
  Phone,
  Clock,
  CheckCircle2,
  Laptop,
  Printer,
  Wifi,
  FileCode,
  Mail,
  HardDrive,
  ShieldAlert,
  ArrowRight,
  Headphones,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Building2,
  KeyRound,
  Layers,
  MonitorCheck,
  FileText,
  AlertTriangle,
  Radio,
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
  const [quickTrackNumber, setQuickTrackNumber] = useState('');

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackNumber.trim()) {
      onNavigateTrackTicket(quickTrackNumber.trim());
    }
  };

  const serviceCatalog = [
    {
      id: 'computer_laptop' as TicketCategory,
      title: 'คอมพิวเตอร์ & โน้ตบุ๊กพนักงาน',
      titleEn: 'Workstations & Notebooks',
      desc: 'เครื่องเปิดไม่ติด, จอฟ้า (Blue Screen), บูตไม่ขึ้น, เครื่องช้าผิดปกติ, ขออัปเกรด RAM/SSD ประจำตำแหน่ง',
      icon: Laptop,
      badge: 'ฮาร์ดแวร์ & OS',
    },
    {
      id: 'network_internet' as TicketCategory,
      title: 'เครือข่ายองค์กร & VPN',
      titleEn: 'Corporate LAN / Wi-Fi / VPN',
      desc: 'ต่อสาย LAN แล้วไฟไม่ขึ้น, เชื่อมต่อ Corporate Wi-Fi ไม่ได้, ปัญหาการเข้าถึง VPN สำหรับทำงานนอกสถานที่',
      icon: Wifi,
      badge: 'เครือข่าย & เชื่อมต่อ',
    },
    {
      id: 'email_account' as TicketCategory,
      title: 'บัญชีผู้ใช้ & สิทธิ์ระบบงาน',
      titleEn: 'Active Directory / Email 365',
      desc: 'ปลดล็อคบัญชีพนักงาน, รีเซ็ตรหัสผ่าน, ขอเปิดอีเมลใหม่, สิทธิ์เข้าถึง File Share Server หรือระบบ ERP',
      icon: KeyRound,
      badge: 'ระบบ & ความปลอดภัย',
    },
    {
      id: 'printer' as TicketCategory,
      title: 'เครื่องพิมพ์ & ห้องประชุม',
      titleEn: 'Network Printers & Meeting Rooms',
      desc: 'เครื่องพิมพ์เครือข่ายสั่งไม่ออก, กระดาษติด, หมึกหมด, ระบบหน้าจอและไมโครโฟนห้องประชุมขัดข้อง',
      icon: Printer,
      badge: 'อุปกรณ์ส่วนกลาง',
    },
    {
      id: 'software' as TicketCategory,
      title: 'โปรแกรมลิขสิทธิ์ & ซอฟต์แวร์',
      titleEn: 'Licensed Software & Applications',
      desc: 'ขอติดตั้งโปรแกรมมาตรฐาน (MS Office, Adobe, AutoCAD, โปรแกรมเฉพาะทาง), อัปเดตแพตช์ความปลอดภัย',
      icon: FileCode,
      badge: 'ซอฟต์แวร์ลิขสิทธิ์',
    },
    {
      id: 'other_equipment' as TicketCategory,
      title: 'ยืมอุปกรณ์เสริม & ครุภัณฑ์ไอที',
      titleEn: 'IT Equipment Loan & Requisition',
      desc: 'ขอยืมโน้ตบุ๊กสำรองออกนอกสถานที่, จอเสริม, สายแปลงสัญญาณ HDMI/Type-C, Adapter ชาร์จไฟฉุกเฉิน',
      icon: HardDrive,
      badge: 'บริการยืมอุปกรณ์',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Enterprise Portal Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg border border-slate-800 px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/90 text-xs font-medium text-slate-300 border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>ศูนย์บริการเทคโนโลยีสารสนเทศภายในองค์กร · Corporate IT Service Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ระบบบริการไอที & แจ้งเหตุขัดข้องสำหรับพนักงาน
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            พนักงานสามารถแจ้งเหตุขัดข้องทางเทคนิค (Incident) หรือยื่นคำขอบริการไอที (Service Request)
            โดยใช้รหัสพนักงานได้ทันที พร้อมระบบติดตามงานและการดำเนินงานตามมาตรฐาน SLA ของบริษัท
          </p>

          {/* Quick Ticket Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <form
              onSubmit={handleQuickTrackSubmit}
              className="flex flex-col sm:flex-row gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 shadow-md backdrop-blur-xs"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quickTrackNumber}
                  onChange={(e) => setQuickTrackNumber(e.target.value)}
                  placeholder="ค้นหาด้วยหมายเลข Ticket (เช่น TK-202610-0001)..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-900 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-1 focus:ring-blue-500 border border-slate-700"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>ตรวจสอบสถานะ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Dual Enterprise Pathway: Incident vs Service Request */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathway 1: แจ้งเหตุขัดข้อง (Incident Report) */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                แจ้งปัญหาการทำงานสะดุด
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">แจ้งเหตุขัดข้องทางเทคนิค (Incident)</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                สำหรับกรณีอุปกรณ์ฮาร์ดแวร์ชำรุดเสียหาย, คอมพิวเตอร์เปิดไม่ติด, หน้าจอฟ้า, อินเทอร์เน็ตหลุด, ปริ้นเตอร์ขัดข้อง หรือโปรแกรมขัดข้องไม่สามารถทำงานได้
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>มีเจ้าหน้าที่ฝ่ายไอทีรับเรื่องและเข้าตรวจสอบตามระดับผลกระทบ</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>ระบุสถานที่ตั้งโต๊ะทำงานและรหัสทรัพย์สิน (Asset Tag) เพื่อความรวดเร็ว</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onNavigateNewTicket({ requestType: 'incident' })}
              className="w-full py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>เปิดใบแจ้งเหตุขัดข้อง (Report Incident)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pathway 2: ขอรับบริการไอที (Service Request) */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                คำขอบริการมาตรฐาน
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">ยื่นคำขอบริการไอที (Service Request)</h2>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                สำหรับขอติดตั้งโปรแกรมลิขสิทธิ์บริษัท, ขอสิทธิ์เข้าใช้งานระบบ/Active Directory, ขอยืมโน้ตบุ๊กสำรองออกนอกสถานที่, จัดเตรียมเครื่องสำหรับพนักงานใหม่
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>ดำเนินการตามระเบียบนโยบายความปลอดภัยและทรัพย์สินไอทีขององค์กร</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>ติดตามสถานะการอนุมัติและการเตรียมอุปกรณ์ได้แบบ Real-time</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => onNavigateNewTicket({ requestType: 'request' })}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>ยื่นคำขอบริการไอที (Submit Request)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Corporate IT Service Catalog (6 Core Categories) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Corporate IT Service Catalog
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              สารบัญการให้บริการของฝ่ายเทคโนโลยีสารสนเทศ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              เลือกหมวดหมู่ที่ตรงกับความต้องการ เพื่อให้ระบบเตรียมข้อมูลและส่งต่องานไปยังทีมช่างผู้รับผิดชอบโดยตรง
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateNewTicket()}
            className="self-start sm:self-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group cursor-pointer"
          >
            <span>เปิดแบบฟอร์มเปล่า</span>
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
                className="text-left p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/70 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
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

      {/* Operational SLA & Standards */}
      <section className="bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Service Level Agreement (SLA)
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            เกณฑ์และระยะเวลาการให้บริการตามมาตรฐานฝ่ายไอที
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>ระดับวิกฤต (P1 - Critical)</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">ภายใน 15-30 นาที</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              ระบบหลักหยุดชะงัก กระทบการทำงานทั้งแผนก หรือส่งผลต่อสายการผลิต/บริการลูกค้า
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>ระดับเร่งด่วน (P2 - High)</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">ภายใน 1-2 ชั่วโมง</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              อุปกรณ์ขัดข้องทำให้พนักงานไม่สามารถปฏิบัติงานตามหน้าที่ได้ และไม่มีเครื่องสำรอง
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>ระดับทั่วไป (P3 - Normal)</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-2">ภายใน 4-8 ชม. ทำการ</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              คำขอบริการมาตรฐาน ติดตั้งโปรแกรม ขออุปกรณ์เสริม หรือปัญหาที่ยังมีทางเลี่ยงทำงานได้
            </p>
          </div>
        </div>
      </section>

      {/* Internal IT Helpdesk Contact & Escalation */}
      <section className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-xs font-semibold border border-blue-800/80">
            <Server className="w-3.5 h-3.5" />
            <span>จุดบริการไอที (IT Operations Center)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold">
            ห้องฝ่ายเทคโนโลยีสารสนเทศ ชั้น 2 อาคารสำนักงานใหญ่
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            โทรศัพท์ภายใน: <strong className="text-white">เบอร์ต่อ 1101, 1102</strong> · อีเมลกลาง:{' '}
            <strong className="text-blue-300 font-mono">it-servicedesk@company.internal</strong>
          </p>
          <div className="text-xs text-slate-400">
            เวลาเปิดทำการ: จันทร์ - ศุกร์ 08:30 - 17:30 น. (นอกเวลาทำการติดต่อช่างเวรฉุกเฉิน)
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onNavigateGuide}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm transition border border-slate-700 flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>ดูเบอร์ต่อเจ้าหน้าที่ไอที</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateNewTicket({ requestType: 'incident' })}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>เปิด Ticket ใหม่</span>
          </button>
        </div>
      </section>
    </div>
  );
};
