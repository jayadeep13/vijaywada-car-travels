import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/site/CarCard";
import { FaqList } from "@/components/site/FaqList";
import { JsonLd } from "@/components/site/JsonLd";
import { getCars, getRoutes, getService, getServices, getSettings } from "@/lib/queries";
import { breadcrumbSchema, faqSchema, taxiServiceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

const SERVICE_KEYWORDS: Record<string, string[]> = {
  "local-car-rental": ["local car rental Vijayawada", "hourly car rental Vijayawada", "car for rent per hour Vijayawada", "4 hours 40 km car rental Vijayawada", "full day car rental Vijayawada", "local taxi Vijayawada"],
  "outstation-cabs": ["outstation cabs Vijayawada", "one way taxi from Vijayawada", "round trip cab Vijayawada", "outstation car rental per km Vijayawada", "cheap outstation cabs Vijayawada", "drop taxi Vijayawada"],
  "airport-transfer": ["Vijayawada airport taxi", "Gannavaram airport cab", "airport pickup Vijayawada", "airport drop Vijayawada", "Vijayawada airport to city cab", "cab to Gannavaram airport"],
  "corporate-travel": ["corporate car rental Vijayawada", "monthly car rental Vijayawada", "employee cab service Vijayawada", "executive car hire Vijayawada", "business travel cars Vijayawada"],
  "wedding-cars": ["wedding car rental Vijayawada", "decorated car for marriage Vijayawada", "luxury wedding cars Vijayawada", "marriage cars on rent Vijayawada"],
};

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const SERVICE_TYPE_FOR: Record<string, string> = {
  "local-car-rental": "local",
  "outstation-cabs": "outstation-round",
  "airport-transfer": "airport",
  "corporate-travel": "corporate",
};

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return pageMetadata({
    title: s.seo_title || `${s.title} in Vijayawada | Affordable, With Driver`,
    description: s.seo_description || `${s.summary} Affordable rates from Vijayawada Car Travels. Call or WhatsApp to book.`,
    path: `/services/${s.slug}`,
    keywords: SERVICE_KEYWORDS[s.slug] ?? [`${s.title} Vijayawada`],
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, settings, cars, routes] = await Promise.all([getService(slug), getSettings(), getCars(), getRoutes()]);
  if (!service) notFound();

  const showRoutes = slug === "outstation-cabs" || slug === "airport-transfer";
  const recommended =
    slug === "corporate-travel"
      ? cars.filter((c) => /luxury|premium/i.test(c.category)).slice(0, 3)
      : [...cars].sort((a, b) => (a.car_pricing?.reg_4hr_40km ?? 1e9) - (b.car_pricing?.reg_4hr_40km ?? 1e9)).slice(0, 3);
  const faq = faqSchema(service.faqs);
  const bookHref = `/book?service=${SERVICE_TYPE_FOR[slug] ?? "local"}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.title, path: `/services/${slug}` }])} />
      <JsonLd data={taxiServiceSchema({ name: service.title, description: service.summary, path: `/services/${slug}` }, settings)} />
      {faq && <JsonLd data={faq} />}

      <section className="container-x pt-10 pb-12 md:pt-16">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-accent">Vijayawada Car Travels</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">{/vijayawada/i.test(service.title) ? service.title : `${service.title} in Vijayawada`}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">{service.summary}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link href={bookHref} className="btn btn-accent">Book now</Link>
            <Link href="/cars" className="btn btn-ghost">See cars and rates</Link>
          </div>
        </div>
        {service.body && <p className="mt-10 max-w-3xl leading-relaxed text-graphite">{service.body}</p>}
      </section>

      {showRoutes && routes.length > 0 && (
        <section aria-labelledby="routes" className="container-x pb-12">
          <h2 id="routes" className="mb-5 text-2xl font-extrabold tracking-tight">Popular routes</h2>
          <ul className="flex flex-wrap gap-2">
            {routes.map((r) => (
              <li key={r.slug}>
                <Link href={`/${r.slug}`} className="inline-flex rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold hover:border-ink">
                  {r.from_city} to {r.to_city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommended.length > 0 && (
        <section aria-labelledby="vehicles" className="border-y border-line bg-surface py-14">
          <div className="container-x">
            <div className="mb-6 flex items-end justify-between">
              <h2 id="vehicles" className="text-2xl font-extrabold tracking-tight">Available vehicles</h2>
              <Link href="/cars" className="text-sm font-bold text-accent hover:underline">All cars</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          </div>
        </section>
      )}

      {service.steps.length > 0 && (
        <section aria-labelledby="how" className="container-x py-14">
          <h2 id="how" className="mb-8 text-2xl font-extrabold tracking-tight">How it works</h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {service.steps.map((step, i) => (
              <li key={i} className="border-t-2 border-ink pt-4">
                <span className="num text-sm font-bold text-accent">Step {i + 1}</span>
                <p className="mt-2 font-semibold leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {service.faqs.length > 0 && (
        <section aria-labelledby="faq" className="container-x pb-16 md:pb-24">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <h2 id="faq" className="text-2xl font-extrabold tracking-tight">Questions</h2>
            <FaqList faqs={service.faqs} />
          </div>
        </section>
      )}
    </>
  );
}
