import type { Metadata } from "next";
import Link from "next/link";
import { MapSection } from "@/components/site/MapSection";
import { getLocations, getRoutes, getSettings } from "@/lib/queries";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Cab Service Areas & Outstation Routes from Vijayawada",
  description: "Doorstep cab pickup anywhere in Vijayawada, and affordable outstation cabs from Vijayawada to Hyderabad, Visakhapatnam, Tirupati, Guntur, Chennai and Bangalore.",
  path: "/locations",
  keywords: PAGE_KEYWORDS.locations,
});

export default async function LocationsPage() {
  const [locations, routes, settings] = await Promise.all([getLocations(), getRoutes(), getSettings()]);
  return (
    <>
      <div className="container-x pt-10 md:pt-16">
        <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">Where we go from Vijayawada</h1>
        <p className="mt-4 max-w-2xl text-lg text-graphite">Pickups anywhere in Vijayawada, and outstation trips across South India.</p>

        {routes.length > 0 && (
          <section aria-labelledby="routes" className="mt-12">
            <h2 id="routes" className="mb-5 text-2xl font-extrabold tracking-tight">Outstation routes</h2>
            <ul className="divide-y divide-line border-y border-line">
              {routes.map((r) => (
                <li key={r.slug}>
                  <Link href={`/${r.slug}`} className="group flex items-center justify-between gap-6 py-5">
                    <span className="text-xl font-extrabold tracking-tight group-hover:text-accent">{r.from_city} to {r.to_city}</span>
                    <span className="num text-right text-sm text-graphite">{r.distance_km ? `${r.distance_km} km` : ""}{r.duration ? `, ${r.duration}` : ""}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {locations.length > 0 && (
          <section aria-labelledby="areas" className="mt-14">
            <h2 id="areas" className="mb-5 text-2xl font-extrabold tracking-tight">Pickup areas in and around Vijayawada</h2>
            <ul className="flex flex-wrap gap-2">
              {locations.map((l) => (
                <li key={l.slug} className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold">{l.name}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <MapSection settings={settings} />
    </>
  );
}
