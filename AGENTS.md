# Bounce Academy — Agent Guide

## Project Overview

Bounce Academy is a React + Vite eCommerce storefront for basketball-inspired apparel and accessories. It also promotes a local basketball training camp. The app uses Supabase for authentication and database, Tailwind CSS for styling, and is deployed as a static SPA.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (ES2020+, no TypeScript) |
| UI | React 19, React Router DOM 7 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS 3, PostCSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Icons | react-icons (Feather) |
| Linting | ESLint 9 (flat config) |
| Testing | None — no test framework installed |
| Font | Space Grotesk (Google Fonts) |

## Key Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint on `src/`

## Directory Layout

```
src/
├── components/       Reusable UI (Navbar, ProductCard, Footer, ScrollToTop, ErrorBoundary, etc.)
│   └── ui/           Atomic primitives (QuantityControl, StatusBadge, SmartImage, SectionHeading)
├── contexts/         React Context providers (AuthContext, CartContext)
├── layouts/          Page layout wrappers (UserLayout, AdminLayout)
├── lib/              Data access layer (supabaseClient.js, db.js)
├── pages/            Route page components
│   └── admin/        Admin sub-pages (dashboard, products, orders, users)
├── utils/            Utilities (format.js — currency/date)
├── assets/           Static imported assets (hero.png)
├── App.jsx           Root component with routing tree (lazy-loaded routes)
├── main.jsx          Entry point (wrapped in ErrorBoundary)
└── index.css         Tailwind directives + custom animations
```

## Route Map

| Route | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/shop` | ShopPage | Public |
| `/about` | AboutPage | Public |
| `/product/:id` | ProductDetailsPage | Public |
| `/cart` | CartPage | Public |
| `/auth` | AuthPage | Public |
| `/checkout` | CheckoutPage | Authenticated |
| `/wishlist` | WishlistPage | Authenticated |
| `/account` | AccountPage | Authenticated |
| `/admin/*` | Admin pages | Admin role |

## Coding Conventions

- **Naming:** PascalCase for components (`Navbar.jsx`), camelCase for utilities (`format.js`).
- **File extensions:** `.jsx` for React files, `.js` for plain JS modules.
- **Exports:** Default export for every component file.
- **Contexts:** Named exports for provider (`AuthProvider`) and hook (`useAuth`).
- **Styling:** Tailwind utility classes in JSX; custom classes in `index.css` only for animations/shimmer effects.
- **State management:** React Context only — no Redux or Zustand.
- **Data fetching:** `useEffect` + async calls to `src/lib/db.js` (Supabase query functions).
- **Error handling:** `try/catch` with `console.error`; user-facing errors shown via `alert()`.
- **Loading states:** Skeleton-shimmer placeholder elements that mirror layout.
- **Stock management:** Optimistic reservation on add-to-cart via `adjust_product_stock` RPC; release on remove/clear.
- **Currency:** Philippine Peso (PHP) via `formatCurrency` in `src/utils/format.js`.

## Database (Supabase / PostgreSQL)

Key tables: `profiles`, `products`, `orders`, `order_items`, `wishlist`, `product_reviews`.

Important RPC: `adjust_product_stock(product_id, delta)` — atomic stock adjustment.

Full schema in `supabase/schema.sql`.

## Important Notes for AI Agents

1. **No tests exist** — do not look for or reference test files or test commands.
2. **No TypeScript** — all code is plain JS/JSX.
3. **`.env` contains real Supabase credentials** — committed for demo purposes; do not expose or commit new secrets.
4. **`App.css` is legacy** — do not import or reference it; styling is in `index.css` + Tailwind.
5. **Checkout is COD-only** — enforced at DB level (`paymentMethod === 'cod'`).
6. **Do not remove or rename components without asking** — they are referenced by routes and layouts.
7. **Keep code terse** — no comments unless they explain non-obvious business logic.
8. **Lazy-loaded routes** — all page components use `React.lazy()` + `<Suspense>` in `App.jsx`.
9. **`ErrorBoundary` wraps the entire app** in `main.jsx` — any render crash shows a refresh prompt.
10. **`ScrollToTop`** is rendered inside `App.jsx` — resets scroll position on every route change.
11. **Shared `Footer` component** at `src/components/Footer.jsx` — used by both `HomePage` and `AboutPage`.
12. **Guest cart migration** — when a guest logs in, their cart items are merged into the user's cart and the guest key is cleared.
13. **Variant changes release/re-reserve stock** — `updateItemVariant` in CartContext handles stock correctly.    
14. **Multi-remove releases stock** — `removeItemsByKeys` releases stock before removing items.