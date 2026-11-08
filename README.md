# Bounce Academy

Frontend foundation for a premium Philippine basketball e-commerce and training platform.

## Stack

React, Vite, Tailwind CSS v4, React Router, Supabase, Zustand, React Hook Form, Zod, and Lucide React.

## Getting started

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set the Supabase values in `.env.local` before connecting data features:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

The Supabase service-role key must never be placed in frontend environment variables.

## Authentication

The customer account flows are available at `/login`, `/register`,
`/forgot-password`, `/reset-password`, and `/account`. Supabase Auth persists
the session in the browser. Add the local and deployed application URLs to
Supabase Auth redirect URLs, including `/reset-password`, before testing
password recovery.

New users receive their `public.profiles` row through the database trigger in
the security migration. Profile, address, order, and booking data is loaded
through Supabase client queries and protected by database RLS; the frontend
does not assign or trust a role. The `/admin` route additionally checks the
role returned from `public.profiles`, while the database policies remain the
authorization boundary.

Database migrations, security policies, transactional RPCs, storage policies,
and SQL verification tests are documented in [supabase/README.md](./supabase/README.md).
Apply them with `supabase db push` after linking the project.

## Available scripts

- `npm run dev` - start the local Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run Oxlint

## Project structure

Feature areas live under `src/components/`, `src/pages/`, and `src/services/`. Shared UI is in `src/components/common/`, the application shell is in `src/layout/`, and global state is in `src/stores/`. Supabase migrations and seed data belong in `supabase/`.

## Verify locally

Run `npm run lint` and `npm run build`, then open the URL printed by `npm run dev`.
For production, deploy the repository to Vercel with the two `VITE_` variables
configured in the project settings. `vercel.json` rewrites client-side routes to
`index.html`; Supabase Auth must also allow the deployed URL and reset-password
callback.
Confirm the home page and navigation, then verify the following auth flows:

1. Register with an invalid email, weak password, and mismatched confirmation.
2. Register with a valid email and confirm the Supabase email link.
3. Sign in, update the profile, add an address, set its default, and sign out.
4. Confirm `/account` redirects to `/login` when signed out.
5. Request a password reset and complete it at `/reset-password`.
6. Promote a test profile to `admin` using the trusted SQL editor and confirm
   `/admin` is inaccessible to customer profiles.

Also verify `/loading`, the public feature placeholders, and the fallback
not-found route render correctly.

The release audit and deployment checklist are in
[QA-DEPLOYMENT-REPORT.md](./QA-DEPLOYMENT-REPORT.md).
