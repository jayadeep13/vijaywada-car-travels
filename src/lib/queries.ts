import "server-only";
import { cache } from "react";
import { createPublicClient, supabaseConfigured } from "./supabase/server";
import type { Announcement, Car, Location, Poster, Review, Route, Service, SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  company_name: "Vijayawada Car Travels",
  tagline: "Car rental, airport transfers and outstation cabs from Vijayawada.",
  phone: "+91 72789 18888",
  whatsapp: "+91 72789 18888",
  alt_phone: "+91 98484 69283",
  email: "pswamy0818@gmail.com",
  address: null,
  city: "Vijayawada",
  state: "Andhra Pradesh",
  postal_code: null,
  latitude: 16.518358656011564,
  longitude: 80.67640439970845,
  maps_url: "https://www.google.com/maps/place/CHARAN+CAR+TRAVELS/@16.51844,80.6759116,19.96z/data=!4m6!3m5!1s0x3a35e5f9e88ca1b5:0x51d0e48132611621!8m2!3d16.5183812!4d80.67639!16s%2Fg%2F11txpht7qv?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D",
  maps_embed_url: "https://www.google.com/maps?q=Charan+Car+Travels,16.518358656011564,80.67640439970845&output=embed",
  google_business_url: null,
  business_hours: null,
  hero_image_url: null,
  logo_url: null,
  favicon_url: null,
  social_links: {
    facebook: "https://www.facebook.com/profile.php?id=61594498482613",
    instagram: "https://www.instagram.com/vijayawada_cartravels/",
  },
  seo_title: null, // the keyword-rich default in app/layout.tsx is used when this is empty
  seo_description: null,
  ga_id: null,
  gsc_verification: null,
  footer_text: null,
};

const CAR_SELECT = "*, car_pricing(*), car_images(*)";

async function safe<T>(fallback: T, run: () => PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  if (!supabaseConfigured) return fallback;
  try {
    const { data, error } = await run();
    if (error) {
      console.error("[queries]", error);
      return fallback;
    }
    return data ?? fallback;
  } catch (e) {
    console.error("[queries]", e);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const row = await safe<Partial<SiteSettings> | null>(null, () =>
    createPublicClient().from("site_settings").select("*").eq("id", 1).maybeSingle(),
  );
  return { ...DEFAULT_SETTINGS, ...(row ?? {}), social_links: (row?.social_links as Record<string, string>) ?? DEFAULT_SETTINGS.social_links };
});

function normaliseCar(c: Car): Car {
  // Supabase returns a one-to-one relation as an object (or array on some versions)
  const pricing = Array.isArray(c.car_pricing) ? (c.car_pricing[0] ?? null) : c.car_pricing;
  const images = [...(c.car_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return { ...c, car_pricing: pricing, car_images: images, features: c.features ?? [] };
}

export const getCars = cache(async (opts: { featuredOnly?: boolean } = {}): Promise<Car[]> => {
  const rows = await safe<Car[]>([], () => {
    let q = createPublicClient().from("cars").select(CAR_SELECT).eq("active", true);
    if (opts.featuredOnly) q = q.eq("featured", true);
    return q.order("display_order");
  });
  return rows.map(normaliseCar);
});

export const getCar = cache(async (slug: string): Promise<Car | null> => {
  const row = await safe<Car | null>(null, () =>
    createPublicClient().from("cars").select(CAR_SELECT).eq("slug", slug).eq("active", true).maybeSingle(),
  );
  return row ? normaliseCar(row) : null;
});

export const getServices = cache(async () =>
  safe<Service[]>([], () => createPublicClient().from("services").select("*").eq("active", true).order("display_order")),
);

export const getService = cache(async (slug: string) =>
  safe<Service | null>(null, () =>
    createPublicClient().from("services").select("*").eq("slug", slug).eq("active", true).maybeSingle(),
  ),
);

export const getRoutes = cache(async () =>
  safe<Route[]>([], () => createPublicClient().from("routes").select("*").eq("active", true).order("display_order")),
);

export const getRoute = cache(async (slug: string) =>
  safe<Route | null>(null, () =>
    createPublicClient().from("routes").select("*").eq("slug", slug).eq("active", true).maybeSingle(),
  ),
);

export const getLocations = cache(async () =>
  safe<Location[]>([], () => createPublicClient().from("locations").select("*").eq("active", true).order("display_order")),
);

export const getReviews = cache(async () =>
  safe<Review[]>([], () =>
    createPublicClient().from("reviews").select("*").eq("published", true).order("review_date", { ascending: false }).limit(10),
  ),
);

// RLS already filters announcements/posters by active flag and date window.
export const getAnnouncement = cache(async () => {
  const rows = await safe<Announcement[]>([], () =>
    createPublicClient().from("announcements").select("*").order("created_at", { ascending: false }).limit(1),
  );
  return rows[0] ?? null;
});

export const getPosters = cache(async () =>
  safe<Poster[]>([], () => createPublicClient().from("posters").select("*").order("created_at", { ascending: false }).limit(3)),
);
