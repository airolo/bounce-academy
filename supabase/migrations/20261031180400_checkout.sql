alter table public.addresses add column if not exists region text;
alter table public.shipping_rates add column if not exists region text;
alter table public.shipping_rates add column if not exists city text;

alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists payment_method text not null default 'cod';
alter table public.orders add column if not exists payment_status text not null default 'pending';

update public.orders
set order_number = 'BA-' || upper(substr(replace(id::text, '-', ''), 1, 10))
where order_number is null;

alter table public.orders alter column order_number set default ('BA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)));
alter table public.orders alter column order_number set not null;
create unique index if not exists orders_order_number_idx on public.orders(order_number);
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (payment_method = 'cod');
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'refunded'));

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
  customer_id uuid := auth.uid();
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
  selected_address jsonb := p_shipping_address;
  address_id uuid;
  address_region text;
  address_province text;
  address_city text;
  selected_rate_id uuid;
begin
  if customer_id is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(p_shipping_address) <> 'object' then raise exception 'a shipping address is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'your cart is empty'; end if;
  if exists (
    select 1
    from jsonb_array_elements(p_items) a
    join jsonb_array_elements(p_items) b on a <> b
    where a ->> 'variant_id' = b ->> 'variant_id'
  ) then raise exception 'duplicate variants are not allowed'; end if;
  if coalesce(p_shipping_address ->> 'payment_method', 'cod') <> 'cod' then raise exception 'only cash on delivery is available'; end if;

  if nullif(p_shipping_address ->> 'id', '') is not null then
    address_id := (p_shipping_address ->> 'id')::uuid;
    select jsonb_build_object(
      'id', id, 'label', label, 'recipient_name', recipient_name, 'phone', phone,
      'line1', line1, 'line2', line2, 'city', city, 'province', province,
      'region', region, 'postal_code', postal_code, 'country', country
    ), region, province, city
    into selected_address, address_region, address_province, address_city
    from public.addresses
    where id = address_id and user_id = customer_id;
    if not found then raise exception 'shipping address is unavailable'; end if;
  else
    address_region := nullif(trim(p_shipping_address ->> 'region'), '');
    address_province := nullif(trim(p_shipping_address ->> 'province'), '');
    address_city := nullif(trim(p_shipping_address ->> 'city'), '');
    if address_province is null or address_city is null
      or nullif(trim(p_shipping_address ->> 'line1'), '') is null
      or nullif(trim(p_shipping_address ->> 'recipient_name'), '') is null
      or nullif(trim(p_shipping_address ->> 'phone'), '') is null then
      raise exception 'complete shipping address is required';
    end if;
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    variant_id := (item ->> 'variant_id')::uuid;
    requested_quantity := (item ->> 'quantity')::integer;
    if requested_quantity is null or requested_quantity <= 0 then raise exception 'quantity must be positive'; end if;
    select v.price, v.stock_quantity, v.name, v.sku, p.name
      into current_price, current_stock, variant_name, variant_sku, product_name
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and v.is_active and p.is_active
      for update of v;
    if not found or current_stock < requested_quantity then raise exception 'inventory is unavailable'; end if;
    calculated_subtotal := calculated_subtotal + (current_price * requested_quantity);
  end loop;

  select id, rate into selected_rate_id, shipping_total
  from public.shipping_rates
  where is_active
    and (region is null or lower(region) = lower(address_region))
    and (province is null or lower(province) = lower(address_province))
    and (city is null or lower(city) = lower(address_city))
    and min_order_total <= calculated_subtotal
  order by
    (case when city is not null then 4 when province is not null then 2 when region is not null then 1 else 0 end) desc,
    min_order_total desc,
    updated_at desc
  limit 1
  for share;
  if selected_rate_id is null then raise exception 'shipping is unavailable for this address'; end if;
  if p_shipping_rate_id is not null and p_shipping_rate_id <> selected_rate_id then raise exception 'shipping rate is no longer available'; end if;

  insert into public.orders (user_id, shipping_address, subtotal, shipping_total, payment_method, payment_status)
  values (customer_id, selected_address, calculated_subtotal, shipping_total, 'cod', 'pending')
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
    if not found or current_stock < requested_quantity then raise exception 'inventory changed while creating order'; end if;
    insert into public.order_items (order_id, variant_id, product_name, variant_name, sku, unit_price, quantity)
    values (new_order_id, variant_id, product_name, variant_name, variant_sku, current_price, requested_quantity);
    update public.product_variants set stock_quantity = stock_quantity - requested_quantity where id = variant_id;
  end loop;

  delete from public.cart_items ci
  using public.carts c
  where ci.cart_id = c.id and c.user_id = customer_id;
  return new_order_id;
end;
$$;

revoke all on function public.create_order(jsonb, uuid, jsonb) from public;
grant execute on function public.create_order(jsonb, uuid, jsonb) to authenticated;
