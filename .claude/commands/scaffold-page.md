You are scaffolding a new authenticated page in the ExpenseAI Next.js 14 App Router project.

Page name to scaffold: **$ARGUMENTS**

The project uses a strict two-file pattern for every route:
- `app/[name]/page.tsx` — re-exports the client component; sets `force-dynamic`
- `app/[name]/[Name]Client.tsx` — `'use client'` component; guards with `useAuth()`; shows a loading spinner while data loads

---

## Step 1 — Derive naming

From `$ARGUMENTS` (e.g. `reports` or `settings`):
- **Route segment**: lowercase, kebab-case (e.g. `reports`)
- **Component name**: PascalCase + "Page" suffix (e.g. `ReportsPage`)
- **Client filename**: PascalCase + "Client.tsx" (e.g. `ReportsClient.tsx`)
- **Page title**: Title Case, human-readable (e.g. `Reports`)

---

## Step 2 — Read the Navigation component

Read `components/Navigation.tsx` to understand the current nav links so you can add the new page in the right place.

---

## Step 3 — Create the two page files

### `app/[route]/page.tsx`

```typescript
export const dynamic = 'force-dynamic';
export { default } from './[Name]Client';
```

### `app/[route]/[Name]Client.tsx`

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function [Name]Page() {
  const { user, isLoading } = useAuth();
  const { expenses, isLoaded } = useExpenses();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/signin');
  }, [user, isLoading, router]);

  if (isLoading || !user || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">[Page Title]</h1>
        <p className="text-gray-500 text-sm mt-1">// TODO: add subtitle</p>
      </div>
      {/* TODO: add page content here */}
    </div>
  );
}
```

---

## Step 4 — Add the nav link

In `components/Navigation.tsx`, add a nav entry for the new page alongside the existing links. Follow the exact same pattern (same class names, same icon size) as the existing nav items. Pick an appropriate icon from `lucide-react` that fits the page's purpose — check what icons are already imported before adding a new one.

---

## Step 5 — Verify and report

1. Confirm both files exist at the correct paths.
2. Confirm the `useAuth` redirect guard is present in the client file.
3. Confirm the nav entry was added.
4. Print a summary:
   - Files created (with paths)
   - Nav entry added (yes/no, and the label used)
   - TODOs left for the developer to complete (content, subtitle, etc.)
