'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types/expense';
import { formatCurrency, getCategorySummaries } from '@/lib/utils';
import {
  X, Mail, Share2, BarChart3, CheckCircle2, Copy, Calendar,
  Download, FileSpreadsheet, Bell, ChevronRight, Globe, Link2,
  Loader2, Check, Trash2, Clock, BookOpen, HardDrive, Shield,
  Layers, History, Plug, RefreshCw, QrCode, AlarmClock, Zap,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = 'templates' | 'connect' | 'schedule' | 'history' | 'share';

interface ExportRecord {
  id: string;
  timestamp: string;
  template: string;
  format: 'csv' | 'json' | 'pdf';
  recordCount: number;
  sizeKB: number;
  destination: string;
}

interface ConnectedService {
  connectedAt: string;
  accountEmail: string;
}

interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'csv' | 'json';
  destinationId: string;
  time: string;
}

interface ShareSnapshot {
  link: string;
  expiry: '24h' | '7d' | '30d';
  qrDataUrl: string | null;
  createdAt: string;
  recordCount: number;
  totalAmount: number;
}

// ── Config ─────────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'google-sheets', name: 'Google Sheets', desc: 'Auto-sync to a live spreadsheet', icon: <FileSpreadsheet size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  { id: 'dropbox',       name: 'Dropbox',        desc: 'Back up exports to your Dropbox',  icon: <HardDrive size={18} />,    color: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-200'    },
  { id: 'onedrive',      name: 'OneDrive',        desc: 'Sync with Microsoft OneDrive',     icon: <Globe size={18} />,        color: 'text-sky-600',     bg: 'bg-sky-50',     ring: 'ring-sky-200'     },
  { id: 'email',         name: 'Email',           desc: 'Send exports to your inbox',       icon: <Mail size={18} />,         color: 'text-violet-600',  bg: 'bg-violet-50',  ring: 'ring-violet-200'  },
  { id: 'notion',        name: 'Notion',          desc: 'Push data into a Notion database', icon: <BookOpen size={18} />,     color: 'text-gray-700',    bg: 'bg-gray-50',    ring: 'ring-gray-200'    },
  { id: 'slack',         name: 'Slack',           desc: 'Get export alerts in Slack',       icon: <Bell size={18} />,         color: 'text-rose-600',    bg: 'bg-rose-50',    ring: 'ring-rose-200'    },
] as const;

type ServiceId = typeof SERVICES[number]['id'];

const TEMPLATES = [
  { id: 'tax-report',       name: 'Tax Report',        desc: 'All expenses sorted by category — ideal for tax filing.', icon: <Shield size={17} />,  color: 'text-emerald-600', bg: 'bg-emerald-50', format: 'csv'  as const, badge: 'Popular' },
  { id: 'monthly-summary',  name: 'Monthly Summary',   desc: 'Current-month expenses with category totals.',            icon: <BarChart3 size={17} />, color: 'text-indigo-600',  bg: 'bg-indigo-50',  format: 'csv'  as const, badge: null },
  { id: 'category-analysis',name: 'Category Analysis', desc: 'Aggregated spending by category with percentages.',      icon: <Layers size={17} />,  color: 'text-orange-600',  bg: 'bg-orange-50',  format: 'json' as const, badge: null },
  { id: 'full-backup',      name: 'Full Backup',        desc: 'Complete export of all data including metadata.',        icon: <HardDrive size={17} />, color: 'text-gray-600',    bg: 'bg-gray-50',    format: 'json' as const, badge: null },
];

const LS_HISTORY  = 'export_hub_history';
const LS_SERVICES = 'export_hub_services';
const LS_SCHEDULE = 'export_hub_schedule';
const LS_SHARE    = 'export_hub_share';

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

function nextRun(frequency: string, time: string): string {
  const [h, mn] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, mn, 0, 0);
  if (d <= new Date()) {
    if (frequency === 'daily')   d.setDate(d.getDate() + 1);
    else if (frequency === 'weekly')  d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
  }
  return d.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildCSV(rows: Expense[]) {
  const header = 'Date,Category,Amount,Description';
  const lines = rows.map(e => `${e.date},${e.category},${e.amount},"${e.description.replace(/"/g, '""')}"`);
  return [header, ...lines].join('\n');
}

function buildCategoryJSON(expenses: Expense[]) {
  const summaries = getCategorySummaries(expenses);
  return JSON.stringify({ generatedAt: new Date().toISOString(), totalExpenses: expenses.length, totalAmount: expenses.reduce((s, e) => s + e.amount, 0), categories: summaries }, null, 2);
}

function buildFullJSON(expenses: Expense[]) {
  return JSON.stringify({ generatedAt: new Date().toISOString(), version: '1.0', count: expenses.length, expenses }, null, 2);
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function estimateKB(content: string) { return Math.max(1, Math.round(content.length / 1024)); }

// ── Main component ─────────────────────────────────────────────────────────

interface ExportHubProps {
  expenses: Expense[];
  onClose: () => void;
}

export default function ExportHub({ expenses, onClose }: ExportHubProps) {
  const [tab, setTab] = useState<Tab>('templates');

  // Persisted state
  const [history,   setHistory]   = useState<ExportRecord[]>([]);
  const [services,  setServices]  = useState<Partial<Record<ServiceId, ConnectedService>>>({});
  const [schedule,  setSchedule]  = useState<ScheduleConfig>({ enabled: false, frequency: 'weekly', format: 'csv', destinationId: 'email', time: '08:00' });
  const [share,     setShare]     = useState<ShareSnapshot | null>(null);

  // UI state
  const [connecting,    setConnecting]    = useState<ServiceId | null>(null);
  const [connectEmail,  setConnectEmail]  = useState('');
  const [connectTarget, setConnectTarget] = useState<ServiceId | null>(null);
  const [downloading,   setDownloading]   = useState<string | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [generatingQR,  setGeneratingQR]  = useState(false);
  const [schedSaved,    setSchedSaved]    = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const h = localStorage.getItem(LS_HISTORY);  if (h) setHistory(JSON.parse(h));
      const sv = localStorage.getItem(LS_SERVICES); if (sv) setServices(JSON.parse(sv));
      const sc = localStorage.getItem(LS_SCHEDULE); if (sc) setSchedule(JSON.parse(sc));
      const sh = localStorage.getItem(LS_SHARE);    if (sh) setShare(JSON.parse(sh));
    } catch {}
  }, []);

  const saveHistory  = (h: ExportRecord[])                           => { setHistory(h);  localStorage.setItem(LS_HISTORY,  JSON.stringify(h));  };
  const saveServices = (s: Partial<Record<ServiceId, ConnectedService>>) => { setServices(s); localStorage.setItem(LS_SERVICES, JSON.stringify(s)); };
  const saveSchedule = (s: ScheduleConfig)                            => { setSchedule(s); localStorage.setItem(LS_SCHEDULE, JSON.stringify(s)); };
  const saveShare    = (s: ShareSnapshot | null)                      => { setShare(s);    localStorage.setItem(LS_SHARE,    JSON.stringify(s)); };

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // ── Template export ──────────────────────────────────────────────────────

  async function runTemplate(tpl: typeof TEMPLATES[number]) {
    setDownloading(tpl.id);
    await new Promise(r => setTimeout(r, 700));

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let content = '';
    let filename = '';
    let mime = 'text/plain';

    if (tpl.id === 'tax-report') {
      const sorted = [...expenses].sort((a, b) => a.category.localeCompare(b.category) || a.date.localeCompare(b.date));
      content = buildCSV(sorted);
      filename = `tax-report-${now.getFullYear()}.csv`;
      mime = 'text/csv';
    } else if (tpl.id === 'monthly-summary') {
      const monthly = expenses.filter(e => e.date.startsWith(month));
      content = buildCSV(monthly);
      filename = `monthly-summary-${month}.csv`;
      mime = 'text/csv';
    } else if (tpl.id === 'category-analysis') {
      content = buildCategoryJSON(expenses);
      filename = `category-analysis-${month}.json`;
      mime = 'application/json';
    } else {
      content = buildFullJSON(expenses);
      filename = `full-backup-${now.toISOString().slice(0, 10)}.json`;
      mime = 'application/json';
    }

    triggerDownload(content, filename, mime);

    const record: ExportRecord = {
      id: uid(), timestamp: now.toISOString(), template: tpl.name,
      format: tpl.format, recordCount: expenses.length,
      sizeKB: estimateKB(content), destination: 'Local',
    };
    saveHistory([record, ...history].slice(0, 20));
    setDownloading(null);
  }

  // ── Connect service ──────────────────────────────────────────────────────

  async function handleConnect(id: ServiceId) {
    if (!connectEmail.trim()) return;
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1400));
    const next = { ...services, [id]: { connectedAt: new Date().toISOString(), accountEmail: connectEmail.trim() } };
    saveServices(next);
    setConnecting(null);
    setConnectTarget(null);
    setConnectEmail('');
  }

  function handleDisconnect(id: ServiceId) {
    const next = { ...services };
    delete next[id];
    saveServices(next);
  }

  // ── Schedule ─────────────────────────────────────────────────────────────

  async function saveScheduleSettings() {
    saveSchedule(schedule);
    setSchedSaved(true);
    setTimeout(() => setSchedSaved(false), 2000);
  }

  // ── Share ────────────────────────────────────────────────────────────────

  async function generateShare(expiry: '24h' | '7d' | '30d') {
    setGeneratingQR(true);
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const payload = btoa(JSON.stringify({ count: expenses.length, total, at: Date.now() }));
    const link = `https://expenseai.app/shared/${payload.slice(0, 24)}`;

    let qrDataUrl: string | null = null;
    try {
      const QRCode = (await import('qrcode')).default;
      qrDataUrl = await QRCode.toDataURL(link, { width: 180, margin: 1, color: { dark: '#4f46e5', light: '#ffffff' } });
    } catch {}

    const snapshot: ShareSnapshot = { link, expiry, qrDataUrl, createdAt: new Date().toISOString(), recordCount: expenses.length, totalAmount: total };
    saveShare(snapshot);
    setGeneratingQR(false);
  }

  async function copyLink() {
    if (!share) return;
    await navigator.clipboard.writeText(share.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Tabs config ──────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'templates', label: 'Templates',    icon: <Zap size={14} />        },
    { id: 'connect',   label: 'Connect',      icon: <Plug size={14} />       },
    { id: 'schedule',  label: 'Schedule',     icon: <AlarmClock size={14} /> },
    { id: 'history',   label: 'History',      icon: <History size={14} />    },
    { id: 'share',     label: 'Share',        icon: <Share2 size={14} />     },
  ];

  const connectedCount = Object.keys(services).length;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Share2 size={14} className="text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Data Hub</h2>
              </div>
              <p className="text-xs text-gray-400 mt-1">Export, share &amp; connect your expense data</p>
            </div>
            <div className="flex items-center gap-3">
              {connectedCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {connectedCount} connected
                </span>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5 mt-4 bg-gray-100 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TEMPLATES ────────────────────────────────────────────────── */}
          {tab === 'templates' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-400">Pre-built export templates for common use cases. Each download is optimised for its purpose.</p>
              {TEMPLATES.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${tpl.bg} flex items-center justify-center flex-shrink-0 ${tpl.color}`}>
                    {tpl.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{tpl.name}</span>
                      {tpl.badge && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">{tpl.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{tpl.desc}</p>
                    <span className="text-[10px] text-gray-300 font-mono uppercase">{tpl.format}</span>
                  </div>
                  <button
                    onClick={() => runTemplate(tpl)}
                    disabled={downloading === tpl.id || expenses.length === 0}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {downloading === tpl.id
                      ? <Loader2 size={13} className="animate-spin" />
                      : <Download size={13} />}
                    {downloading === tpl.id ? 'Exporting' : 'Export'}
                  </button>
                </div>
              ))}

              {expenses.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">Add some expenses first to enable exports.</p>
              )}
            </div>
          )}

          {/* ── CONNECT ──────────────────────────────────────────────────── */}
          {tab === 'connect' && (
            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-400">Connect cloud services to automatically push exports and receive notifications.</p>
              {SERVICES.map(svc => {
                const conn = services[svc.id as ServiceId];
                const isConnecting = connecting === svc.id;
                const isTarget = connectTarget === svc.id;
                return (
                  <div key={svc.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <div className={`w-9 h-9 rounded-xl ${svc.bg} flex items-center justify-center flex-shrink-0 ${svc.color}`}>
                        {svc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{svc.name}</span>
                          {conn && <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Connected</span>}
                        </div>
                        {conn
                          ? <p className="text-xs text-gray-400">{conn.accountEmail} · {timeAgo(conn.connectedAt)}</p>
                          : <p className="text-xs text-gray-400">{svc.desc}</p>}
                      </div>
                      {conn ? (
                        <button onClick={() => handleDisconnect(svc.id as ServiceId)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors px-2 py-1">
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => setConnectTarget(isTarget ? null : svc.id as ServiceId)}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all"
                        >
                          <ChevronRight size={12} className={`transition-transform ${isTarget ? 'rotate-90' : ''}`} />
                          Connect
                        </button>
                      )}
                    </div>

                    {/* Inline connect form */}
                    {isTarget && !conn && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-50 bg-gray-50/60">
                        <p className="text-xs text-gray-500 mb-2 mt-3">Enter your {svc.name} account email to simulate OAuth connection:</p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={connectEmail}
                            onChange={e => setConnectEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleConnect(svc.id as ServiceId)}
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          <button
                            onClick={() => handleConnect(svc.id as ServiceId)}
                            disabled={isConnecting || !connectEmail.trim()}
                            className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isConnecting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            {isConnecting ? 'Connecting…' : 'Authorize'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SCHEDULE ─────────────────────────────────────────────────── */}
          {tab === 'schedule' && (
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Automatic Exports</p>
                  <p className="text-xs text-gray-400 mt-0.5">Set up recurring exports on a schedule</p>
                </div>
                <button
                  onClick={() => saveSchedule({ ...schedule, enabled: !schedule.enabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${schedule.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${schedule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className={`space-y-4 transition-opacity ${schedule.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {/* Frequency */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setSchedule(s => ({ ...s, frequency: f }))}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          schedule.frequency === f ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['csv', 'json'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setSchedule(s => ({ ...s, format: f }))}
                        className={`py-2 rounded-xl text-xs font-semibold uppercase border transition-all ${
                          schedule.format === f ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:border-indigo-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Destination</label>
                  <select
                    value={schedule.destinationId}
                    onChange={e => setSchedule(s => ({ ...s, destinationId: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="local">Local Download</option>
                    {SERVICES.map(svc => (
                      <option key={svc.id} value={svc.id} disabled={!services[svc.id as ServiceId]}>
                        {svc.name}{services[svc.id as ServiceId] ? '' : ' (not connected)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Run At</label>
                  <input
                    type="time"
                    value={schedule.time}
                    onChange={e => setSchedule(s => ({ ...s, time: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Next run preview */}
                <div className="flex items-center gap-3 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <Clock size={15} className="text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-indigo-500 font-medium">Next scheduled run</p>
                    <p className="text-sm font-semibold text-indigo-700">{nextRun(schedule.frequency, schedule.time)}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveScheduleSettings}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  schedSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {schedSaved ? <><CheckCircle2 size={15} /> Saved!</> : 'Save Schedule'}
              </button>
            </div>
          )}

          {/* ── HISTORY ──────────────────────────────────────────────────── */}
          {tab === 'history' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">{history.length} export{history.length !== 1 ? 's' : ''} recorded</p>
                {history.length > 0 && (
                  <button onClick={() => saveHistory([])} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <Trash2 size={11} /> Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <History size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">No exports yet</p>
                  <p className="text-xs text-gray-300 mt-1">Use a template to create your first export</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((rec, i) => (
                    <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Download size={13} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{rec.template}</p>
                        <p className="text-xs text-gray-400">{rec.recordCount} records · {rec.sizeKB} KB · {rec.format.toUpperCase()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">Done</span>
                        <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(rec.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SHARE ────────────────────────────────────────────────────── */}
          {tab === 'share' && (
            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Shareable Snapshot</p>
                <p className="text-xs text-gray-400">Generate a read-only link to share your expense summary with others.</p>
              </div>

              {/* Expiry + generate */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Link Expiry</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['24h', '7d', '30d'] as const).map(e => (
                    <button
                      key={e}
                      onClick={() => generateShare(e)}
                      disabled={generatingQR || expenses.length === 0}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        share?.expiry === e
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {e === '24h' ? '24 hours' : e === '7d' ? '7 days' : '30 days'}
                    </button>
                  ))}
                </div>

                {generatingQR && (
                  <div className="flex items-center justify-center py-8 gap-2 text-sm text-indigo-500">
                    <Loader2 size={16} className="animate-spin" /> Generating link…
                  </div>
                )}
              </div>

              {/* Generated link */}
              {share && !generatingQR && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shareable Link</label>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
                      <Link2 size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-xs text-gray-600 font-mono truncate">{share.link}</span>
                      <button
                        onClick={copyLink}
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
                          copied ? 'text-emerald-600 bg-emerald-50' : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {/* Snapshot metadata */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Records', value: share.recordCount },
                      { label: 'Total', value: formatCurrency(share.totalAmount) },
                      { label: 'Expires', value: share.expiry },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-700">{item.value}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3 p-5 border border-gray-100 rounded-2xl bg-gray-50">
                    {share.qrDataUrl ? (
                      <>
                        <img src={share.qrDataUrl} alt="QR Code" className="w-36 h-36 rounded-xl" />
                        <p className="text-xs text-gray-400">Scan to open the shared snapshot</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
                        <QrCode size={16} /> QR generation unavailable
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => generateShare(share.expiry)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={13} /> Regenerate Link
                  </button>
                </>
              )}

              {!share && !generatingQR && (
                <div className="text-center py-10">
                  <QrCode size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">Select an expiry above to generate a link</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{expenses.length} expenses · {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </div>
    </div>
  );
}
