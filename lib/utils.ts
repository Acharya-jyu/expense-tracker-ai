import { Expense, Category, CategorySummary, CATEGORIES } from '@/types/expense';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MM/dd/yyyy');
}

export function getTotalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyTotal(expenses: Expense[]): number {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return getTotalAmount(
    expenses.filter((e) => {
      try {
        return isWithinInterval(parseISO(e.date), { start, end });
      } catch {
        return false;
      }
    })
  );
}

export function getCategorySummaries(expenses: Expense[]): CategorySummary[] {
  const total = getTotalAmount(expenses);
  return CATEGORIES.map((category) => {
    const filtered = expenses.filter((e) => e.category === category);
    const catTotal = getTotalAmount(filtered);
    return {
      category,
      total: catTotal,
      count: filtered.length,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
    };
  }).sort((a, b) => b.total - a.total);
}

export function getTopCategory(expenses: Expense[]): Category | null {
  if (expenses.length === 0) return null;
  const summaries = getCategorySummaries(expenses);
  return summaries[0]?.total > 0 ? summaries[0].category : null;
}

export function getMonthlyData(expenses: Expense[]): { month: string; total: number }[] {
  const months: Record<string, number> = {};
  expenses.forEach((e) => {
    try {
      const key = format(parseISO(e.date), 'MMM yyyy');
      months[key] = (months[key] || 0) + e.amount;
    } catch {
      // skip invalid dates
    }
  });
  return Object.entries(months)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6);
}

export function filterExpenses(
  expenses: Expense[],
  search: string,
  category: Category | 'All',
  dateFrom: string,
  dateTo: string
): Expense[] {
  return expenses.filter((e) => {
    const matchesSearch =
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === 'All' || e.category === category;

    let matchesDate = true;
    if (dateFrom) {
      try {
        matchesDate = matchesDate && e.date >= dateFrom;
      } catch {
        // skip
      }
    }
    if (dateTo) {
      try {
        matchesDate = matchesDate && e.date <= dateTo;
      } catch {
        // skip
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
