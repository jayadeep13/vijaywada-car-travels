-- Replaces the old homepage SEO title ("Vijayawada Car Travels - 86883 62789") with the
-- keyword-rich title and description. Run once in Supabase: SQL Editor -> New query -> Run.
-- Safe to re-run. Other settings are not touched.

update public.site_settings
set
  seo_title = 'Vijayawada Car Travels | Affordable Car Rental & Cabs in Vijayawada',
  seo_description = 'Vijayawada Car Travels: affordable car rental with driver in Vijayawada. Local taxi, airport cabs, one-way & outstation trips. Sedans, Innova, Crysta. Call +91 86883 62789.'
where id = 1;

-- Check the result:
select seo_title, seo_description from public.site_settings where id = 1;
