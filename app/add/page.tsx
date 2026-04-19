'use client';

import { useExpenses } from '@/context/ExpenseContext';
import ExpenseForm from '@/components/ExpenseForm';
import { PlusCircle } from 'lucide-react';

export default function AddExpensePage() {
  const { add } = useExpenses();

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle size={20} className="text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        </div>
        <p className="text-gray-500 text-sm">Record a new expense to your tracker</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <ExpenseForm onSave={add} mode="create" />
      </div>

      {/* Tips */}
      <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-700 mb-1">Tips</p>
        <ul className="text-xs text-indigo-600 space-y-1 list-disc list-inside">
          <li>Enter amounts in dollars (e.g. 12.50)</li>
          <li>Choose the most specific category that fits</li>
          <li>Add a clear description to remember context later</li>
        </ul>
      </div>
    </div>
  );
}
