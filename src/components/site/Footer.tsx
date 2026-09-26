import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Car, Route, Service, SiteSettings } from "@/lib/types";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { telHref } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { LogoVideo } from "./LogoVideo";
import { SOCIAL_ICONS } from "./social-icons";

type Props = { settings: SiteSettings; services: Service[]; cars: Car[]; routes: Route[] };

const COMPANY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/cars", label: "Our fleet" },
  { href: "/services", label: "Services" },
  { href: "/locations", label: "Locations" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book a car" },
];

const GREEN = "#86ad49";

export function Footer({ settings, services, cars, routes }: Props) {
  const wa = whatsappLink(settings.whatsapp, settings.company_name);
  const year = new Date().getFullYear();
  const socials = Object.entries(settings.social_links || {}).filter(([, url]) => url);
  const displayCars = cars.length ? cars : FALLBACK_CARS;

  return (
    <footer className="relative overflow-hidden bg-[#0a0c0f] text-white">
      {/* Brand glow and a road-marking rule along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 28rem at 0% 0%, rgb(134 173 73 / 0.16), transparent 60%), radial-gradient(40rem 24rem at 100% 100%, rgb(13 97 80 / 0.28), transparent 60%)",
        }}
      />
      <div aria-hidden className="relative h-1 w-full bg-[repeating-linear-gradient(90deg,#86ad49_0_28px,transparent_28px_48px)] opacity-70" />

      <div className="container-x relative grid gap-12 pt-14 pb-10 md:pt-16 lg:grid-cols-[1.15fr_1.85fr] lg:gap-16">
        {/* Brand */}
        <div className="max-w-sm">
          <LogoVideo name={settings.company_name} className="w-full max-w-[300px] shadow-[0_20px_50px_-20px_rgb(134_173_73_/_0.45)]" />
          <p className="mt-6 text-[15px] leading-relaxed text-white/70">{settings.footer_text || settings.tagline}</p>

          <ul className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
            {["Chauffeur-driven", "Upfront fares", "Local & outstation"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <span className="size-1.5 rounded-full" style={{ background: GREEN }} aria-hidden />
                {t}
              </li>
            ))}
          </ul>

          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map(([name, url]) => {
                const Icon = SOCIAL_ICONS[name];
                return (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={name === "x" ? "X (Twitter)" : name}
                      className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#86ad49] hover:bg-[#86ad49] hover:text-[#0a0c0f]"
                    >
                      {Icon ? <Icon className="size-4" /> : <span className="text-xs font-bold capitalize">{name[0]}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Links + contact */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          <FooterCol title="Company">
            {COMPANY_LINKS.map((l) => (
              <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>
            ))}
          </FooterCol>

          <FooterCol title="Our cars">
            {displayCars.slice(0, 6).map((c) => (
              <FooterLink key={c.slug} href={`/cars/${c.slug}`}>{c.name}</FooterLink>
            ))}
            <FooterLink href="/cars" accent>View all cars</FooterLink>
          </FooterCol>

          <div className="col-span-2 sm:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#86ad49]">Get in touch</h2>
            <ul className="mt-5 grid gap-2.5">
              {settings.phone && (
                <ContactCard href={telHref(settings.phone)} label="Call us" value={settings.phone} icon={<Phone className="size-4" aria-hidden />} tint="bg-[#86ad49]/15 text-[#a6cc68]" />
              )}
              {settings.alt_phone && (
                <ContactCard href={telHref(settings.alt_phone)} label="Alternative number" value={settings.alt_phone} icon={<Phone className="size-4" aria-hidden />} tint="bg-[#86ad49]/15 text-[#a6cc68]" />
              )}
              {wa && (
                <ContactCard href={wa} external label="WhatsApp" value="Chat with us" icon={<SOCIAL_ICONS.whatsapp className="size-4" />} tint="bg-[#25d366]/15 text-[#4ade80]" />
              )}
              {settings.email && (
                <ContactCard href={`mailto:${settings.email}`} label="Email" value={settings.email} icon={<Mail className="size-4" aria-hidden />} tint="bg-white/10 text-white/80" />
              )}
            </ul>
            {settings.address && (
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-white/60">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {settings.address}
              </p>
            )}
            {settings.maps_url && (
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 transition-colors hover:border-[#86ad49] hover:text-[#86ad49]"
              >
                <Navigation className="size-4" aria-hidden />
                Get directions
              </a>
            )}
          </div>
        </div>
      </div>

      {(services.length > 0 || routes.length > 0) && (
        <div className="container-x relative flex flex-col gap-6 border-t border-white/10 py-8 md:flex-row md:gap-12">
          {services.length > 0 && <ChipRow title="Services" items={services.map((s) => ({ href: `/services/${s.slug}`, label: s.title }))} />}
          {routes.length > 0 && <ChipRow title="Popular routes" items={routes.slice(0, 8).map((r) => ({ href: `/${r.slug}`, label: `${r.from_city} to ${r.to_city}` }))} />}
        </div>
      )}

      {/* Oversized wordmark, cropped by the bottom edge */}
      <div aria-hidden className="container-x relative select-none overflow-hidden">
        <p className="translate-y-[18%] bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-center text-[14.5vw] font-black leading-none tracking-[-0.06em] text-transparent lg:text-[11.5rem]">
          VIJAYAWADA
        </p>
      </div>

      <div className="relative border-t border-white/10 bg-black/40">
        {/* Phones: copyright and location, a divider, then the credit. md+: one row with the credit centred. */}
        <div className="container-x grid pt-4 pb-20 text-center text-[11px] leading-snug text-white/45 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6 md:py-5 md:text-left md:text-xs md:text-white/50 lg:pb-5">
          <p>© {year} {settings.company_name}. All rights reserved.</p>
          <p className="mt-0.5 md:order-last md:mt-0 md:text-right">Car rental in {[settings.city, settings.state, "India"].filter(Boolean).join(", ")}</p>
          <a
            href="https://www.pandjtechnologies.com/"
            target="_blank"
            rel="noopener"
            className="group mx-auto mt-3 inline-flex items-center justify-center gap-1.5 border-t border-white/10 pt-3 text-[11px] md:mx-0 md:mt-0 md:justify-self-center md:border-0 md:pt-0 md:text-xs"
          >
            <span className="text-[#d99a4e]">Designed &amp; Developed by</span>
            <Image src="/pj-logo.webp" alt="" width={20} height={20} className="size-4 rounded object-cover transition-transform duration-300 group-hover:scale-110 md:size-5" />
            <span className="font-bold text-white group-hover:text-[#f5a524]">P &amp; J Technologies</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#86ad49]">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, accent, children }: { href: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className={`group inline-flex items-center gap-1 text-sm transition-colors ${accent ? "font-bold text-[#86ad49]" : "text-white/70 hover:text-white"}`}
      >
        <span className="transition-transform duration-300 group-hover:translate-x-1">{children}</span>
        <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden />
      </Link>
    </li>
  );
}

function ContactCard({ href, label, value, icon, tint, external }: { href: string; label: string; value: string; icon: React.ReactNode; tint: string; external?: boolean }) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
      >
        <span aria-hidden className={`grid size-9 shrink-0 place-items-center rounded-xl ${tint}`}>{icon}</span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">{label}</span>
          <span className="block truncate text-sm font-bold text-white">{value}</span>
        </span>
      </a>
    </li>
  );
}

function ChipRow({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white/45">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-[#86ad49] hover:text-white">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
