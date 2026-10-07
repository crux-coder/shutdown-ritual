# Shutdown Ritual

A calm, minimal way to close out your workday.

Next.js 16 (App Router, Cache Components) · Supabase Auth · Tailwind v4 + daisyUI 5

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the env template and fill in values from **Project Settings → API**:
   ```bash
   cp .env.example .env.local
   ```
3. In Supabase **Authentication → URL Configuration**, add `http://localhost:3000/auth/confirm` to the redirect URLs.
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Structure

- `src/proxy.ts` — refreshes the Supabase session and redirects based on auth state
- `src/lib/supabase/` — browser, server, and proxy Supabase clients
- `src/lib/auth.ts` — `getCurrentUser()`, the authoritative server-side check
- `src/app/(auth)/` — login and signup pages plus server actions
- `src/app/auth/confirm/` — email confirmation callback
- `src/app/globals.css` — `hearth` (light) and `dusk` (dark) daisyUI themes
