import type { Metadata } from "next";

export const BRAND = "Vijayawada Car Travels";
export const DEFAULT_OG_IMAGE = { url: "/og-image.jpg", alt: `${BRAND} fleet in Vijayawada` };

/** Search phrases people use for car rental in and from Vijayawada. Shared by every page. */
export const CORE_KEYWORDS = [
  "Vijayawada Car Travels",
  "car travels in Vijayawada",
  "car rental Vijayawada",
  "car rental in Vijayawada with driver",
  "affordable car rental Vijayawada",
  "cheap car rental in Vijayawada",
  "low cost cabs Vijayawada",
  "cab service in Vijayawada",
  "taxi service Vijayawada",
  "car hire Vijayawada",
  "travels in Vijayawada",
  "best car travels in Vijayawada",
];

/** Page-specific phrases, combined with the core list by `pageMetadata`. */
export const PAGE_KEYWORDS = {
  home: [
    "car rental near me Vijayawada",
    "Vijayawada taxi booking",
    "outstation cabs from Vijayawada",
    "Vijayawada airport taxi",
    "Gannavaram airport cab",
    "Innova for rent in Vijayawada",
    "one way taxi Vijayawada",
    "car rental Andhra Pradesh",
  ],
  cars: [
    "cars on rent in Vijayawada",
    "car rental rates Vijayawada",
    "sedan on rent Vijayawada",
    "Innova Crysta on rent Vijayawada",
    "Innova car rental Vijayawada",
    "Fortuner on rent Vijayawada",
    "luxury car rental Vijayawada",
    "7 seater car rental Vijayawada",
  ],
  services: [
    "local car rental Vijayawada",
    "outstation cabs Vijayawada",
    "airport transfer Vijayawada",
    "corporate car rental Vijayawada",
    "wedding car rental Vijayawada",
    "hourly car rental Vijayawada",
  ],
  locations: [
    "Vijayawada to Hyderabad cab",
    "Vijayawada to Visakhapatnam cab",
    "Vijayawada to Tirupati cab",
    "Vijayawada to Guntur taxi",
    "Vijayawada to Bangalore cab",
    "Vijayawada to Chennai cab",
    "taxi near Benz Circle",
    "cab service near Vijayawada railway station",
  ],
  about: ["trusted car travels Vijayawada", "chauffeur driven cars Vijayawada", "local travel agency Vijayawada"],
  contact: ["Vijayawada Car Travels phone number", "Vijayawada Car Travels contact", "car travels near me", "book cab Vijayawada WhatsApp"],
  book: ["book car online Vijayawada", "book taxi Vijayawada", "cab booking Vijayawada", "advance cab booking Vijayawada"],
};

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: { url: string; alt?: string } | null;
  /** Use the title as-is instead of appending the brand via the root template. */
  absoluteTitle?: boolean;
  noindex?: boolean;
};

/**
 * Builds a page's metadata. Next.js replaces (not merges) nested objects like openGraph,
 * so every page needs the full set: canonical, Open Graph, Twitter and keywords.
 */
export function pageMetadata({ title, description, path, keywords = [], image, absoluteTitle, noindex }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${BRAND}`;
  const images = [image ?? DEFAULT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...new Set([...keywords, ...CORE_KEYWORDS])],
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_IN", siteName: BRAND, url: path, title: fullTitle, description, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: images.map((i) => i.url) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
