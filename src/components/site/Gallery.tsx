"use client";
import Image from "next/image";
import { useState } from "react";
import { CarImage } from "./CarImage";

export function Gallery({ name, images }: { name: string; images: { url: string; alt: string | null }[] }) {
  const [active, setActive] = useState(0);
  const main = images[active];
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-white">
        <CarImage src={main?.url} alt={main?.alt || name} sizes="(max-width: 1024px) 100vw, 720px" priority />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-colors ${
                  i === active ? "border-ink" : "border-transparent opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="120px" className="bg-white object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
