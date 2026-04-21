You are auditing a component in the ExpenseAI project (Next.js 14, Firebase, TypeScript) for quality issues across five dimensions: TypeScript safety, error handling, accessibility, mobile responsiveness, and performance.

Component to audit: **$ARGUMENTS**

---

## Step 1 — Locate and read the component

Search `components/` and `app/` for a file matching `$ARGUMENTS` (case-insensitive, with or without `.tsx`). Read the full file. Also read any direct child components it renders if they are small enough to be relevant.

---

## Step 2 — Audit across five dimensions

### Dimension 1 — TypeScript Safety

Check for:
- Props typed with an explicit interface or type (not inlined `any`)
- No `as any` or `// @ts-ignore` suppressions
- All `useState` variables have explicit generic types where the initial value is `null`, `[]`, or `{}`
- Event handlers typed correctly (`React.ChangeEvent<HTMLInputElement>`, etc.)
- No unguarded access on potentially undefined/null values

### Dimension 2 — Error Handling

Check for:
- All `async` operations (Firestore calls, dynamic imports, fetch) are wrapped in try/catch
- User-visible error states: is there a UI element that shows the error to the user?
- Errors are not swallowed silently (empty catch blocks)
- Loading states: is there a spinner or skeleton while async work is in progress?
- Empty states: is there a message or CTA when the data set is empty?
- Optimistic updates: if the component mutates data, does it roll back on failure?

### Dimension 3 — Accessibility

Check for:
- Interactive elements are `<button>` or `<a>`, not `<div onClick>`
- All `<button>` and `<input>` elements have accessible labels (`aria-label`, `title`, or visible text)
- Modal/dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape key closes it
- Form inputs: `<label>` paired with inputs via `htmlFor` / `id`, or `aria-label`
- Error messages: `role="alert"` so screen readers announce them immediately
- Icon-only buttons: have `aria-label` or `title`
- Lists rendered as `<ul>`/`<li>` where appropriate
- Color is not the sole means of conveying information

### Dimension 4 — Mobile Responsiveness

Check for:
- Fixed pixel widths that would overflow on small screens
- Grid/flex layouts that collapse correctly on mobile (look for `md:` breakpoints)
- Table-like layouts: do they use a card pattern on mobile instead of overflowing?
- Touch targets: interactive elements should be at least 44×44 px (check padding — `p-1` alone is too small)
- Horizontal scroll risk: any `flex` row without `flex-wrap` or `overflow-x-auto`
- Text truncation (`truncate`) on long strings that could overflow

### Dimension 5 — Performance

Check for:
- Expensive computations inside render (array filters, sorts, reduces) that are not memoised with `useMemo`
- Callbacks passed as props that are not wrapped in `useCallback` (causes unnecessary child re-renders)
- Heavy libraries (e.g. jsPDF, chart libs) imported statically instead of dynamically
- Lists without a `key` prop, or `key={index}` on reorderable lists
- Effects with missing or overly-broad dependency arrays

---

## Step 3 — Write the audit report

For each dimension, use this format:

### [Dimension Name]

**Status:** ✅ No issues / ⚠️ Minor issues / ❌ Critical issues

For each issue found:
> **Issue:** One sentence describing the problem.
> **Location:** `ComponentName.tsx:line_number`
> **Fix:** Concrete one- or two-sentence description of what to change.

If a dimension has no issues, write "No issues found."

---

## Step 4 — Summary table

Print a final table:

| Dimension | Status | Issue count |
|---|---|---|
| TypeScript Safety | ✅/⚠️/❌ | N |
| Error Handling | ✅/⚠️/❌ | N |
| Accessibility | ✅/⚠️/❌ | N |
| Mobile Responsiveness | ✅/⚠️/❌ | N |
| Performance | ✅/⚠️/❌ | N |

Then list the top 1–3 issues to fix first, in priority order, with the file and line number for each.
