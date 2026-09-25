"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteSettings } from "@/lib/types";
import { telHref } from "@/lib/format";
import { NAV } from "./nav";

export function NavMenu({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        className="group relative grid size-12 shrink-0 place-items-center rounded-full border border-line-strong bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-lift active:scale-90"
      >
        <span
          className="flex h-4 w-6 flex-col justify-between transition-transform duration-500 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span
            className={`h-[2px] w-full origin-center rounded-full bg-ink transition-all duration-300 ${
              open ? "translate-y-[7px] rotate-45" : "group-hover:translate-x-0.5"
            }`}
          />
          <span
            className={`h-[2px] w-full origin-center rounded-full bg-ink transition-all duration-300 ${
              open ? "scale-x-0 opacity-0" : "opacity-100 group-hover:w-3/4"
            }`}
          />
          <span
            className={`h-[2px] w-full origin-center rounded-full bg-ink transition-all duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : "group-hover:-translate-x-0.5"
            }`}
          />
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            ref={panelRef}
            tabIndex={-1}
            className="ios-glass no-scrollbar fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto outline-none md:top-[72px]"
          >
            <nav aria-label="Main" className="container-x flex flex-col items-center pt-8 pb-12 text-center sm:pt-12">
              <ul className="hero-in w-full max-w-sm divide-y divide-black/10">
                {NAV.map((item, i) => (
                  <li key={item.href} className="hero-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-4 text-2xl font-bold tracking-tight transition-colors active:opacity-60 sm:text-3xl"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hero-in mt-8 grid w-full max-w-xs gap-3" style={{ animationDelay: "0.26s" }}>
                <Link href="/book" onClick={() => setOpen(false)} className="btn btn-primary">
                  Book a car
                </Link>
                {settings.phone && (
                  <a href={telHref(settings.phone)} className="btn btn-ghost">
                    Call {settings.phone}
                  </a>
                )}
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
