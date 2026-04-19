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

This is a Next.js 14 (App Router) expense tracker backed by **Firebase** (Firestore + Firebase Auth). `localStorage` still exists in `lib/storage.ts` but is only used to seed sample data for unauthenticated users — all real data is stored in Firestore per-user.

### Data flow

- **Auth**: `context/AuthContext.tsx` wraps the app; exposes `user`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, and `isLoading`.
- **Expenses**: `context/ExpenseContext.tsx` loads from Firestore (`users/{uid}/expenses`) when a user is signed in, and falls back to `lib/storage.ts` (localStorage seed) otherwise. Exposes `add`, `update`, `remove` via `useExpenses()`.
- **Custom categories**: `context/CustomCategoriesContext.tsx` loads `customCategories` from the user's Firestore profile (`users/{uid}`). Exposes `allCategories` (built-ins + custom), `addCategory`, `removeCategory`, and `isLoaded`.

### Firebase

- `lib/firebase.ts` — initialises the Firebase app, exports `auth`, `db` (Firestore), and `googleProvider`.
- `lib/firestore.ts` — typed CRUD helpers:
  - Expenses: `loadUserExpenses`, `addUserExpense`, `updateUserExpense`, `deleteUserExpense`
  - Profile: `getUserProfile`, `setUserProfile`
  - `UserProfile` interface: `{ displayName, email, photoURL?, customCategories: string[], createdAt }`

**Firebase Console requirements (manual setup):**
- Authentication → Sign-in method → Email/Password and Google: **Enabled**
- Authentication → Settings → Authorized domains: **localhost** added

### Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` + `HomeClient.tsx` | Dashboard with summary cards, charts, recent expenses |
| `/expenses` | `app/expenses/page.tsx` + `ExpensesClient.tsx` | Full filterable/sortable expense list. Accepts `?dateFrom=&dateTo=` query params |
| `/add` | `app/add/page.tsx` + `AddClient.tsx` | Add new expense form |
| `/profile` | `app/profile/page.tsx` + `ProfileClient.tsx` | Edit display name, manage custom categories, sign out |
| `/auth/signin` | `app/auth/signin/` | Sign in (email/password + Google) |
| `/auth/signup` | `app/auth/signup/` | Create account (email/password) |

### Key types (`types/expense.ts`)

- `Expense` — `{ id, date (YYYY-MM-DD), amount, category, description, createdAt }`
- `Category` — `string` (no longer a fixed union; use `BUILTIN_CATEGORIES` for the canonical six)
- `BUILTIN_CATEGORIES` — `['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']` as const
- `CATEGORIES` — mutable array copy of `BUILTIN_CATEGORIES` (used as base for `allCategories`)
- `CATEGORY_COLORS`, `CATEGORY_BG` — keyed by `BuiltinCategory`; only cover built-ins
- `getCategoryColor(category)` — returns a hex color; uses `CATEGORY_COLORS` for built-ins, hashes custom names to an 8-color palette
- `FilterState` — shape used by `ExpenseList` for filter controls
- `CategorySummary` — `{ category, total, count, percentage }`

### Components

- **`Dashboard`** — composes all dashboard sections; computes aggregates from `lib/utils.ts`
- **`SummaryCard`** — accepts an optional `href` prop; renders as `<Link>` when provided
- **`ExpenseList`** — filter/sort/edit/delete UI; accepts `initialFilters?: Partial<FilterState>`
- **`SpendingChart`** — monthly bar + category pie (Recharts); uses `getCategoryColor()` for all pie segments so custom categories get consistent colors
- **`ExpenseForm`** — shared add/edit form; `mode: 'create' | 'edit'`; reads `allCategories` from `useCustomCategories()`; currency prefix is `NRs`
- **`Navigation`** — sticky top nav; shows user avatar/name dropdown (profile link + sign out) when authenticated; mobile hamburger menu includes profile link
- **`CategoryBadge`** — built-ins use Tailwind classes from `CATEGORY_BG`; custom categories use inline styles from `getCategoryColor()`

### Utilities (`lib/utils.ts`)

- Aggregation: `getTotalAmount`, `getMonthlyTotal`, `getCategorySummaries`, `getTopCategory`, `getMonthlyData`
- Filtering: `filterExpenses`
- Formatting: `formatCurrency` (returns `NRs …`), `formatDate`, `formatShortDate`
- Export: `exportToCSV(expenses)` — triggers a browser download of a CSV file
- Misc: `generateId`
- Date handling uses `date-fns`
