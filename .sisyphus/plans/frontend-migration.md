# Frontend Migration Plan — Budget Tracker

## Overview

Complete frontend overhaul of `/home/sujal/practice/Budget_calulation/frontend`.
React 18 + Vite 5 + JSX (not TypeScript).

### What Changes

| From | To |
|---|---|
| Tailwind CSS v3 (`tailwindcss@^3.4.0`) | Tailwind CSS v4 (CSS-first, `@tailwindcss/vite`) |
| No UI library | shadcn/ui components |
| Hardcoded Tailwind colors | shadcn CSS variable classes |
| react-router-dom v6 | TanStack Router (file-based) |
| Manual useEffect+axios | TanStack Query |
| ESLint + no Prettier | Biome |
| ThemeContext (React Context) | Zustand store |
| react-hot-toast | sonner (shadcn toast) |
| react-icons | lucide-react |

### What Stays

- React 18, Vite 5, Zustand 5 (authStore)
- `src/services/api.js` (axios instance + all API wrappers)
- `src/services/auth.js` (auth service)
- Auth flow (Google OAuth + session-based, `X-Session-Id` header)
- Recharts (restyled only)
- vite-plugin-pwa
- `src/utils/currency.js`, `src/constants/categories.js`
- date-fns

### Key Constraints

- **NEVER hardcode CSS colors** — always use shadcn CSS variable classes
- **JSX only** — no TypeScript, strip types from all shadcn components
- **Professional finance minimal** color scheme (slate blues, muted tones)
- **Two unavoidable big-bang moments**: Tailwind v4 upgrade + routing cutover

---

## Phase 0: Biome Setup

**Goal**: Replace ESLint with Biome. Zero coupling to other changes.
**Risk**: None. Fully independent.

### Steps

1. Uninstall ESLint packages:
   - `eslint` (devDep in `package.json` line 28)
   - `eslint-plugin-react` (line 29)
   - `eslint-plugin-react-hooks` (line 30)
   - `eslint-plugin-react-refresh` (line 31)
2. Uninstall dead TypeScript type packages:
   - `@types/react` (devDep line 24)
   - `@types/react-dom` (line 25)
3. Install `@biomejs/biome` as exact devDependency
4. Create `frontend/biome.json`:
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
     "organizeImports": { "enabled": true },
     "linter": {
       "enabled": true,
       "domains": { "react": "recommended" },
       "rules": {
         "correctness": { "useExhaustiveDependencies": "warn" }
       }
     },
     "formatter": {
       "enabled": true,
       "indentStyle": "space",
       "indentWidth": 2,
       "lineWidth": 100
     },
     "javascript": {
       "formatter": {
         "quoteStyle": "single",
         "trailingCommas": "es5"
       },
       "jsxRuntime": "reactClassic"
     }
   }
   ```
5. Update `package.json` scripts:
   - `"lint": "biome check src/"` (replaces old ESLint command)
   - `"format": "biome format --write src/"`
   - `"check": "biome check --write src/"`
   - `"check:ci": "biome check src/"`
6. Run `npx biome check --write src/` to auto-format entire codebase
7. Verify: `npx biome check src/` exits 0
8. Verify: `npm run build` succeeds

---

## Phase 1: Tailwind CSS v4 + CSS Variables + shadcn Foundation (BIG BANG #1)

**Goal**: Upgrade Tailwind v3 to v4, set up shadcn CSS variable system, install shadcn/ui components.
**Risk**: HIGH — class renames affect all 19 JSX files simultaneously.

### Sub-phase 1A: Package & Config Changes

**Files modified**: `package.json`, `vite.config.js`
**Files created**: `jsconfig.json`, `src/lib/utils.js`
**Files deleted**: `tailwind.config.js` (146 lines), `postcss.config.js`

1. Uninstall old packages:
   - `tailwindcss` (devDep, v3 — `package.json` line 33)
   - `postcss` (devDep — line 32)
   - `autoprefixer` (devDep — line 27)
2. Install new packages (dependencies):
   - `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
3. Install new packages (devDependencies):
   - `tailwindcss@latest` (v4), `@tailwindcss/vite`, `tw-animate-css`
4. Delete `frontend/tailwind.config.js`
5. Delete `frontend/postcss.config.js`
6. Create `frontend/jsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": { "@/*": ["./src/*"] }
     }
   }
   ```
7. Rewrite `frontend/vite.config.js`:
   - Add imports: `import tailwindcss from '@tailwindcss/vite'`, `import path from 'path'`, and `import { fileURLToPath } from 'url'`
   - Add `tailwindcss()` to plugins array BEFORE `react()`
   - Add ESM-safe path alias (NOTE: `__dirname` is undefined in ESM — must use `import.meta.url`):
     ```js
     const __dirname = path.dirname(fileURLToPath(import.meta.url));
     // ...
     resolve: { alias: { '@': path.resolve(__dirname, './src') } }
     ```
   - Keep VitePWA config as-is
   - Keep server proxy config as-is
   - Keep build config but update `manualChunks` later (Phase 4)
8. Create `frontend/src/lib/utils.js`:
   ```js
   import { clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs) {
     return twMerge(clsx(inputs));
   }
   ```

### Sub-phase 1B: CSS Rewrite

**File**: `src/index.css` (currently 487 lines — will be completely rewritten)

1. Replace entire `src/index.css` with:
   - `@import "tailwindcss";`
   - `@import "tw-animate-css";`
   - `:root { }` block with professional finance oklch color scheme (light mode) — all shadcn CSS variables:
     - `--background`, `--foreground`, `--card`, `--card-foreground`
     - `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`
     - `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`
     - `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`
     - `--border`, `--input`, `--ring`
     - `--chart-1` through `--chart-5`
     - `--sidebar-*` variants
     - `--radius: 0.5rem`
   - `.dark { }` block with dark mode values
   - `@theme inline { }` block mapping CSS variables to Tailwind tokens
   - Keep essential custom keyframes: `shimmer`, `gradient-shift`, `countUp`
   - Remove ALL custom component classes (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-outline`, `.input`, `.input-error`, `.label`, `.card`, `.card-interactive`, `.badge`, `.badge-income`, `.badge-expense`, `.badge-personal`, `.badge-business`, `.page-container`, `.skeleton`, `.hover-lift`, `.glass`, `.glass-card`, `.glass-morphism`, `.neomorph`, `.neomorph-dark`, `.neomorph-inset`, `.gradient-primary`, `.gradient-ocean`, `.gradient-sunset`, `.gradient-mint`, `.gradient-purple`, `.gradient-animate`, `.particles-bg`, `.gradient-border`, `.gradient-text`, `.card-hover-glow`, `.pulse-dot`, `.tooltip`, `.btn-shine`, `.skeleton-shimmer`, `.flip-card`, `.glow-effect`, `.ripple`, `.table-row-hover`)
2. Verify dark mode works with existing `document.documentElement.classList.add('dark')` pattern from `ThemeContext.jsx` (line ~20)

### Sub-phase 1C: Component Class Updates

**Files**: All 19 JSX files in `src/pages/` and `src/components/`

Replace hardcoded Tailwind color classes with shadcn CSS variable classes across ALL components:

| Old Class | New Class | Notes |
|---|---|---|
| `bg-gray-50`, `bg-gray-100` | `bg-background` | Main background |
| `bg-white` | `bg-card` | Card/container backgrounds |
| `bg-gray-800`, `bg-gray-900` (dark variants) | remove `dark:` prefix | CSS variables handle it |
| `text-gray-900`, `text-gray-800` | `text-foreground` | Primary text |
| `text-gray-600`, `text-gray-500` | `text-muted-foreground` | Secondary text |
| `text-gray-300`, `text-gray-400` | `text-muted-foreground` | Subtle text |
| `border-gray-200`, `border-gray-300` | `border-border` | Borders |
| `bg-indigo-600`, `bg-primary-600` | `bg-primary` | Primary actions |
| `text-indigo-600`, `text-primary-600` | `text-primary` | Primary text |
| `bg-red-500`, `bg-danger-500` | `bg-destructive` | Destructive actions |
| `text-red-600`, `text-danger-600` | `text-destructive` | Error text |
| `hover:bg-gray-100` | `hover:bg-accent` | Hover states |
| `focus:ring-indigo-500` | `focus:ring-ring` | Focus rings |
| ALL `dark:*` color classes | remove entirely | CSS variables auto-switch |

Also handle Tailwind v4 class renames:
- `shadow` → `shadow-sm` (bare shadow renamed)
- `rounded` → `rounded-sm` (bare rounded renamed)  
- `ring` → `ring-3` (bare ring renamed)
- `outline-none` → `outline-hidden`

Remove references to custom classes from `index.css` that no longer exist:
- `.btn`, `.btn-primary`, etc. → replace with inline Tailwind or shadcn Button
- `.input` → replace with shadcn Input
- `.card` → replace with shadcn Card
- `.badge-income`, `.badge-expense` → replace with shadcn Badge + variant

**Specific files and their custom class usage** (must all be updated):
- `src/App.jsx` line 25: `bg-gray-50 dark:bg-gray-900` → `bg-background`
- `src/components/Layout.jsx`: heavy use of `bg-gray-*`, `dark:bg-gray-*`, custom nav classes
- `src/pages/Dashboard.jsx`: `.card`, `.badge-*`, `bg-white dark:bg-gray-800`
- `src/pages/Transactions.jsx`: `.btn-primary`, `.input`, `.card`, `.table-row-hover`, `.badge-*`
- `src/pages/Landing.jsx`: `.gradient-*`, `.glass-*`, `.neomorph`, `.particles-bg`, `.glow-effect`
- All other pages: mix of hardcoded gray/indigo colors + custom component classes

### Sub-phase 1D: shadcn/ui Init + Components

**Prerequisite**: Sub-phases 1A, 1B, 1C must be complete (Tailwind v4 working, CSS variables defined, path aliases configured).

1. Run `npx shadcn@latest init` with options:
   - Style: default
   - Base color: slate
   - CSS variables: yes
   - Path alias: `@/`
   - Components path: `src/components/ui`
   - Hooks path: `src/hooks`
   - Lib path: `src/lib`
2. Verify/update `frontend/components.json` (should be auto-created)
3. Add shadcn components one by one (each needs TypeScript type stripping for JSX):
   - **Core**: `npx shadcn@latest add button card dialog input select table badge skeleton separator avatar`
   - **Navigation**: `npx shadcn@latest add sidebar sheet dropdown-menu`
   - **Form**: `npx shadcn@latest add form label textarea checkbox switch tabs toggle`
   - **Feedback**: `npx shadcn@latest add alert tooltip popover sonner`
4. For EACH added component file in `src/components/ui/*.tsx`:
   - Rename `.tsx` → `.jsx`
   - Remove all `interface` declarations
   - Remove all `: TypeName` annotations from params
   - Remove all `React.forwardRef<HTMLElement, Props>` generic params → `React.forwardRef(({...props}, ref) => ...)`
   - Remove all `import type` statements
   - Remove all `as const satisfies` patterns
   - Remove `VariantProps<typeof xVariants>` type intersections
5. Install `sonner` package (required by shadcn sonner component)

### Verification (Phase 1 complete)

```bash
# Build succeeds
npm run build

# Old Tailwind directives removed
grep -r "@tailwind" src/
# Expected: 0 results

# New CSS imports present
grep "@import" src/index.css
# Expected: "tailwindcss" and "tw-animate-css"

# Utils file exists
ls src/lib/utils.js
# Expected: exists

# shadcn components directory populated
ls src/components/ui/
# Expected: button.jsx, card.jsx, dialog.jsx, input.jsx, etc.

# No TypeScript syntax in JSX files
grep -r "interface \|: React\.\|: string\|: number\|: boolean" src/components/ui/*.jsx
# Expected: 0 results (no TS types)

# CSS variables defined
grep "^  --background:" src/index.css
# Expected: 1 result in :root block

# jsconfig.json exists
ls jsconfig.json
# Expected: exists

# Old config files deleted
ls tailwind.config.js postcss.config.js 2>&1
# Expected: "No such file"
```

---

## Phase 2: ThemeContext to Zustand + Shared Component Rewrites + Toast Migration

**Goal**: Migrate dark mode to Zustand, rewrite shared components with shadcn, migrate toasts.
**Risk**: LOW-MEDIUM. ThemeContext has only 3 consumers. Toast migration is find-and-replace.

### Sub-phase 2A: Theme Store

**Files modified**: `src/components/Layout.jsx`, `src/pages/Settings.jsx`, `src/App.jsx`
**Files created**: `src/stores/themeStore.js`
**Files deleted**: `src/context/ThemeContext.jsx`

1. Create `src/stores/themeStore.js`:
   - Follow pattern from `src/stores/authStore.js` (uses Zustand 5 `create`)
   - Use `persist` middleware with `localStorage` key `'theme-storage'`
   - State: `{ theme: 'system' | 'light' | 'dark', resolvedTheme: 'light' | 'dark' }`
   - Actions: `setTheme(theme)`, `toggleTheme()`
   - On hydration + change: apply `document.documentElement.classList.add/remove('dark')` logic
   - Respect `window.matchMedia('(prefers-color-scheme: dark)')` for system theme
2. Update `src/components/Layout.jsx`: replace `useTheme()` from ThemeContext with `useThemeStore()`
3. Update `src/pages/Settings.jsx`: replace `useTheme()` with `useThemeStore()`
4. Update `src/App.jsx`: remove `import { ThemeProvider } from './context/ThemeContext'` and remove `<ThemeProvider>` wrapper
5. Delete `src/context/ThemeContext.jsx`

### Sub-phase 2B: Shared Component Rewrites

**Files modified**: All files in `src/components/`

1. `Modal.jsx` → rewrite internals using shadcn Dialog (`src/components/ui/dialog.jsx`). Keep the same prop API (`isOpen`, `onClose`, `title`, `children`) so consuming pages don't break. Internally use `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, `<DialogTitle>`.
2. `Spinner.jsx` → replace with a simple component using shadcn Skeleton or lucide-react Loader2 icon with `animate-spin`
3. `SkeletonLoader.jsx` → rewrite using shadcn `<Skeleton>` component
4. `QuickAddTransaction.jsx` → rewrite with shadcn Dialog + shadcn Form components (Input, Select, Button). Keep same functionality (FAB button → opens form → submits transaction).
5. `OfflineBanner.jsx` → restyle with shadcn Alert component + CSS variable colors. Keep same offline detection logic.
6. `PWAInstallPrompt.jsx` → restyle with shadcn Button + Card. Keep same install prompt logic.
7. `ErrorBoundary.jsx` → restyle + **fix bug**: line 41 `window.location.href = '/dashboard'` must become `window.location.href = '/app/dashboard'`
8. `Layout.jsx` → rewrite with shadcn Sidebar component + shadcn navigation. **Keep react-router-dom imports** (`NavLink`, `Outlet`, `useNavigate`) for now — they will be replaced in Phase 4. Layout MUST render `<Outlet />` (for page content) and `<QuickAddTransaction />` (FAB) internally. The `_authenticated.jsx` route component renders `<Layout />` with NO children — Layout owns the Outlet and FAB.

### Sub-phase 2C: Toast Migration

**Files modified**: Every file importing `react-hot-toast` (search: `grep -r "react-hot-toast" src/`)

Sonner API differences from react-hot-toast:
- `toast.success('msg')` → `toast.success('msg')` (same API, mostly compatible)
- `toast.error('msg')` → `toast.error('msg')` (same)
- `toast('msg')` → `toast('msg')` (same)
- `toast.loading('msg')` → `toast.loading('msg')` (same)
- `<Toaster>` component is different — import from `sonner` or from `src/components/ui/sonner.jsx`

1. Find all files: `grep -rn "from 'react-hot-toast'" src/`
2. Replace imports: `import toast from 'react-hot-toast'` → `import { toast } from 'sonner'`
3. In `src/App.jsx`: replace `import { Toaster } from 'react-hot-toast'` with `import { Toaster } from '@/components/ui/sonner'`
4. Remove `<Toaster>` props (sonner has different options — use shadcn's default config)
5. Update all toast calls if any use react-hot-toast-specific API (e.g., `toast.custom()`)
6. Uninstall `react-hot-toast` from dependencies

### Verification (Phase 2 complete)

```bash
npm run build

# ThemeContext fully removed
grep -r "ThemeContext\|ThemeProvider\|from.*context/Theme" src/
# Expected: 0 results

# Theme store exists
ls src/stores/themeStore.js
# Expected: exists

# Toast migration complete
grep -r "react-hot-toast" src/
# Expected: 0 results

# ErrorBoundary bug fixed
grep "'/dashboard'" src/components/ErrorBoundary.jsx
# Expected: 0 results (should be '/app/dashboard')

# react-hot-toast removed from deps
grep "react-hot-toast" package.json
# Expected: 0 results
```

---

## Phase 3: TanStack Query Adoption (Incremental)

**Goal**: Replace all manual useEffect+axios data fetching with TanStack Query. Can be done page-by-page.
**Risk**: LOW. TanStack Query works alongside react-router-dom. Each page migration is independent.

### Sub-phase 3A: Setup

**Files modified**: `package.json`, `src/App.jsx`
**Files created**: `src/lib/queryClient.js`, `src/hooks/queries/` directory

1. Install: `@tanstack/react-query`, `@tanstack/react-query-devtools`
2. Create `src/lib/queryClient.js`:
   ```js
   import { QueryClient } from '@tanstack/react-query';

   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60 * 5, // 5 minutes
         retry: 1,
         refetchOnWindowFocus: false,
       },
     },
   });
   ```
3. Update `src/App.jsx`: wrap content with `<QueryClientProvider client={queryClient}>` (inside existing `<ErrorBoundary>`, outside `<Router>`)
4. Create directory: `src/hooks/queries/`

### Sub-phase 3B: Create Query Hooks

**Files created**: 7 files in `src/hooks/queries/`

Each hook file exports `queryOptions()` configs + mutation hooks wrapping existing `src/services/api.js` functions.

1. `src/hooks/queries/useDashboardQueries.js`:
   - Wraps: `dashboardAPI.getSummary(params)`, `dashboardAPI.getCategoryBreakdown(params)`, `dashboardAPI.getMonthlyTrend()`, `dashboardAPI.getBankSummary()`, `dashboardAPI.getRecentTransactions(limit)`, `dashboardAPI.getPaymentMethodBreakdown(params)`
   - Note: `getSummary`, `getCategoryBreakdown`, `getPaymentMethodBreakdown` take a `params` object (e.g., `{ month, year }`), NOT positional args
   - Query keys: `['dashboard', 'summary', params]`, etc.

2. `src/hooks/queries/useTransactionQueries.js`:
   - Wraps: `transactionsAPI.getAll(params)`, `transactionsAPI.getOne(id)`, `transactionsAPI.create(data)`, `transactionsAPI.update(id, data)`, `transactionsAPI.delete(id)`, `transactionsAPI.bulkDelete(ids)`, `transactionsAPI.importCSV(formData)`
   - Note: method is `getOne` NOT `getById`
   - Query keys: `['transactions', params]`, `['transactions', id]`
   - Mutations: invalidate `['transactions']` and `['dashboard']` on success

3. `src/hooks/queries/useBankAccountQueries.js`:
   - Wraps: `bankAccountsAPI.getAll()`, `bankAccountsAPI.getOne(id)`, `bankAccountsAPI.create(data)`, `bankAccountsAPI.update(id, data)`, `bankAccountsAPI.delete(id)`, `bankAccountsAPI.getTransactions(id)`
   - Note: method is `getOne` NOT `getById`; also has `getTransactions(id)` for per-account transactions
   - Query keys: `['bankAccounts']`, `['bankAccounts', id]`, `['bankAccounts', id, 'transactions']`
   - Mutations: invalidate `['bankAccounts']` and `['dashboard']` on success

4. `src/hooks/queries/useDailyNotesQueries.js`:
   - Wraps: `dailyNotesAPI.getAll(params)`, `dailyNotesAPI.getByDate(date)`, `dailyNotesAPI.create(data)`, `dailyNotesAPI.delete(date)`, `dailyNotesAPI.getBurnRate(params)`
   - Query keys: `['dailyNotes', params]`, `['dailyNotes', date]`, `['dailyNotes', 'burnRate', params]`

5. `src/hooks/queries/useRecurringQueries.js`:
   - Wraps: `recurringAPI.getAll(params)`, `recurringAPI.getById(id)`, `recurringAPI.create(data)`, `recurringAPI.update(id, data)`, `recurringAPI.delete(id)`, `recurringAPI.pause(id)`, `recurringAPI.resume(id)`, `recurringAPI.detect()`, `recurringAPI.approvePattern(pattern)`, `recurringAPI.getUpcoming(days)`, `recurringAPI.generateNow(id)`, `recurringAPI.getHistory(id)`, `recurringAPI.batchApprove(patterns)`, `recurringAPI.batchDelete(ids)`
   - Note: recurring uses `getById` (unlike bank accounts/transactions which use `getOne`)
   - Query keys: `['recurring', params]`, `['recurring', id]`, `['recurring', 'detect']`, `['recurring', 'upcoming']`

6. `src/hooks/queries/useReportQueries.js`:
   - Wraps: `exportAPI.transactionsCSV(params)`, `exportAPI.reportPDF(params)` + dashboard queries reused for report data
   - Note: export functions return blobs (responseType: 'blob') — use mutations for downloads, not queries
   - Query keys: `['reports', params]`

7. `src/hooks/queries/useAuthQueries.js`:
   - Wraps: `authService.getSession()` (from `src/services/auth.js`, NOT `authAPI`), `authAPI.updateProfile(data)` (from `src/services/api.js`), `authAPI.getCurrentUser()` (from `src/services/api.js`)
   - Note: `getSession` is on `authService` (uses raw fetch), NOT on `authAPI` (which uses axios). `authAPI` has `updateProfile` and `getCurrentUser` only. There is NO `updatePreferences` method — preferences are updated via `updateProfile`.
   - Query keys: `['auth', 'session']`, `['auth', 'user']`
   - Note: Keep existing `authStore` Zustand store for auth state — TQ only for data fetching

### Sub-phase 3C: Migrate Pages (one at a time)

Each page: remove `useState` for data + `useEffect` for fetching + loading/error local state → replace with `useQuery`/`useSuspenseQuery` + `useMutation`.

**Migration order** (simplest to most complex):

1. **Landing.jsx** — No data fetching. Skip.
2. **Login.jsx** — Minimal data fetching (just redirect logic). Skip or minimal.
3. **AuthCallback.jsx** — Keep existing flow. Do NOT migrate to TQ.
4. **Settings.jsx** — Simple: fetch user preferences, mutation for update.
5. **BankAccounts.jsx** — Moderate: fetch list + CRUD mutations.
6. **DailyNotes.jsx** — Moderate: fetch by date + CRUD.
7. **Reports.jsx** — Moderate: fetch report data by month/year.
8. **RecurringTransactions.jsx** — Moderate: fetch list + patterns + CRUD.
9. **Dashboard.jsx** — Complex: 4-6 parallel queries for summary, trends, breakdowns.
10. **Transactions.jsx** — Most complex: filtered list + CRUD + bulk operations + CSV import.

**Per-page migration pattern**:
```diff
- const [data, setData] = useState(null);
- const [loading, setLoading] = useState(true);
- const [error, setError] = useState(null);
-
- useEffect(() => {
-   const fetchData = async () => {
-     try {
-       setLoading(true);
-       const response = await someAPI.getAll();
-       setData(response.data);
-     } catch (err) {
-       setError(err.message);
-     } finally {
-       setLoading(false);
-     }
-   };
-   fetchData();
- }, [deps]);

+ const { data, isLoading, error } = useQuery(someQueryOptions(deps));
```

For mutations:
```diff
- const handleCreate = async (formData) => {
-   try {
-     await someAPI.create(formData);
-     toast.success('Created!');
-     fetchData(); // re-fetch
-   } catch (err) {
-     toast.error(err.message);
-   }
- };

+ const createMutation = useMutation({
+   mutationFn: (formData) => someAPI.create(formData),
+   onSuccess: () => {
+     queryClient.invalidateQueries({ queryKey: ['someKey'] });
+     toast.success('Created!');
+   },
+   onError: (err) => toast.error(err.message),
+ });
```

### Verification (Phase 3 complete)

```bash
npm run build

# Query hooks exist
ls src/hooks/queries/
# Expected: 7 files (useDashboardQueries.js, etc.)

# QueryClient configured
ls src/lib/queryClient.js
# Expected: exists

# No raw useEffect data fetching in migrated pages
# (Check each page — some useEffects for non-data purposes are OK)
grep -n "useEffect" src/pages/Dashboard.jsx
# Expected: 0 or only non-data useEffects

grep -n "useEffect" src/pages/Transactions.jsx
# Expected: 0 or only non-data useEffects

# TanStack Query devtools in dev
grep "ReactQueryDevtools" src/App.jsx
# Expected: 1 result
```

---

## Phase 4: TanStack Router Migration (BIG BANG #2)

**Goal**: Replace react-router-dom with TanStack Router file-based routing. ATOMIC — cannot be done incrementally.
**Risk**: HIGH. Router cutover affects all navigation + auth flow.

### Sub-phase 4A: Install + Configure

**Files modified**: `package.json`, `vite.config.js`

1. Install: `@tanstack/react-router`, `@tanstack/react-router-devtools`, `@tanstack/router-plugin`
2. Update `frontend/vite.config.js` plugins array:
   ```js
   import { tanstackRouter } from '@tanstack/router-plugin/vite';
   // ...
   plugins: [
     tanstackRouter({
       target: 'react',
       autoCodeSplitting: true,
       disableTypes: true,
     }),
     tailwindcss(),
     react(),
     VitePWA({...}),
   ]
   ```
   Note: The export is `tanstackRouter` (camelCase), NOT `TanStackRouterVite`. Must be FIRST in plugins (before tailwindcss and react).
3. Update `manualChunks` in build config:
   ```js
   manualChunks: {
     vendor: ['react', 'react-dom'],
     router: ['@tanstack/react-router'],
     query: ['@tanstack/react-query'],
   }
   ```

### Sub-phase 4B: Create Route Tree

**Directory**: `src/routes/` (new)

**File-based route structure**:
```
src/routes/
  __root.jsx                    # Root layout (ErrorBoundary, Toaster, Outlet)
  index.jsx                     # Landing page (public) — "/"
  login.jsx                     # Login page (public) — "/login"
  auth/
    callback.jsx                # OAuth callback — "/auth/callback"
  _authenticated.jsx            # Pathless layout with beforeLoad auth guard
  _authenticated/
    index.jsx                   # Redirect to dashboard
    dashboard.jsx               # "/dashboard" (was "/app/dashboard")
    transactions.jsx            # "/transactions" (was "/app/transactions")
    bank-accounts.jsx           # "/bank-accounts" (was "/app/bank-accounts")
    daily-notes.jsx             # "/daily-notes" (was "/app/daily-notes")
    recurring.jsx               # "/recurring" (was "/app/recurring")
    reports.jsx                 # "/reports" (was "/app/reports")
    settings.jsx                # "/settings" (was "/app/settings")
```

**CRITICAL URL CHANGE**: Routes move from `/app/dashboard` to `/dashboard`, `/app/transactions` to `/transactions`, etc. This means:
- `window.location.href = '/app/dashboard'` → `'/dashboard'` (ErrorBoundary, any hardcoded URLs)
- `useNavigate()('/app/dashboard')` → `navigate({ to: '/dashboard' })`
- Backend OAuth redirect callback URL stays the same (`/auth/callback`)

**Wait — DECISION POINT**: Should we keep `/app/*` prefix or flatten to `/*`?

**Recommendation**: Flatten to `/*` (cleaner URLs). But this means:
- `vercel.json` rewrites still work (SPA fallback catches all)
- `useAuth.js` pathname check: `window.location.pathname === '/auth/callback'` — STILL WORKS
- Backend doesn't care about frontend routes (only `/api/*` matters)

**Route implementations**:

1. **`__root.jsx`**:
   ```jsx
   import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
   import { Toaster } from '@/components/ui/sonner';
   import ErrorBoundary from '@/components/ErrorBoundary';
   import OfflineBanner from '@/components/OfflineBanner';
   import PWAInstallPrompt from '@/components/PWAInstallPrompt';

   export const Route = createRootRouteWithContext()({
     component: function RootComponent() {
       return (
         <ErrorBoundary>
           <div className="min-h-screen bg-background text-foreground">
             <OfflineBanner />
             <PWAInstallPrompt />
             <Toaster />
             <Outlet />
           </div>
         </ErrorBoundary>
       );
     },
   });
   ```

2. **`_authenticated.jsx`** (replaces `PrivateRoute.jsx`):

   **IMPORTANT**: `useAuthStore` is a NAMED export from `src/stores/authStore.js`. The store has NO `initializeAuth` action. Auth initialization lives in the `useAuth` hook (`src/hooks/useAuth.js`) which uses module-level flags (`authInitialized`, `authInitializing`) and calls `authService.getSession()` from `src/services/auth.js`.

   For the `beforeLoad` guard, we check the Zustand store directly (non-hook access via `.getState()`) and if no user is found, try fetching the session (same as `useAuth`'s `initAuth` logic):

   ```jsx
   import { createFileRoute, redirect } from '@tanstack/react-router';
   import Layout from '@/components/Layout';

   export const Route = createFileRoute('/_authenticated')({
     beforeLoad: async () => {
       const { useAuthStore } = await import('@/stores/authStore');
       const { authService } = await import('@/services/auth');
       const state = useAuthStore.getState();

       // If already authenticated (e.g., persisted from localStorage), allow
       if (state.isAuthenticated && state.user) {
         return;
       }

       // Try to fetch session (mirrors useAuth.js initAuth logic)
       try {
         const sessionData = await authService.getSession();
         if (sessionData && sessionData.user) {
           state.setSession(sessionData);
           return;
         }
       } catch (err) {
         // Session fetch failed — not authenticated
       }

       // Not authenticated — redirect to login
       throw redirect({ to: '/login' });
     },
      component: function AuthenticatedLayout() {
        return <Layout />;
      },
    });
    ```

    **NOTE**: `Layout.jsx` already renders `<Outlet />` internally (from TanStack Router) and includes `<QuickAddTransaction />`. Do NOT render `<Outlet />` or `<QuickAddTransaction />` here — that would cause double-rendering. This component is just a wrapper that triggers Layout.

3. **`auth/callback.jsx`** (CRITICAL — must preserve exact auth flow):
   ```jsx
   import { createFileRoute } from '@tanstack/react-router';
   // ... component logic copied from src/pages/AuthCallback.jsx

   export const Route = createFileRoute('/auth/callback')({
     validateSearch: (search) => ({
       success: search.success === 'true' || search.success === true,
       error: search.error || '',
       sid: search.sid || '',
     }),
     component: AuthCallbackComponent,
   });

   function AuthCallbackComponent() {
     const { success, error, sid } = Route.useSearch();
     // REST OF AuthCallback.jsx logic EXACTLY as-is
     // MUST preserve:
     // - markAuthInitialized() call
     // - 500ms delay (await new Promise(resolve => setTimeout(resolve, 500)))
     // - sessionId stored in localStorage
     // - Redirect to /dashboard on success
     // - useRef(hasRun) to prevent double execution in StrictMode
   }
   ```

4. **`_authenticated/index.jsx`** (redirect):
   ```jsx
   import { createFileRoute, redirect } from '@tanstack/react-router';

   export const Route = createFileRoute('/_authenticated/')({
     beforeLoad: () => {
       throw redirect({ to: '/dashboard' });
     },
   });
   ```

5. **Each page route** (e.g., `_authenticated/dashboard.jsx`):
   ```jsx
   import { createFileRoute } from '@tanstack/react-router';
   // Import the page component (initially keep in src/pages/, move content later)
   import Dashboard from '@/pages/Dashboard';

   export const Route = createFileRoute('/_authenticated/dashboard')({
     component: Dashboard,
   });
   ```

### Sub-phase 4C: Convert Navigation

**Files modified**: `src/components/Layout.jsx`, all pages with `useNavigate()`, `src/pages/AuthCallback.jsx`, `src/hooks/useAuth.js`

1. **Layout.jsx**:
   - `import { NavLink, Outlet, useNavigate } from 'react-router-dom'`
   → `import { Link, Outlet, useNavigate } from '@tanstack/react-router'`
   - `<NavLink to="/app/dashboard" className={({isActive}) => ...}>`
   → `<Link to="/dashboard" activeProps={{ className: 'active-class' }}>`
   - `<Outlet />` → `<Outlet />` (same name, different import)
   - `navigate('/app/dashboard')` → `navigate({ to: '/dashboard' })`

2. **All pages with useNavigate()**:
   - Update import source
   - `navigate('/app/transactions')` → `navigate({ to: '/transactions' })`
   - `navigate(-1)` → `navigate({ to: '..', from: Route.fullPath })` or `window.history.back()`

3. **AuthCallback.jsx** → handled in route file (Sub-phase 4B, step 3)

4. **useAuth.js**:
   - Line 59: `window.location.pathname === '/auth/callback'` — **NO CHANGE NEEDED** (pathname stays same)
   - The `navigate` from react-router-dom used in useAuth → if any, update import

5. **api.js** 401 interceptor: `window.location.href = '/login'` — keep as hard navigation (works with any router)

### Sub-phase 4D: Cutover

**Files modified**: `src/main.jsx`
**Files deleted**: `src/App.jsx`, `src/components/PrivateRoute.jsx`

1. Rewrite `src/main.jsx`:

   **NOTE**: `useAuthStore` is a NAMED export. The `_authenticated.jsx` `beforeLoad` handles auth checks directly (no router context needed for auth). Router context only needs `queryClient`.

   ```jsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { RouterProvider, createRouter } from '@tanstack/react-router';
   import { QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   import { routeTree } from './routeTree.gen';
   import { queryClient } from './lib/queryClient';
   import './index.css';

   const router = createRouter({
     routeTree,
     context: {
       queryClient,
     },
     defaultPreloadStaleTime: 0,
   });

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <QueryClientProvider client={queryClient}>
         <RouterProvider router={router} />
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
     </React.StrictMode>
   );
   ```

2. Delete `src/App.jsx`
3. Delete `src/components/PrivateRoute.jsx`
4. Uninstall `react-router-dom` from dependencies

### Sub-phase 4E: Route Prefetching (Optional)

Add `loader` to route files for data prefetching:
```jsx
export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: ({ context }) => {
    const { queryClient } = context;
    // Fire parallel prefetches
    queryClient.ensureQueryData(dashboardSummaryOptions(currentMonth, currentYear));
    queryClient.ensureQueryData(monthlyTrendOptions());
  },
  component: Dashboard,
});
```

### Verification (Phase 4 complete)

```bash
npm run build

# Route tree auto-generated
ls src/routeTree.gen.js
# Expected: exists

# No react-router-dom imports anywhere
grep -r "from 'react-router-dom'" src/
# Expected: 0 results

grep "react-router-dom" package.json
# Expected: 0 results

# Auth callback has validateSearch
grep "validateSearch" src/routes/auth/callback.jsx
# Expected: >= 1

# Auth callback preserves markAuthInitialized
grep "markAuthInitialized" src/routes/auth/callback.jsx
# Expected: >= 1

# Protected routes use _authenticated layout
ls src/routes/_authenticated/dashboard.jsx src/routes/_authenticated/transactions.jsx src/routes/_authenticated/settings.jsx
# Expected: all exist

# Old files deleted
ls src/App.jsx src/components/PrivateRoute.jsx 2>&1
# Expected: "No such file"

# PrivateRoute no longer imported
grep -r "PrivateRoute" src/
# Expected: 0 results
```

---

## Phase 5: Page UI Overhaul with shadcn Components

**Goal**: Rebuild every page UI with shadcn components for professional finance SaaS look.
**Risk**: MEDIUM per page, but pages are independent — can be parallelized.

**Prerequisite**: All previous phases complete. Pages are now in `src/routes/_authenticated/*.jsx` (or still imported from `src/pages/`).

### Per-Page Requirements

**ALL pages must**:
- Use ONLY shadcn CSS variable classes for colors (no `bg-gray-*`, no `text-gray-*`, no `bg-white`)
- Use shadcn components for all interactive elements (buttons, inputs, selects, dialogs, tables)
- Use `lucide-react` icons (not `react-icons`)
- Have clean dark mode via CSS variables (zero `dark:` color prefixes)
- Follow professional finance minimal aesthetic (tight spacing, muted tones, clear hierarchy)

### Page-by-Page Plan

1. **Dashboard** (`src/pages/Dashboard.jsx` or inline in route):
   - shadcn `<Card>` for summary stat cards (Income, Expenses, Balance, Budget)
   - shadcn `<Badge>` for categories/types
   - Recharts restyled: use CSS variable colors via `getComputedStyle(document.documentElement).getPropertyValue('--chart-1')` (or `hsl(var(--chart-1))` in config)
   - Clean grid layout, proper typography hierarchy
   - shadcn `<Skeleton>` for loading states (replacing useEffect loading)

2. **Transactions** (`src/pages/Transactions.jsx`):
   - shadcn `<Table>` with `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`
   - shadcn `<Select>` for filter dropdowns (type, category, bank, date range)
   - shadcn `<Input>` for search
   - shadcn `<Dialog>` for add/edit transaction modal
   - shadcn `<Badge>` for transaction type (income/expense) and category (personal/business)
   - shadcn `<Button>` for pagination, actions
   - shadcn `<DropdownMenu>` for row actions (edit, delete)
   - shadcn `<AlertDialog>` for delete confirmation

3. **RecurringTransactions** (`src/pages/RecurringTransactions.jsx`):
   - shadcn `<Tabs>` for Active/Patterns/Detected sections
   - shadcn `<Table>` for recurring list
   - shadcn `<Badge>` for status (active, paused, detected)
   - shadcn `<Dialog>` for add/edit
   - shadcn `<Switch>` for pause/resume

4. **DailyNotes** (`src/pages/DailyNotes.jsx`):
   - shadcn `<Card>` for note cards
   - shadcn `<Button>` for date navigation
   - shadcn `<Textarea>` for note editor
   - Recharts restyled with CSS variables

5. **Landing** (`src/pages/Landing.jsx`):
   - Professional SaaS hero section with clean typography
   - Feature cards using shadcn `<Card>`
   - CTA buttons using shadcn `<Button>`
   - Replace all gradient classes (`.gradient-*`) with CSS variable-based gradients
   - Replace glass-morphism with clean, minimal card styles
   - Keep animations but simplify (remove neumorphism, glow effects)

6. **Login** (`src/pages/Login.jsx`):
   - Centered shadcn `<Card>` with logo/title
   - Google OAuth `<Button>` (primary variant)
   - Clean, minimal — no gradients or effects

7. **Reports** (`src/pages/Reports.jsx`):
   - shadcn `<Tabs>` for report types
   - Recharts restyled with CSS variables
   - shadcn `<Button>` for PDF/CSV export
   - shadcn `<Select>` for month/year picker

8. **BankAccounts** (`src/pages/BankAccounts.jsx`):
   - shadcn `<Card>` grid for account cards
   - shadcn `<Dialog>` for add/edit account
   - shadcn `<Badge>` for account type
   - Account colors via CSS variables or shadcn palette

9. **Settings** (`src/pages/Settings.jsx`):
   - shadcn `<Card>` sections for each settings group
   - shadcn `<Form>`, `<Input>`, `<Label>` for form fields
   - shadcn `<Switch>` for dark mode toggle (connected to themeStore)
   - shadcn `<Select>` for currency/preferences
   - shadcn `<Button>` for save actions

10. **AuthCallback** (`src/routes/auth/callback.jsx`):
    - Minimal: centered loading state with shadcn `<Skeleton>` or Loader2 spinner
    - Error state with shadcn `<Alert>`

### Verification (Phase 5 complete — per page)

```bash
npm run build

# No hardcoded gray colors in pages
grep -r "bg-gray-\|text-gray-\|border-gray-" src/pages/ src/routes/
# Expected: 0 results

# No bg-white (should be bg-card or bg-background)
grep -r "bg-white" src/pages/ src/routes/
# Expected: 0 results

# No dark: color prefixes (CSS variables handle dark mode)
grep -r "dark:bg-\|dark:text-\|dark:border-" src/pages/ src/routes/
# Expected: 0 results (or minimal — some utility dark: classes like dark:hidden are OK)

# No react-icons imports (replaced by lucide-react)
grep -r "from 'react-icons" src/
# Expected: 0 results
```

---

## Phase 6: Final Cleanup + Verification

**Goal**: Remove all vestiges of old stack, final formatting, full verification.

### Steps

1. Delete old component files (if not already deleted):
   - `src/components/Modal.jsx` (replaced by shadcn Dialog usage)
   - `src/components/Spinner.jsx` (replaced)
   - `src/components/SkeletonLoader.jsx` (replaced by shadcn Skeleton)
   - `src/components/PrivateRoute.jsx` (should already be deleted in Phase 4)
2. Remove `react-icons` from dependencies (replaced by `lucide-react`)
3. Clean up `src/pages/` directory — if page logic was moved inline to route files, delete the old page files. If route files import from `src/pages/`, keep them.
4. Run `npx biome check --write src/` for final formatting pass
5. Run `npm run build` — must succeed cleanly

### Final Verification Commands

```bash
# Clean build
npm run build
# Expected: Success, no warnings about missing modules

# Clean lint
npx biome check src/
# Expected: Exit 0

# All old deps removed
grep "react-router-dom\|react-hot-toast\|react-icons\|@types/react\|eslint" package.json
# Expected: 0 results (none of these should be in deps)

# All old patterns removed
grep -r "from 'react-router-dom'" src/
# Expected: 0 results

grep -r "from 'react-hot-toast'" src/
# Expected: 0 results

grep -r "ThemeContext\|ThemeProvider" src/
# Expected: 0 results

grep -r "@tailwind" src/
# Expected: 0 results

grep -r "from 'react-icons" src/
# Expected: 0 results

# No hardcoded colors
grep -r "bg-gray-\|bg-white\|text-gray-\|border-gray-" src/pages/ src/routes/ src/components/Layout.jsx
# Expected: 0 results

# shadcn CSS variables in use
grep "bg-background\|bg-card\|text-foreground\|text-muted-foreground\|border-border\|bg-primary" src/pages/*.jsx src/routes/**/*.jsx src/components/Layout.jsx 2>/dev/null | wc -l
# Expected: many results (CSS variable classes are used extensively)

# Route tree exists
ls src/routeTree.gen.js
# Expected: exists

# All route files exist
ls src/routes/__root.jsx src/routes/index.jsx src/routes/login.jsx src/routes/auth/callback.jsx src/routes/_authenticated.jsx src/routes/_authenticated/dashboard.jsx src/routes/_authenticated/transactions.jsx src/routes/_authenticated/bank-accounts.jsx src/routes/_authenticated/daily-notes.jsx src/routes/_authenticated/recurring.jsx src/routes/_authenticated/reports.jsx src/routes/_authenticated/settings.jsx
# Expected: all exist
```

---

## Risk Mitigation Summary

| Risk | Severity | Mitigation |
|---|---|---|
| Tailwind v4 class renames break all components | HIGH | Do CSS rewrite + component updates in one atomic phase, build-verify after |
| Auth callback flow breaks during routing migration | HIGH | Preserve exact flow: validateSearch, markAuthInitialized, 500ms delay, sessionId storage |
| Routing cutover is atomic | HIGH | Create all route files + convert all navigation + rewrite main.jsx in one phase |
| shadcn components have TypeScript types | MEDIUM | Strip types from each component immediately after adding |
| Custom CSS classes removed but still referenced in JSX | MEDIUM | Grep for all custom class names before deleting them from index.css |
| manualChunks config breaks after dep swap | MEDIUM | Update in same phase as dep changes |
| PWA cache stale after migration | LOW | registerType: 'autoUpdate' handles this; bump manifest version |
| react-hot-toast → sonner API differences | LOW | APIs are largely compatible; test each toast call |
