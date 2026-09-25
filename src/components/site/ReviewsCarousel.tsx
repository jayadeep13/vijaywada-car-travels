"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/lib/types";

const cardGap = (el: HTMLElement) => parseFloat(getComputedStyle(el).columnGap) || 20;

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const cardWidth = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 320;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + cardWidth + cardGap(el), behavior: "smooth" });
    }, 3200);
    return () => clearInterval(id);
  }, [paused, reducedMotion]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onScroll() {
      const card = trackRef.current?.firstElementChild as HTMLElement | null;
      const cardWidth = (card?.offsetWidth ?? 320) + cardGap(trackRef.current!);
      const idx = Math.round(trackRef.current!.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), reviews.length - 1));
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [reviews.length]);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 320;
    el.scrollBy({ left: dir * (cardWidth + cardGap(el)), behavior: "smooth" });
  }

  function scrollToIndex(i: number) {
    const el = trackRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 sm:mx-0 sm:gap-5"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex w-[84vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:w-[360px] sm:max-w-none sm:p-6"
          >
            <p className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`size-4 ${i < r.rating ? "fill-[#86ad49] text-[#86ad49]" : "text-white/20"}`} aria-hidden />
              ))}
            </p>
            <blockquote className="mt-4 flex-1 leading-relaxed text-white/85">&ldquo;{r.review}&rdquo;</blockquote>
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#86ad49]/20 text-sm font-extrabold text-[#86ad49]">
                {r.customer_name.charAt(0).toUpperCase()}
              </span>
              <p className="text-sm font-bold">{r.customer_name}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Previous review"
        className="absolute left-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink/80 text-white backdrop-blur transition-colors hover:bg-white/10 sm:flex"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Next review"
        className="absolute right-2 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink/80 text-white backdrop-blur transition-colors hover:bg-white/10 sm:flex"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {reviews.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to review ${i + 1}`}
            aria-current={i === activeIndex}
            className={`h-2 rounded-full transition-all ${i === activeIndex ? "w-6 bg-[#86ad49]" : "w-2 bg-white/25"}`}
          />
        ))}
      </div>
    </div>
  );
}
