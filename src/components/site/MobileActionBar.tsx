import type { SiteSettings } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";
import { SOCIAL_ICONS } from "./social-icons";

/** Floating WhatsApp button in the bottom-right corner on phones and tablets. */
export function MobileActionBar({ settings }: { settings: SiteSettings }) {
  const wa = whatsappLink(settings.whatsapp, settings.company_name);
  if (!wa) return null;
  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-8px_rgb(37_211_102_/_0.6)] transition-transform active:scale-90 lg:hidden"
    >
      <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-25 motion-reduce:hidden" />
      <SOCIAL_ICONS.whatsapp className="relative size-7" />
    </a>
  );
}
