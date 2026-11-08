# Bounce Academy QA and production deployment report

Date: 2026-10-31

## Executive result

Production readiness is **not approved**. The frontend lint and production build
pass, but the Supabase security/integration suite could not run because no local
Postgres instance is listening on `127.0.0.1:54322`. Functional, payment, and
authorization checks that require a real Supabase project remain unverified.

## Validation performed

| Area | Result | Evidence |
|---|---|---|
| ESLint/Oxlint equivalent | PASS with warnings | `npm run lint` |
| Vite production build | PASS with chunk-size warning | `npm run build` |
| SPA fallback configuration | PASS | `vercel.json` |
| Supabase database tests | BLOCKED | `npx supabase test db` could not connect to local DB |
| Browser end-to-end flows | NOT RUN | No test account/project fixture was provided |

The route tree contains customer auth, account, shop/product, cart/checkout,
orders, training, announcements, and admin pages. Presence of a route is not
treated as proof that its Supabase operation works.

## Functional and payment matrix

Registration, login, logout, profile, addresses, catalog browsing/filtering,
product details, cart, stock validation, COD checkout, shipping calculation,
orders, training booking, conflict prevention, announcements, admin auth, and
admin management require live Supabase fixtures and are **unverified**.

The database design provides the expected controls: RLS ownership policies,
transactional `create_order`, stock locking, generated order totals, COD-only
payment constraint, and the confirmed-booking exclusion constraint. These
controls still require execution against the production schema.

GCash, PayPal, and bank transfer are disabled in the UI and rejected by the
`orders_payment_method_check` constraint / `create_order` RPC. This is
**unverified at runtime** until API requests are attempted with a customer
fixture.

## Security findings

No confirmed exploitable vulnerability was established from static inspection.
The following high-value checks are pending live verification:

- Cross-customer order and booking reads.
- Customer profile role escalation.
- Customer writes to product prices or inventory.
- Non-admin administrator operations.
- Tampered order items, shipping rates, and totals.
- Service-role key exposure in deployed assets and Vercel settings.

The frontend only references `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY`; never configure a service-role key with a
`VITE_` prefix.

## Issues and recommendations

1. **Release blocker:** start/link a Supabase project and run
   `supabase db push` followed by `supabase test db` with fixture users.
2. **Release blocker:** execute the full customer/admin/payment matrix against a
   staging project, including direct REST/RPC tampering attempts.
3. Oxlint reports React effect/purity warnings in auth, shop, account, training,
   and admin pages; resolve before treating lint as clean.
4. The production bundle is approximately 708 kB minified. Add route-level
   `lazy()` boundaries and verify mobile Lighthouse performance.
5. Configure image CDN transformations, explicit dimensions/aspect ratios, and
   responsive `srcSet` values for catalog and campaign images.
6. Configure an error-monitoring provider and alerting; no monitoring SDK is
   currently configured.

The homepage now reads new arrivals from the live catalog instead of displaying
the hard-coded mock product list. Database indexes for common ownership,
catalog, order, booking, and announcement queries were added in the latest
migration.

## Deployment checklist

- [ ] Create/link the production Supabase project.
- [ ] Apply all migrations, including `20261031180700_performance_indexes.sql`.
- [ ] Run `supabase test db` with Docker/local Postgres or a staging database.
- [ ] Seed categories, products, variants, shipping rates, services, and trainers.
- [ ] Promote the first administrator only through the trusted SQL editor.
- [ ] Configure Vercel `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Add Vercel URL and `/reset-password` to Supabase Auth redirect URLs.
- [ ] Verify `product-images` and `campaign-banners` storage policies.
- [ ] Run the complete functional and security matrix with two customer users
  and one admin user.
- [ ] Confirm GCash, PayPal, and bank transfer API submissions fail.
- [ ] Configure monitoring, alerts, domain, HTTPS, and rollback ownership.
- [ ] Re-run build, lint, smoke tests, and a production preview.

## Production setup guide

```powershell
Copy-Item .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY locally only.
npm ci
npm run lint
npm run build
```

In Supabase, link the project and apply migrations:

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase test db
```

In Vercel, import the repository, set the two public variables for Production,
Preview, and Development as appropriate, and deploy. The checked-in
`vercel.json` rewrites all browser routes to the Vite entry point.
