'use client';

import { useState, useMemo, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { CATEGORIES } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { X, Download, FileText, FileJson, FilePlus, Calendar, Filter, Eye, Loader2, CheckCircle2 } from 'lucide-react';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'csv', label: 'CSV', icon: <FileText size={18} />, desc: 'Spreadsheet compatible' },
  { id: 'json', label: 'JSON', icon: <FileJson size={18} />, desc: 'Developer friendly' },
  { id: 'pdf', label: 'PDF', icon: <FilePlus size={18} />, desc: 'Print ready report' },
];

export default function ExportModal({ expenses, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filename, setFilename] = useState(`expenses-${new Date().toISOString().slice(0, 10)}`);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const allCategories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    return Array.from(cats).sort();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo, selectedCategories]);

  const totalAmount = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function buildCSV() {
    const header = 'Date,Category,Amount,Description';
    const rows = filtered.map(
      (e) => `${e.date},${e.category},${e.amount},"${e.description.replace(/"/g, '""')}"`
    );
    return [header, ...rows].join('\n');
  }

  function buildJSON() {
    return JSON.stringify(
      filtered.map(({ id, date, category, amount, description, createdAt }) => ({
        id, date, category, amount, description, createdAt,
      })),
      null,
      2
    );
  }

  async function buildPDF() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Expense Report', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Records: ${filtered.length}  |  Total: $${totalAmount.toFixed(2)}`, 14, 34);

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 38, 196, 38);

    const colX = [14, 48, 88, 118];
    const headers = ['Date', 'Category', 'Amount', 'Description'];

    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => doc.text(h, colX[i], 46));
    doc.line(14, 48, 196, 48);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    let y = 55;
    for (const e of filtered) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const row = [e.date, e.category, `$${e.amount.toFixed(2)}`, e.description];
      row.forEach((val, i) => {
        const maxW = i === 3 ? 75 : 35;
        const truncated = val.length > 35 ? val.slice(0, 33) + '…' : val;
        doc.text(i === 3 ? truncated : val, colX[i], y, { maxWidth: maxW });
      });
      y += 7;
    }

    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Total: $${totalAmount.toFixed(2)}`, 14, y + 4);

    return doc;
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const name = filename.trim() || 'expenses';

      if (format === 'csv') {
        const blob = new Blob([buildCSV()], { type: 'text/csv' });
        trigger(blob, `${name}.csv`);
      } else if (format === 'json') {
        const blob = new Blob([buildJSON()], { type: 'application/json' });
        trigger(blob, `${name}.json`);
      } else {
        const doc = await buildPDF();
        doc.save(`${name}.pdf`);
      }

      setDone(true);
      setTimeout(() => { setDone(false); setExporting(false); }, 2000);
    } catch {
      setExporting(false);
    }
  }

  function trigger(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure and download your expense data</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Format selector */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    format === opt.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Calendar size={12} /> Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </section>

          {/* Category filter */}
          <section>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Filter size={12} /> Categories
              <span className="ml-auto text-indigo-500 font-normal normal-case tracking-normal cursor-pointer hover:underline text-xs"
                onClick={() => setSelectedCategories([])}
              >
                {selectedCategories.length > 0 ? 'Clear' : 'All included'}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Filename */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filename</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm text-gray-400">.{format}</span>
            </div>
          </section>

          {/* Summary bar */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Records</span>
              <span className="font-bold text-gray-900">{filtered.length}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline"
            >
              <Eye size={13} />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          </div>

          {/* Preview table */}
          {showPreview && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto max-h-52">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Date', 'Category', 'Amount', 'Description'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-gray-400">No records match your filters</td>
                      </tr>
                    ) : (
                      filtered.slice(0, 50).map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{e.date}</td>
                          <td className="px-3 py-2 text-gray-600">{e.category}</td>
                          <td className="px-3 py-2 text-gray-800 font-medium tabular-nums">{formatCurrency(e.amount)}</td>
                          <td className="px-3 py-2 text-gray-500 truncate max-w-[160px]">{e.description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 50 && (
                <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
                  Showing first 50 of {filtered.length} records
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || filtered.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:cursor-not-allowed ${
              done
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
            }`}
          >
            {done ? (
              <><CheckCircle2 size={16} /> Exported!</>
            ) : exporting ? (
              <><Loader2 size={16} className="animate-spin" /> Exporting…</>
            ) : (
              <><Download size={16} /> Export {filtered.length} records</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
