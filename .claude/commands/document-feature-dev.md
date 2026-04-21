You are writing a developer reference document for the ExpenseAI expense tracker (Next.js 14, Firebase, TypeScript).

Feature to document: **$ARGUMENTS**

---

## Step 1 — Discover the code

Search the codebase for every file relevant to the "$ARGUMENTS" feature:
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
- What state it manages and how
- What edge cases and error states exist

---

## Step 2 — Write the developer reference

Create the file `docs/dev/$ARGUMENTS.md` with this exact structure:

```markdown
# [Feature Name] — Developer Reference

> **Last updated:** [today's date]
> **Status:** Stable
> **Related user guide:** [../../docs/user/$ARGUMENTS.md](../../docs/user/$ARGUMENTS.md)

## Overview

One paragraph describing what this feature does technically and why it exists in the codebase.

## Architecture

How this feature fits into the overall app architecture. Include a text diagram using indented tree format showing parent/child component relationships and data ownership.

## Files

| File | Role |
|---|---|
| `path/to/file.tsx` | What this file does in the context of this feature |

## Types & Interfaces

Document every TypeScript type, interface, and enum used by this feature. Copy the actual definitions from the source code.

\`\`\`typescript
// paste actual type definitions here
\`\`\`

## Component API

Repeat this block for every component involved in the feature.

### `ComponentName`

**Location:** `components/ComponentName.tsx`
**Rendered by:** which parent mounts this component

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `propName` | `type` | Yes / No | What it does |

**State:**

| Variable | Type | Purpose |
|---|---|---|
| `varName` | `type` | What this piece of state tracks |

**Derived state (useMemo / useCallback):**

| Variable | Dependencies | Purpose |
|---|---|---|
| `varName` | `dep1, dep2` | What it computes and why it is memoised |

**Key behaviour:**
Describe the most important logic — async flows, filtering, side effects, etc.

## Data Flow

Numbered step-by-step description of how data moves from user interaction through to the final output (download, render, API call, etc.).

1. ...
2. ...

## External Libraries

| Library | Version | Why used | Load strategy |
|---|---|---|---|
| `lib-name` | `^x.y.z` | Reason | Static import / Dynamic import |

## localStorage Keys

| Key | Value type | What it stores |
|---|---|---|
| `key_name` | `type` | Description |

If this feature does not use localStorage, state that explicitly.

## Error States

| Scenario | How it is handled | User-visible result |
|---|---|---|
| Description of failure | Code-level handling | What the user sees |

## Performance Notes

- **Bundle impact:** Is the feature zero-cost at load time? Are any heavy libraries dynamically imported?
- **Memoisation:** List every `useMemo` / `useCallback`, what it depends on, and why it exists.
- **Re-render surface:** Which state changes cause re-renders and whether that is intentional.
- **DOM bounds:** Any lists or tables that are capped to prevent unbounded DOM growth.

## Accessibility

| Feature | Implementation detail |
|---|---|
| Dialog / region semantics | ARIA roles applied |
| Keyboard interaction | Keys handled and their effect |
| Focus management | Where focus goes on open/close |
| Live regions | Which elements use `aria-live` and why |
| Labels | How all interactive elements are labelled |

## Extending This Feature

Concrete step-by-step instructions for the most likely future additions. Be specific about which files to touch and in what order.

**Example: Adding a new [option/format/filter]:**
1. Step one
2. Step two
3. ...

## Known Limitations

Honest list of current gaps, edge cases not handled, or TODOs left in the code.
```

---

## Step 3 — Verify and report

1. Confirm `docs/dev/$ARGUMENTS.md` exists and all sections are populated.
2. Confirm the cross-reference link to `docs/user/$ARGUMENTS.md` is correct (note: that file may not exist yet — link it anyway).
3. Print a short summary listing every section written and flagging any gaps where the code did not provide enough information to fill a section completely.
