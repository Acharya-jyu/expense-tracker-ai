import { ReactNode } from 'react';
import Link from 'next/link';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  color?: 'indigo' | 'emerald' | 'orange' | 'rose';
  href?: string;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-600',
    value: 'text-indigo-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-600',
    value: 'text-emerald-700',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-600',
    value: 'text-orange-700',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'bg-rose-600',
    value: 'text-rose-700',
  },
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color = 'indigo',
  href,
}: SummaryCardProps) {
  const c = colorMap[color];
  const inner = (
    <>
      <div className={`${c.icon} p-3 rounded-xl text-white flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.value} truncate`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:border-gray-200 transition-all"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
      {inner}
    </div>
  );
}
