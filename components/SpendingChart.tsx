'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Expense, getCategoryColor } from '@/types/expense';
import { getMonthlyData, getCategorySummaries, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface SpendingChartProps {
  expenses: Expense[];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; payload: { fill: string; percentage: number } }[];
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-700">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: TooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-xs text-gray-400">{payload[0].payload.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export default function SpendingChart({ expenses }: SpendingChartProps) {
  const monthlyData = getMonthlyData(expenses);
  const categorySummaries = getCategorySummaries(expenses).filter((s) => s.total > 0);

  const pieData = categorySummaries.map((s) => ({
    name: s.category,
    value: s.total,
    percentage: s.percentage,
    fill: getCategoryColor(s.category),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly bar chart */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Monthly Spending</h3>
          <Link href="/expenses" className="text-xs text-indigo-600 hover:underline font-medium">
            View all →
          </Link>
        </div>
        {monthlyData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `NRs ${v}`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category pie chart */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
