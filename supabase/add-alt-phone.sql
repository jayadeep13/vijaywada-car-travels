-- Adds the "Alternative phone" setting and sets the current contact numbers.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
alter table public.site_settings add column if not exists alt_phone text;

update public.site_settings
set phone = '+91 72789 18888',
    whatsapp = '+91 72789 18888',
    alt_phone = '+91 98484 69283'
where id = 1;
