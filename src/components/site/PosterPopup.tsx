"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Poster } from "@/lib/types";

const storageKey = (id: string) => `vct-poster-${id}`;

function shouldShow(p: Poster): boolean {
  try {
    if (p.frequency === "every_visit") return true;
    if (p.frequency === "session") return !sessionStorage.getItem(storageKey(p.id));
    const last = Number(localStorage.getItem(storageKey(p.id)) || 0);
    return Date.now() - last > p.frequency_hours * 3600_000;
  } catch {
    return true;
  }
}

function markShown(p: Poster) {
  try {
    if (p.frequency === "session") sessionStorage.setItem(storageKey(p.id), "1");
    if (p.frequency === "hours") localStorage.setItem(storageKey(p.id), String(Date.now()));
  } catch {}
}

export function PosterPopup({ posters }: { posters: Poster[] }) {
  const pathname = usePathname();
  const [poster, setPoster] = useState<Poster | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const candidate = posters.find((p) => (p.placement === "all" || pathname === "/") && shouldShow(p));
    if (!candidate) return;
    const t = window.setTimeout(() => {
      lastFocus.current = document.activeElement as HTMLElement;
      setPoster(candidate);
      markShown(candidate);
    }, 1200); // let the page render first
    return () => window.clearTimeout(t);
  }, [posters, pathname]);

  const close = useCallback(() => {
    setPoster(null);
    lastFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!poster) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && dialogRef.current) {
        const els = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button");
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [poster, close]);

  if (!poster) return null;
  const external = poster.cta_url?.startsWith("http");
  const hasButton = Boolean(poster.cta_url && poster.cta_text);
  const hasCaption = Boolean(poster.title || hasButton);
  // With a link but no button text, the whole poster is the link.
  const imageLink = poster.cta_url && !poster.cta_text ? poster.cta_url : null;
  const alt = poster.title || "Offer from Vijayawada Car Travels";
  // Show the whole poster at its own shape, scaled down to fit the screen (never cropped).
  // The width/height here are only a hint; CSS lets the real image decide its proportions.
  const image = (
    <Image
      src={poster.image_url}
      alt={alt}
      width={1080}
      height={1350}
      sizes="(max-width: 640px) 100vw, 720px"
      className={`block h-auto w-auto max-w-[min(calc(100vw-2rem),45rem)] ${hasCaption ? "max-h-[calc(100dvh-8.5rem)]" : "max-h-[calc(100dvh-2rem)]"}`}
    />
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" onClick={close}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        onClick={(e) => e.stopPropagation()}
        className="hero-in relative w-fit max-w-full overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-sheet"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-surface/90 shadow-lift"
        >
          <X className="size-5" aria-hidden />
        </button>
        {imageLink ? (
          imageLink.startsWith("http") ? (
            <a href={imageLink} target="_blank" rel="noopener noreferrer" onClick={close} className="block bg-line">{image}</a>
          ) : (
            <Link href={imageLink} onClick={close} className="block bg-line">{image}</Link>
          )
        ) : (
          <div className="bg-line">{image}</div>
        )}
        {hasCaption && (
        <div className="flex w-0 min-w-full items-center justify-between gap-4 p-4">
          {poster.title ? <h2 className="text-base font-bold">{poster.title}</h2> : <span />}
          {hasButton && (
            external ? (
              <a href={poster.cta_url!} target="_blank" rel="noopener noreferrer" className="btn btn-accent !min-h-11" onClick={close}>
                {poster.cta_text}
              </a>
            ) : (
              <Link href={poster.cta_url!} className="btn btn-accent !min-h-11" onClick={close}>{poster.cta_text}</Link>
            )
          )}
        </div>
        )}
      </div>
    </div>
  );
}
