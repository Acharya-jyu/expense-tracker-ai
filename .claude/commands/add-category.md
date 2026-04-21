You are adding a new built-in expense category to the ExpenseAI project.

Category to add: **$ARGUMENTS**

`$ARGUMENTS` may be just a name (e.g. `Health`) or a name + hex color (e.g. `Health #10b981`). Parse accordingly.

The built-in category system lives in `types/expense.ts` and requires **three entries to be added in sync**. Missing any one causes a TypeScript error or broken UI.

---

## Step 1 — Read the current category definitions

Read `types/expense.ts` in full. Note the existing entries in:
- `BUILTIN_CATEGORIES` — the `as const` array
- `CATEGORY_COLORS` — hex color map keyed by `BuiltinCategory`
- `CATEGORY_BG` — Tailwind class string map keyed by `BuiltinCategory`

Also read `components/CategoryBadge.tsx` to check for any switch/if blocks that hard-code built-in category names.

---

## Step 2 — Determine the color

If a hex color was provided in `$ARGUMENTS`, use it.

If no color was provided, pick one that:
- Does not clash with existing colors (check `CATEGORY_COLORS` first)
- Comes from a recognizable Tailwind color palette value (e.g. `#10b981` for emerald, `#06b6d4` for cyan)

Then choose a matching Tailwind badge class pair for `CATEGORY_BG` using this pattern:
`bg-[color]-100 text-[color]-700`

Example mappings for reference:
| Hex | Tailwind pair |
|---|---|
| `#f97316` | `bg-orange-100 text-orange-700` |
| `#3b82f6` | `bg-blue-100 text-blue-700` |
| `#10b981` | `bg-emerald-100 text-emerald-700` |
| `#06b6d4` | `bg-cyan-100 text-cyan-700` |
| `#f59e0b` | `bg-amber-100 text-amber-700` |
| `#14b8a6` | `bg-teal-100 text-teal-700` |
| `#84cc16` | `bg-lime-100 text-lime-700` |

---

## Step 3 — Make exactly three edits in `types/expense.ts`

1. **`BUILTIN_CATEGORIES`**: append the new category name string to the array (before the closing `] as const`).
2. **`CATEGORY_COLORS`**: add `  [Name]: '[hex]',` entry.
3. **`CATEGORY_BG`**: add `  [Name]: 'bg-[x]-100 text-[x]-700',` entry.

Preserve the existing order and formatting exactly. Do not change any other lines.

---

## Step 4 — Check `CategoryBadge.tsx`

Read the component. If it contains a `switch`, `if/else`, or object literal that maps built-in category names to styles, add an entry for the new category using the same Tailwind classes chosen in Step 2. If the component already uses `CATEGORY_BG` dynamically (e.g. `CATEGORY_BG[category]`), no change is needed there.

---

## Step 5 — Run the TypeScript check

Run:
```bash
npx tsc --noEmit
```

If there are errors, fix them before reporting done.

---

## Step 6 — Report

Print a summary:
- Category name added
- Hex color used (and whether it was provided or auto-chosen)
- Tailwind badge class used
- Files modified (list each)
- Whether `CategoryBadge.tsx` required a manual update
- TypeScript check result
