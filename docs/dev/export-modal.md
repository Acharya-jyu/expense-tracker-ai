# Export Modal — Developer Reference

> **Last updated:** 2026-04-21
> **Status:** Stable
> **Related user guide:** [../../docs/user/export-modal.md](../../docs/user/export-modal.md)

## Overview

`ExportModal` is a full-featured data-export dialog mounted from the dashboard. It lets authenticated users download their expense data as CSV, JSON, or PDF, with optional date-range and category filtering, a live data preview, and a custom filename. All heavy PDF/autotable libraries are code-split and only loaded on demand.

## Architecture

```
Dashboard
├── showExport: boolean          ← owns open/close state
└── <ExportModal expenses onClose>
    ├── format: 'csv'|'json'|'pdf'   (persisted → localStorage)
    ├── filename: string              (persisted → localStorage)
    ├── dateFrom, dateTo: string
    ├── selectedCategories: string[]
    ├── showPreview: boolean
    ├── exporting / done / exportError: boolean / string | null
    ├── allCategories  (useMemo ← expenses)
    ├── filtered       (useMemo ← expenses + filters)
    ├── totalAmount    (useMemo ← filtered)
    ├── buildCSV()
    ├── buildJSON()
    ├── buildPDF()     ← async, dynamic import jspdf + jspdf-autotable
    └── handleExport() ← orchestrates format branch + error handling
```

## Files

| File | Role |
|---|---|
| `components/ExportModal.tsx` | Entire export feature — UI, state, file generation |
| `components/Dashboard.tsx` | Mounts ExportModal; owns `showExport` boolean |
| `types/expense.ts` | `Expense` type consumed by the modal |
| `lib/utils.ts` | `formatCurrency` used in the summary bar and preview table |

## Types & Interfaces

```typescript
// From types/expense.ts
export interface Expense {
  id: string;
  date: string;        // YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  createdAt: string;   // ISO timestamp
}

// Internal to ExportModal.tsx
type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}
```

## Component API

### `ExportModal`

**Location:** `components/ExportModal.tsx`
**Rendered by:** `components/Dashboard.tsx` (conditionally, when `showExport === true`)

| Prop | Type | Required | Description |
|---|---|---|---|
| `expenses` | `Expense[]` | Yes | Full expense array from `useExpenses()` — filtering is done inside the modal |
| `onClose` | `() => void` | Yes | Called on Escape key, backdrop click, or Cancel button |

**State:**

| Variable | Type | Purpose |
|---|---|---|
| `format` | `ExportFormat` | Selected output format; initialised from localStorage |
| `filename` | `string` | Download filename (without extension); initialised from localStorage |
| `dateFrom` | `string` | ISO date string for the start of the filter range |
| `dateTo` | `string` | ISO date string for the end of the filter range |
| `selectedCategories` | `string[]` | Categories to include; empty means all |
| `showPreview` | `boolean` | Toggles the preview table |
| `exporting` | `boolean` | True while the async export is in progress |
| `done` | `boolean` | True for 2 seconds after a successful export |
| `exportError` | `string \| null` | Non-null when an export throws; displayed as a dismissible banner |

**Derived state (useMemo):**

| Variable | Dependencies | Purpose |
|---|---|---|
| `allCategories` | `expenses` | Unique sorted category list for the filter UI |
| `filtered` | `expenses, dateFrom, dateTo, selectedCategories` | The subset of expenses that will be exported |
| `totalAmount` | `filtered` | Sum of amounts in the filtered set |

## Data Flow

1. User clicks "Export Data" on the dashboard → `showExport` flips to `true` → `ExportModal` mounts.
2. On mount: `localStorage` is read for `export_modal_format` and `export_modal_filename`; these pre-populate `format` and `filename`.
3. On mount: the first focusable element inside the modal receives focus (accessibility).
4. User configures format, date range, categories, filename → each change updates state; `filtered` and `totalAmount` recompute via `useMemo`.
5. User clicks "Export N records":
   - `exporting` → `true`, `exportError` → `null`.
   - 600 ms artificial delay (makes spinner visible for fast exports).
   - Format branch executes:
     - **CSV**: `buildCSV()` → `Blob` → `URL.createObjectURL` → anchor click → `revokeObjectURL`.
     - **JSON**: `buildJSON()` → same Blob/anchor pattern.
     - **PDF**: `buildPDF()` → dynamic imports `jspdf` + `jspdf-autotable` → `doc.save()`.
   - On success: `done` → `true` for 2 seconds, then both `done` and `exporting` reset.
   - On error: `exportError` set to `err.message`; `exporting` → `false`; error banner renders.
6. User closes modal → `onClose()` → Dashboard unmounts the component; all state is destroyed.

## External Libraries

| Library | Version | Why used | Import pattern |
|---|---|---|---|
| `jspdf` | ^4.2.1 | PDF document generation | Dynamic: `await import('jspdf')` |
| `jspdf-autotable` | ^5.0.7 | Auto-sizing table layout in PDF (fixes overflow on long descriptions) | Dynamic: `await import('jspdf-autotable')` |
| `lucide-react` | ^1.8.0 | Icons throughout the modal UI | Static named imports |

## localStorage Keys

| Key | Type | Content |
|---|---|---|
| `export_modal_format` | `'csv' \| 'json' \| 'pdf'` | Last format the user selected |
| `export_modal_filename` | `string` | Last filename the user typed |

## Error States

| Scenario | How it is handled | User-visible result |
|---|---|---|
| PDF dynamic import fails (network/bundler error) | `catch` block sets `exportError` to `err.message` | Red dismissible alert banner with the error message |
| CSV/JSON Blob creation fails | Same `catch` block | Same red alert banner |
| No records match filters | Export button is `disabled` | Button shows "Export 0 records" and cannot be clicked |
| Empty filename | `filename.trim() \|\| 'expenses'` fallback | File downloads as `expenses.<ext>` |

## Performance Notes

- **Bundle impact:** Zero at page load. `jspdf` (~200 KB gzipped) and `jspdf-autotable` are only fetched when the user selects PDF and clicks Export.
- **`useMemo` usage:** `allCategories`, `filtered`, and `totalAmount` are memoised. `filtered` only recomputes when `expenses`, `dateFrom`, `dateTo`, or `selectedCategories` change — not on every keystroke in the filename field.
- **Preview table:** Capped at 50 rows to keep the DOM bounded on large datasets.
- **Modal mount/unmount:** The component is conditionally rendered (`{showExport && <ExportModal />}`), so all state is GC'd on close with no lingering listeners.

## Accessibility

| Feature | Implementation |
|---|---|
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="export-modal-title"` |
| Focus management | On mount, first focusable element receives focus via `modalRef` + `querySelector` |
| Focus trap | `keydown` listener intercepts Tab/Shift+Tab and cycles focus within `modalRef` |
| Close on Escape | Same `keydown` listener calls `onClose()` |
| Format selector | `role="radiogroup"` on the grid, `role="radio"` + `aria-checked` on each button |
| Category toggles | `aria-pressed` on each category button |
| Preview toggle | `aria-expanded` + `aria-controls="preview-table"` on the preview button |
| Live region | `aria-live="polite"` on the summary bar so screen readers announce filter changes |
| Error banner | `role="alert"` — announced immediately by screen readers |
| Table headers | `scope="col"` on all `<th>` elements |
| Backdrop | `aria-hidden="true"` so screen readers ignore it |

## Extending This Feature

**Add a new export format (e.g. Excel):**
1. Add `{ id: 'xlsx', label: 'Excel', ... }` to `FORMAT_OPTIONS`.
2. Extend `ExportFormat` type: `type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx'`.
3. Add a `buildXLSX()` async function with a dynamic import of an xlsx library.
4. Add an `else if (format === 'xlsx')` branch in `handleExport`.

**Add a new filter dimension (e.g. amount range):**
1. Add `amountMin` and `amountMax` state variables.
2. Add filter inputs in the UI (follow the date-range section pattern).
3. Add the filter condition inside the `filtered` `useMemo` callback.
4. No other changes required — `totalAmount` and the export functions consume `filtered` automatically.

## Known Limitations

- **Silent PDF column overflow:** Very long category names can still overflow the category column even with `jspdf-autotable`. A `columnStyles.maxCellWidth` or word-wrap setting would fix this.
- **No error message for download blocked by browser:** If the browser blocks the anchor click (e.g., popup blocker), the user sees no feedback.
- **Preview capped at 50 rows:** The exported file always contains the full filtered set; only the preview is limited.
- **No export progress for large datasets:** For thousands of records, PDF generation can take several seconds with only a spinner and no progress indication.
