import React from 'react';
import { TicketCategory } from '../../types/index.ts';
import { Laptop, Printer, Wifi, Code2, Mail, Cpu } from 'lucide-react';

interface CategoryBadgeProps {
  category: TicketCategory;
  showIconOnly?: boolean;
}

export const CATEGORY_CONFIG: Record<
  TicketCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  computer_laptop: {
    label: 'คอมพิวเตอร์ / โน้ตบุ๊ก',
    icon: <Laptop className="w-4 h-4" />,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  printer: {
    label: 'เครื่องพิมพ์ / พริ้นเตอร์',
    icon: <Printer className="w-4 h-4" />,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  network_internet: {
    label: 'ระบบเครือข่าย / อินเทอร์เน็ต',
    icon: <Wifi className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  software: {
    label: 'โปรแกรม / ซอฟต์แวร์',
    icon: <Code2 className="w-4 h-4" />,
    color: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  email_account: {
    label: 'อีเมล / บัญชีผู้ใช้งาน',
    icon: <Mail className="w-4 h-4" />,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
  other_equipment: {
    label: 'อุปกรณ์ไอทีอื่นๆ',
    icon: <Cpu className="w-4 h-4" />,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
  },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIconOnly = false }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.computer_laptop;

  if (showIconOnly) {
    return (
      <span className={`p-1.5 rounded-lg border ${config.color} inline-flex items-center justify-center`} title={config.label}>
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
