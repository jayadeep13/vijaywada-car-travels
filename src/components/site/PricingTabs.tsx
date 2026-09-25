"use client";
import { useId, useRef, useState } from "react";
import type { CarPricing } from "@/lib/types";
import { rupees } from "@/lib/format";

type Row = [label: string, value: string];

function tabs(p: CarPricing) {
  const t: { key: string; label: string; short: string; rows: Row[]; note?: string | null }[] = [
    {
      key: "regular",
      label: "Local packages",
      short: "Local",
      rows: [
        ["4 hrs / 40 km", rupees(p.reg_4hr_40km)],
        ["8 hrs / 80 km", rupees(p.reg_8hr_80km)],
        ["Extra hour", rupees(p.reg_extra_hour)],
        ["Extra km", p.reg_extra_km != null ? `${rupees(p.reg_extra_km)} / km` : "On request"],
      ],
    },
    {
      key: "day",
      label: "Day rental",
      short: "Day rental",
      rows: [
        ["12 hours", rupees(p.day_12hr)],
        ["24 hours", rupees(p.day_24hr)],
        ["Driver allowance (12 hrs)", rupees(p.day_chauffeur_12hr)],
        ["Driver allowance (24 hrs)", rupees(p.day_chauffeur_24hr)],
        ["Extra hour", rupees(p.day_extra_hour)],
        ["Fuel", p.day_fuel_km_per_litre ? `Charged at ${p.day_fuel_km_per_litre} km per litre` : "On request"],
      ],
      note: "Day rental is the car and driver; fuel is charged separately at the mileage shown.",
    },
    {
      key: "outstation",
      label: "Outstation",
      short: "Outstation",
      rows: [
        ["Rate per km", p.out_per_km != null ? `${rupees(p.out_per_km)} / km` : "On request"],
        ["Driver allowance per day", rupees(p.out_chauffeur)],
        ...(p.out_min_km ? ([["Outstation tariff applies", `Above ${p.out_min_km} km`]] as Row[]) : []),
      ],
      note: p.out_notes,
    },
  ];
  return t;
}

export function PricingTabs({ pricing }: { pricing: CarPricing }) {
  const data = tabs(pricing);
  const [active, setActive] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % data.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + data.length) % data.length;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Tariff" className="flex gap-1 overflow-x-auto rounded-full bg-paper p-1">
        {data.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`${base}-tab-${i}`}
            aria-controls={`${base}-panel-${i}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-11 flex-1 whitespace-nowrap rounded-full px-3 text-sm font-bold sm:px-4 transition-colors ${
              active === i ? "bg-ink text-white" : "text-graphite hover:text-ink"
            }`}
          >
            <span className="sm:hidden">{t.short}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      {data.map((t, i) => (
        <div key={t.key} role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} hidden={active !== i} className="mt-4">
          <dl className="divide-y divide-line">
            {t.rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-3 sm:gap-6 sm:py-3.5">
                <dt className="text-graphite">{label}</dt>
                <dd className="num text-right font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          {t.note && <p className="mt-3 text-sm text-graphite">{t.note}</p>}
        </div>
      ))}
      <p className="mt-4 text-xs text-mist">Tolls, parking and state permits are extra, at actuals.</p>
    </div>
  );
}
