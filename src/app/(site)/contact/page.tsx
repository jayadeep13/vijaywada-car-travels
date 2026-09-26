import type { Metadata } from "next";
import Link from "next/link";
import { MapSection } from "@/components/site/MapSection";
import { getSettings } from "@/lib/queries";
import { PAGE_KEYWORDS, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Contact Vijayawada Car Travels | Call or WhatsApp +91 72789 18888",
  absoluteTitle: true,
  description: "Contact Vijayawada Car Travels on +91 72789 18888 by call or WhatsApp to book an affordable car or cab in Vijayawada. Directions and map to our office.",
  path: "/contact",
  keywords: PAGE_KEYWORDS.contact,
});

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <div className="container-x pt-10 md:pt-16">
        <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-6xl">Contact Vijayawada Car Travels</h1>
        <p className="mt-4 max-w-xl text-lg text-graphite">
          Call or WhatsApp for the quickest reply, or <Link href="/book" className="font-bold text-ink underline underline-offset-4">send a booking request</Link>.
        </p>
      </div>
      <MapSection settings={settings} />
    </>
  );
}
