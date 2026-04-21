'use client';

import { useExpenses } from '@/context/ExpenseContext';
import Dashboard from '@/components/Dashboard';

export default function HomePage() {
  const { expenses, isLoaded, error } = useExpenses();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your data…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 animate-reveal-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your financial overview at a glance</p>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          Could not load your expenses: {error}
        </div>
      )}
      <Dashboard expenses={expenses} />
    </div>
  );
}
