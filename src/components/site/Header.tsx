"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { Logo } from "./Logo";
import { NavMenu } from "./NavMenu";

const HERO_OVERLAY_PATHS = new Set(["/", "/about"]);

export function Header({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const hasHeroOverlay = HERO_OVERLAY_PATHS.has(pathname);
  const [scrolled, setScrolled] = useState(!hasHeroOverlay);

  useEffect(() => {
    if (!hasHeroOverlay) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHeroOverlay]);

  const overlay = hasHeroOverlay && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        overlay
          ? "border-b border-transparent bg-transparent"
          : "border-b border-line/80 bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 md:h-[72px]">
        <Logo name={settings.company_name} logoUrl={settings.logo_url} />
        <NavMenu settings={settings} />
      </div>
    </header>
  );
}
