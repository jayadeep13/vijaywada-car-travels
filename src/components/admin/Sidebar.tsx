"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Car,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Route,
  Settings,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { logout } from "@/app/admin/actions/auth";

const GROUPS = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/enquiries", label: "Bookings", icon: Inbox },
    ],
  },
  { title: "Fleet", items: [{ href: "/admin/cars", label: "Cars & prices", icon: Car }] },
  {
    title: "Website",
    items: [
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/routes", label: "Routes", icon: Route },
      { href: "/admin/locations", label: "Locations", icon: MapPin },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/posters", label: "Posters", icon: ImageIcon },
    ],
  },
  { title: "Business", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/**
 * The admin frame: sidebar (fixed on desktop, drawer on phones), top bar and page area.
 * Kept outside any element with backdrop-filter, which would trap `position: fixed` children.
 */
export function AdminShell({ unread, children }: { unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hello, setHello] = useState("Welcome back");

  useEffect(() => setHello(greeting()), []);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-mist">{g.title}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active ? "bg-accent-soft text-accent-strong" : "text-graphite hover:bg-paper hover:text-ink"
                    }`}
                  >
                    {active && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-accent" />}
                    <Icon className={`size-[18px] ${active ? "text-accent" : "text-mist group-hover:text-ink"}`} aria-hidden />
                    <span className="flex-1">{label}</span>
                    {href === "/admin/enquiries" && unread > 0 && (
                      <span className="num rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{unread}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2">
      <Image src="/vctlogo.webp" alt="Vijayawada Car Travels" width={900} height={265} className="h-9 w-auto" priority />
    </Link>
  );

  const footer = (
    <div className="space-y-1 border-t border-line p-3">
      <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-graphite hover:bg-paper hover:text-ink">
        <ExternalLink className="size-[18px] text-mist" aria-hidden />
        View website
      </a>
      <form action={logout}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-graphite hover:bg-[#fdecea] hover:text-danger">
          <LogOut className="size-[18px]" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-dvh bg-paper">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-line px-5">{brand}</div>
        {nav}
        {footer}
      </aside>

      {/* Phone drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-sheet">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              {brand}
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-xl hover:bg-paper" aria-label="Close menu">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 md:px-8">
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="Open admin menu">
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{hello}</p>
            <p className="hidden truncate text-xs text-graphite sm:block">Vijayawada Car Travels admin</p>
          </div>
          <a href="/" target="_blank" rel="noopener" className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-graphite hover:border-ink hover:text-ink sm:flex">
            View site <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <Link
            href="/admin/enquiries?read=unread"
            className="relative grid size-10 place-items-center rounded-xl hover:bg-paper"
            aria-label={`${unread} unread enquiries`}
          >
            <Bell className="size-5" aria-hidden />
            {unread > 0 && (
              <span className="num absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{unread}</span>
            )}
          </Link>
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">A</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
