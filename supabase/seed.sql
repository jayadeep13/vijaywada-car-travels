-- Vijayawada Car Travels: initial seed data. Run AFTER schema.sql.
-- All of this is editable later in /admin. Re-running is safe (upserts by slug).
--
-- CHECK BEFORE LAUNCH: these rates were taken from a reference page. Replace them
-- with your own tariff. Values that look inconsistent in the source are marked "VERIFY".

insert into public.site_settings (id, company_name, tagline, phone, whatsapp, email, city, state, business_hours,
  seo_title, seo_description, footer_text, latitude, longitude, maps_url, maps_embed_url, social_links)
values (1, 'Vijayawada Car Travels',
  'Car rental, airport transfers and outstation cabs from Vijayawada.',
  '+91 86883 62789', '+91 86883 62789', 'pswamy0818@gmail.com',
  'Vijayawada', 'Andhra Pradesh', 'Open 24 hours, all days',
  'Vijayawada Car Travels | Affordable Car Rental & Cabs in Vijayawada',
  'Vijayawada Car Travels: affordable car rental with driver in Vijayawada. Local taxi, airport cabs, one-way & outstation trips. Sedans, Innova, Crysta. Call +91 86883 62789.',
  'Chauffeur-driven cars for local, airport, outstation and corporate travel from Vijayawada, Andhra Pradesh.',
  16.518358656011564, 80.67640439970845,
  'https://www.google.com/maps/place/CHARAN+CAR+TRAVELS/@16.51844,80.6759116,19.96z/data=!4m6!3m5!1s0x3a35e5f9e88ca1b5:0x51d0e48132611621!8m2!3d16.5183812!4d80.67639!16s%2Fg%2F11txpht7qv?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D',
  'https://www.google.com/maps?q=Charan+Car+Travels,16.518358656011564,80.67640439970845&output=embed',
  '{"facebook": "https://www.facebook.com/profile.php?id=61594498482613", "instagram": "https://www.instagram.com/vijayawada_cartravels/"}')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Cars
-- ---------------------------------------------------------------------------
insert into public.cars (name, slug, category, seating_capacity, air_conditioned, description, features, featured, display_order) values
  ('Toyota Etios', 'etios', 'Sedan', 4, true, 'Comfortable, economical sedan for city runs, airport drops and budget outstation trips.', '{"Boot space for 2 large bags","Ideal for 1 to 4 travellers"}', true, 1),
  ('Swift Dzire', 'swift-dzire', 'Sedan', 4, true, 'Compact sedan that is easy through city traffic and comfortable on the highway.', '{"Boot space for 2 large bags","Ideal for 1 to 4 travellers"}', true, 2),
  ('Nissan Sunny', 'nissan-sunny', 'Sedan', 4, true, 'Roomy sedan with generous rear legroom for longer local days.', '{"Generous rear legroom","Ideal for 1 to 4 travellers"}', false, 3),
  ('Honda City', 'honda-city', 'Premium Sedan', 4, true, 'Refined premium sedan for business meetings and family occasions.', '{"Premium interior","Ideal for executives"}', false, 4),
  ('Toyota Innova', 'innova', 'MUV', 7, true, 'Spacious seven-seater for families and groups, local or outstation.', '{"Seats up to 7","Room for group luggage"}', true, 5),
  ('Toyota Innova Crysta', 'innova-crysta', 'Premium MUV', 7, true, 'The most requested car for long highway trips: quiet, spacious and comfortable.', '{"Seats up to 7","Captain seats on select cars","Long-trip comfort"}', true, 6),
  ('Toyota Camry', 'camry', 'Luxury Sedan', 4, true, 'Executive sedan for corporate guests, VIP pickups and weddings.', '{"Executive rear seat","Corporate and VIP travel"}', false, 7),
  ('Toyota Fortuner', 'fortuner', 'Premium SUV', 6, true, 'Commanding SUV with presence, comfort and space.', '{"Seats up to 6","Premium SUV"}', true, 8),
  ('New Toyota Fortuner', 'new-fortuner', 'Premium SUV', 6, true, 'Latest-generation Fortuner for events, weddings and premium travel.', '{"Latest model","Seats up to 6"}', false, 9),
  ('Mercedes-Benz C 220', 'benz-c220', 'Luxury Sedan', 4, true, 'Mercedes-Benz luxury for weddings, VIP guests and special occasions.', '{"Luxury interior","Wedding and VIP travel"}', false, 10),
  ('BMW 7 Series', 'bmw-7-series', 'Luxury Sedan', 4, true, 'Flagship luxury sedan for dignitaries and premium events.', '{"Flagship luxury","Chauffeur-driven"}', false, 11),
  ('Audi Q7', 'audi-q7', 'Luxury SUV', 6, true, 'Luxury SUV for high-profile guests and grand occasions.', '{"Luxury SUV","Seats up to 6"}', false, 12)
on conflict (slug) do nothing;

-- Car photos shipped with the website (public/). Only fills cars that have no photo yet,
-- so photos uploaded later in /admin are never overwritten.
update public.cars c set image_url = p.url
from (values
  ('etios', '/ETIOS.webp'), ('swift-dzire', '/SWIFT.webp'), ('nissan-sunny', '/sunny.webp'),
  ('honda-city', '/city.webp'), ('innova', '/INNOVA.webp'), ('innova-crysta', '/crysta.webp'),
  ('camry', '/CAM.webp'), ('fortuner', '/fortuner-2.webp'), ('new-fortuner', '/newf.webp'),
  ('benz-c220', '/benz-c-2201.webp'), ('bmw-7-series', '/bmw.webp'), ('audi-q7', '/93c7oua-1555653.webp')
) as p(slug, url)
where c.slug = p.slug and c.image_url is null;

-- ---------------------------------------------------------------------------
-- Pricing (whole rupees)
-- ---------------------------------------------------------------------------
insert into public.car_pricing (car_id,
  day_12hr, day_24hr, day_fuel_km_per_litre, day_chauffeur_12hr, day_chauffeur_24hr, day_extra_hour,
  reg_4hr_40km, reg_8hr_80km, reg_extra_hour, reg_extra_km,
  out_per_km, out_chauffeur, out_min_km, out_notes)
select c.id, p.d12, p.d24, p.fuel, p.ch12, p.ch24, p.dex, p.r4, p.r8, p.rex, p.rkm, p.okm, p.och, p.omin, p.onotes from (values
  ('etios',         1500,  2500,  10.0,  400,  700,  200,  1400,  2200,  200,  13,   13,  500, 350, 'Above 350 km, outstation tariff applies.'),
  ('swift-dzire',   1500,  2500,  10.0,  400,  700,  200,  1400,  2200,  200,  13,   13,  500, 350, 'Above 350 km, outstation tariff applies.'),
  -- VERIFY: regular extra hour (100) is lower than day-rent extra hour (200)
  ('nissan-sunny',  2000,  2500,   8.0,  500,  600,  200,  2000,  3000,  100,  12,   12,  500, null, null),
  ('honda-city',    5000,  7500,   6.0,  500, 1000,  200,  2500,  5000,  200,  50,   50,  500, null, null),
  ('innova',        2000,  3000,   8.0,  500,  700,  300,  2500,  3000,  300,  17,   17,  700, 450, 'Above 450 km, outstation tariff applies.'),
  ('innova-crysta', 2500,  3500,   8.0,  500,  700,  350,  3000,  4000,  350,  19,   19,  700, 450, 'Above 450 km, outstation tariff applies.'),
  -- VERIFY: day extra hour 300 vs regular extra hour 400
  ('camry',        10000, 15000,   6.0,  750, 1000,  300,  5000, 10000,  400,  70,   70, 1000, null, null),
  -- VERIFY: day extra hour 300 vs regular 1000; outstation chauffeur 1500 (New Fortuner is 1000)
  ('fortuner',     10000, 15000,   6.0,  750, 1000,  300,  5000, 10000, 1000,  50,   50, 1500, null, null),
  ('new-fortuner', 15000, 20000,   6.0,  750, 1000, 1000,  8000, 15000, 1000,  60,   60, 1000, null, null),
  ('benz-c220',    20000, 30000,   6.0,  750, 1500, 1000, 10000, 20000, 1000,  70,   70, 1500, null, null),
  -- VERIFY: regular extra km 100 vs outstation 110
  ('bmw-7-series', 20000, 30000,   6.0, 1000, 1500, 1000, 10000, 20000, 1000, 100,  110, 1500, null, null),
  ('audi-q7',      25000, 35000,   6.0, 1000, 1500, 1000, 15000, 25000, 1000, 120,  120, 1500, null, null)
) as p(slug, d12, d24, fuel, ch12, ch24, dex, r4, r8, rex, rkm, okm, och, omin, onotes)
join public.cars c on c.slug = p.slug
on conflict (car_id) do nothing;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
insert into public.services (slug, title, summary, body, steps, faqs, seo_title, seo_description, display_order) values
('local-car-rental', 'Local car rental',
 'Hourly and full-day cars with a driver, anywhere in Vijayawada.',
 'Choose a 4-hour or 8-hour package for shopping, hospital visits, functions and meetings, or book the car for 12 or 24 hours. Extra hours and kilometres are billed at the published rate for your car.',
 '["Tell us the date, pickup point and hours you need","We confirm the car and driver by phone or WhatsApp","Your driver arrives at the pickup point on time","Pay the package plus any extra hours or kilometres"]',
 '[{"q":"What is included in the 4 hrs / 40 km package?","a":"The car, driver and fuel for up to 4 hours or 40 km, whichever comes first. Beyond that, extra hour and extra km rates apply."},{"q":"Are parking and toll charges included?","a":"No. Parking, tolls and state permits are paid at actuals."},{"q":"Can I book for just a few hours?","a":"Yes. The smallest package is 4 hours / 40 km."}]',
 'Local Car Rental in Vijayawada with Driver | Hourly & Full Day',
 'Hire a car with driver in Vijayawada by the hour or for the full day. 4 hr / 40 km and 8 hr / 80 km packages. Sedans, Innova, Crysta and luxury cars.', 1),
('outstation-cabs', 'Outstation cabs',
 'One-way and round-trip journeys from Vijayawada, billed per kilometre.',
 'Travel to Hyderabad, Visakhapatnam, Tirupati, Chennai, Bangalore and anywhere in between. Outstation trips are billed per kilometre plus a daily driver allowance.',
 '["Share your destination, dates and number of travellers","We suggest the right car and share the per-km rate","Driver picks you up from your home or hotel","Pay kilometres travelled, driver allowance, tolls and permits"]',
 '[{"q":"How is outstation fare calculated?","a":"Kilometres travelled multiplied by the per-km rate for your car, plus the driver allowance for each day. Tolls, parking and state permits are extra."},{"q":"Do you offer one-way trips?","a":"Yes. Share your route and we will confirm the fare before the trip."},{"q":"Which car is best for a family of 6?","a":"Innova or Innova Crysta. Both seat up to 7 with room for luggage."}]',
 'Outstation Cabs from Vijayawada | One Way & Round Trip Taxi',
 'Outstation cabs from Vijayawada to Hyderabad, Vizag, Tirupati, Chennai and Bangalore. Clear per-km rates for sedans, Innova and Crysta.', 2),
('airport-transfer', 'Airport transfers',
 'Pickup and drop at Vijayawada International Airport, Gannavaram.',
 'Share your flight details and we will plan the pickup around your arrival. Drops are scheduled with enough time for check-in.',
 '["Share your flight number, date and address","We confirm the car and share driver details","Your driver meets you at arrivals or your door","Pay the confirmed fare"]',
 '[{"q":"Which airport do you serve?","a":"Vijayawada International Airport at Gannavaram, plus drops to Hyderabad, Visakhapatnam and other airports on request."},{"q":"What if my flight is delayed?","a":"Share your flight number while booking so the pickup can be adjusted to the actual arrival time."}]',
 'Vijayawada Airport Taxi | Gannavaram Airport Pickup & Drop',
 'Airport cab service to and from Vijayawada International Airport, Gannavaram. Sedans, Innova, Crysta and luxury cars. Book by call or WhatsApp.', 3),
('corporate-travel', 'Corporate travel',
 'Reliable cars for companies, executives, guests and events.',
 'Daily office cabs, executive cars for visiting leadership, and fleets for conferences and events. Monthly billing is available for companies.',
 '["Share your travel requirement or schedule","We propose cars and a rate plan","Drivers are assigned and briefed","Receive consolidated invoices"]',
 '[{"q":"Do you provide GST invoices?","a":"Please confirm invoicing requirements while booking and our team will share the details."},{"q":"Can you arrange several cars for an event?","a":"Yes. Share the date, number of guests and schedule, and we will plan the fleet."}]',
 'Corporate Car Rental in Vijayawada | Executive & Event Travel',
 'Corporate car rental in Vijayawada for executives, visiting guests, conferences and events. Sedans to luxury cars with professional drivers.', 4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Routes (distances are approximate road distances; adjust as needed)
-- ---------------------------------------------------------------------------
insert into public.routes (slug, to_city, distance_km, duration, description, highlights, faqs, seo_title, seo_description, display_order) values
('vijayawada-to-hyderabad-cab', 'Hyderabad', 275, '5 to 6 hours',
 'The busiest intercity route from Vijayawada, mostly on NH65 via Suryapet.',
 '{"Route via NH65 and Suryapet","Airport drops at Rajiv Gandhi International available"}',
 '[{"q":"How long does Vijayawada to Hyderabad take by car?","a":"Usually 5 to 6 hours depending on traffic and stops."},{"q":"Can I get a drop at Hyderabad airport?","a":"Yes. Mention the airport as your destination while booking."}]',
 'Vijayawada to Hyderabad Cab | One Way & Round Trip Taxi',
 'Book a Vijayawada to Hyderabad cab. About 275 km via NH65. Sedans, Innova and Crysta with clear per-km rates.', 1),
('vijayawada-to-visakhapatnam-cab', 'Visakhapatnam', 350, '6 to 7 hours',
 'Coastal highway drive to Vizag via Eluru, Rajahmundry and Annavaram.',
 '{"Route via Eluru and Rajahmundry","Stops at Annavaram on request"}',
 '[{"q":"How far is Visakhapatnam from Vijayawada by road?","a":"About 350 km, usually 6 to 7 hours."}]',
 'Vijayawada to Visakhapatnam Cab | Vizag Taxi Service',
 'Vijayawada to Vizag cab service, about 350 km via Rajahmundry. Sedans, Innova and Crysta with transparent per-km rates.', 2),
('vijayawada-to-tirupati-cab', 'Tirupati', 400, '7 to 8 hours',
 'Pilgrimage trip to Tirupati via Ongole and Nellore, with Tirumala on request.',
 '{"Route via Ongole and Nellore","Tirumala ghat road on request"}',
 '[{"q":"Do you go up to Tirumala?","a":"Yes, on request. Mention it while booking so the correct distance is planned."}]',
 'Vijayawada to Tirupati Cab | Tirumala Taxi from Vijayawada',
 'Book a Vijayawada to Tirupati cab, about 400 km. Comfortable Innova and Crysta for family pilgrimages.', 3),
('vijayawada-to-chennai-cab', 'Chennai', 455, '8 to 9 hours',
 'Long highway drive to Chennai via Ongole and Nellore on NH16.',
 '{"Route via NH16","Chennai airport drops available"}',
 '[{"q":"How long is the drive to Chennai?","a":"About 455 km, usually 8 to 9 hours."}]',
 'Vijayawada to Chennai Cab | Outstation Taxi',
 'Vijayawada to Chennai cab, about 455 km on NH16. Choose a sedan, Innova or Crysta with clear per-km pricing.', 4),
('vijayawada-to-bangalore-cab', 'Bangalore', 640, '11 to 12 hours',
 'Full-day drive to Bengaluru; most travellers prefer the Innova Crysta for comfort.',
 '{"Full-day drive","Crysta recommended for comfort"}',
 '[{"q":"Is a single-day drive to Bangalore possible?","a":"Yes, though it is a long day. Many travellers start early morning or plan an overnight halt."}]',
 'Vijayawada to Bangalore Cab | One Way & Round Trip',
 'Vijayawada to Bangalore cab, about 640 km. Innova Crysta and sedans with per-km rates and experienced highway drivers.', 5),
('vijayawada-to-guntur-cab', 'Guntur', 35, '45 minutes to 1 hour',
 'Short hop to Guntur for work, hospital visits or functions. Local packages usually work out cheaper than outstation rates.',
 '{"Local 4 hr / 40 km package often applies","Return trips same day"}',
 '[{"q":"Which tariff applies for Guntur?","a":"For same-day return trips, a local 4 hr or 8 hr package is usually the best value."}]',
 'Vijayawada to Guntur Cab | Taxi & Car Rental',
 'Vijayawada to Guntur cab, about 35 km. Local hourly packages and one-way drops.', 6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Service areas
-- ---------------------------------------------------------------------------
insert into public.locations (name, slug, display_order) values
  ('Benz Circle', 'benz-circle', 1),
  ('Governorpet', 'governorpet', 2),
  ('Labbipet', 'labbipet', 3),
  ('Patamata', 'patamata', 4),
  ('Moghalrajpuram', 'moghalrajpuram', 5),
  ('Auto Nagar', 'auto-nagar', 6),
  ('Kanuru', 'kanuru', 7),
  ('One Town', 'one-town', 8),
  ('Gannavaram Airport', 'gannavaram', 9),
  ('Tadepalli', 'tadepalli', 10),
  ('Mangalagiri', 'mangalagiri', 11),
  ('Amaravati', 'amaravati', 12)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- A starter announcement (inactive; enable it in /admin/announcements)
-- ---------------------------------------------------------------------------
insert into public.announcements (title, cta_text, cta_url, active)
select 'Airport transfers available 24/7', 'Book a pickup', '/services/airport-transfer', false
where not exists (select 1 from public.announcements);
