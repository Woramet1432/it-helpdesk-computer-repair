import React from 'react';
import { TicketPriority } from '../../types/index.ts';
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  low: {
    label: 'ต่ำ (Low)',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-600',
    icon: <ArrowDown className="w-3.5 h-3.5 text-slate-500" />,
  },
  normal: {
    label: 'ปกติ (Normal)',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    text: 'text-blue-700',
    icon: <AlertCircle className="w-3.5 h-3.5 text-blue-500" />,
  },
  high: {
    label: 'สูง (High)',
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    text: 'text-amber-800',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
  },
  critical: {
    label: 'วิกฤต (Critical)',
    bg: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
    text: 'text-rose-800',
    icon: <Flame className="w-3.5 h-3.5 text-rose-600" />,
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${config.bg}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
