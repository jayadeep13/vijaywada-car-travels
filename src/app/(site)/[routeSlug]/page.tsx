import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MessageCircle } from "lucide-react";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { rupees } from "@/lib/format";
import { getCars, getRoute, getRoutes, getSettings } from "@/lib/queries";
import { breadcrumbSchema, faqSchema, taxiServiceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

type Props = { params: Promise<{ routeSlug: string }> };

// Only slugs shaped like "vijayawada-to-<city>-cab" are route pages.
const ROUTE_PATTERN = /^[a-z0-9-]+-to-[a-z0-9-]+-cab$/;

export async function generateStaticParams() {
  return (await getRoutes()).map((r) => ({ routeSlug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { routeSlug } = await params;
  if (!ROUTE_PATTERN.test(routeSlug)) return {};
  const r = await getRoute(routeSlug);
  if (!r) return {};
  const cars = await getCars();
  const perKm = cars.map((c) => c.car_pricing?.out_per_km).filter((n): n is number => typeof n === "number");
  const fare = perKm.length ? ` from ${rupees(Math.min(...perKm))}/km` : "";
  const from = r.from_city;
  const to = r.to_city;
  const title = r.seo_title || `${from} to ${to} Cab | One Way & Round Trip Taxi`;
  const description =
    r.seo_description ||
    `Affordable ${from} to ${to} cab${fare}${r.distance_km ? `, about ${r.distance_km} km` : ""}. One way & round trip taxi with driver: sedan, Innova, Crysta. Book with Vijayawada Car Travels.`;
  return pageMetadata({
    title,
    description,
    path: `/${r.slug}`,
    absoluteTitle: true,
    keywords: [
      `${from} to ${to} cab`,
      `${from} to ${to} taxi`,
      `${from} to ${to} one way taxi`,
      `${from} to ${to} car rental`,
      `${from} to ${to} cab fare`,
      `${from} to ${to} Innova`,
      `cheap cab ${from} to ${to}`,
    ],
  });
}

export default async function RoutePage({ params }: Props) {
  const { routeSlug } = await params;
  if (!ROUTE_PATTERN.test(routeSlug)) notFound();
  const [route, cars, settings, routes] = await Promise.all([getRoute(routeSlug), getCars(), getSettings(), getRoutes()]);
  if (!route) notFound();

  const wa = whatsappLink(settings.whatsapp, settings.company_name, {
    service: "Outstation",
    pickup: route.from_city,
    destination: route.to_city,
  });
  const faq = faqSchema(route.faqs);
  const others = routes.filter((r) => r.slug !== route.slug);
  const rateCars = cars.filter((c) => c.car_pricing?.out_per_km).sort((a, b) => a.car_pricing!.out_per_km! - b.car_pricing!.out_per_km!);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }, { name: `${route.from_city} to ${route.to_city}`, path: `/${route.slug}` }])} />
      <JsonLd data={taxiServiceSchema({ name: `${route.from_city} to ${route.to_city} cab`, description: route.description || "", path: `/${route.slug}`, area: `${route.from_city}, ${route.to_city}` }, settings)} />
      {faq && <JsonLd data={faq} />}

      <section className="container-x pt-10 pb-12 md:pt-16">
        <div className="grid grid-cols-1 gap-10 [&>*]:min-w-0 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">
              {route.from_city} to {route.to_city} cab
            </h1>
            {route.description && <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">{route.description}</p>}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/book?service=outstation-oneway&pickup=${encodeURIComponent(route.from_city)}&destination=${encodeURIComponent(route.to_city)}`} className="btn btn-accent">
                Book this trip
              </Link>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><MessageCircle className="size-4" aria-hidden />Ask on WhatsApp</a>}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
            <div className="flex gap-4">
              <span aria-hidden className="flex flex-col items-center pt-1.5">
                <span className="size-3 rounded-full border-[3px] border-ink" />
                <span className="my-1 w-px flex-1 border-l-2 border-dotted border-line-strong" />
                <span className="size-3 rounded-[3px] bg-accent" />
              </span>
              <div className="flex flex-1 flex-col justify-between gap-8">
                <p className="text-xl font-extrabold">{route.from_city}</p>
                <p className="text-xl font-extrabold">{route.to_city}</p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
              <div><dt className="text-sm text-graphite">Approx. distance</dt><dd className="num text-lg font-bold">{route.distance_km ? `${route.distance_km} km` : "On request"}</dd></div>
              <div><dt className="text-sm text-graphite">Travel time</dt><dd className="text-lg font-bold">{route.duration || "Varies"}</dd></div>
            </dl>
            {route.highlights.length > 0 && (
              <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                {route.highlights.map((h) => (
                  <li key={h} className="flex gap-2"><Check className="size-4 shrink-0 text-accent" aria-hidden />{h}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {rateCars.length > 0 && (
        <section aria-labelledby="rates" className="border-y border-line bg-surface py-14">
          <div className="container-x">
            <h2 id="rates" className="text-2xl font-extrabold tracking-tight">Outstation rates for this route</h2>
            <p className="mt-2 text-sm text-graphite">Billed on kilometres travelled plus driver allowance per day. Tolls, parking and permits are extra.</p>
            <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line">
              <table className="num w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-line bg-paper text-graphite">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Car</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Seats</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Per km</th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">Driver / day</th>
                    <th scope="col" className="px-5 py-3.5"><span className="sr-only">Book</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rateCars.map((c) => (
                    <tr key={c.id}>
                      <th scope="row" className="px-5 py-3.5 font-bold"><Link href={`/cars/${c.slug}`} className="hover:underline">{c.name}</Link></th>
                      <td className="px-5 py-3.5">{c.seating_capacity}</td>
                      <td className="px-5 py-3.5">{rupees(c.car_pricing?.out_per_km)}</td>
                      <td className="px-5 py-3.5">{rupees(c.car_pricing?.out_chauffeur)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/book?car=${c.slug}&service=outstation-oneway&pickup=${encodeURIComponent(route.from_city)}&destination=${encodeURIComponent(route.to_city)}`} className="font-bold text-accent hover:underline">
                          Book
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {route.faqs.length > 0 && (
        <section aria-labelledby="faq" className="container-x py-14">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 id="faq" className="text-2xl font-extrabold tracking-tight">Questions</h2>
            <FaqList faqs={route.faqs} />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="more-routes" className="container-x pb-16 md:pb-24">
          <h2 id="more-routes" className="mb-4 text-lg font-extrabold">More routes from {route.from_city}</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((r) => (
              <li key={r.slug}><Link href={`/${r.slug}`} className="inline-flex rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold hover:border-ink">To {r.to_city}</Link></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
