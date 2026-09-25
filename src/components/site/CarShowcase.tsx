"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { CarCard } from "./CarCard";

export function CarShowcase({ cars }: { cars: Car[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Scrolling down slides the cars sideways on every screen size; reduced motion gets a swipe row instead.
  const swipe = reducedMotion;

  useLayoutEffect(() => {
    function measure() {
      if (!trackRef.current) return;
      setMaxTranslate(Math.max(trackRef.current.scrollWidth - window.innerWidth, 0));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cars.length]);

  useEffect(() => {
    if (swipe || maxTranslate === 0) return;
    let raf = 0;
    // Writes the transform straight to the track (no React re-render per scroll frame), at most once per frame.
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;
        // The section is exactly maxTranslate taller than the pinned viewport, so that is the pinned scroll distance
        const progress = Math.min(Math.max(-section.getBoundingClientRect().top / maxTranslate, 0), 1);
        track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [maxTranslate, swipe]);

  if (!cars.length) return null;

  if (swipe) {
    return (
      <section aria-labelledby="fleet-heading" className="border-y border-line bg-surface py-12 md:py-24">
        <div className="container-x">
          <FleetHeading />
        </div>
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:mt-8 md:scroll-px-8 md:gap-5 md:px-8">
          {cars.map((car, i) => (
            <div key={car.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[320px] sm:max-w-none">
              <CarCard car={car} priority={i < 2} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="fleet-heading"
      className="relative border-y border-line bg-surface"
      style={{ height: maxTranslate > 0 ? `calc(100svh + ${maxTranslate}px)` : undefined }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-16 pb-6 md:py-10">
        <div className="container-x">
          <FleetHeading />
        </div>
        <div
          ref={trackRef}
          className="mt-8 flex gap-5 px-[max(1.25rem,calc((100vw-76rem)/2+1.25rem))] will-change-transform"
        >
          {cars.map((car, i) => (
            <div key={car.id} className="w-[280px] shrink-0 sm:w-[320px]">
              <CarCard car={car} priority={i < 2} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function FleetHeading() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
      <div className="max-w-2xl">
        <h2 id="fleet-heading" className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">
          Our full fleet
        </h2>
        <p className="mt-3 text-base leading-relaxed text-graphite md:text-lg">
          Every car comes with a driver. Local packages include fuel; outstation trips are billed per kilometre.
        </p>
      </div>
      <Link href="/cars" className="text-sm font-bold text-accent underline-offset-4 hover:underline">
        See all cars
      </Link>
    </div>
  );
}
