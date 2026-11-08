-- Run with: supabase test db
-- These checks are intentionally database-side and do not require frontend code.
begin;

do $$
declare
  table_name text;
  rls_enabled boolean;
begin
  foreach table_name in array array[
    'profiles', 'addresses', 'categories', 'products', 'product_variants',
    'product_images', 'carts', 'cart_items', 'shipping_rates', 'orders',
    'order_items', 'training_services', 'trainers', 'bookings',
    'announcements', 'admin_activity_logs'
  ]
  loop
    select c.relrowsecurity into rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = table_name;
    if rls_enabled is distinct from true then
      raise exception 'RLS is not enabled for public.%', table_name;
    end if;
  end loop;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace and proname = 'is_admin'
  ) then
    raise exception 'is_admin helper is missing';
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_confirmed_no_overlap'
  ) then
    raise exception 'booking conflict constraint is missing';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'shipping_rates' and column_name = 'city'
  ) then raise exception 'shipping city specificity is missing'; end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'payment_status'
  ) then raise exception 'order payment status is missing'; end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass and conname = 'orders_payment_method_check'
  ) then raise exception 'COD-only payment constraint is missing'; end if;
end;
$$;

-- Customer policy shape: ownership is checked against auth.uid(), not a client id.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'addresses'
      and policyname = 'addresses_customer_manage'
      and qual ilike '%auth.uid%'
  ) then
    raise exception 'address ownership policy is missing';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders'
      and policyname = 'orders_customer_read'
      and qual ilike '%auth.uid%'
  ) then
    raise exception 'order ownership policy is missing';
  end if;
end;
$$;

-- Inventory and totals are protected by database constraints and the order RPC.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.product_variants'::regclass
      and conname like '%stock_quantity%'
  ) then
    raise exception 'inventory non-negative constraint is missing';
  end if;
  if not exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace and proname = 'create_order'
  ) then
    raise exception 'secure order creation function is missing';
  end if;
end;
$$;

-- The role trigger must reject authenticated role changes. The service role is
-- the only supported path for provisioning an administrator.
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.profiles'::regclass
      and tgname = 'profiles_role_immutable'
  ) then
    raise exception 'profile role immutability trigger is missing';
  end if;
end;
$$;

-- A real customer/admin integration run should execute these statements with
-- two existing fixture users (replace the UUIDs before running):
--
-- select set_config('request.jwt.claims',
--   '{"sub":"CUSTOMER_UUID","role":"authenticated"}', true);
-- set local role authenticated;
-- select is(
--   (select count(*) from orders where user_id <> 'CUSTOMER_UUID'::uuid), 0::bigint,
--   'customer cannot read another customer order'
-- );
-- select set_config('request.jwt.claims',
--   '{"sub":"CUSTOMER_UUID","role":"authenticated"}', true);
-- select throws_ok(
--   $$update profiles set role = 'admin' where id = 'CUSTOMER_UUID'::uuid$$,
--   'profile role cannot be changed',
--   'customer cannot promote their own profile'
-- );
-- select set_config('request.jwt.claims',
--   '{"sub":"ADMIN_UUID","role":"authenticated"}', true);
-- select lives_ok(
--   $$insert into categories (name, slug) values ('Test', 'test')$$,
--   'administrator can manage categories'
-- );

rollback;
