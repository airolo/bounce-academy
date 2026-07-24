# Bounce Academy

Bounce Academy is a React + Vite ecommerce storefront for basketball-inspired apparel and accessories. It includes a public shop experience, customer accounts, wishlist and cart flows, checkout, product reviews, and an admin area for managing products, orders, and users.

## Features

- Modern storefront homepage with featured products and category browsing
- Product catalog with search, sort, wishlist, and cart actions
- Product detail pages with size, color, and review support
- Customer account page with order history and reorder actions
- Admin dashboard for sales, inventory, and order insights
- Admin product and user management screens
- Floating assistant chatbot for common shop questions

## Tech Stack

- React 19
- React Router DOM 7
- Tailwind CSS 3
- Supabase (PostgreSQL, Auth)
- Vite 8
- react-icons (Feather)

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

## Setup

```bash
# Install dependencies
npm install

# Create environment file
# Copy the values from your Supabase project dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Supabase schema is in `supabase/schema.sql` — run it in your Supabase SQL editor to set up the database.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Admin Access

1. Register a user through the `/auth` page
2. In your Supabase SQL editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log in — admin navigation appears automatically

## Project Notes

- The app uses Supabase for authentication and database storage.
- Cart and order actions are connected to product stock updates via the `adjust_product_stock` RPC.
- Checkout is Cash on Delivery (COD) only — enforced at the database level.
- The design favors a clean, minimal black-and-white style with subtle motion.
- No test framework is configured.

## License

Private project for Bounce Academy.
