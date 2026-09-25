import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronRight, Fuel, MessageCircle, Phone, Settings2, Snowflake, Users } from "lucide-react";
import { CarCard } from "@/components/site/CarCard";
import { Gallery } from "@/components/site/Gallery";
import { JsonLd } from "@/components/site/JsonLd";
import { PricingTabs } from "@/components/site/PricingTabs";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { rupees, startingPrice, telHref } from "@/lib/format";
import { getCar, getCars, getSettings } from "@/lib/queries";
import { breadcrumbSchema, carOfferSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const cars = await getCars();
  return (cars.length ? cars : FALLBACK_CARS).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = (await getCar(slug)) ?? FALLBACK_CARS.find((c) => c.slug === slug) ?? null;
  if (!car) return {};
  const from = startingPrice(car.car_pricing);
  const perKm = car.car_pricing?.out_per_km;
  const short = car.name.replace(/^(New Toyota|Toyota|Maruti|Honda|Nissan) /, "");
  return pageMetadata({
    title: `${car.name} on Rent in Vijayawada${from ? ` from ${rupees(from)}` : ""}`,
    description: `Hire a ${car.name} (${car.seating_capacity} seater ${car.category}) on rent in Vijayawada with driver${from ? ` from ${rupees(from)}` : ""}${perKm ? `, outstation ${rupees(perKm)}/km` : ""}. Local, full-day & outstation rates. Book by call or WhatsApp.`,
    path: `/cars/${car.slug}`,
    keywords: [
      `${car.name} on rent in Vijayawada`,
      `${short} for rent Vijayawada`,
      `${short} car rental Vijayawada`,
      `${short} taxi Vijayawada`,
      `${short} rent per km Vijayawada`,
      `${car.seating_capacity} seater car rental Vijayawada`,
      `${car.category} car rental Vijayawada`,
    ],
    image: car.image_url ? { url: car.image_url, alt: `${car.name} on rent in Vijayawada` } : null,
  });
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const [fetchedCar, settings, fetchedCars] = await Promise.all([getCar(slug), getSettings(), getCars()]);
  const allCars = fetchedCars.length ? fetchedCars : FALLBACK_CARS;
  const car = fetchedCar ?? allCars.find((c) => c.slug === slug) ?? null;
  if (!car) notFound();

  const images = [
    ...(car.image_url ? [{ url: car.image_url, alt: car.name }] : []),
    ...(car.car_images ?? []).map((i) => ({ url: i.url, alt: i.alt })),
  ];
  const wa = whatsappLink(settings.whatsapp, settings.company_name, { vehicle: car.name });
  const similar = allCars.filter((c) => c.id !== car.id && c.category === car.category).slice(0, 3);
  const specs = [
    { icon: Users, label: `${car.seating_capacity} seater` },
    car.air_conditioned && { icon: Snowflake, label: "AC" },
    car.fuel_type && { icon: Fuel, label: car.fuel_type },
    car.transmission && { icon: Settings2, label: car.transmission },
  ].filter(Boolean) as { icon: typeof Users; label: string }[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Cars", path: "/cars" }, { name: car.name, path: `/cars/${car.slug}` }])} />
      <JsonLd data={carOfferSchema(car, settings)} />

      <div className="container-x pt-6 pb-16 md:pt-10 md:pb-24">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-graphite md:mb-6">
          <ol className="flex min-w-0 items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li><Link href="/cars" className="hover:text-ink">Cars</Link></li>
            <li aria-hidden><ChevronRight className="size-3.5" /></li>
            <li aria-current="page" className="truncate font-semibold text-ink">{car.name}</li>
          </ol>
        </nav>

        {/* Phones: gallery, then name/rates/booking, then description. Desktop: rates stay in a sticky right column. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0 [&>*]:min-w-0">
          <div>
            <Gallery name={car.name} images={images} />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            {car.description && <p className="max-w-2xl text-base leading-relaxed text-graphite sm:text-lg lg:mt-8">{car.description}</p>}
            {car.features.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {car.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="row-start-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-7">
              <p className="text-sm font-semibold text-accent">{car.category}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">
                {car.name}
                <span className="mt-1 block text-base font-semibold tracking-normal text-graphite">on rent in Vijayawada with driver</span>
              </h1>
              <ul className="mt-4 flex flex-wrap gap-2">
                {specs.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-sm font-semibold">
                    <Icon className="size-4 text-graphite" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {car.car_pricing ? (
                  <PricingTabs pricing={car.car_pricing} />
                ) : (
                  <p className="text-graphite">Rates on request.</p>
                )}
              </div>

              <div className="mt-6 grid gap-2">
                <Link href={`/book?car=${car.slug}`} className="btn btn-accent w-full">Book this car</Link>
                <div className="grid grid-cols-2 gap-2">
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>
                  )}
                  {settings.phone && (
                    <a href={telHref(settings.phone)} className="btn btn-ghost"><Phone className="size-4" aria-hidden />Call now</a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-heading" className="mt-14 md:mt-20">
            <h2 id="similar-heading" className="mb-6 text-2xl font-extrabold tracking-tight">Similar cars</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
