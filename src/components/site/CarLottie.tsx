"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// lottie-react and the animation JSON are only fetched once the card scrolls near the viewport.
const Lottie = dynamic(() => import("lottie-react").then((m) => m.Lottie), { ssr: false });

export function CarLottie({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ? `${className} overflow-hidden` : "overflow-hidden"}>
      {show && (
        <Lottie
          src="/LOOTIEMAP.json"
          // Canvas instead of SVG: this scene is ~1 MB of SVG markup, which is heavy to animate on phones.
          renderer="canvas"
          loop={!reducedMotion}
          autoplay={!reducedMotion}
          style={{ width: "100%", height: "100%" }}
          rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
          aria-hidden
        />
      )}
    </div>
  );
}
