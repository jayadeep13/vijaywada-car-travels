import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { getSettings } from "@/lib/queries";
import { CORE_KEYWORDS, DEFAULT_OG_IMAGE, PAGE_KEYWORDS } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seo_title || `${s.company_name} | Affordable Car Rental & Cabs in Vijayawada`;
  const description =
    s.seo_description ||
    `${s.company_name}: affordable car rental with driver in Vijayawada. Local taxi, airport cabs, one-way & outstation trips. Sedans, Innova, Crysta. Call ${s.phone ?? "us"}.`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.company_name}` },
    description,
    keywords: [...CORE_KEYWORDS, ...PAGE_KEYWORDS.home],
    applicationName: s.company_name,
    authors: [{ name: s.company_name, url: SITE_URL }],
    creator: s.company_name,
    publisher: s.company_name,
    category: "travel",
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "en_IN", siteName: s.company_name, title, description, url: "/", images: [s.hero_image_url || DEFAULT_OG_IMAGE.url] },
    twitter: { card: "summary_large_image", title, description, images: [s.hero_image_url || DEFAULT_OG_IMAGE.url] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Without an uploaded favicon, app/icon.png and app/apple-icon.png (the VCT road mark) are used.
    icons: s.favicon_url ? { icon: s.favicon_url } : undefined,
    verification: s.gsc_verification ? { google: s.gsc_verification } : undefined,
    formatDetection: { telephone: false },
    other: {
      "geo.region": "IN-AP",
      "geo.placename": s.city || "Vijayawada",
      ...(s.latitude && s.longitude ? { "geo.position": `${s.latitude};${s.longitude}`, ICBM: `${s.latitude}, ${s.longitude}` } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fafaf8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
