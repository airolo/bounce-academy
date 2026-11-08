# Bounce Academy database

## Setup

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Link the project: `supabase link --project-ref <project-ref>`.
3. Apply migrations: `supabase db push`.
4. Run verification tests: `supabase test db`.
5. In Supabase Auth, enable the providers used by the application. New users
   receive a `public.profiles` row through the `on_auth_user_created` trigger.
6. Promote the first administrator from a trusted SQL editor using the
   service role only:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = '<AUTH_USER_UUID>';
   ```

The role-protection trigger recognizes Supabase SQL Editor sessions
(`postgres`/`supabase_admin`) and the service role. It rejects role changes
from normal authenticated users.

Never expose the service-role key to the browser. The frontend should use only
the project URL and anon key.

## Relationships

- `profiles`, `addresses`, `carts`, `orders`, and `bookings` belong to
  `auth.users`.
- `products` belong to `categories`; `product_variants` belong to products;
  `product_images` can belong to a product and optionally a variant.
- `cart_items` belong to carts and variants.
- `order_items` snapshot a variant's name, SKU, price, and quantity so historical
  orders do not change when a product is edited.
- `bookings` reference a training service and trainer. Confirmed bookings use a
  PostgreSQL exclusion constraint to prevent overlapping trainer schedules.
- `admin_activity_logs` records administrator actions without exposing logs to
  customers.

## Security model

Every public table has RLS enabled. Customers can access only their own
profiles, addresses, cart, orders, and bookings. Product catalog, active
services, active trainers, active shipping rates, and published announcements
are readable publicly. Product, inventory, order administration, training,
booking, announcement, shipping, and activity-log operations require
`public.is_admin()`.

The `profiles.role` column is immutable to authenticated users. The secure
profile trigger copies only selected metadata from `auth.users`; it never
accepts a user-submitted role.

## Transactional functions

Call these RPCs through Supabase:

- `create_order(shipping_address, shipping_rate_id, items)`: validates active
  variants, locks inventory, calculates prices and totals from the database,
  inserts snapshots, deducts stock atomically, and clears matching cart items.
- `validate_inventory(items)`: locks and validates requested stock. It is
  callable only by trusted database functions.
- `request_booking(service_id, starts_at, customer_notes)`: derives
  `ends_at` from the service duration and always creates a pending request.
- `manage_booking(booking_id, status, trainer_id, admin_notes)`: administrator-only
  booking management; overlapping confirmed bookings fail atomically.
- Order status changes are performed through the administrator order update policy
  and status guard.

An exception rolls back the entire PostgreSQL transaction, including stock
deduction and order rows.

## Storage

The `product-images` public bucket is created by migration. Anyone may read
objects; only administrators may upload, update, or delete them. Keep object
paths and `product_images.storage_path` synchronized.

## Tests

`supabase/tests/security.sql` verifies that all exposed tables have RLS,
ownership policies and security helpers exist, inventory constraints exist,
booking conflict protection exists, and role immutability is installed. The
file also includes customer/admin integration statements that can be enabled
with fixture UUIDs to verify cross-customer order isolation, role escalation
prevention, and administrator category access.
