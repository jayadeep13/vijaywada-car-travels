import type { Car, Faq, Review, SiteSettings } from "./types";
import { rupees, startingPrice } from "./format";
import { absoluteUrl, SITE_URL } from "./site";

const abs = (u: string) => (/^https?:\/\//.test(u) ? u : absoluteUrl(u));

/** Cities we run trips to; listed as areaServed so the business shows for "<city> cab from Vijayawada" searches. */
const SERVED_CITIES = ["Vijayawada", "Guntur", "Amaravati", "Mangalagiri", "Eluru", "Machilipatnam", "Rajahmundry", "Hyderabad", "Visakhapatnam", "Tirupati", "Chennai", "Bengaluru"];

const OFFERED_SERVICES = [
  { name: "Local car rental in Vijayawada", path: "/services/local-car-rental" },
  { name: "Outstation cabs from Vijayawada", path: "/services/outstation-cabs" },
  { name: "Vijayawada airport taxi (Gannavaram)", path: "/services/airport-transfer" },
  { name: "Corporate car rental in Vijayawada", path: "/services/corporate-travel" },
];

export function websiteSchema(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: s.company_name,
    url: SITE_URL,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}

export function localBusinessSchema(s: SiteSettings, reviews: Review[] = [], cars: Car[] = []) {
  const perKm = cars.map((c) => c.car_pricing?.out_per_km).filter((n): n is number => typeof n === "number");
  const local = cars.map((c) => startingPrice(c.car_pricing)).filter((n): n is number => typeof n === "number");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: s.company_name,
    url: SITE_URL,
    description:
      s.seo_description ||
      "Affordable chauffeur-driven car rental in Vijayawada: local packages, airport taxi, one-way and round-trip outstation cabs, corporate and wedding cars.",
    slogan: "Your journey. Our priority.",
    logo: abs(s.logo_url || "/vctlogo.webp"),
    image: [abs(s.hero_image_url || "/ABOUT.webp"), abs("/corporate.webp")],
    priceRange: local.length ? `${rupees(Math.min(...local))} - ${rupees(Math.max(...local))}` : "₹₹",
    currenciesAccepted: "INR",
    areaServed: [
      ...SERVED_CITIES.map((name) => ({ "@type": "City", name })),
      { "@type": "State", name: "Andhra Pradesh" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Car rental services",
      itemListElement: OFFERED_SERVICES.map((o) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: o.name, url: absoluteUrl(o.path) },
        ...(perKm.length && o.path.includes("outstation")
          ? { priceSpecification: { "@type": "UnitPriceSpecification", price: Math.min(...perKm), priceCurrency: "INR", unitText: "km" } }
          : {}),
      })),
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address || undefined,
      addressLocality: s.city || "Vijayawada",
      addressRegion: s.state || "Andhra Pradesh",
      postalCode: s.postal_code || undefined,
      addressCountry: "IN",
    },
  };
  if (s.phone) data.telephone = s.phone;
  if (s.email) data.email = s.email;
  if (s.maps_url) data.hasMap = s.maps_url;
  if (s.business_hours && /24s*hours/i.test(s.business_hours)) {
    data.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    };
  }
  if (s.latitude && s.longitude) data.geo = { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude };
  const sameAs = [s.google_business_url, ...Object.values(s.social_links || {})].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  // Ratings are only emitted from real, published reviews.
  if (reviews.length >= 3) {
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length };
  }
  return data;
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function faqSchema(faqs: Faq[]) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function taxiServiceSchema(opts: { name: string; description: string; path: string; area?: string }, s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: { "@id": `${SITE_URL}/#business`, name: s.company_name },
    areaServed: opts.area || "Vijayawada, Andhra Pradesh",
  };
}

export function carOfferSchema(car: Car, s: SiteSettings) {
  const p = car.car_pricing;
  const offers = [
    p?.reg_4hr_40km && { name: "4 hours / 40 km", price: p.reg_4hr_40km },
    p?.reg_8hr_80km && { name: "8 hours / 80 km", price: p.reg_8hr_80km },
    p?.day_12hr && { name: "12 hour day rental", price: p.day_12hr },
    p?.day_24hr && { name: "24 hour day rental", price: p.day_24hr },
  ].filter(Boolean) as { name: string; price: number }[];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Car rental with driver",
    name: `${car.name} on rent in Vijayawada`,
    description: car.description || `${car.name} (${car.seating_capacity} seater) on rent with driver in Vijayawada.`,
    url: absoluteUrl(`/cars/${car.slug}`),
    ...(car.image_url ? { image: abs(car.image_url) } : {}),
    provider: { "@id": `${SITE_URL}/#business`, name: s.company_name },
    areaServed: "Vijayawada, Andhra Pradesh",
    offers: offers.map((o) => ({ "@type": "Offer", name: o.name, price: o.price, priceCurrency: "INR" })),
  };
}

export function carListSchema(cars: Car[], s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Cars on rent in Vijayawada from ${s.company_name}`,
    itemListElement: cars.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/cars/${c.slug}`),
      name: `${c.name} on rent in Vijayawada`,
    })),
  };
}
