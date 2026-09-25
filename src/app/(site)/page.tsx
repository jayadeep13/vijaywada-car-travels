import Image from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Car as CarIcon, Clock, Compass, MessageCircle, Phone, Star, UserRound } from "lucide-react";
import { BookingWidget } from "@/components/site/BookingWidget";
import { CarLottie } from "@/components/site/CarLottie";
import { CarShowcase } from "@/components/site/CarShowcase";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { MapSection } from "@/components/site/MapSection";
import { Reveal } from "@/components/site/Reveal";
import { ReviewsCarousel } from "@/components/site/ReviewsCarousel";
import { ServiceGlobe } from "@/components/site/ServiceGlobe";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { FALLBACK_REVIEWS } from "@/lib/fallback-reviews";
import { rupees, telHref } from "@/lib/format";
import { getCars, getLocations, getReviews, getRoutes, getSettings } from "@/lib/queries";
import { faqSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

const DESTINATIONS = [
  { name: "Hyderabad", image: "/destinations/hyderabad.webp" },
  { name: "Tirupati", image: "/destinations/tirupati.webp" },
  { name: "Bengaluru", image: "/destinations/bengaluru.webp" },
  { name: "Maredumilli", image: "/destinations/maredumilli.webp" },
  { name: "Visakhapatnam", image: "/destinations/visakhapatnam.webp" },
  { name: "Araku Valley", image: "/destinations/araku.webp" },
];

const FEATURES = [
  {
    icon: Clock,
    title: "Quick Pickup",
    body: "Doorstep pickup within minutes of booking. Your driver is confirmed and on the way before you finish packing.",
    gradient: "linear-gradient(135deg, #0d6150, #082e26)",
    video: "/path.mp4", // a 30 KB loop, instead of a ~300 KB animated image
    image: "/path-poster.webp",
  },
  {
    icon: BadgeIndianRupee,
    title: "Fair, Upfront Fares",
    body: "Every rate is published on this site. No surge pricing and no last-minute surprises, just the fare you saw when you booked.",
    gradient: "linear-gradient(135deg, #86ad49, #4d6a24)",
    image: "/fairprice.webp",
  },
  {
    icon: Compass,
    title: "Never Too Far",
    body: "From city errands to outstation trips across Andhra Pradesh and beyond, wherever you're headed, we'll get you there.",
    gradient: "linear-gradient(135deg, #2f6b9a, #163a56)",
    lottie: true,
  },
];

const ROUTE_CARD_GRADIENTS = [
  "linear-gradient(135deg, #0d6150, #082e26)",
  "linear-gradient(135deg, #86ad49, #4d6a24)",
  "linear-gradient(135deg, #2c3440, #12151a)",
  "linear-gradient(135deg, #2f6b9a, #163a56)",
  "linear-gradient(135deg, #a15a2b, #5e3316)",
  "linear-gradient(135deg, #4a4a86, #232349)",
];

const HOME_FAQS = [
  {
    q: "How do I book a car?",
    a: "Fill in the search widget on this page with your pickup, destination and travel date, or call us directly. We confirm the exact car, driver and fare by phone before your trip.",
  },
  {
    q: "Do I need to pay anything to book?",
    a: "No. There's no payment when you send a request online. We call to confirm the car and fare, and payment is settled directly with the driver at the end of the trip.",
  },
  {
    q: "What's included in the outstation fare?",
    a: "The per-km rate shown for each car. Driver allowance, tolls, permits and parking are billed separately and explained upfront on a call, so there are no surprises.",
  },
  {
    q: "Can I book a one-way outstation trip, or only round trips?",
    a: "Both. Choose \"One way\" or \"Round trip\" in the search widget, and the fare is calculated accordingly.",
  },
  {
    q: "Do you provide airport pickup and drop?",
    a: "Yes, to and from Vijayawada (Gannavaram) Airport. Share your flight time when booking and we'll track it in case of delays.",
  },
  {
    q: "Are your drivers verified?",
    a: "Every trip comes with a verified, experienced chauffeur who knows the city and highway routes well.",
  },
  {
    q: "Can I hire a car for just a few hours in the city?",
    a: "Yes, local packages are available by the hour or for a full day, with fuel included in the package.",
  },
  {
    q: "What if my plans change after booking?",
    a: "Call or WhatsApp us as soon as you know. We'll do our best to adjust the pickup time, drop location or car for you.",
  },
];

function pricingFaqs(cars: { name: string; car_pricing: { reg_4hr_40km: number | null; out_per_km: number | null } | null }[]) {
  const local = cars.filter((c) => c.car_pricing?.reg_4hr_40km).sort((a, b) => a.car_pricing!.reg_4hr_40km! - b.car_pricing!.reg_4hr_40km!);
  const perKm = cars.filter((c) => c.car_pricing?.out_per_km).sort((a, b) => a.car_pricing!.out_per_km! - b.car_pricing!.out_per_km!);
  if (!local.length || !perKm.length) return [];
  return [
    {
      q: "What is the cheapest car rental in Vijayawada?",
      a: `At Vijayawada Car Travels the most affordable option is a sedan like the ${local[0].name}, from ${rupees(local[0].car_pricing!.reg_4hr_40km)} for a 4 hour / 40 km local package with a driver. Outstation trips start at ${rupees(perKm[0].car_pricing!.out_per_km)} per km.`,
    },
    {
      q: "How much does an outstation cab from Vijayawada cost?",
      a: `Outstation cabs are billed per kilometre: from ${rupees(perKm[0].car_pricing!.out_per_km)}/km for a sedan, and more for an Innova, Crysta or SUV. Driver allowance, tolls and permits are extra and shared with you before the trip.`,
    },
  ];
}

export default async function HomePage() {
  const [settings, allCars, routes, locations, reviews] = await Promise.all([
    getSettings(),
    getCars(),
    getRoutes(),
    getLocations(),
    getReviews(),
  ]);
  const showcaseCars = allCars.length ? allCars : FALLBACK_CARS;
  const minPerKm = Math.min(...showcaseCars.map((c) => c.car_pricing?.out_per_km ?? Infinity));
  const displayReviews = reviews.length ? reviews : FALLBACK_REVIEWS;
  const avgRating = displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length;
  const wa = whatsappLink(settings.whatsapp, settings.company_name);
  const faqs = [...pricingFaqs(showcaseCars), ...HOME_FAQS];
  const homeFaqSchema = faqSchema(faqs);
  // The hero poster is the largest thing on screen at load, so fetch it before anything else.
  if (!settings.hero_image_url) preload("/hero-poster.webp", { as: "image", fetchPriority: "high" });

  return (
    <>
      <JsonLd data={websiteSchema(settings)} />
      <JsonLd data={localBusinessSchema(settings, reviews, showcaseCars)} />
      {homeFaqSchema && <JsonLd data={homeFaqSchema} />}

      {/* Hero: full-bleed, pulled up under the sticky header so the video shows through it before scroll */}
      <section className="relative -mt-16 overflow-hidden bg-ink text-white md:-mt-[72px]">
          {settings.hero_image_url ? (
            <>
              <Image src={settings.hero_image_url} alt="" fill priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" aria-hidden />
            </>
          ) : (
            <>
              {/* The poster shows instantly; phones get a lighter 720p encode of the same clip */}
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/hero-poster.webp"
                aria-hidden
                className="absolute inset-0 size-full object-cover"
              >
                <source src="/herovideo-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
                <source src="/herovideo.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/25 to-transparent" aria-hidden />
            </>
          )}
          <div className="container-x relative grid gap-10 pt-[6.5rem] pb-10 sm:pt-[7.5rem] md:py-16 md:pt-[9rem] lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-16 lg:py-20 lg:pt-[10rem]">
            {/* Below lg this wrapper is "contents", so the selling points can sit under the booking form */}
            <div className="contents lg:flex lg:flex-col">
              <div className="order-1 px-2 sm:px-0 lg:order-none">
                <h1>
                  <span className="hero-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-white/80 backdrop-blur-sm sm:px-3.5 sm:text-xs sm:tracking-[0.08em]">
                  <span className="size-1.5 rounded-full bg-[#86ad49]" aria-hidden />
                  Car rental in Vijayawada, Andhra Pradesh
                  </span>
                  <span className="sr-only">: </span>
                  <span className="hero-in hero-in-2 mt-5 block text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.045em] [text-shadow:0_2px_24px_rgb(0_0_0_/_0.55)] sm:text-6xl lg:text-[4.5rem]">
                  Your journey.
                  <br />
                  <span className="text-[#86ad49]">Our priority.</span>
                  </span>
                </h1>
                <p className="hero-in hero-in-3 mt-5 max-w-lg text-base leading-relaxed sm:mt-6 sm:text-lg text-white/85 [text-shadow:0_1px_12px_rgb(0_0_0_/_0.5)]">
                  Affordable car rental with driver, airport taxi, local and outstation cabs from Vijayawada.
                </p>
              </div>
              <ul className="hero-in hero-in-3 order-3 -mt-2 grid grid-cols-3 gap-x-3 gap-y-5 px-2 sm:gap-x-6 sm:px-0 lg:order-none lg:mt-auto lg:border-t lg:border-white/10 lg:pt-7">
                {[
                  { icon: UserRound, t: "Chauffeur-driven", d: "Every trip, every car" },
                  { icon: BadgeIndianRupee, t: "Upfront rates", d: "No hidden charges" },
                  { icon: CarIcon, t: "Sedans to luxury", d: "A car for every need" },
                ].map(({ icon: Icon, t, d }) => (
                  <li key={t} className="flex flex-col items-start gap-2 sm:flex-row sm:gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/8 text-[#86ad49]">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold leading-tight sm:text-sm">{t}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-white/55 sm:mt-0 sm:text-xs">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hero-in hero-in-2 order-2 text-ink lg:order-none">
              <BookingWidget />
            </div>
          </div>
      </section>

      <CarShowcase cars={showcaseCars} />

      {/* Destinations, with the globe bleeding off the right edge */}
      <section aria-labelledby="destinations-heading" className="relative overflow-hidden py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="relative z-10">
            <h2 id="destinations-heading" className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">
              More than just a ride.
              <br />
              <span className="text-[#86ad49]">We&apos;ll take you exploring.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
              Temple towns, tech cities and misty hill forests. Our drivers know the road to every getaway near Vijayawada.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {DESTINATIONS.map((d) => (
                <li key={d.name} className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-line">
                  <Image
                    src={d.image}
                    alt={`Vijayawada to ${d.name} trip by cab`}
                    fill
                    sizes="(min-width: 1024px) 15vw, (min-width: 640px) 20vw, 30vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
                  <span className="absolute inset-x-2 bottom-2 text-sm font-bold leading-tight text-white [text-shadow:0_1px_8px_rgb(0_0_0_/_0.6)]">
                    {d.name}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/locations"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-ink lg:hidden"
            >
              Explore many more cities
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="hidden lg:block" aria-hidden />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <div className="absolute top-1/2 right-[-16%] aspect-square w-[36rem] -translate-y-1/2">
            <ServiceGlobe className="size-full" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 18% 50%, rgb(250 250 248 / 0.85) 0%, rgb(250 250 248 / 0.35) 30%, rgb(250 250 248 / 0) 62%)" }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-3">
            <Link
              href="/locations"
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-bold text-ink shadow-lift transition-colors hover:border-ink"
            >
              Explore many more cities
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-graphite">Vijayawada Car Travels</p>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section aria-labelledby="features-heading" className="bg-[#f8fbff] py-12 md:py-24">
        <div className="container-x">
          <h2 id="features-heading" className="mb-5 text-2xl font-extrabold tracking-[-0.03em] md:sr-only">
            Why book with us
          </h2>
          {/* Phones: compact list cards (thumbnail beside text). Tablet up: three large columns. */}
          <div className="grid gap-3 md:grid-cols-3 md:gap-8">
            {FEATURES.map(({ icon: Icon, title, body, gradient, image, lottie, video }) => (
              <div
                key={title}
                className="flex items-center gap-4 rounded-2xl bg-surface p-3 shadow-[0_1px_2px_rgb(28_31_35_/_0.04)] ring-1 ring-line md:block md:rounded-none md:bg-transparent md:p-0 md:shadow-none md:ring-0"
              >
                <div
                  className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl md:aspect-[4/3] md:size-auto md:w-full md:rounded-2xl"
                  style={{ background: gradient }}
                >
                  {lottie ? (
                    <CarLottie className="size-full" />
                  ) : video ? (
                    <video
                      src={video}
                      poster={image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      aria-hidden
                      className="absolute inset-0 size-full bg-white object-cover"
                    />
                  ) : image ? (
                    <Image src={image} alt="" fill sizes="(min-width: 768px) 33vw, 96px" className="object-cover" />
                  ) : (
                    // TODO: swap this placeholder for a real photo once available
                    <Icon className="size-16 text-white/25" aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold tracking-tight md:mt-5 md:text-xl">{title}</h3>
                  <p className="mt-1 text-[13.5px] leading-snug text-graphite md:mt-2 md:text-base md:leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular routes */}
      {routes.length > 0 && (
        <section aria-labelledby="routes-heading" className="container-x py-16 md:py-24">
          <div className="grid items-center gap-8 overflow-hidden rounded-[1.75rem] border border-line bg-surface lg:grid-cols-2">
            <div className="p-6 sm:p-8 md:p-12">
              <h2 id="routes-heading" className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.75rem] md:leading-[1.08]">
                Wherever the road leads.
                <br />
                <span className="text-[#86ad49]">We&apos;ll take you there.</span>
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
                Outstation cabs from Vijayawada to every major city in Andhra Pradesh and beyond, with transparent per-km rates.
              </p>
              <Link href="/locations" className="mt-6 inline-flex items-center gap-2 font-bold text-accent underline-offset-4 hover:underline">
                All routes and areas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[320px]">
              <Image src="/hero-poster.webp" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            {routes.map((r, i) => (
              <li key={r.slug}>
                <Link
                  href={`/${r.slug}`}
                  className="group relative flex aspect-[4/3.6] flex-col justify-end overflow-hidden rounded-[1.25rem] p-4 transition-transform duration-300 hover:-translate-y-1 sm:aspect-[4/3.1] sm:rounded-[1.5rem] sm:p-5"
                  style={{ background: ROUTE_CARD_GRADIENTS[i % ROUTE_CARD_GRADIENTS.length] }}
                >
                  <span
                    aria-hidden
                    className="absolute -right-4 -top-6 select-none text-[6rem] font-black leading-none text-white/10 transition-transform duration-500 group-hover:scale-110 sm:text-[8rem]"
                  >
                    {r.to_city.charAt(0)}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
                  <span className="relative text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 sm:text-xs">{r.from_city} to</span>
                  <span className="relative break-words text-lg font-extrabold leading-tight tracking-tight text-white sm:text-2xl">{r.to_city}</span>
                  {(r.distance_km || r.duration) && (
                    <span className="relative mt-1 text-xs text-white/80 sm:text-sm">
                      {[r.distance_km ? `${r.distance_km} km` : null, r.duration].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {Number.isFinite(minPerKm) && (
            <p className="mt-4 text-sm text-graphite">Outstation fares start at {rupees(minPerKm)} per km, plus driver allowance, tolls and permits.</p>
          )}
        </section>
      )}

      {/* Service areas */}
      {locations.length > 0 && (
        <section aria-labelledby="areas-heading" className="border-y border-line bg-surface py-16 md:py-20">
          <div className="container-x grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 id="areas-heading" className="text-3xl font-extrabold tracking-[-0.03em]">Pickups across Vijayawada</h2>
              <p className="mt-3 leading-relaxed text-graphite">Doorstep pickup from homes, hotels, hospitals, offices and the airport.</p>
            </div>
            <ul className="flex flex-wrap content-start gap-2">
              {locations.map((l) => (
                <li key={l.slug} className="rounded-full border border-line-strong px-4 py-2 text-sm font-semibold">{l.name}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Corporate */}
      <Reveal as="section" className="bg-accent-soft py-16 md:py-24">
        <div className="container-x">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">Corporate travel, handled</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
                Cars for visiting executives, client pickups, conferences and daily office travel, with one point of contact.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/services/corporate-travel" className="btn btn-primary">Plan corporate travel</Link>
                <Link href="/contact" className="btn btn-ghost">Talk to our team</Link>
              </div>
            </div>
            <div
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl"
              style={{ background: "linear-gradient(135deg, #2c3440, #12151a)" }}
            >
              <Image src="/corporate.webp" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 lg:grid-cols-4">
            {["Executive sedans and luxury cars", "Airport pickups for guests", "Multiple cars for events", "Monthly billing on request"].map((t) => (
              <li key={t} className="rounded-2xl bg-surface p-4 text-sm font-bold leading-snug sm:p-5 sm:text-base">{t}</li>
            ))}
          </ul>
        </div>
      </Reveal>

      <MapSection settings={settings} />

      {/* Reviews */}
      <section aria-labelledby="reviews-heading" className="bg-ink py-16 text-white md:py-24">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/50">Customer reviews</p>
              <h2 id="reviews-heading" className="mt-2 text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem]">
                What travellers say
              </h2>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-6 py-4">
              <span className="text-4xl font-extrabold text-[#86ad49]">{avgRating.toFixed(1)}</span>
              <div>
                <p className="flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-4 ${i < Math.round(avgRating) ? "fill-[#86ad49] text-[#86ad49]" : "text-white/20"}`} />
                  ))}
                </p>
                <p className="mt-1 text-xs text-white/50">Reviews</p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <ReviewsCarousel reviews={displayReviews} />
          </div>
        </div>
        {settings.google_business_url && (
          <div className="container-x mt-6 text-center">
            <Link
              href={settings.google_business_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold underline-offset-4 hover:underline"
            >
              Read more reviews on Google
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      {/* Search-friendly summary of what we offer, with links into the rest of the site */}
      <section aria-labelledby="about-rental-heading" className="container-x py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <h2 id="about-rental-heading" className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">
            Affordable car rental in Vijayawada,
            <span className="text-[#86ad49]"> with a driver</span>
          </h2>
          <div className="space-y-4 leading-relaxed text-graphite">
            <p>
              {settings.company_name} is a local car travels service in Vijayawada offering chauffeur-driven cars at honest, published rates.
              Hire an economical sedan like the Etios or Swift Dzire for city errands, an{" "}
              <Link href="/cars/innova" className="font-semibold text-ink underline-offset-4 hover:underline">Innova</Link> or{" "}
              <Link href="/cars/innova-crysta" className="font-semibold text-ink underline-offset-4 hover:underline">Innova Crysta</Link> for family trips,
              or a Fortuner, Mercedes-Benz, BMW or Audi when the occasion calls for it.
            </p>
            <p>
              We run <Link href="/services/local-car-rental" className="font-semibold text-ink underline-offset-4 hover:underline">local car rental</Link> by the hour,{" "}
              <Link href="/services/airport-transfer" className="font-semibold text-ink underline-offset-4 hover:underline">Vijayawada airport taxi</Link> pickups and drops at Gannavaram,{" "}
              <Link href="/services/outstation-cabs" className="font-semibold text-ink underline-offset-4 hover:underline">one-way and round-trip outstation cabs</Link>{" "}
              to Hyderabad, Visakhapatnam, Tirupati, Guntur, Chennai and Bengaluru, plus{" "}
              <Link href="/services/corporate-travel" className="font-semibold text-ink underline-offset-4 hover:underline">corporate car rental</Link> and wedding cars.
              {Number.isFinite(minPerKm) && <> Outstation fares start at {rupees(minPerKm)} per km, with no surge pricing.</>}
            </p>
            <p>
              Pickups are available from anywhere in Vijayawada, including Benz Circle, the railway station, the bus stand and hotels.{" "}
              <Link href="/cars" className="font-semibold text-accent underline-offset-4 hover:underline">Compare car rental rates</Link> or{" "}
              <Link href="/locations" className="font-semibold text-accent underline-offset-4 hover:underline">see the routes we cover</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="bg-[#f8fbff] py-16 md:py-24">
        <div className="container-x flex flex-col items-center text-center">
          <h2 id="faq-heading" className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem]">
            Frequently asked questions
          </h2>
          <div className="mt-10 w-full max-w-2xl text-left">
            <FaqList faqs={faqs} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x pb-16 md:pb-24">
        <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white sm:p-8 md:flex-row md:items-stretch md:justify-between md:p-12">
          <div className="md:self-center">
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">Need a car today?</h2>
            <p className="mt-2 text-white/70">Call, WhatsApp or send a request. We reply quickly.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:self-center">
            {settings.phone && (
              <a href={telHref(settings.phone)} className="btn bg-white text-ink hover:bg-white/90"><Phone className="size-4" aria-hidden />Call now</a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-white/25 text-white hover:border-white"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>
            )}
            <Link href="/book" className="btn btn-accent">Book a car</Link>
          </div>
        </div>
      </section>
    </>
  );
}
