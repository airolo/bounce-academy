insert into public.categories (id, name, slug, description)
values
  ('00000000-0000-0000-0000-000000000001', 'Shirts', 'shirts', 'Made for the daily grind'),
  ('00000000-0000-0000-0000-000000000002', 'Shorts', 'shorts', 'Move without limits'),
  ('00000000-0000-0000-0000-000000000003', 'Socks', 'socks', 'Lock in your foundation'),
  ('00000000-0000-0000-0000-000000000004', 'Basketball Shoes', 'basketball-shoes', 'Find your next step')
on conflict (slug) do update set name = excluded.name, is_active = true;

insert into public.products (id, category_id, name, slug, description)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Everyday Varsity Tee', 'everyday-varsity-tee', 'A heavyweight cotton tee with a relaxed fit for warmups, commutes, and everything after.'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Core Training Shorts', 'core-training-shorts', 'Lightweight four-way stretch shorts with a secure zip pocket and court-ready length.'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Bounce Crew Socks', 'bounce-crew-socks', 'Cushioned crew socks with arch support for all-day comfort and hard sessions.'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Court Vision Low', 'court-vision-low', 'A responsive low-top built for quick cuts, stable landings, and confident runs.')
on conflict (slug) do update set name = excluded.name, description = excluded.description, is_active = true;

insert into public.product_variants (id, product_id, sku, name, price, stock_quantity)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'BA-TEE-BLK-M', 'Black / M', 1890, 18),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'BA-TEE-WHT-L', 'White / L', 1890, 12),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'BA-SHORT-BLK-M', 'Black / M', 2290, 15),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'BA-SOCK-WHT-M', 'White / M-L', 790, 30),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'BA-SHOE-BLK-9', 'Black / US 9', 5490, 8),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'BA-SHOE-BLK-10', 'Black / US 10', 5490, 0)
on conflict (sku) do update set name = excluded.name, price = excluded.price, stock_quantity = excluded.stock_quantity, is_active = true;

insert into public.product_images (product_id, storage_path, alt_text, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85', 'Everyday Varsity Tee', 0),
  ('10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=85', 'Core Training Shorts', 0),
  ('10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=1000&q=85', 'Bounce Crew Socks', 0),
  ('10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85', 'Court Vision Low', 0)
on conflict (storage_path) do nothing;

insert into public.shipping_rates (name, region, province, city, min_order_total, rate)
values
  ('NCR standard delivery', 'NCR', null, null, 0, 150),
  ('Metro Manila delivery', 'NCR', 'Metro Manila', null, 3000, 100);

insert into public.training_services (id, name, slug, description, duration_minutes, price)
values
  ('30000000-0000-0000-0000-000000000001', '1-on-1 Basketball Training', 'one-on-one-basketball-training', 'Personalized coaching built around your goals, position, and current game.', 60, 1800),
  ('30000000-0000-0000-0000-000000000002', 'Shooting Training', 'shooting-training', 'Build a repeatable shooting process from footwork through follow-through.', 60, 1500),
  ('30000000-0000-0000-0000-000000000003', 'Ball Handling', 'ball-handling', 'Tighten your handle, change of pace, and confidence under pressure.', 60, 1500),
  ('30000000-0000-0000-0000-000000000004', 'Skills Development', 'skills-development', 'A complete workout for players ready to sharpen the details that separate them.', 90, 2200),
  ('30000000-0000-0000-0000-000000000005', 'Group Training', 'group-training', 'High-energy team sessions focused on decision-making and competitive reps.', 90, 1200)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  is_active = true;

insert into public.trainers (id, name, bio)
values
  ('40000000-0000-0000-0000-000000000001', 'Coach Marcus', 'Player development and shooting specialist.'),
  ('40000000-0000-0000-0000-000000000002', 'Coach Aya', 'Skills development and small-group training specialist.')
on conflict (id) do update set name = excluded.name, bio = excluded.bio, is_active = true;

insert into public.announcements (
  id, title, description, body, image_url, location, starts_at, ends_at,
  registration_deadline, available_slots, status
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    'Bounce Winter Skills Camp',
    'Three focused days of footwork, finishing, and competitive reps with the Bounce Academy coaching team.',
    'Three focused days of footwork, finishing, and competitive reps with the Bounce Academy coaching team.',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=85',
    'Makati City Basketball Center',
    '2026-11-20T01:00:00Z',
    '2026-11-22T09:00:00Z',
    '2026-11-15T15:59:00Z',
    40,
    'upcoming'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Open Run: Manila',
    'A high-energy community run for players who want to compete, connect, and keep building their game.',
    'A high-energy community run for players who want to compete, connect, and keep building their game.',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1400&q=85',
    'BGC Activity Center',
    '2026-11-07T08:00:00Z',
    '2026-11-07T11:00:00Z',
    '2026-11-06T15:59:00Z',
    24,
    'active'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  image_url = excluded.image_url,
  location = excluded.location,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  registration_deadline = excluded.registration_deadline,
  available_slots = excluded.available_slots,
  status = excluded.status,
  is_archived = false;
