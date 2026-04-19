'use client';

import { useExpenses } from '@/context/ExpenseContext';
import ExpenseList from '@/components/ExpenseList';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function ExpensesPage() {
  const { expenses, isLoaded, update, remove } = useExpenses();
  const searchParams = useSearchParams();
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo = searchParams.get('dateTo') ?? '';

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {expenses.length} total {expenses.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <Link
          href="/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <PlusCircle size={16} />
          Add Expense
        </Link>
      </div>

      <ExpenseList
        expenses={expenses}
        onUpdate={update}
        onDelete={remove}
        initialFilters={{ dateFrom, dateTo }}
      />
    </div>
  );
}
