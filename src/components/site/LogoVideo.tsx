"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The animated VCT logo. The video only loads once it scrolls into view, plays once and
 * holds on the final frame, then replays each time it comes back into view.
 * With reduced motion, the static logo is shown instead.
 */
export function LogoVideo({ name, className = "" }: { name: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>();
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSrc("/vctlogo.mp4");
        el.currentTime = 0;
        el.play().catch(() => {});
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`overflow-hidden rounded-2xl bg-[#ececec] ring-1 ring-white/10 ${className}`}>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/vctlogo-sm.webp" alt={name} className="aspect-[1160/378] w-full object-contain p-3" />
      ) : (
        <video
          ref={ref}
          src={src}
          autoPlay
          muted
          playsInline
          preload="none"
          poster="/vctlogo-sm.webp"
          aria-label={`${name} logo`}
          className="block aspect-[1160/378] w-full object-contain"
        />
      )}
    </div>
  );
}
