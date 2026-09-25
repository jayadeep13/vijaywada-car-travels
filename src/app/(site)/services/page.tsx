import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/queries";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Car Rental Services in Vijayawada | Local, Airport & Outstation",
  description: "Affordable car rental services in Vijayawada: hourly local packages, Gannavaram airport taxi, one-way & round-trip outstation cabs and corporate cars. All with driver.",
  path: "/services",
  keywords: PAGE_KEYWORDS.services,
});

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="container-x pt-10 pb-16 md:pt-16 md:pb-24">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">Car rental services in Vijayawada</h1>
      <p className="mt-4 max-w-2xl text-lg text-graphite">Chauffeur-driven cars for every kind of trip from Vijayawada.</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {services.map((s) => (
          <li key={s.slug}>
            <Link href={`/services/${s.slug}`} className="group flex flex-col gap-2 py-7 md:flex-row md:items-center md:justify-between md:gap-10">
              <h2 className="text-2xl font-extrabold tracking-tight group-hover:text-accent md:text-3xl">{s.title}</h2>
              <p className="max-w-md text-graphite">{s.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
