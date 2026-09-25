import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeIndianRupee, Car as CarIcon, ShieldCheck, UserRound } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getServices, getSettings } from "@/lib/queries";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";
import { FALLBACK_SERVICES, SERVICE_ICONS } from "@/lib/service-display";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "About Vijayawada Car Travels | Trusted Car Rental in Vijayawada",
  absoluteTitle: true,
  description: "Meet Vijayawada Car Travels, founded by Potru Nagaraju: affordable chauffeur-driven cars for local, airport, outstation and corporate travel from Vijayawada.",
  path: "/about",
  keywords: PAGE_KEYWORDS.about,
  image: { url: "/og-image.jpg", alt: "Potru Nagaraju, founder of Vijayawada Car Travels, with the fleet" },
});

export default async function AboutPage() {
  const [s, services] = await Promise.all([getSettings(), getServices()]);
  const serviceCards = services.length ? services : FALLBACK_SERVICES;
  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden bg-ink md:-mt-[72px]">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[3/1]">
          <Image
            src="/ABOUT.webp"
            alt="Potru Nagaraju, Founder of Vijayawada Car Travels, with the fleet"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_22%]"
          />
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-black/70 via-black/25 to-transparent sm:w-3/4" aria-hidden />
          <div className="absolute inset-y-0 left-0 flex items-center px-4 sm:px-8">
            <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-white [text-shadow:0_2px_20px_rgb(0_0_0_/_0.5)] sm:text-5xl lg:text-6xl">
              About Us
            </h1>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-4 py-2 shadow-sm backdrop-blur sm:bottom-5 sm:left-5">
            <p className="text-xs font-bold text-ink sm:text-sm">
              Potru Nagaraju <span className="font-medium text-graphite">· Founder, {s.company_name}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="container-x pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">About {s.company_name}</h2>
            <p className="mt-5 text-lg leading-relaxed text-graphite sm:text-xl">
              We provide chauffeur-driven cars from Vijayawada for city errands, airport runs, family trips, weddings and business travel.
            </p>
            <p className="mt-5 leading-relaxed text-graphite">
              Our fleet runs from economical sedans to the Innova Crysta and luxury cars from Mercedes-Benz, BMW and Audi. Every rate is published on this site so you can plan before you call, and every booking is confirmed personally by our team.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/cars" className="btn btn-primary">See our cars</Link>
              <Link href="/contact" className="btn btn-ghost">Contact us</Link>
            </div>
          </div>
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <div className="relative aspect-square w-56 overflow-hidden rounded-2xl bg-paper sm:w-64">
              <Image
                src="/FOUNDER1.webp"
                alt="Potru Nagaraju, Founder of Vijayawada Car Travels"
                fill
                sizes="(min-width: 640px) 256px, 224px"
                quality={90}
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-lg font-extrabold tracking-tight">Potru Nagaraju</p>
            <p className="text-sm text-graphite">Founder, {s.company_name}</p>
          </div>
        </div>
      </div>

      {/* Why us */}
      <Reveal as="section" className="bg-[#f8fbff] py-16 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">Why travellers choose us</h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
              Clear rates, the right car for the trip, and a team you can reach on the phone.
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8">
            {[
              { icon: BadgeIndianRupee, t: "Rates you can see", d: "Hourly, daily and per-km tariffs for every car are on this site. No guessing." },
              { icon: UserRound, t: "Chauffeur-driven", d: "Every booking includes a driver who knows the city and the highways." },
              { icon: CarIcon, t: "Sedans to luxury", d: "From Etios and Dzire to Innova Crysta, Fortuner, Mercedes-Benz, BMW and Audi." },
              { icon: ShieldCheck, t: "Confirmed before you travel", d: "We call to confirm the car, pickup and fare before the trip starts." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t}>
                <dt className="flex items-center gap-3 text-lg font-extrabold tracking-tight">
                  <Icon className="size-5 text-accent" aria-hidden />
                  {t}
                </dt>
                <dd className="mt-2 leading-relaxed text-graphite">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* Quick services */}
      <section aria-labelledby="services-heading" className="container-x py-16 md:py-24">
        <SectionHeading id="services-heading" title="Travel made simple" />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {serviceCards.map((service) => {
            const Icon = SERVICE_ICONS[service.slug] ?? CarIcon;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex items-start gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-ink sm:flex-col sm:gap-0 sm:p-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-[#86ad49] sm:size-12">
                  <Icon className="size-5 sm:size-6" />
                </span>
                <div className="flex flex-1 flex-col">
                  <h3 className="text-base font-extrabold tracking-tight sm:mt-6 sm:text-lg">{service.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-graphite sm:mt-2 sm:text-[15px]">{service.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
