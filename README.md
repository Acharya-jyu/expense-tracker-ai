# ExpenseAI

A minimalist personal finance tracker built with Next.js 14. Track spending by category, visualise monthly trends, and manage your expense history — all stored locally in the browser with no account or backend required.

## Features

- **Dashboard** — at-a-glance summary cards (total spent, this month, transaction count, top category), monthly spending bar chart, category pie chart, animated category breakdown with progress bars, and a recent expenses list
- **Expense management** — add, inline-edit, and delete expenses with instant feedback
- **Filtering & sorting** — search by keyword, filter by category and date range, sort by date / amount / category
- **Deep-linked filters** — dashboard cards link directly to the expenses page with pre-applied filters (e.g. "This Month" opens the list filtered to the current month)
- **CSV export** — export the currently filtered view as a `.csv` file
- **Entrance animations** — staggered blur+lift reveal on every dashboard section on page load
- **No backend** — all data persists in `localStorage`; seeds 15 sample expenses on first visit so the UI is immediately populated

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Date utilities | date-fns |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run lint    # ESLint
```

## Project Structure

```
app/
  page.tsx              # Dashboard page (/)
  expenses/page.tsx     # Expense list (/expenses) — accepts ?dateFrom & ?dateTo query params
  add/page.tsx          # Add expense (/add)
  globals.css           # Global styles + animation keyframes

components/
  Dashboard.tsx         # Composes all dashboard sections
  SummaryCard.tsx       # Stat card; renders as <Link> when href prop is provided
  SpendingChart.tsx     # Monthly bar chart + category pie chart (Recharts)
  ExpenseList.tsx       # Filterable, sortable, editable expense table
  ExpenseForm.tsx       # Shared form for add and inline-edit modes
  CategoryBadge.tsx     # Coloured category pill
  Navigation.tsx        # Top nav with logo link

context/
  ExpenseContext.tsx    # React context — loads from storage on mount, exposes add/update/remove

lib/
  storage.ts            # All localStorage read/write logic + seed data
  utils.ts              # Pure aggregation & filter functions (getTotalAmount, filterExpenses, etc.)

types/
  expense.ts            # Expense, Category, FilterState types + CATEGORIES / CATEGORY_COLORS maps
```

## Data Model

```ts
interface Expense {
  id: string;
  date: string;        // YYYY-MM-DD
  amount: number;
  category: Category;  // 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other'
  description: string;
  createdAt: string;   // ISO timestamp
}
```

All expenses are stored in `localStorage` under the key `expense_tracker_data`. There is no authentication, server, or database.

## Categories

`Food` · `Transportation` · `Entertainment` · `Shopping` · `Bills` · `Other`

Category colours and Tailwind background classes are defined in `types/expense.ts` (`CATEGORY_COLORS`, `CATEGORY_BG`) and should always be used as the source of truth rather than hardcoding values.
