import type { MetadataRoute } from "next";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { getCars, getRoutes, getServices } from "@/lib/queries";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/cars", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/locations", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/book", priority: 0.6, changeFrequency: "monthly" },
];

const abs = (u: string) => (/^https?:\/\//.test(u) ? u : absoluteUrl(u));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [fetchedCars, services, routes] = await Promise.all([getCars(), getServices(), getRoutes()]);
  const cars = fetchedCars.length ? fetchedCars : FALLBACK_CARS;
  const now = new Date();
  return [
    ...STATIC_PAGES.map((p) => ({ url: absoluteUrl(p.path), lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), lastModified: s.updated_at ? new Date(s.updated_at) : now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...routes.map((r) => ({ url: absoluteUrl(`/${r.slug}`), lastModified: r.updated_at ? new Date(r.updated_at) : now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...cars.map((c) => ({
      url: absoluteUrl(`/cars/${c.slug}`),
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(c.image_url ? { images: [abs(c.image_url)] } : {}),
    })),
  ];
}
