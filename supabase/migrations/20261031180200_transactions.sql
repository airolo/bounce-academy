create or replace function public.validate_inventory(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  variant_id uuid;
  requested_quantity integer;
  available_quantity integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'at least one item is required';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) with ordinality as a(value, ordinality)
    join jsonb_array_elements(p_items) with ordinality as b(value, ordinality)
      on a.ordinality < b.ordinality
    where a.value ->> 'variant_id' = b.value ->> 'variant_id'
  ) then
    raise exception 'duplicate variants are not allowed';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    begin
      variant_id := (item ->> 'variant_id')::uuid;
      requested_quantity := (item ->> 'quantity')::integer;
    exception when invalid_text_representation then
      raise exception 'invalid inventory item';
    end;
    if requested_quantity is null or requested_quantity <= 0 then
      raise exception 'quantity must be positive';
    end if;
    select stock_quantity into available_quantity
      from public.product_variants
      where id = variant_id and is_active
      for update;
    if not found or available_quantity < requested_quantity then
      raise exception 'insufficient inventory for variant %', variant_id;
    end if;
  end loop;
end;
$$;

create or replace function public.create_order(
  p_shipping_address jsonb,
  p_shipping_rate_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  item jsonb;
  variant_id uuid;
  requested_quantity integer;
  current_price numeric(12,2);
  current_stock integer;
  product_name text;
  variant_name text;
  variant_sku text;
  calculated_subtotal numeric(12,2) := 0;
  shipping_total numeric(12,2);
  rate_is_active boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'a shipping address is required';
  end if;
  perform public.validate_inventory(p_items);

  select rate, is_active into shipping_total, rate_is_active
    from public.shipping_rates
    where id = p_shipping_rate_id
    for share;
  if not found or rate_is_active is distinct from true then
    raise exception 'shipping rate is unavailable';
  end if;

  insert into public.orders (user_id, shipping_address, shipping_total)
  values ((select auth.uid()), p_shipping_address, shipping_total)
  returning id into new_order_id;

  for item in select value from jsonb_array_elements(p_items)
  loop
    variant_id := (item ->> 'variant_id')::uuid;
    requested_quantity := (item ->> 'quantity')::integer;

    select v.price, v.stock_quantity, v.name, v.sku, p.name
      into current_price, current_stock, variant_name, variant_sku, product_name
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and v.is_active and p.is_active
      for update of v;
    if not found or current_stock < requested_quantity then
      raise exception 'inventory changed while creating order';
    end if;

    insert into public.order_items (
      order_id, variant_id, product_name, variant_name, sku, unit_price, quantity
    )
    values (
      new_order_id, variant_id, product_name, variant_name, variant_sku,
      current_price, requested_quantity
    );
    update public.product_variants
      set stock_quantity = stock_quantity - requested_quantity
      where id = variant_id;
    calculated_subtotal := calculated_subtotal + (current_price * requested_quantity);
  end loop;

  update public.orders o
    set subtotal = calculated_subtotal
    where o.id = new_order_id;
  delete from public.cart_items ci
    using public.carts c
    where ci.cart_id = c.id
      and c.user_id = (select auth.uid())
      and ci.variant_id in (
        select (value ->> 'variant_id')::uuid from jsonb_array_elements(p_items)
      );
  return new_order_id;
exception
  when others then
    raise;
end;
$$;

create or replace function public.request_booking(
  p_service_id uuid,
  p_trainer_id uuid,
  p_starts_at timestamptz,
  p_customer_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking_id uuid;
  service_duration integer;
  service_is_active boolean;
  trainer_is_active boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  select duration_minutes, is_active into service_duration, service_is_active
    from public.training_services where id = p_service_id;
  select is_active into trainer_is_active from public.trainers where id = p_trainer_id;
  if not found or service_is_active is distinct from true then
    raise exception 'service or trainer is unavailable';
  end if;
  if trainer_is_active is distinct from true then
    raise exception 'service or trainer is unavailable';
  end if;

  insert into public.bookings (
    user_id, service_id, trainer_id, starts_at, ends_at, customer_notes
  )
  values (
    (select auth.uid()), p_service_id, p_trainer_id, p_starts_at,
    p_starts_at + make_interval(mins => service_duration), p_customer_notes
  )
  returning id into new_booking_id;
  return new_booking_id;
end;
$$;

create or replace function public.confirm_booking(
  p_booking_id uuid,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required';
  end if;
  update public.bookings
    set status = 'confirmed', admin_notes = p_admin_notes
    where id = p_booking_id and status = 'pending';
  if not found then
    raise exception 'booking is not pending';
  end if;
end;
$$;

create or replace function public.change_order_status(
  p_order_id uuid,
  p_status public.order_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required';
  end if;
  update public.orders set status = p_status where id = p_order_id;
  if not found then
    raise exception 'order not found';
  end if;
end;
$$;

revoke all on function public.validate_inventory(jsonb) from public;
revoke all on function public.create_order(jsonb, uuid, jsonb) from public;
revoke all on function public.request_booking(uuid, uuid, timestamptz, text) from public;
revoke all on function public.confirm_booking(uuid, text) from public;
revoke all on function public.change_order_status(uuid, public.order_status) from public;
grant execute on function public.create_order(jsonb, uuid, jsonb) to authenticated;
grant execute on function public.request_booking(uuid, uuid, timestamptz, text) to authenticated;
grant execute on function public.confirm_booking(uuid, text) to authenticated;
grant execute on function public.change_order_status(uuid, public.order_status) to authenticated;
