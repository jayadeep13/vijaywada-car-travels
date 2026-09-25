import { SubmitButton } from "@/components/admin/SubmitButton";
import { Card, Field, Flash, ImageInput, PageHeader, TextArea } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "../../actions/settings";

function RemoveBox({ name, show }: { name: string; show: boolean }) {
  if (!show) return null;
  return (
    <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-graphite">
      <input type="checkbox" name={name} /> Remove current image
    </label>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const { msg, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const s: SiteSettings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  const social = s.social_links ?? {};
  const h = "border-b border-line px-5 py-4 font-extrabold md:px-6";
  const grid = "grid gap-4 p-5 md:grid-cols-2 md:p-6";

  return (
    <>
      <PageHeader title="Website settings" description="Business details used across the website, map, WhatsApp links and search results." />
      <Flash msg={msg} error={error} />
      <form action={saveSettings} className="space-y-6">
        <Card>
          <h2 className={h}>Business</h2>
          <div className={grid}>
            <Field name="company_name" label="Company name" defaultValue={s.company_name} required />
            <Field name="tagline" label="Tagline" defaultValue={s.tagline} />
            <Field name="phone" label="Phone" defaultValue={s.phone} placeholder="+91 98XXX XXXXX" />
            <Field name="whatsapp" label="WhatsApp number" defaultValue={s.whatsapp} placeholder="+91 98XXX XXXXX" hint="Used for every WhatsApp button and booking message." />
            <Field name="email" label="Email" type="email" defaultValue={s.email} />
            <Field name="business_hours" label="Business hours" defaultValue={s.business_hours} placeholder="Open 24 hours, all days" />
            <TextArea name="address" label="Address" defaultValue={s.address} rows={2} className="md:col-span-2" />
            <Field name="city" label="City" defaultValue={s.city} />
            <Field name="state" label="State" defaultValue={s.state} />
            <Field name="postal_code" label="PIN code" defaultValue={s.postal_code} />
            <TextArea name="footer_text" label="Footer text" defaultValue={s.footer_text} rows={2} />
          </div>
        </Card>

        <Card>
          <h2 className={h}>Google Maps</h2>
          <div className={grid}>
            <Field name="maps_url" label="Google Maps link" defaultValue={s.maps_url} hint="From Google Maps: Share, Copy link. Used for Get directions." className="md:col-span-2" />
            <TextArea name="maps_embed_url" label="Map embed" defaultValue={s.maps_embed_url} rows={3} hint="Google Maps: Share, Embed a map, Copy HTML, then paste here." className="md:col-span-2" />
            <Field name="latitude" label="Latitude (optional)" type="number" step="any" defaultValue={s.latitude} />
            <Field name="longitude" label="Longitude (optional)" type="number" step="any" defaultValue={s.longitude} />
            <Field name="google_business_url" label="Google Business Profile link" defaultValue={s.google_business_url} hint="Shows a 'Read reviews on Google' link." className="md:col-span-2" />
          </div>
        </Card>

        <Card>
          <h2 className={h}>Brand images</h2>
          <div className={grid}>
            <div><ImageInput name="logo" label="Logo" current={s.logo_url} hint="Transparent PNG, about 320×80." /><RemoveBox name="remove_logo" show={!!s.logo_url} /></div>
            <div><ImageInput name="favicon" label="Favicon" current={s.favicon_url} hint="Square PNG, 512×512." /><RemoveBox name="remove_favicon" show={!!s.favicon_url} /></div>
            <div className="md:col-span-2"><ImageInput name="hero" label="Homepage hero photo" current={s.hero_image_url} hint="Wide car photo, at least 2000×1200. Text sits over the left side." /><RemoveBox name="remove_hero" show={!!s.hero_image_url} /></div>
          </div>
        </Card>

        <Card>
          <h2 className={h}>Social media</h2>
          <div className={grid}>
            {["instagram", "facebook", "youtube", "x", "linkedin"].map((k) => (
              <Field key={k} name={`social_${k}`} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} defaultValue={social[k]} placeholder="https://" />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className={h}>Search and analytics</h2>
          <div className={grid}>
            <Field name="seo_title" label="Homepage SEO title" defaultValue={s.seo_title} hint="About 60 characters." className="md:col-span-2" />
            <TextArea name="seo_description" label="Homepage SEO description" defaultValue={s.seo_description} rows={2} hint="About 155 characters." className="md:col-span-2" />
            <Field name="ga_id" label="Google Analytics ID" defaultValue={s.ga_id} placeholder="G-XXXXXXXXXX" />
            <Field name="gsc_verification" label="Search Console verification" defaultValue={s.gsc_verification} hint="Paste the meta tag or just its content value." />
          </div>
        </Card>

        <div className="sticky bottom-0 -mx-4 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-6">
          <SubmitButton>Save settings</SubmitButton>
        </div>
      </form>
    </>
  );
}
