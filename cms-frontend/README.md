# CMS Frontend — Call Management System Dashboard

Next.js 14 dashboard for the Call Management System backend.

## Stack
- Next.js 14 (App Router, static export)
- TypeScript
- Tailwind CSS
- Recharts (analytics)
- Lucide React (icons)

## Pages
- `/dashboard` — Overview, stats, recent calls, agent list, Twilio webhook URLs
- `/calls` — Full call log with search, filters, date range, CSV export, call detail modal
- `/agents` — Manage agents, add agent, toggle online/offline, bulk actions
- `/make-call` — Outbound call form
- `/analytics` — Charts: calls per day, status breakdown, peak hours, duration trend
- `/settings` — Health check, webhook URLs, env vars reference, quick links

## Setup

```bash
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://call-management-system-11b9.onrender.com
NEXT_PUBLIC_API_KEY=callsystem2024secret
```

```bash
npm run dev       # development
npm run build     # production build (static export → /out)
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub
2. Go to Cloudflare Pages → Create project → Connect GitHub repo
3. Build settings:
   - **Framework**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output**: `out`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://call-management-system-11b9.onrender.com`
   - `NEXT_PUBLIC_API_KEY` = `callsystem2024secret`
5. Deploy
