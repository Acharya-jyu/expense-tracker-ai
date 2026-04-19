'use client';

import { useState } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';
import { generateId } from '@/lib/utils';
import { useCustomCategories } from '@/context/CustomCategoriesContext';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ExpenseFormProps {
  initialData?: Expense;
  onSave: (expense: Expense) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

type FormErrors = Partial<Record<keyof ExpenseFormData, string>>;

export default function ExpenseForm({ initialData, onSave, onCancel, mode = 'create' }: ExpenseFormProps) {
  const { allCategories } = useCustomCategories();

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: initialData?.date ?? format(new Date(), 'yyyy-MM-dd'),
    amount: initialData ? String(initialData.amount) : '',
    category: initialData?.category ?? 'Food',
    description: initialData?.description ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  function validate(data: ExpenseFormData): FormErrors {
    const errs: FormErrors = {};
    if (!data.date) errs.date = 'Date is required.';
    const amt = parseFloat(data.amount);
    if (!data.amount || isNaN(amt) || amt <= 0) {
      errs.amount = 'Enter a valid positive amount.';
    } else if (amt > 1_000_000) {
      errs.amount = 'Amount seems too large.';
    }
    if (!data.description.trim()) errs.description = 'Description is required.';
    if (data.description.trim().length > 200) errs.description = 'Max 200 characters.';
    return errs;
  }

  function handleChange(field: keyof ExpenseFormData, value: string) {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (Object.keys(errors).length > 0) setErrors(validate(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);

    const expense: Expense = {
      id: initialData?.id ?? generateId(),
      date: formData.date,
      amount: parseFloat(parseFloat(formData.amount).toFixed(2)),
      category: formData.category,
      description: formData.description.trim(),
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
    };

    await new Promise((r) => setTimeout(r, 300));
    onSave(expense);
    setSaving(false);
    setSubmitted(true);

    if (mode === 'create') {
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          category: 'Food',
          description: '',
        });
      }, 1500);
    }
  }

  const inputBase =
    'w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all';
  const inputOk = `${inputBase} border-gray-200 focus:ring-indigo-400 focus:border-indigo-400`;
  const inputErr = `${inputBase} border-red-400 focus:ring-red-300 focus:border-red-400 bg-red-50`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {submitted && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={16} />
          Expense {mode === 'edit' ? 'updated' : 'added'} successfully!
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className={errors.date ? inputErr : inputOk}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.date}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`${errors.amount ? inputErr : inputOk} pl-8`}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.amount}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleChange('category', cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                formData.category === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
          <span className="ml-1 text-xs text-gray-400 font-normal">
            ({formData.description.length}/200)
          </span>
        </label>
        <textarea
          rows={3}
          placeholder="What did you spend on?"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`${errors.description ? inputErr : inputOk} resize-none`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || submitted}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {saving ? 'Saving…' : submitted ? 'Saved!' : mode === 'edit' ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
