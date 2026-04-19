'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { X, Download, FileText, FileJson, FilePlus, Calendar, Filter, Eye, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

const LS_FORMAT   = 'export_modal_format';
const LS_FILENAME = 'export_modal_filename';

const FOCUSABLE = 'button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ExportModal({ expenses, onClose }: ExportModalProps) {
  // ── Fix 4: restore last-used format & filename from localStorage ──────────
  const [format, setFormat] = useState<ExportFormat>(() => {
    if (typeof window === 'undefined') return 'csv';
    return (localStorage.getItem(LS_FORMAT) as ExportFormat) ?? 'csv';
  });
  const [filename, setFilename] = useState(() => {
    if (typeof window === 'undefined') return `expenses-${new Date().toISOString().slice(0, 10)}`;
    return localStorage.getItem(LS_FILENAME) ?? `expenses-${new Date().toISOString().slice(0, 10)}`;
  });

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  // ── Fix 1: visible error state ────────────────────────────────────────────
  const [exportError, setExportError] = useState<string | null>(null);

  // ── Fix 3: focus trap ref ─────────────────────────────────────────────────
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Persist format & filename whenever they change
  function updateFormat(f: ExportFormat) {
    setFormat(f);
    localStorage.setItem(LS_FORMAT, f);
  }
  function updateFilename(f: string) {
    setFilename(f);
    localStorage.setItem(LS_FILENAME, f);
  }

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

  // ── Fix 2: use jspdf-autotable for correct column layout ─────────────────
  async function buildPDF() {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Expense Report', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Records: ${filtered.length}  |  Total: $${totalAmount.toFixed(2)}`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [['Date', 'Category', 'Amount', 'Description']],
      body: filtered.map((e) => [
        e.date,
        e.category,
        `$${e.amount.toFixed(2)}`,
        e.description,
      ]),
      headStyles: {
        fillColor: [79, 70, 229],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: { fontSize: 8, textColor: [75, 85, 99] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 36 },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 'auto' },
      },
      foot: [[{ content: `Total: $${totalAmount.toFixed(2)}`, colSpan: 4, styles: { halign: 'right', fontSize: 8, textColor: [107, 114, 128] } }]],
      showFoot: 'lastPage',
      margin: { left: 14, right: 14 },
    });

    return doc;
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setExporting(true);
    setExportError(null);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const name = filename.trim() || 'expenses';

      if (format === 'csv') {
        trigger(new Blob([buildCSV()], { type: 'text/csv' }), `${name}.csv`);
      } else if (format === 'json') {
        trigger(new Blob([buildJSON()], { type: 'application/json' }), `${name}.json`);
      } else {
        const doc = await buildPDF();
        doc.save(`${name}.pdf`);
      }

      setDone(true);
      setTimeout(() => { setDone(false); setExporting(false); }, 2000);
    } catch (err) {
      // ── Fix 1: surface the error to the user ─────────────────────────────
      const message = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setExportError(message);
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

  // ── Fix 3: Escape key + focus trap + initial focus ────────────────────────
  useEffect(() => {
    // Move focus into the modal on open
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    // ── Fix 3: aria-modal + role="dialog" + aria-labelledby ─────────────────
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog" aria-labelledby="export-modal-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div ref={modalRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 id="export-modal-title" className="text-lg font-bold text-gray-900">Export Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure and download your expense data</p>
          </div>
          <button onClick={onClose} aria-label="Close export dialog" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Fix 1: error banner */}
          {exportError && (
            <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Export failed</p>
                <p className="text-xs mt-0.5 text-red-600">{exportError}</p>
              </div>
              <button onClick={() => setExportError(null)} aria-label="Dismiss error" className="ml-auto text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Format selector */}
          <section aria-labelledby="format-label">
            <p id="format-label" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Export Format</p>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-labelledby="format-label">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateFormat(opt.id)}
                  role="radio"
                  aria-checked={format === opt.id}
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
          <section aria-labelledby="date-range-label">
            <p id="date-range-label" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Calendar size={12} aria-hidden="true" /> Date Range
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-from" className="text-xs text-gray-400 mb-1 block">From</label>
                <input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="text-xs text-gray-400 mb-1 block">To</label>
                <input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          </section>

          {/* Category filter */}
          <section aria-labelledby="category-label">
            <div className="flex items-center gap-1.5 mb-3">
              <p id="category-label" className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={12} aria-hidden="true" /> Categories
              </p>
              <button
                onClick={() => setSelectedCategories([])}
                className="ml-auto text-indigo-500 font-normal text-xs hover:underline"
              >
                {selectedCategories.length > 0 ? 'Clear' : 'All included'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="category-label">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  aria-pressed={selectedCategories.includes(cat)}
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
            <label htmlFor="export-filename" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filename</label>
            <div className="flex items-center gap-2">
              <input
                id="export-filename"
                type="text"
                value={filename}
                onChange={(e) => updateFilename(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm text-gray-400" aria-live="polite">.{format}</span>
            </div>
          </section>

          {/* Summary bar */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <div className="flex items-center gap-4 text-sm" aria-live="polite" aria-atomic="true">
              <span className="text-gray-500">Records</span>
              <span className="font-bold text-gray-900">{filtered.length}</span>
              <span className="text-gray-300" aria-hidden="true">|</span>
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <button
              onClick={() => setShowPreview((p) => !p)}
              aria-expanded={showPreview}
              aria-controls="preview-table"
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline"
            >
              <Eye size={13} aria-hidden="true" />
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          </div>

          {/* Preview table */}
          {showPreview && (
            <div id="preview-table" className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto max-h-52">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Date', 'Category', 'Amount', 'Description'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-gray-500" scope="col">{h}</th>
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
            aria-busy={exporting}
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
