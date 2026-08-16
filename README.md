# Spot the Mistake — RMIT

## Run locally

```powershell
npm install
npm run dev
```

## Deploy

This is a static Vite app. On Vercel, Netlify, or Cloudflare Pages, set:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20 or newer

Add these environment variables in the hosting dashboard (never commit `.env.local`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_RESULTS_WEBHOOK_URL` *(optional; enables Google Sheets result logging)*

Only use a Supabase **publishable** key in the frontend. Do not expose a Supabase service-role/secret key or a Google API key.

## Enable Pair Comparison rooms

1. Create a Supabase project, then in **Authentication → Providers** enable **Anonymous Sign-Ins**.
2. Open the SQL Editor and run [the pair-room migration](supabase/migrations/20260816131330_pair_rooms.sql).
3. Confirm both `pair_rooms` and `pair_participants` are in the `supabase_realtime` publication. The migration does this automatically.
4. Copy `.env.example` to `.env.local`, then add the Project URL and **Publishable key**. Never use a service-role/secret key in this app.
5. Restart `npm run dev`.

The host chooses a document, creates a persistent 5-digit room, and enters a waiting room. A second anonymous player joins with that code; both browsers start together, save their own score/progress in realtime, and compare final scores once both are done.

To test, open two separate browser profiles or one normal and one Incognito window. Anonymous identities are browser-local.

## Google Sheets result log (optional)

The app can send a non-blocking row to a Google Sheet whenever a game reaches the Result screen. Complete the one-time setup in [docs/google-sheets-results.md](docs/google-sheets-results.md), then set `VITE_RESULTS_WEBHOOK_URL` on the deployed site. The client does not block a player if the log endpoint is unavailable.
