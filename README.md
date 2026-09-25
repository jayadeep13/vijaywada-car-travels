# Vijayawada Car Travels

Car rental website with a full admin panel. Built with Next.js 16 (App Router), Supabase (database, login, image storage) and Tailwind CSS 4.

Everything on the site is managed from `/admin`: cars, prices, photos, services, routes, service areas, announcements, popup posters, reviews, booking enquiries and business settings. Changes appear on the live site within seconds.

## 1. Create the Supabase project

1. Create a free project at https://supabase.com (region: Mumbai, `ap-south-1`).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql` and run it.
3. Paste `supabase/seed.sql` and run it. This adds the 12 cars with prices, 4 services, 6 routes and the service areas.
4. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up". The admin panel uses a PIN, not Supabase accounts.

## 2. Run locally

Requires Node.js 20.9 or newer.

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are under Supabase **Project Settings → API**. The anon key is safe to expose: every table is protected by row-level security, so the public site can only read.

**Admin PIN.** `/admin` opens with a PIN (`ADMIN_PIN`). After the PIN, the server signs a 12-hour session cookie with `ADMIN_SESSION_SECRET` and uses `SUPABASE_SERVICE_ROLE_KEY` to read and save data. That key bypasses row-level security, so it is only ever used on the server, after the PIN check, and must never be given a `NEXT_PUBLIC_` name. Wrong PINs are limited to 5 per device and 20 in total per 15 minutes. To change the PIN, change `ADMIN_PIN` and redeploy; to sign every device out, change `ADMIN_SESSION_SECRET`.

## 3. Deploy on Vercel

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com/new.
3. Add all the environment variables from `.env.example` (including `ADMIN_PIN`, `ADMIN_SESSION_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`). Set `NEXT_PUBLIC_SITE_URL` to your real domain, e.g. `https://www.vijayawadacartravels.com`.
4. Deploy, then add your domain under **Settings → Domains**.

## 4. Before launch: checklist

In **/admin/settings**:
- Phone and WhatsApp number (Call and WhatsApp buttons stay hidden until these are set)
- Address, business hours, email
- Google Maps link and map embed (Google Maps → Share → Embed a map → Copy HTML → paste)
- Google Business Profile link
- Logo, favicon and a wide hero photo of one of your cars
- Google Analytics ID and Search Console verification (optional)

In **/admin/cars**:
- Upload a main photo for every car (landscape, about 1600×1000). Use your own photos, not manufacturer or competitor images.
- **Replace the seeded rates with your own tariff.** The seed prices came from a reference page. Several values there look inconsistent and are marked `VERIFY` in `supabase/seed.sql`:
  - Nissan Sunny: regular extra hour ₹100 vs day-rent extra hour ₹200
  - Toyota Camry: day extra hour ₹300 vs regular extra hour ₹400
  - Toyota Fortuner: day extra hour ₹300 vs regular ₹1,000; outstation driver allowance ₹1,500 (New Fortuner is ₹1,000)
  - BMW 7 Series: regular extra km ₹100 vs outstation ₹110
- Fill in fuel type and transmission (left empty so nothing is guessed).

In **/admin/routes**: check the approximate distances and travel times.

In **/admin/reviews**: add only genuine customer reviews. The reviews section and star ratings in search results stay hidden until real reviews exist.

## Admin guide

| Section | What it does |
| --- | --- |
| Dashboard | Counts, recent enquiries, recent changes |
| Cars | Add, edit, reorder (arrows), activate/deactivate, feature on homepage, all three tariffs, photos and gallery |
| Bookings | Every enquiry from the website. Search, filter by status or unread, update status, add private notes, call or WhatsApp the customer |
| Announcements | Slim bar at the top of the site. Optional start and end time (IST) |
| Posters | Popup image with button. Homepage or every page; show once per visit, every N hours, or every page load; optional schedule |
| Services / Routes / Locations | Page content, FAQs and SEO fields |
| Reviews | Customer reviews, published or hidden |
| Settings | Business details, map, logo, hero image, social links, SEO, analytics |

To hide a car, poster or announcement temporarily, switch it off instead of deleting it.

## How it works

- **Public pages** are cached and refreshed every 5 minutes, and immediately after any admin change.
- **Booking requests** are validated on the server, protected by a hidden spam field, a per-device limit and a database limit of 5 requests per phone number per hour. After sending, the customer can forward the details on WhatsApp in one tap.
- **Images** go to the Supabase `media` bucket. Only JPG, PNG, WebP and AVIF up to 5 MB are accepted, and the file contents are checked, not just the name.
- **SEO**: per-page titles and descriptions, canonical URLs, `sitemap.xml`, `robots.txt`, and structured data (AutoRental business, TaxiService, FAQ, Breadcrumb, car offers). Admin pages are never indexed.

## Project structure

```
supabase/schema.sql       tables, security policies, storage bucket
supabase/seed.sql         starting content
src/app/(site)/           public website
src/app/admin/            admin panel and its server actions
src/app/actions/          booking form action
src/components/site/      website components
src/components/admin/     admin components
src/lib/                  data access, formatting, WhatsApp links, structured data
src/proxy.ts              protects /admin (Next.js 16 replacement for middleware)
```
