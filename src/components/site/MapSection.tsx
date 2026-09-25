import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { telHref } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { SOCIAL_ICONS } from "./social-icons";

export function MapSection({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsapp, settings.company_name);
  const socials = Object.entries(settings.social_links || {}).filter(([, url]) => url);
  const embed =
    settings.maps_embed_url?.startsWith("https://www.google.com/maps/embed") ||
    (settings.maps_embed_url?.startsWith("https://www.google.com/maps") && settings.maps_embed_url.includes("output=embed"))
      ? settings.maps_embed_url
      : null;
  const row = "flex gap-3 py-4 border-b border-line last:border-0";
  return (
    <section aria-labelledby="find-us" className="container-x py-10 md:py-16">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col p-5 sm:min-h-[320px] sm:p-6 md:p-10">
          <h2 id="find-us" className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Find us in Vijayawada</h2>
          <div className="mt-4 sm:mt-6">
            <p className="text-lg font-bold">{settings.company_name}</p>
            <ul className="mt-2 text-[15px]">
              {settings.address && (
                <li className={row}><MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><span>{settings.address}</span></li>
              )}
              {settings.phone && (
                <li className={row}><Phone className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><a href={telHref(settings.phone)} className="font-semibold hover:underline">{settings.phone}</a></li>
              )}
              {wa && (
                <li className={row}><MessageCircle className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Chat on WhatsApp</a></li>
              )}
              {settings.business_hours && (
                <li className={row}><Clock className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden /><span>{settings.business_hours}</span></li>
              )}
            </ul>
          </div>
          {settings.maps_url && (
            <a href={settings.maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6">
              <Navigation className="size-4" aria-hidden />
              Get directions
            </a>
          )}
          <div className="mt-5 flex flex-1 flex-col justify-end gap-6 sm:mt-6">
            {(settings.phone || wa) && (
              <div className="hidden gap-3 sm:flex">
                {settings.phone && (
                  <a href={telHref(settings.phone)} className="btn btn-primary">
                    <Phone className="size-4" aria-hidden />
                    {settings.phone}
                  </a>
                )}
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                )}
              </div>
            )}
            {(socials.length > 0 || wa || settings.email) && (
              <ul className="flex flex-wrap gap-2">
                {socials.map(([name, url]) => {
                  const Icon = SOCIAL_ICONS[name];
                  return (
                    <li key={name}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={name === "x" ? "X (Twitter)" : name}
                        className="grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                      >
                        {Icon ? <Icon className="size-4" /> : <span className="text-xs font-bold capitalize">{name[0]}</span>}
                      </a>
                    </li>
                  );
                })}
                {wa && (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <SOCIAL_ICONS.whatsapp className="size-4" />
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a
                      href={`mailto:${settings.email}`}
                      aria-label="Email"
                      className="grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <Mail className="size-4" aria-hidden />
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
        <div className="relative min-h-[260px] bg-line sm:min-h-[320px]">
          {embed ? (
            <iframe
              src={embed}
              title={`${settings.company_name} on Google Maps`}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-paper p-8 text-center text-sm text-graphite">
              Add the Google Maps embed link in Admin, Settings to show the map here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
