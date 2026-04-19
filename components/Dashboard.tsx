'use client';

import { Expense } from '@/types/expense';
import {
  getTotalAmount,
  getMonthlyTotal,
  getCategorySummaries,
  getTopCategory,
  formatCurrency,
} from '@/lib/utils';
import SummaryCard from './SummaryCard';
import SpendingChart from './SpendingChart';
import CategoryBadge from './CategoryBadge';
import { DollarSign, TrendingUp, Tag, Receipt } from 'lucide-react';
import Link from 'next/link';

interface DashboardProps {
  expenses: Expense[];
}

export default function Dashboard({ expenses }: DashboardProps) {
  const total = getTotalAmount(expenses);
  const monthly = getMonthlyTotal(expenses);
  const topCategory = getTopCategory(expenses);
  const summaries = getCategorySummaries(expenses).filter((s) => s.total > 0);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthEndStr = `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Spent"
          value={formatCurrency(total)}
          subtitle="All time"
          icon={<DollarSign size={20} />}
          color="indigo"
          href="/expenses"
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(monthly)}
          subtitle={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          icon={<TrendingUp size={20} />}
          color="emerald"
          href={`/expenses?dateFrom=${monthStart}&dateTo=${monthEndStr}`}
        />
        <SummaryCard
          title="Transactions"
          value={String(expenses.length)}
          subtitle="Total entries"
          icon={<Receipt size={20} />}
          color="orange"
          href="/expenses"
        />
        <SummaryCard
          title="Top Category"
          value={topCategory ?? '—'}
          subtitle="Highest spending"
          icon={<Tag size={20} />}
          color="rose"
          href="/expenses"
        />
      </div>

      {/* Charts */}
      <SpendingChart expenses={expenses} />

      {/* Category breakdown */}
      {summaries.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {summaries.map((s) => (
              <div key={s.category} className="flex items-center gap-4">
                <CategoryBadge category={s.category} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">{s.count} expenses</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {formatCurrency(s.total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {s.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent Expenses</h3>
          <Link href="/expenses" className="text-xs text-indigo-600 hover:underline font-medium">
            View all →
          </Link>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No expenses yet.</p>
            <Link
              href="/add"
              className="mt-2 inline-block text-indigo-600 text-sm hover:underline"
            >
              Add your first expense
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryBadge category={expense.category} size="sm" />
                  <span className="text-sm text-gray-700 truncate">{expense.description}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(expense.amount)}
                  </p>
                  <p className="text-xs text-gray-400">{expense.date}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
