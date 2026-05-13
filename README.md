# 💸 Budget Tracker (Budget_calulation)

Full-stack personal finance app for tracking income, expenses, bank balances, recurring transactions, daily notes, and reporting analytics.

---

## Table of Contents

- [What this project does](#what-this-project-does)
- [Core features](#core-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Getting started (local development)](#getting-started-local-development)
- [Environment variables](#environment-variables)
- [Google OAuth setup](#google-oauth-setup)
- [Available scripts](#available-scripts)
- [API reference](#api-reference)
- [Data models](#data-models)
- [PWA / offline support](#pwa--offline-support)
- [Testing & code quality](#testing--code-quality)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## What this project does

Budget Tracker helps users:

- sign in with Google,
- connect and manage multiple bank accounts,
- add and filter income/expense transactions,
- detect and automate recurring payments/income,
- track daily notes + burn rate,
- generate charts, CSV exports, and PDF reports,
- use the app as a Progressive Web App (PWA) with offline awareness.

---

## Core features

### Authentication
- Google OAuth login flow
- Session-based auth (`express-session` + `connect-mongo`)
- Cookie auth with `X-Session-Id` fallback for cross-domain/session-cookie edge cases

### Transaction management
- Create, update, delete, list transactions
- Filters: date range, type, category, bank account, payment method, search
- CSV import for bank/transaction data
- Bulk delete

### Bank accounts
- Multiple accounts per user
- Masked account numbers in responses
- Balance tracking with automatic recalculation based on linked transactions
- Soft delete when linked transactions exist

### Dashboard & reports
- Monthly and all-time summary
- Category breakdown
- 12-month trend
- Bank-wise summary
- Recent transactions
- Payment method analytics

### Daily notes & burn rate
- Add per-day notes and highlights
- Fetch per-day transactions and totals
- Monthly burn-rate projection and weekly breakdown

### Recurring transactions
- CRUD for recurring templates
- AI/pattern-based recurring detection from historical transactions
- Approve single/batch detected patterns
- Pause/resume templates
- Auto-generation by cron job (daily)

### Exports
- Transactions CSV export
- Monthly PDF report export

### UX extras
- Dark mode
- Responsive dashboard UI
- PWA install prompt
- Offline/online banner

---

## Tech stack

### Frontend
- React 18
- Vite
- Tailwind CSS 4
- Zustand (auth store)
- React Router
- Recharts
- Axios
- Vite PWA plugin

### Backend
- Node.js + Express
- MongoDB + Mongoose
- express-session + connect-mongo
- Google OAuth (`google-auth-library`)
- `csv-parse`, `multer`, `pdfkit`
- `node-cron`
- Security middleware: `helmet`, rate-limiter, mongo sanitize

---

## Architecture

```text
Frontend (React + Vite)
  ├─ /api/* calls (relative path)
  ├─ Auth callback handling (/auth/callback)
  └─ Dashboard / Transactions / Reports / Settings / etc.

Backend (Express API)
  ├─ Session auth + Google OAuth routes
  ├─ Business routes (transactions, banks, dashboard, recurring)
  ├─ Export routes (CSV/PDF)
  └─ Cron job: generate recurring transactions daily

Database
  ├─ Users
  ├─ BankAccounts
  ├─ Transactions
  ├─ RecurringTransactions
  └─ DailyNotes
```

---

## Repository structure

```text
Budget_calulation/
├── backend/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── stores/
│   └── vite.config.js
├── docs/
├── scripts/
├── docker-compose.yml
└── README.md
```

---

## Getting started (local development)

### Prerequisites

- Node.js 18+
- npm
- MongoDB running locally or cloud MongoDB URI
- Google OAuth credentials

### 1) Clone and install

```bash
git clone <your-repo-url>
cd Budget_calulation
```

Install deps (manual):

```bash
cd backend && npm install
cd ../frontend && npm install
```

Or use helper script:

```bash
./scripts/setup.sh
```

### 2) Configure environment

Create env files from examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update values (see [Environment variables](#environment-variables)).

### 3) Run backend

```bash
cd backend
npm run dev
```

API health: `http://localhost:5000/api/health`

### 4) Run frontend

```bash
cd frontend
npm run dev
```

App URL: `http://localhost:5173`

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Default `5000` |
| `MONGODB_URI` | Yes | Mongo connection string |
| `SESSION_SECRET` | Yes | Session encryption secret |
| `NODE_ENV` | No | `development` / `production` |
| `FRONTEND_URL` | Yes | Used for CORS + OAuth redirects |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth secret |
| `GOOGLE_REDIRECT_URI` | Yes | e.g. `http://localhost:5000/api/auth/google/callback` |
| `JWT_SECRET` | Legacy/optional | Present in `.env.example`, not used in current session-based auth flow |
| `JWT_EXPIRE` | Legacy/optional | Present in `.env.example`, not used in current session-based auth flow |

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Used for OAuth redirect target and dev proxy target |
| `VITE_GOOGLE_CLIENT_ID` | Optional currently | Present in example env |

---

## Google OAuth setup

In Google Cloud Console:

1. Create OAuth client credentials.
2. Add **Authorized JavaScript Origins**:
   - `http://localhost:5173`
   - your production frontend URL
3. Add **Authorized Redirect URI**:
   - `http://localhost:5000/api/auth/google/callback`
   - your production backend callback URL
4. Put those values in backend/frontend env files.

---

## Available scripts

### Root helper scripts

| Script | Purpose |
|---|---|
| `scripts/setup.sh` | Install backend + frontend dependencies |
| `scripts/start.sh` | Start backend and frontend (includes process cleanup) |
| `scripts/stop.sh` | Stop running backend/frontend processes |
| `scripts/build.sh` | Build backend (if TS) and frontend |

> Note: `scripts/start.sh` and `scripts/stop.sh` use absolute paths from the original dev machine. Update paths if needed in your environment.

### Backend (`backend/package.json`)

- `npm run dev` – nodemon server
- `npm start` – production start
- `npm test` – vitest
- `npm run type-check` – TypeScript check
- `npm run build-ts` – build TS output (migration path)

### Frontend (`frontend/package.json`)

- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – biome check
- `npm run format` – biome format write
- `npm run check` / `check:ci` – quality checks

---

## API reference

Base URL: `/api`

### Auth

| Method | Endpoint | Description |
|---|---|---|
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/google/callback` | OAuth callback handler |
| POST | `/auth/google` | Credential-based Google login |
| GET | `/auth/session` | Get current session user |
| POST | `/auth/signout` | Logout session |
| GET | `/auth/me` | Current user (protected) |
| PUT | `/auth/profile` | Update profile (protected) |
| GET | `/auth/status` | Session debug page |

### Bank Accounts

| Method | Endpoint |
|---|---|
| GET | `/bank-accounts` |
| GET | `/bank-accounts/:id` |
| POST | `/bank-accounts` |
| PUT | `/bank-accounts/:id` |
| DELETE | `/bank-accounts/:id` |
| GET | `/bank-accounts/:id/transactions` |

### Transactions

| Method | Endpoint |
|---|---|
| GET | `/transactions` |
| GET | `/transactions/:id` |
| POST | `/transactions` |
| PUT | `/transactions/:id` |
| DELETE | `/transactions/:id` |
| POST | `/transactions/import-csv` |
| DELETE | `/transactions/bulk` |

### Dashboard

| Method | Endpoint |
|---|---|
| GET | `/dashboard/summary` |
| GET | `/dashboard/category-breakdown` |
| GET | `/dashboard/monthly-trend` |
| GET | `/dashboard/bank-summary` |
| GET | `/dashboard/recent-transactions` |
| GET | `/dashboard/payment-method-breakdown` |

### Daily Notes

| Method | Endpoint |
|---|---|
| GET | `/daily-notes` |
| GET | `/daily-notes/:date` |
| POST | `/daily-notes` |
| DELETE | `/daily-notes/:date` |
| GET | `/daily-notes/stats/burn-rate` |

### Recurring

| Method | Endpoint |
|---|---|
| GET | `/recurring` |
| GET | `/recurring/detect` |
| POST | `/recurring/detect/approve` |
| POST | `/recurring/batch/approve` |
| DELETE | `/recurring/batch/delete` |
| GET | `/recurring/upcoming` |
| GET | `/recurring/:id` |
| POST | `/recurring` |
| PUT | `/recurring/:id` |
| DELETE | `/recurring/:id` |
| PATCH | `/recurring/:id/pause` |
| PATCH | `/recurring/:id/resume` |
| POST | `/recurring/:id/generate` |
| GET | `/recurring/:id/history` |

### Export

| Method | Endpoint |
|---|---|
| GET | `/export/transactions/csv` |
| GET | `/export/report/pdf` |

---

## Data models

### `User`
- Profile: name, email, image, emailVerified
- Preferences: darkMode, currency
- Budget: monthlyBudgetLimit

### `BankAccount`
- bankName, accountNumber, accountType, currency
- initialBalance, current balance
- masked account number helper

### `Transaction`
- type (`income`/`expense`), category, subcategory
- amount, paymentMethod, date, description, tags
- optional bank link
- recurring flags (`isRecurring`, `recurringPeriod`)

### `RecurringTransaction`
- template fields: amount, category, description, payment method
- schedule: frequency, start/end, nextDueDate
- detection metadata: confidence, source transactions
- generation helpers (`isDue`, `generateTransaction`)

### `DailyNote`
- date, notes, mood, dailyBudget/dailyTarget, highlights, tags

---

## PWA / offline support

Frontend uses `vite-plugin-pwa` with:

- web app manifest,
- service worker auto-update,
- runtime caching,
- install prompt component,
- offline banner component.

---

## Testing & code quality

### Backend

```bash
cd backend
npm test
```

### Frontend checks

```bash
cd frontend
npm run check:ci
npm run build
```

---

## Deployment

This repo includes multiple deployment paths:

- Dockerfiles for frontend and backend
- GHCR publishing workflow (`.github/workflows/docker-deploy.yml`)
- Azure deployment guide
- Docker deployment guide

See docs:

- [Azure deployment guide](./docs/AZURE_DEPLOYMENT_GUIDE.md)
- [Docker deployment guide](./docs/DOCKER_DEPLOYMENT.md)
- [Recurring transactions guide](./docs/RECURRING_TRANSACTIONS_GUIDE.md)

---

## Troubleshooting

### 1) Backend starts but auth fails
- Confirm `SESSION_SECRET`, Google OAuth env vars, and `FRONTEND_URL`.
- Verify redirect URI in Google Console exactly matches backend callback URL.

### 2) Session/cookie issues across domains
- App supports `X-Session-Id` fallback header. Ensure frontend localStorage is not blocked.

### 3) CORS errors
- `FRONTEND_URL` in backend env must match frontend origin exactly.

### 4) MongoDB connection error
- Verify `MONGODB_URI` and network access (if using Atlas).

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes with tests/checks
4. Open a pull request

---

## License

Current package manifests use **ISC** license.
