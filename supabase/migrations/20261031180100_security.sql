create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  trusted_session boolean := current_user in ('postgres', 'supabase_admin')
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role';
begin
  if (
    new.id is distinct from old.id
    or new.created_at is distinct from old.created_at
  ) and not trusted_session then
    raise exception 'protected profile fields cannot be changed';
  end if;
  if new.role is distinct from old.role
     and not trusted_session then
    raise exception 'profile role cannot be changed';
  end if;
  return new;
end;
$$;

create trigger profiles_role_immutable before update on public.profiles
  for each row execute function public.prevent_role_change();

create or replace function public.prevent_order_status_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and not public.is_admin()
     and coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'order status can only be changed by an administrator';
  end if;
  if public.is_admin() and not (
    (old.status = 'pending' and new.status in ('paid', 'cancelled')) or
    (old.status = 'paid' and new.status in ('processing', 'cancelled')) or
    (old.status = 'processing' and new.status in ('shipped', 'cancelled')) or
    (old.status = 'shipped' and new.status = 'completed') or
    (new.status = old.status)
  ) then
    raise exception 'invalid order status transition';
  end if;
  return new;
end;
$$;
create trigger orders_status_guard before update on public.orders
  for each row execute function public.prevent_order_status_change();

create or replace function public.prevent_booking_status_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status and not public.is_admin()
     and coalesce((select auth.jwt() ->> 'role'), '') <> 'service_role' then
    raise exception 'booking status can only be changed by an administrator';
  end if;
  if public.is_admin() and not (
    new.status = old.status or
    (old.status = 'pending' and new.status in ('confirmed', 'rejected', 'cancelled')) or
    (old.status = 'confirmed' and new.status = 'cancelled')
  ) then
    raise exception 'invalid booking status transition';
  end if;
  return new;
end;
$$;
create trigger bookings_status_guard before update on public.bookings
  for each row execute function public.prevent_booking_status_change();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.training_services enable row level security;
alter table public.trainers enable row level security;
alter table public.bookings enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_activity_logs enable row level security;

create policy profiles_select_own on public.profiles for select
  to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update
  to authenticated using (id = (select auth.uid()) and role = 'customer')
  with check (id = (select auth.uid()) and role = 'customer');

create policy addresses_customer_manage on public.addresses for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy categories_public_read on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());
create policy categories_admin_manage on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy products_public_read on public.products for select to anon, authenticated
  using (is_active or public.is_admin());
create policy products_admin_manage on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy variants_public_read on public.product_variants for select to anon, authenticated
  using (is_active or public.is_admin());
create policy variants_admin_manage on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy images_public_read on public.product_images for select to anon, authenticated
  using (true);
create policy images_admin_manage on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy carts_customer_manage on public.carts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cart_items_customer_manage on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));

create policy shipping_rates_public_read on public.shipping_rates for select to anon, authenticated
  using (is_active or public.is_admin());
create policy shipping_rates_admin_manage on public.shipping_rates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy orders_customer_read on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy orders_admin_manage on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy order_items_customer_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.is_admin())));

create policy training_services_public_read on public.training_services for select to anon, authenticated
  using (is_active or public.is_admin());
create policy training_services_admin_manage on public.training_services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy trainers_public_read on public.trainers for select to anon, authenticated
  using (is_active or public.is_admin());
create policy trainers_admin_manage on public.trainers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy bookings_customer_create on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');
create policy bookings_admin_insert on public.bookings for insert to authenticated
  with check (public.is_admin());
create policy bookings_customer_read on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
create policy bookings_admin_manage on public.bookings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy bookings_admin_delete on public.bookings for delete to authenticated
  using (public.is_admin());

create policy announcements_public_read on public.announcements for select to anon, authenticated
  using (is_published or public.is_admin());
create policy announcements_admin_manage on public.announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy activity_logs_admin_read on public.admin_activity_logs for select to authenticated
  using (public.is_admin());
create policy activity_logs_admin_insert on public.admin_activity_logs for insert to authenticated
  with check (public.is_admin() and admin_id = (select auth.uid()));
