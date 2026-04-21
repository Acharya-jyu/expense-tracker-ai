You are documenting a feature in the ExpenseAI expense tracker project (Next.js 14, Firebase, TypeScript).

Feature to document: **$ARGUMENTS**

---

## Step 1 — Discover the code

Search the codebase to find every file relevant to the "$ARGUMENTS" feature:
- Components in `components/`
- Pages/routes in `app/`
- Context providers in `context/`
- Utilities in `lib/`
- Types in `types/`
- Any related configuration files

Use Grep and Read to examine each file thoroughly before writing anything. Understand:
- What the feature does end-to-end
- How data flows through it
- What props/interfaces/types it exposes
- What external libraries it uses
- What state it manages
- What edge cases and error states exist

---

## Step 2 — Generate developer documentation

Create the file `docs/dev/$ARGUMENTS.md` with this exact structure:

```markdown
# [Feature Name] — Developer Reference

> **Last updated:** [today's date]  
> **Status:** Stable  
> **Related user guide:** [../../user/$ARGUMENTS.md](../../user/$ARGUMENTS.md)

## Overview

One paragraph describing what this feature does technically and why it exists.

## Architecture

How this feature fits into the overall app architecture. Include a text diagram if helpful (use indented tree format).

## Files

| File | Role |
|---|---|
| `path/to/file.tsx` | What this file does in the context of this feature |

## Types & Interfaces

Document every TypeScript type, interface, and enum used by this feature. Copy the actual type definitions from the code.

```typescript
// paste actual type definitions here
```

## Component API

For each component involved:

### `ComponentName`

**Location:** `components/ComponentName.tsx`  
**Rendered by:** which parent mounts it

| Prop | Type | Required | Description |
|---|---|---|---|
| `propName` | `type` | Yes/No | What it does |

**State:**
List each `useState` / `useReducer` variable, its type, and what it tracks.

**Key behaviour:**
Describe the most important logic — filtering, async flows, derived state, etc.

## Data Flow

Step-by-step description of how data moves from user interaction to output. Use numbered steps.

## External Libraries

| Library | Version | Why used | Import pattern |
|---|---|---|---|

## localStorage Keys

List any localStorage keys this feature reads or writes, and what they store.

## Error States

| Scenario | How it is handled | User-visible result |
|---|---|---|

## Performance Notes

- Bundle impact (are heavy libraries dynamically imported?)
- Any memoization used (`useMemo`, `useCallback`) and why
- Re-render considerations

## Accessibility

List ARIA roles, attributes, keyboard interactions, and focus management implemented.

## Extending This Feature

Concrete instructions for the most likely future changes:
- How to add a new export format / filter / option
- What to change and where

## Known Limitations

Honest list of current gaps, TODOs, or edge cases not yet handled.
```

---

## Step 3 — Generate user documentation

Create the file `docs/user/$ARGUMENTS.md` with this exact structure:

```markdown
# How to [Feature Name in plain English]

> **Related technical reference:** [../../dev/$ARGUMENTS.md](../../dev/$ARGUMENTS.md)

## What is this?

One or two sentences explaining what this feature does and why it is useful. Write for someone who is not technical.

## Before you start

List any prerequisites (e.g. "You must be signed in", "You need at least one expense recorded").

## How to use it

### Step 1 — [Action verb + what to do]

Plain English description of this step.

![Screenshot placeholder: [describe exactly what should be visible in this screenshot]](screenshots/$ARGUMENTS-step-1.png)

### Step 2 — [Action verb + what to do]

Plain English description of this step.

![Screenshot placeholder: [describe exactly what should be visible in this screenshot]](screenshots/$ARGUMENTS-step-2.png)

### Step 3 — [Continue for as many steps as needed]

...

## Options explained

If the feature has settings, filters, or format choices, explain each one in plain language.

| Option | What it does |
|---|---|
| Option name | Plain English explanation |

## Tips

- Practical tip 1
- Practical tip 2

## Troubleshooting

**Problem:** Describe a common issue a user might hit.  
**Solution:** How to fix it.

**Problem:** Another common issue.  
**Solution:** How to fix it.

## Frequently asked questions

**Q: A question a user might ask?**  
A: The answer.
```

---

## Step 4 — Verify and report

After writing both files:

1. Confirm both files exist at the correct paths.
2. Check that all cross-reference links between the two files are correct.
3. Print a short summary:
   - `docs/dev/$ARGUMENTS.md` — list the sections written
   - `docs/user/$ARGUMENTS.md` — list the sections written and count the screenshot placeholders
   - Any gaps you could not fill because the code did not provide enough information
