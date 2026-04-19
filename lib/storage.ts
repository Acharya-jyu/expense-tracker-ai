import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense_tracker_data';

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultExpenses();
    return JSON.parse(raw) as Expense[];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expenses: Expense[], expense: Expense): Expense[] {
  const updated = [expense, ...expenses];
  saveExpenses(updated);
  return updated;
}

export function updateExpense(expenses: Expense[], updated: Expense): Expense[] {
  const list = expenses.map((e) => (e.id === updated.id ? updated : e));
  saveExpenses(list);
  return list;
}

export function deleteExpense(expenses: Expense[], id: string): Expense[] {
  const list = expenses.filter((e) => e.id !== id);
  saveExpenses(list);
  return list;
}

// Seed data so the app looks populated on first load
function getDefaultExpenses(): Expense[] {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const ago = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return fmt(d);
  };

  const seeds: Omit<Expense, 'id' | 'createdAt'>[] = [
    { date: ago(1), amount: 45.5, category: 'Food', description: 'Grocery shopping' },
    { date: ago(1), amount: 12.0, category: 'Transportation', description: 'Uber ride' },
    { date: ago(3), amount: 89.99, category: 'Shopping', description: 'New headphones' },
    { date: ago(4), amount: 25.0, category: 'Entertainment', description: 'Netflix + Spotify' },
    { date: ago(5), amount: 120.0, category: 'Bills', description: 'Electricity bill' },
    { date: ago(6), amount: 32.5, category: 'Food', description: 'Restaurant dinner' },
    { date: ago(7), amount: 60.0, category: 'Transportation', description: 'Monthly bus pass' },
    { date: ago(8), amount: 15.75, category: 'Food', description: 'Coffee & snacks' },
    { date: ago(10), amount: 200.0, category: 'Bills', description: 'Internet bill' },
    { date: ago(12), amount: 55.0, category: 'Shopping', description: 'Clothing' },
    { date: ago(14), amount: 22.0, category: 'Entertainment', description: 'Movie tickets' },
    { date: ago(15), amount: 78.9, category: 'Food', description: 'Weekly groceries' },
    { date: ago(18), amount: 35.0, category: 'Other', description: 'Gym membership' },
    { date: ago(20), amount: 145.0, category: 'Bills', description: 'Phone bill' },
    { date: ago(22), amount: 18.5, category: 'Food', description: 'Lunch with colleague' },
  ];

  const expenses: Expense[] = seeds.map((s, i) => ({
    ...s,
    id: `seed-${i + 1}`,
    createdAt: new Date().toISOString(),
  }));

  saveExpenses(expenses);
  return expenses;
}
