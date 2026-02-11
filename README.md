# hup_corner (Isomorphic Next.js App)

A Next.js application (App Router) built using an isomorphic template with Tailwind CSS, Supabase integration, Uploadthing support, and a local `packages/isomorphic-core` package for shared UI and utilities.

## Key features

- Next.js 14 App Router (`src/app`)
- Tailwind CSS for styling
- Supabase client and admin factory (server-only) in `src/lib`
- Upload handling with Uploadthing and Uploadthing React
- Monorepo-style local package: `packages/isomorphic-core`
- Database migrations in the `migrations/` folder

## Repository layout (high level)

- `src/` — Next.js app code, API routes, shared components, and utilities
- `packages/isomorphic-core/` — local package with shared UI, config, and helpers
- `public/` — static assets
- `migrations/` — SQL migration files
- `package.json`, `pnpm-lock.yaml` — project manifest and lockfile

## Prerequisites

- Node.js >= 18.15.0
- pnpm (recommended) — this repository includes a `pnpm-lock.yaml`

Install dependencies:

```bash
pnpm install
```

## Environment variables

The project uses Supabase. At minimum, set these environment variables (example names appear in code):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key (commonly required by client code)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only; used by `src/lib/supabaseAdmin.ts`)

Store secrets in a `.env.local` file for local development and ensure `SUPABASE_SERVICE_ROLE_KEY` is only available to server-side code.

Note: other integrations (e.g., Uploadthing, NextAuth) may require additional environment variables depending on configuration in `src/app` or `src/lib`.

## Common scripts

Available npm scripts (from `package.json`):

- `pnpm dev` — run Next.js in development mode
- `pnpm build` — build for production
- `pnpm start` — start the production server (after build)
- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier
- `pnpm clean` — remove build and cache folders

Run the development server:

```bash
pnpm dev
```

## Database & migrations

SQL migrations are in the `migrations/` directory. Apply them using your preferred workflow or the Supabase CLI.

## Notes for contributors

- Shared UI and utilities are kept in `packages/isomorphic-core` — import them using the local `core` dependency in `package.json`.
- Server-only code (for example, `src/lib/supabaseAdmin.ts`) must not be imported into client-side bundles. The code contains runtime guards to prevent accidental client-side usage.

## Where to look next

- App entry and global styles: `src/app/layout.tsx`, `src/app/globals.css`
- Supabase client helpers: `src/lib/supabaseClient.ts` and `src/lib/supabaseAdmin.ts`
- API routes: `src/app/api/`
- Shared UI and components: `packages/isomorphic-core/src/components` and `src/shared`

If you want, I can also:

- generate an environment example file (`.env.example`) with the common variables above
- run the dev server and verify it starts locally (requires you to provide env secrets)

---

Written to be icon-free and plain-text friendly.
