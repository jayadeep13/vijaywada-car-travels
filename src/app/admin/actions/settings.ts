"use server";
import { redirect } from "next/navigation";
import { errorMessage, logActivity, num, refreshSite, removeImage, requireAdmin, str, uploadImage } from "@/lib/admin";

const enc = encodeURIComponent;

function httpsUrl(v: string | null, label: string) {
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol === "https:") return u.toString();
  } catch {}
  throw new Error(`${label} must be a full https:// link.`);
}

/** Accepts either the embed URL or the full <iframe> code copied from Google Maps. */
function mapsEmbed(v: string | null) {
  if (!v) return null;
  const src = v.match(/src="([^"]+)"/)?.[1] ?? v;
  if (!src.startsWith("https://www.google.com/maps/embed")) {
    throw new Error("Maps embed must come from Google Maps: Share, Embed a map, Copy HTML.");
  }
  return src;
}

export async function saveSettings(fd: FormData) {
  const { supabase } = await requireAdmin();
  let target: string;
  try {
    const { data: current } = await supabase.from("site_settings").select("logo_url, favicon_url, hero_image_url").eq("id", 1).maybeSingle();
    const [logo, favicon, hero] = await Promise.all([
      uploadImage(supabase, fd.get("logo"), "brand"),
      uploadImage(supabase, fd.get("favicon"), "brand"),
      uploadImage(supabase, fd.get("hero"), "brand"),
    ]);
    const ga = str(fd, "ga_id");
    if (ga && !/^G-[A-Z0-9]+$/.test(ga)) throw new Error("Google Analytics ID should look like G-XXXXXXXXXX.");
    const gsc = str(fd, "gsc_verification");
    const gscToken = gsc?.match(/content="([^"]+)"/)?.[1] ?? gsc;

    const row: Record<string, unknown> = {
      id: 1,
      company_name: str(fd, "company_name") ?? "Vijayawada Car Travels",
      tagline: str(fd, "tagline"),
      phone: str(fd, "phone"),
      whatsapp: str(fd, "whatsapp"),
      email: str(fd, "email"),
      address: str(fd, "address"),
      city: str(fd, "city"),
      state: str(fd, "state"),
      postal_code: str(fd, "postal_code"),
      latitude: num(fd, "latitude"),
      longitude: num(fd, "longitude"),
      maps_url: httpsUrl(str(fd, "maps_url"), "Google Maps link"),
      maps_embed_url: mapsEmbed(str(fd, "maps_embed_url")),
      google_business_url: httpsUrl(str(fd, "google_business_url"), "Google Business Profile link"),
      business_hours: str(fd, "business_hours"),
      social_links: Object.fromEntries(
        ["instagram", "facebook", "youtube", "x", "linkedin"]
          .map((k) => [k, httpsUrl(str(fd, `social_${k}`), `${k} link`)])
          .filter(([, v]) => v),
      ),
      seo_title: str(fd, "seo_title"),
      seo_description: str(fd, "seo_description"),
      ga_id: ga,
      gsc_verification: gscToken,
      footer_text: str(fd, "footer_text"),
    };
    if (logo) { row.logo_url = logo; await removeImage(supabase, current?.logo_url); }
    if (favicon) { row.favicon_url = favicon; await removeImage(supabase, current?.favicon_url); }
    if (hero) { row.hero_image_url = hero; await removeImage(supabase, current?.hero_image_url); }
    for (const k of ["logo", "favicon", "hero"] as const) {
      if (fd.get(`remove_${k}`) === "on") {
        const field = k === "hero" ? "hero_image_url" : `${k}_url`;
        await removeImage(supabase, (current as Record<string, string> | null)?.[field]);
        row[field] = null;
      }
    }

    const { error } = await supabase.from("site_settings").upsert(row);
    if (error) throw new Error(error.message);
    await logActivity(supabase, "updated", "settings");
    refreshSite();
    target = `/admin/settings?msg=${enc("Settings saved. The website is updated.")}`;
  } catch (e) {
    target = `/admin/settings?error=${enc(errorMessage(e))}`;
  }
  redirect(target);
}
