'use client';

import { useState } from 'react';
import { Expense, CATEGORIES, Category, FilterState } from '@/types/expense';
import { filterExpenses, formatCurrency, formatDate, exportToCSV } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import ExpenseForm from './ExpenseForm';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
  initialFilters?: Partial<FilterState>;
}

type SortField = 'date' | 'amount' | 'category';
type SortDir = 'asc' | 'desc';

export default function ExpenseList({ expenses, onUpdate, onDelete, initialFilters }: ExpenseListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    dateFrom: '',
    dateTo: '',
    ...initialFilters,
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = filterExpenses(
    expenses,
    filters.search,
    filters.category,
    filters.dateFrom,
    filters.dateTo
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'date') cmp = a.date.localeCompare(b.date);
    else if (sortField === 'amount') cmp = a.amount - b.amount;
    else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  function toggleSort(field: SortField) {
    if (field === sortField) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function resetFilters() {
    setFilters({ search: '', category: 'All', dateFrom: '', dateTo: '' });
  }

  const hasActiveFilters =
    filters.search || filters.category !== 'All' || filters.dateFrom || filters.dateTo;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={14} className="text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-indigo-600" />
    ) : (
      <ChevronDown size={14} className="text-indigo-600" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>
        <button
          onClick={() => exportToCSV(sorted)}
          disabled={sorted.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value as Category | 'All' }))
              }
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {hasActiveFilters && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={12} /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {sorted.length} {sorted.length === 1 ? 'expense' : 'expenses'}
          {hasActiveFilters ? ' (filtered)' : ''}
        </span>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No expenses found.</p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-2 text-indigo-600 text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <button className="text-left flex items-center gap-1" onClick={() => toggleSort('date')}>
              Date <SortIcon field="date" />
            </button>
            <span>Description</span>
            <button className="flex items-center gap-1" onClick={() => toggleSort('category')}>
              Category <SortIcon field="category" />
            </button>
            <button className="flex items-center gap-1" onClick={() => toggleSort('amount')}>
              Amount <SortIcon field="amount" />
            </button>
            <span>Actions</span>
          </div>

          <ul className="divide-y divide-gray-50">
            {sorted.map((expense) => (
              <li key={expense.id}>
                {editingId === expense.id ? (
                  <div className="p-6 bg-indigo-50/40">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Edit Expense</p>
                    <ExpenseForm
                      initialData={expense}
                      mode="edit"
                      onSave={(updated) => {
                        onUpdate(updated);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50/60 transition-colors">
                    {/* Date */}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(expense.date)}</p>
                      <p className="text-xs text-gray-500 md:hidden">{expense.description}</p>
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 md:hidden">
                          {expense.tags.map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full border border-indigo-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Description (desktop) */}
                    <div className="hidden md:block max-w-[200px]">
                      <p className="text-sm text-gray-600 truncate">{expense.description}</p>
                      {expense.tags && expense.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {expense.tags.map((tag) => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full border border-indigo-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Category */}
                    <CategoryBadge category={expense.category} />
                    {/* Amount */}
                    <p className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(expense.amount)}
                    </p>
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(expense.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(expense.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation inline */}
                {deleteConfirmId === expense.id && (
                  <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-red-700">
                      <AlertTriangle size={15} />
                      Delete this expense?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDelete(expense.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
