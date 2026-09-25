"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

const TRIP_TYPES = [
  { value: "outstation-oneway", label: "One way", dest: "Destination city", placeholder: "Hyderabad, Vizag, Tirupati…" },
  { value: "outstation-round", label: "Round trip", dest: "Destination city", placeholder: "Where are you going?" },
  { value: "local", label: "Local", dest: "Drop or area", placeholder: "Benz Circle, hospital, venue…" },
  { value: "airport", label: "Airport", dest: "Airport or address", placeholder: "Gannavaram Airport" },
] as const;

export function BookingWidget() {
  const router = useRouter();
  const [type, setType] = useState<(typeof TRIP_TYPES)[number]["value"]>("outstation-oneway");
  const current = TRIP_TYPES.find((t) => t.value === type)!;
  const today = new Date().toISOString().slice(0, 10);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams({ service: type });
    for (const k of ["pickup", "destination", "date", "passengers"]) {
      const v = String(fd.get(k) || "").trim();
      if (v) params.set(k, v);
    }
    router.push(`/book?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} aria-label="Plan your trip" className="rounded-[1.75rem] bg-surface p-5 shadow-sheet ring-1 ring-black/[0.03] sm:p-7">
      <h2 className="text-lg font-extrabold tracking-tight">Where are you going?</h2>
      <p className="mt-1 text-sm text-graphite">Get a fare estimate in seconds.</p>

      <div role="radiogroup" aria-label="Travel type" className="mt-5 grid grid-cols-4 gap-1 rounded-full bg-paper p-1.5">
        {TRIP_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={type === t.value}
            onClick={() => setType(t.value)}
            className={`min-h-10 whitespace-nowrap rounded-full px-2 text-[13px] font-bold tracking-tight transition-colors sm:text-sm ${
              type === t.value ? "bg-ink text-white shadow-sm" : "text-graphite hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Route line: pickup to destination, the way ride apps show it */}
      <div className="relative mt-5 rounded-2xl border border-line bg-paper/60">
        <span aria-hidden className="absolute left-[21px] top-[26px] bottom-[26px] w-px border-l-2 border-dotted border-line-strong" />
        <label className="flex items-center gap-3 px-4 pt-3.5 pb-2.5 transition-colors focus-within:bg-white/70">
          <span aria-hidden className="relative z-10 size-3 shrink-0 rounded-full border-[3px] border-ink bg-surface" />
          <span className="flex-1">
            <span className="block text-xs font-semibold text-graphite">Pickup location</span>
            <input name="pickup" defaultValue="Vijayawada" required className="w-full bg-transparent py-1 font-semibold outline-none" autoComplete="off" />
          </span>
        </label>
        <div className="ml-11 border-t border-line" />
        <label className="flex items-center gap-3 px-4 pt-2.5 pb-3.5 transition-colors focus-within:bg-white/70">
          <span aria-hidden className="relative z-10 size-3 shrink-0 rounded-[3px] bg-accent" />
          <span className="flex-1">
            <span className="block text-xs font-semibold text-graphite">{current.dest}</span>
            <input name="destination" placeholder={current.placeholder} className="w-full bg-transparent py-1 font-semibold outline-none placeholder:font-normal placeholder:text-mist" autoComplete="off" />
          </span>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block rounded-2xl border border-line bg-paper/60 px-4 py-3 transition-colors focus-within:border-ink focus-within:bg-white/70">
          <span className="block text-xs font-semibold text-graphite">Travel date</span>
          <input type="date" name="date" min={today} className="w-full bg-transparent py-1 font-semibold outline-none" />
        </label>
        <label className="block rounded-2xl border border-line bg-paper/60 px-4 py-3 transition-colors focus-within:border-ink focus-within:bg-white/70">
          <span className="block text-xs font-semibold text-graphite">Passengers</span>
          <select name="passengers" defaultValue="" className="w-full bg-transparent py-1 font-semibold outline-none">
            <option value="">Select</option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
            <option value="8">8 or more</option>
          </select>
        </label>
      </div>

      <button type="submit" className="btn btn-accent mt-5 w-full !min-h-[3.25rem] text-base shadow-lift">
        <Search className="size-5" aria-hidden />
        Check availability
      </button>
      <p className="mt-3 text-center text-xs text-graphite">No payment now. We confirm the car and fare by phone.</p>
    </form>
  );
}
