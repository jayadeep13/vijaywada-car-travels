import Link from "next/link";
import { Snowflake, Users } from "lucide-react";
import type { Car } from "@/lib/types";
import { rupees, startingPrice } from "@/lib/format";
import { CarImage } from "./CarImage";

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const from = startingPrice(car.car_pricing);
  const perKm = car.car_pricing?.out_per_km;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-shadow duration-300 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-white">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
          <CarImage src={car.image_url} alt={`${car.name} on rent in Vijayawada`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px" priority={priority} />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-surface/95 px-3 py-1 text-xs font-bold text-ink">{car.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg font-extrabold tracking-tight">
          <Link href={`/cars/${car.slug}`} className="after:absolute after:inset-0">{car.name}</Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-4 text-sm text-graphite">
          <span className="inline-flex items-center gap-1.5"><Users className="size-4" aria-hidden />{car.seating_capacity} seats</span>
          {car.air_conditioned && <span className="inline-flex items-center gap-1.5"><Snowflake className="size-4" aria-hidden />AC</span>}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xs text-graphite">Local from</p>
            <p className="num text-xl font-extrabold">{rupees(from)}</p>
          </div>
          {perKm != null && (
            <div className="text-right">
              <p className="text-xs text-graphite">Outstation</p>
              <p className="num text-sm font-bold">{rupees(perKm)}/km</p>
            </div>
          )}
        </div>
        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
          <Link href={`/cars/${car.slug}`} className="btn btn-ghost !min-h-11 !text-sm">View details</Link>
          <Link href={`/book?car=${car.slug}`} className="btn btn-primary !min-h-11 !text-sm">Book now</Link>
        </div>
      </div>
    </article>
  );
}
