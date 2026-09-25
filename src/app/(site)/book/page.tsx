import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { BackButton } from "@/components/site/BackButton";
import { BookingForm, type BookingDefaults } from "@/components/site/BookingForm";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { telHref } from "@/lib/format";
import { getCars, getSettings } from "@/lib/queries";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Book a Car or Cab in Vijayawada Online",
  description: "Book an affordable car with driver in Vijayawada in a minute: local, airport, one-way or outstation. No advance payment; we call to confirm the car and fare.",
  path: "/book",
  keywords: PAGE_KEYWORDS.book,
});

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const pick = (v: string | string[] | undefined) => (typeof v === "string" ? v.slice(0, 160) : undefined);

export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [fetchedCars, settings] = await Promise.all([getCars(), getSettings()]);
  const cars = fetchedCars.length ? fetchedCars : FALLBACK_CARS;
  const defaults: BookingDefaults = {
    car: pick(sp.car),
    service: pick(sp.service),
    pickup: pick(sp.pickup),
    destination: pick(sp.destination),
    date: pick(sp.date),
    passengers: pick(sp.passengers),
  };
  const wa = whatsappLink(settings.whatsapp, settings.company_name);

  return (
    <div className="container-x pt-5 pb-16 md:pt-8 md:pb-24">
      <BackButton className="mb-5 md:mb-8" />
      <div className="grid grid-cols-1 gap-10 [&>*]:min-w-0 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div>
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">Book a car in Vijayawada</h1>
          <p className="mt-3 max-w-xl text-lg text-graphite">Tell us about the trip. We will call to confirm the car and fare.</p>
          <div className="mt-8">
            <BookingForm cars={cars.map(({ slug, name, seating_capacity }) => ({ slug, name, seating_capacity }))} defaults={defaults} />
          </div>
        </div>
        <aside className="lg:pt-24">
          <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
            <h2 className="text-lg font-extrabold">Prefer to talk?</h2>
            <p className="mt-2 text-sm text-white/70">Call or WhatsApp and book in a couple of minutes.</p>
            <div className="mt-5 grid gap-2">
              {settings.phone && <a href={telHref(settings.phone)} className="btn bg-white text-ink"><Phone className="size-4" aria-hidden />{settings.phone}</a>}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border border-white/25"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
