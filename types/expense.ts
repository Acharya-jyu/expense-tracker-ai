export type Category = string;

export const BUILTIN_CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
] as const;

export type BuiltinCategory = typeof BUILTIN_CATEGORIES[number];

export const CATEGORIES: string[] = [...BUILTIN_CATEGORIES];

export const CATEGORY_COLORS: Record<BuiltinCategory, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
};

export const CATEGORY_BG: Record<BuiltinCategory, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
};

const CUSTOM_PALETTE = [
  '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6',
  '#14b8a6', '#f43f5e', '#84cc16', '#fb923c',
];

export function getCategoryColor(category: string): string {
  if (category in CATEGORY_COLORS) return CATEGORY_COLORS[category as BuiltinCategory];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return CUSTOM_PALETTE[Math.abs(hash) % CUSTOM_PALETTE.length];
}

export interface Expense {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  createdAt: string; // ISO timestamp
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface FilterState {
  search: string;
  category: string; // Category | 'All'
  dateFrom: string;
  dateTo: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}
