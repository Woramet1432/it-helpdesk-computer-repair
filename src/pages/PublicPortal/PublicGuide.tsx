import React from 'react';
import {
  HelpCircle,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Wifi,
  Printer,
  Mail,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Search,
  Server,
  Building2,
  FileText,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface PublicGuideProps {
  onNavigateNewTicket: () => void;
  onNavigateTrackTicket: () => void;
}

export const PublicGuide: React.FC<PublicGuideProps> = ({
  onNavigateNewTicket,
  onNavigateTrackTicket,
}) => {
  const teamDirectory = [
    {
      team: 'ศูนย์บริการไอทีกลาง (IT Service Desk Hotline)',
      ext: 'เบอร์ต่อ 1101, 1102',
      lead: 'จุดรับเรื่องส่วนกลาง',
      desc: 'สำหรับแจ้งปัญหาทั่วไป ขอรับบริการด่วน และสอบถามสถานะงานซ่อม',
    },
    {
      team: 'ทีมคอมพิวเตอร์และอุปกรณ์พนักงาน (Client Hardware & OS)',
      ext: 'เบอร์ต่อ 1103',
      lead: 'ช่างวิชัย รัตนโชติ (หัวหน้าทีมฮาร์ดแวร์)',
      desc: 'ดูแลคอมพิวเตอร์ตั้งโต๊ะ โน้ตบุ๊กประจำตำแหน่ง จอภาพ และเครื่องพิมพ์ส่วนกลาง',
    },
    {
      team: 'ทีมระบบเครือข่ายและโครงสร้างพื้นฐาน (Network & Infrastructure)',
      ext: 'เบอร์ต่อ 1104',
      lead: 'คุณนรินทร์ สุขเกษม (วิศวกรระบบเครือข่าย)',
      desc: 'ดูแลระบบสาย LAN, สัญญาณ Wi-Fi องค์กร, Firewall, VPN และ Server ส่วนกลาง',
    },
    {
      team: 'ทีมระบบงานองค์กรและบัญชีผู้ใช้ (Enterprise Applications & AD)',
      ext: 'เบอร์ต่อ 1105',
      lead: 'คุณธีรภัทร วัฒนากุล (ผู้ดูแลระบบ Active Directory & ERP)',
      desc: 'ดูแลบัญชีพนักงาน, อีเมล Office 365, สิทธิ์โฟลเดอร์แชร์ และระบบ ERP องค์กร',
    },
  ];

  const selfServiceTips = [
    {
      icon: Laptop,
      title: 'คอมพิวเตอร์ทำงานช้า หรือโปรแกรมค้าง',
      tip: 'ลองทำการ Restart เครื่องคอมพิวเตอร์ 1 ครั้งเพื่อเคลียร์หน่วยความจำแคช หากยังไม่ดีขึ้นให้เปิด Task Manager เพื่อตรวจสอบโปรแกรมที่ใช้ CPU/Memory สูง',
    },
    {
      icon: Wifi,
      title: 'การเชื่อมต่อ Corporate Wi-Fi / LAN',
      tip: 'ตรวจสอบว่าเปิดสัญญาณ Wi-Fi ที่มุมขวาล่างของหน้าจอ และเลือก SSID ภายในของบริษัท โดยเข้าใช้งานด้วยรหัสพนักงานเดียวกับที่เข้าคอมพิวเตอร์',
    },
    {
      icon: Printer,
      title: 'การสั่งพิมพ์งานไปยังเครื่องพิมพ์เครือข่ายส่วนกลาง',
      tip: 'ตรวจสอบว่าตั้งค่า Default Printer เป็นเครื่องพิมพ์ประจำแผนกแล้วหรือไม่ และเช็กไฟสถานะที่ตัวเครื่องว่ามีกระดาษหรือแจ้ง Error หรือไม่',
    },
    {
      icon: Mail,
      title: 'ลืมรหัสผ่าน หรือบัญชีถูกระงับชั่วคราว',
      tip: 'หากใส่รหัสผ่านผิดเกิน 5 ครั้ง ระบบ Active Directory จะล็อคบัญชีอัตโนมัติเป็นเวลา 15 นาที หากต้องการใช้งานด่วนสามารถแจ้งขอปลดล็อคได้ทันที',
    },
  ];

  const itPolicies = [
    {
      title: 'นโยบายการเบิก-ยืมอุปกรณ์ไอทีสำรอง (Hardware Loan Policy)',
      desc: 'พนักงานสามารถยื่นขอยืมโน้ตบุ๊กสำรองหรืออุปกรณ์นำเสนอสำหรับออกนอกสถานที่ได้ล่วงหน้าอย่างน้อย 1 วันทำการ โดยต้องได้รับความเห็นชอบจากหัวหน้าแผนก',
    },
    {
      title: 'นโยบายความปลอดภัยไซเบอร์และรหัสผ่าน (Cybersecurity & Password Policy)',
      desc: 'รหัสผ่านของพนักงานต้องมีความยาวอย่างน้อย 8 ตัวอักษร มีตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข โดยมีรอบการเปลี่ยนรหัสผ่านทุก 90 วันตามมาตรฐานความปลอดภัย',
    },
    {
      title: 'นโยบายลิขสิทธิ์ซอฟต์แวร์ (Software Licensing Policy)',
      desc: 'ห้ามพนักงานติดตั้งโปรแกรมที่ไม่ได้รับอนุญาตหรือโปรแกรมละเมิดลิขสิทธิ์ลงในเครื่องของบริษัทโดยเด็ดขาด หากต้องการโปรแกรมเสริมให้ยื่นคำขอผ่าน IT Service Portal',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 mb-2">
          <Server className="w-3.5 h-3.5 text-blue-600" />
          <span>ศูนย์ข้อมูลและการบริการฝ่ายไอทีองค์กร</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          สารบัญบริการไอที & ช่องทางติดต่อประสานงาน
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          คำแนะนำการใช้บริการ ระเบียบนโยบาย และช่องทางติดต่อเจ้าหน้าที่ฝ่ายเทคโนโลยีสารสนเทศ
        </p>
      </div>

      {/* 4 Steps to Request IT Service */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>ขั้นตอนการขอรับบริการและติดตามงาน (Standard IT Workflow)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-slate-900">ยื่นคำขอออนไลน์</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ระบุรหัสพนักงาน สังกัดแผนก ตำแหน่งโต๊ะ และรายละเอียดสิ่งที่ต้องการ
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-slate-900">รับเลขที่ใบแจ้งซ่อม</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ระบบออกเลขที่ใบแจ้งซ่อมและรหัสติดตามงานไว้สำหรับตรวจสอบความคืบหน้า
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-slate-900">เจ้าหน้าที่ปฏิบัติงาน</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ช่างไอทีเข้าตรวจสอบที่โต๊ะทำงานหรือแก้ไขผ่านระบบ Remote Support
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <div className="text-xs font-bold text-slate-900">ส่งมอบและปิดงาน</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ทดสอบอุปกรณ์ ส่งมอบงานเรียบร้อย และประเมินความพึงพอใจการบริการ
            </p>
          </div>
        </div>
      </div>

      {/* Internal Team Directory & Ext. Numbers */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>ทำเนียบเบอร์ต่อภายในฝ่ายไอที (Internal IT Directory)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เวลาทำการปกติ: จันทร์ - ศุกร์ เวลา 08:30 - 17:30 น.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            เปิดให้บริการปกติ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {teamDirectory.map((member, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{member.team}</span>
                <span className="text-xs font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {member.ext}
                </span>
              </div>
              <div className="text-[11px] text-slate-700 font-medium">{member.lead}</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Service Troubleshooting Tips */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>คำแนะนำการตรวจสอบเบื้องต้น (Self-Service Knowledge Base)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {selfServiceTips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1.5"
              >
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{tip.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-9">
                  {tip.tip}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corporate IT Policies */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>ระเบียบและนโยบายด้านไอทีขององค์กร (Corporate IT Policies)</span>
        </h2>

        <div className="space-y-3 pt-1 text-xs">
          {itPolicies.map((pol, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="font-bold text-slate-900">{pol.title}</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{pol.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 text-white">
        <div>
          <div className="text-sm font-bold">พร้อมยื่นคำขอบริการหรือแจ้งปัญหาแล้วหรือยัง?</div>
          <div className="text-xs text-slate-400">
            เปิดใบแจ้งเหตุขัดข้องหรือยื่นคำขอบริการได้ทันทีด้วยรหัสพนักงาน
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateTrackTicket}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 cursor-pointer"
          >
            ติดตามสถานะการแจ้งซ่อม
          </button>
          <button
            type="button"
            onClick={onNavigateNewTicket}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ยื่นคำขอบริการ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
