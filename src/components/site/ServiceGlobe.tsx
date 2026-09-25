"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { CITY_MARKERS } from "@/lib/service-cities";

const Globe3D = dynamic(() => import("@/components/ui/3d-globe").then((m) => m.Globe3D), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-line" />,
});

/**
 * The 3D globe is only shown on large screens, so three.js is only downloaded there, once the
 * globe is near the viewport. Its render loop pauses whenever it is scrolled out of view.
 */
export function ServiceGlobe({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(min-width: 1024px)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {mounted && (
        <Globe3D
          markers={CITY_MARKERS}
          paused={!inView}
          config={{
            textureUrl: "/textures/earth.webp",
            markerColor: "#ffb703",
            atmosphereIntensity: 0,
            autoRotateSpeed: 0.25,
          }}
          className="size-full"
        />
      )}
    </div>
  );
}
