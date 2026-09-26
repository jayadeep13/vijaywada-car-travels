-- Vijayawada Car Travels: database schema
-- Run in Supabase SQL editor (or `supabase db push`) BEFORE seed.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admins: a row here grants admin rights to a Supabase Auth user
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Cars and pricing
-- ---------------------------------------------------------------------------
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'Sedan',
  seating_capacity int not null default 4 check (seating_capacity between 1 and 60),
  fuel_type text,
  transmission text,
  air_conditioned boolean not null default true,
  description text,
  features text[] not null default '{}',
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One pricing row per car. All amounts are whole rupees.
create table if not exists public.car_pricing (
  car_id uuid primary key references public.cars(id) on delete cascade,
  -- Day rent
  day_12hr int,
  day_24hr int,
  day_fuel_km_per_litre numeric(5,1),
  day_chauffeur_12hr int,
  day_chauffeur_24hr int,
  day_extra_hour int,
  -- Regular (local packages)
  reg_4hr_40km int,
  reg_8hr_80km int,
  reg_extra_hour int,
  reg_extra_km int,
  -- Outstation
  out_per_km int,
  out_chauffeur int,
  out_min_km int,            -- distance above which outstation tariff applies
  out_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists car_images_car_idx on public.car_images(car_id, sort_order);

-- ---------------------------------------------------------------------------
-- Services, routes, service areas
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text,
  steps jsonb not null default '[]',   -- ["Share your trip", ...]
  faqs jsonb not null default '[]',    -- [{"q": "...", "a": "..."}]
  seo_title text,
  seo_description text,
  active boolean not null default true,
  display_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,           -- e.g. vijayawada-to-hyderabad-cab
  from_city text not null default 'Vijayawada',
  to_city text not null,
  distance_km int,
  duration text,
  description text,
  highlights text[] not null default '{}',
  faqs jsonb not null default '[]',
  seo_title text,
  seo_description text,
  active boolean not null default true,
  display_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  display_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Announcements and popup posters
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cta_text text,
  cta_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.posters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  cta_text text,
  cta_url text,
  placement text not null default 'home' check (placement in ('home', 'all')),
  frequency text not null default 'session' check (frequency in ('session', 'hours', 'every_visit')),
  frequency_hours int not null default 24 check (frequency_hours between 1 and 720),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 8 and 20),
  email text check (email is null or char_length(email) <= 120),
  car_id uuid references public.cars(id) on delete set null,
  vehicle_name text,
  service_type text not null,
  pickup text not null check (char_length(pickup) <= 160),
  destination text check (destination is null or char_length(destination) <= 160),
  travel_date date,
  pickup_time text,
  passengers int check (passengers is null or passengers between 1 and 60),
  message text check (message is null or char_length(message) <= 1000),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
  is_read boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);
create index if not exists enquiries_status_idx on public.enquiries(status);

-- ---------------------------------------------------------------------------
-- Reviews (real customer reviews only)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  review text not null,
  rating int not null default 5 check (rating between 1 and 5),
  review_date date,
  photo_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'Vijayawada Car Travels',
  tagline text,
  phone text,
  whatsapp text,
  alt_phone text,
  email text,
  address text,
  city text default 'Vijayawada',
  state text default 'Andhra Pradesh',
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  maps_url text,
  maps_embed_url text,
  google_business_url text,
  business_hours text,
  hero_image_url text,
  logo_url text,
  favicon_url text,
  social_links jsonb not null default '{}',  -- {"instagram": "...", "facebook": "...", "youtube": "..."}
  seo_title text,
  seo_description text,
  ga_id text,
  gsc_verification text,
  footer_text text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Activity log (dashboard "recent activity")
-- ---------------------------------------------------------------------------
create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  actor uuid default auth.uid(),
  action text not null,
  entity text not null,
  entity_label text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['cars','car_pricing','services','routes','enquiries','site_settings'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) can read published content and create enquiries.
-- Only admins can write anything else or read enquiries.
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.cars enable row level security;
alter table public.car_pricing enable row level security;
alter table public.car_images enable row level security;
alter table public.services enable row level security;
alter table public.routes enable row level security;
alter table public.locations enable row level security;
alter table public.announcements enable row level security;
alter table public.posters enable row level security;
alter table public.enquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_log enable row level security;

-- admins: an admin can see the admin list
drop policy if exists admins_read on public.admins;
create policy admins_read on public.admins for select using (public.is_admin());

-- helper macro: public read of active rows + full admin access
do $$
declare t text;
begin
  foreach t in array array['cars','services','routes','locations'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format('create policy %1$s_public_read on public.%1$s for select using (active or public.is_admin())', t);
    execute format('drop policy if exists %1$s_admin_all on public.%1$s', t);
    execute format('create policy %1$s_admin_all on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists car_pricing_public_read on public.car_pricing;
create policy car_pricing_public_read on public.car_pricing for select
  using (exists (select 1 from public.cars c where c.id = car_id and (c.active or public.is_admin())));
drop policy if exists car_pricing_admin_all on public.car_pricing;
create policy car_pricing_admin_all on public.car_pricing for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists car_images_public_read on public.car_images;
create policy car_images_public_read on public.car_images for select
  using (exists (select 1 from public.cars c where c.id = car_id and (c.active or public.is_admin())));
drop policy if exists car_images_admin_all on public.car_images;
create policy car_images_admin_all on public.car_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements for select using (
  public.is_admin() or (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
);
drop policy if exists announcements_admin_all on public.announcements;
create policy announcements_admin_all on public.announcements for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists posters_public_read on public.posters;
create policy posters_public_read on public.posters for select using (
  public.is_admin() or (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
);
drop policy if exists posters_admin_all on public.posters;
create policy posters_admin_all on public.posters for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select using (published or public.is_admin());
drop policy if exists reviews_admin_all on public.reviews;
create policy reviews_admin_all on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: anyone may create a NEW enquiry; only admins read/update/delete
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert
  with check (status = 'new' and is_read = false and admin_notes is null);
drop policy if exists enquiries_admin_read on public.enquiries;
create policy enquiries_admin_read on public.enquiries for select using (public.is_admin());
drop policy if exists enquiries_admin_update on public.enquiries;
create policy enquiries_admin_update on public.enquiries for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists enquiries_admin_delete on public.enquiries;
create policy enquiries_admin_delete on public.enquiries for delete using (public.is_admin());

drop policy if exists activity_admin_all on public.activity_log;
create policy activity_admin_all on public.activity_log for all using (public.is_admin()) with check (public.is_admin());

-- Simple DB-level flood protection: max 5 enquiries per phone number per hour
create or replace function public.enquiry_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.enquiries
      where phone = new.phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests. Please call or WhatsApp us instead.';
  end if;
  return new;
end; $$;
drop trigger if exists enquiry_rate_limit on public.enquiries;
create trigger enquiry_rate_limit before insert on public.enquiries
  for each row execute function public.enquiry_rate_limit();

-- ---------------------------------------------------------------------------
-- Storage bucket for images (public read, admin write, 5 MB, images only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
