# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

There are no tests in this project.

## Architecture

This is a Next.js 14 (App Router) expense tracker. All data is persisted in **`localStorage`** under the key `expense_tracker_data` — there is no backend or database.

### Data flow

`lib/storage.ts` handles all localStorage reads/writes. `context/ExpenseContext.tsx` wraps the app in a React context that loads from storage on mount and exposes `add`, `update`, `remove` to any component via the `useExpenses()` hook. Pages consume this hook and pass data down to components as props.

On first load (empty localStorage), `lib/storage.ts` seeds ~15 sample expenses so the UI looks populated.

### Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Dashboard with summary cards, charts, recent expenses |
| `/expenses` | `app/expenses/page.tsx` | Full filterable/sortable expense list. Accepts `?dateFrom=&dateTo=` query params to pre-filter (used by the "This Month" dashboard card) |
| `/add` | `app/add/page.tsx` | Add new expense form |

### Key types (`types/expense.ts`)

- `Expense` — `{ id, date (YYYY-MM-DD), amount, category, description, createdAt }`
- `Category` — union of `'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other'`
- `CATEGORIES`, `CATEGORY_COLORS`, `CATEGORY_BG` — canonical arrays/maps for categories; always use these instead of hardcoding category strings
- `FilterState` — shape used by `ExpenseList` for its filter controls

### Components

- **`Dashboard`** — composes all dashboard sections; computes aggregates from `lib/utils.ts` functions
- **`SummaryCard`** — accepts an optional `href` prop; renders as a `<Link>` when provided, otherwise a `<div>`
- **`ExpenseList`** — self-contained filter/sort/edit/delete UI; accepts `initialFilters?: Partial<FilterState>` to pre-populate filters from URL params
- **`SpendingChart`** — two-panel chart (monthly bar + category pie) using Recharts
- **`ExpenseForm`** — shared between add and inline-edit modes via a `mode: 'add' | 'edit'` prop

### Utilities (`lib/utils.ts`)

Pure functions for aggregation (`getTotalAmount`, `getMonthlyTotal`, `getCategorySummaries`, `getTopCategory`, `getMonthlyData`) and filtering (`filterExpenses`). Date handling uses `date-fns`.
