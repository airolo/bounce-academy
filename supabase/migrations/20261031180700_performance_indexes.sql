create index if not exists addresses_user_id_created_at_idx
  on public.addresses (user_id, created_at desc);

create index if not exists cart_items_cart_id_idx
  on public.cart_items (cart_id);

create index if not exists product_variants_product_id_active_idx
  on public.product_variants (product_id, is_active);

create index if not exists product_images_product_id_sort_order_idx
  on public.product_images (product_id, sort_order);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists bookings_user_id_starts_at_idx
  on public.bookings (user_id, starts_at desc);

create index if not exists bookings_status_starts_at_idx
  on public.bookings (status, starts_at);

create index if not exists announcements_status_starts_at_idx
  on public.announcements (status, starts_at);
