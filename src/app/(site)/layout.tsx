import Script from "next/script";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileActionBar } from "@/components/site/MobileActionBar";
import { PosterPopup } from "@/components/site/PosterPopup";
import { getAnnouncement, getCars, getPosters, getRoutes, getServices, getSettings } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcement, posters, services, cars, routes] = await Promise.all([
    getSettings(),
    getAnnouncement(),
    getPosters(),
    getServices(),
    getCars(),
    getRoutes(),
  ]);
  const gaId = settings.ga_id && /^G-[A-Z0-9]+$/.test(settings.ga_id) ? settings.ga_id : null;

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <AnnouncementBar announcement={announcement} />
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} cars={cars} routes={routes} />
      <MobileActionBar settings={settings} />
      <PosterPopup posters={posters} />
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
    </>
  );
}
