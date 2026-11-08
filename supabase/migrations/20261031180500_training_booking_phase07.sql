alter type public.booking_status add value if not exists 'completed';

alter table public.bookings
  alter column trainer_id drop not null;

create or replace function public.request_booking(
  p_service_id uuid,
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
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  select duration_minutes into service_duration
    from public.training_services
    where id = p_service_id and is_active;
  if not found then
    raise exception 'service is unavailable';
  end if;
  if p_starts_at < timezone('utc', now()) then
    raise exception 'booking date cannot be in the past';
  end if;

  insert into public.bookings (
    user_id, service_id, starts_at, ends_at, customer_notes
  )
  values (
    (select auth.uid()), p_service_id, p_starts_at,
    p_starts_at + make_interval(mins => service_duration), p_customer_notes
  )
  returning id into new_booking_id;
  return new_booking_id;
end;
$$;

create or replace function public.manage_booking(
  p_booking_id uuid,
  p_status public.booking_status default null,
  p_trainer_id uuid default null,
  p_admin_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.booking_status;
begin
  if not public.is_admin() then
    raise exception 'administrator access required';
  end if;

  select status into current_status
    from public.bookings
    where id = p_booking_id
    for update;
  if not found then
    raise exception 'booking not found';
  end if;
  if p_trainer_id is not null and not exists (
    select 1 from public.trainers where id = p_trainer_id and is_active
  ) then
    raise exception 'trainer is unavailable';
  end if;
  if p_status = 'confirmed' and p_trainer_id is null
    and not exists (select 1 from public.bookings where id = p_booking_id and trainer_id is not null) then
    raise exception 'assign a trainer before confirming';
  end if;
  if p_status = 'completed' and current_status <> 'confirmed' then
    raise exception 'only confirmed bookings can be completed';
  end if;
  if p_status = 'confirmed' and current_status <> 'pending' then
    raise exception 'only pending bookings can be confirmed';
  end if;

  update public.bookings
    set trainer_id = coalesce(p_trainer_id, trainer_id),
        status = coalesce(p_status, status),
        admin_notes = coalesce(p_admin_notes, admin_notes)
    where id = p_booking_id;
exception
  when exclusion_violation then
    raise exception 'trainer is already booked for this time';
end;
$$;

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
    (old.status = 'confirmed' and new.status in ('cancelled', 'completed'))
  ) then
    raise exception 'invalid booking status transition';
  end if;
  return new;
end;
$$;

revoke all on function public.request_booking(uuid, uuid, timestamptz, text) from public;
revoke all on function public.request_booking(uuid, timestamptz, text) from public;
revoke all on function public.manage_booking(uuid, public.booking_status, uuid, text) from public;
grant execute on function public.request_booking(uuid, timestamptz, text) to authenticated;
grant execute on function public.manage_booking(uuid, public.booking_status, uuid, text) to authenticated;
