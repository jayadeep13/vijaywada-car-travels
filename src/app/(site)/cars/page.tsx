import type { Metadata } from "next";
import Link from "next/link";
import { CarCard } from "@/components/site/CarCard";
import { JsonLd } from "@/components/site/JsonLd";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { rupees } from "@/lib/format";
import { getCars, getSettings } from "@/lib/queries";
import { breadcrumbSchema, carListSchema } from "@/lib/schema";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const fetched = await getCars();
  const cars = fetched.length ? fetched : FALLBACK_CARS;
  const local = cars.map((c) => c.car_pricing?.reg_4hr_40km).filter((n): n is number => typeof n === "number");
  const perKm = cars.map((c) => c.car_pricing?.out_per_km).filter((n): n is number => typeof n === "number");
  const from = local.length ? ` from ${rupees(Math.min(...local))}` : "";
  const km = perKm.length ? `, outstation from ${rupees(Math.min(...perKm))}/km` : "";
  return pageMetadata({
    title: "Cars on Rent in Vijayawada with Driver | Affordable Rates",
    description: `Affordable cars on rent in Vijayawada with driver${from}${km}. Etios, Dzire, Innova, Innova Crysta, Fortuner & luxury cars. Compare rates and book.`,
    path: "/cars",
    keywords: PAGE_KEYWORDS.cars,
  });
}

export default async function CarsPage() {
  const [allCars, settings] = await Promise.all([getCars(), getSettings()]);
  const cars = allCars.length ? allCars : FALLBACK_CARS;
  const categories = [...new Set(cars.map((c) => c.category))];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Cars", path: "/cars" }])} />
      <JsonLd data={carListSchema(cars, settings)} />
      <div className="container-x pt-10 pb-16 md:pt-16 md:pb-24">
        <h1 className="max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-4xl md:text-6xl">Cars on rent in Vijayawada</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite sm:text-lg">
          Every car comes with a driver. Pick by seats and budget, compare rates, and request a booking in a minute.
        </p>

        {cars.length === 0 ? (
          <p className="mt-12 rounded-[var(--radius-card)] border border-dashed border-line-strong p-10 text-center text-graphite">
            Cars will appear here once they are added in the admin panel.
          </p>
        ) : (
          <>
            {/* On phones: one swipeable row that sticks under the header */}
            <nav
              aria-label="Car categories"
              className="no-scrollbar sticky top-16 z-30 -mx-5 mt-6 flex gap-2 overflow-x-auto border-b border-line bg-paper/90 px-5 py-3 backdrop-blur-md md:static md:mx-0 md:mt-8 md:flex-wrap md:overflow-visible md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none"
            >
              {categories.map((cat) => (
                <a key={cat} href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`} className="shrink-0 whitespace-nowrap rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold hover:border-ink">
                  {cat}
                </a>
              ))}
              <a href="#compare" className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-accent hover:underline">Compare all rates</a>
            </nav>

            {categories.map((cat) => (
              <section key={cat} id={cat.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-36 pt-10 md:scroll-mt-24 md:pt-12">
                <h2 className="mb-4 text-xl font-extrabold tracking-tight md:mb-5 md:text-2xl">{cat}</h2>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {cars.filter((c) => c.category === cat).map((car) => <CarCard key={car.id} car={car} />)}
                </div>
              </section>
            ))}

            <section id="compare" aria-labelledby="compare-heading" className="scroll-mt-36 pt-14 md:scroll-mt-24 md:pt-16">
              <h2 id="compare-heading" className="text-2xl font-extrabold tracking-tight">Compare rates</h2>
              <p className="mt-2 text-sm text-graphite">Tolls, parking and state permits are extra, at actuals.</p>
              <div className="mt-5 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
                <table className="num w-full min-w-[640px] text-left text-sm md:min-w-[720px]">
                  <thead className="border-b border-line bg-paper text-graphite">
                    <tr>
                      <th scope="col" className="sticky left-0 z-10 bg-paper px-4 py-3.5 font-semibold shadow-[1px_0_0_var(--color-line)] md:static md:px-5 md:shadow-none">Car</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Seats</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">4 hrs / 40 km</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">8 hrs / 80 km</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">12 hr day</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Outstation / km</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {cars.map((c) => (
                      <tr key={c.id} className="hover:bg-paper">
                        <th scope="row" className="sticky left-0 z-10 max-w-[9.5rem] bg-surface px-4 py-3.5 font-bold shadow-[1px_0_0_var(--color-line)] md:static md:max-w-none md:bg-transparent md:px-5 md:shadow-none">
                          <Link href={`/cars/${c.slug}`} className="hover:underline">{c.name}</Link>
                        </th>
                        <td className="px-5 py-3.5">{c.seating_capacity}</td>
                        <td className="px-5 py-3.5">{rupees(c.car_pricing?.reg_4hr_40km)}</td>
                        <td className="px-5 py-3.5">{rupees(c.car_pricing?.reg_8hr_80km)}</td>
                        <td className="px-5 py-3.5">{rupees(c.car_pricing?.day_12hr)}</td>
                        <td className="px-5 py-3.5">{rupees(c.car_pricing?.out_per_km)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
