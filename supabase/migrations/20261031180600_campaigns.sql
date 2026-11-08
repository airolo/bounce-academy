create type public.campaign_status as enum ('draft', 'upcoming', 'active', 'completed', 'cancelled');

alter table public.announcements
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists registration_deadline timestamptz,
  add column if not exists available_slots integer,
  add column if not exists status public.campaign_status not null default 'draft',
  add column if not exists is_archived boolean not null default false,
  add column if not exists archived_at timestamptz;

update public.announcements
set description = body
where description is null;

alter table public.announcements
  alter column description set not null,
  add constraint announcements_dates_valid check (
    starts_at is null
    or (
      ends_at is not null
      and ends_at > starts_at
      and (registration_deadline is null or registration_deadline <= starts_at)
    )
  ),
  add constraint announcements_slots_valid check (available_slots is null or available_slots >= 0);

create or replace function public.validate_campaign()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.starts_at is null or new.ends_at is null then
    if new.status in ('upcoming', 'active', 'completed') then
      raise exception 'Campaign dates are required for this status';
    end if;
  elsif new.ends_at <= new.starts_at then
    raise exception 'Campaign end date must be after the start date';
  elsif new.registration_deadline is not null and new.registration_deadline > new.starts_at then
    raise exception 'Registration deadline must be on or before the campaign start date';
  end if;

  new.is_published = new.status <> 'draft' and not new.is_archived;
  if new.is_archived then
    new.archived_at = coalesce(new.archived_at, timezone('utc', now()));
  else
    new.archived_at = null;
  end if;
  return new;
end;
$$;

create trigger announcements_validate_campaign
  before insert or update on public.announcements
  for each row execute function public.validate_campaign();

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements for select
  to anon, authenticated
  using ((status <> 'draft' and not is_archived) or public.is_admin());

insert into storage.buckets (id, name, public)
values ('campaign-banners', 'campaign-banners', true)
on conflict (id) do update set public = excluded.public;

create policy campaign_banners_public_read on storage.objects
  for select to public using (bucket_id = 'campaign-banners');

create policy campaign_banners_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'campaign-banners' and public.is_admin());

create policy campaign_banners_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'campaign-banners' and public.is_admin())
  with check (bucket_id = 'campaign-banners' and public.is_admin());

create policy campaign_banners_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'campaign-banners' and public.is_admin());
