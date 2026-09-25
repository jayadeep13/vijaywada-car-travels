"use server";
import { redirect } from "next/navigation";
import { bool, errorMessage, faqs, istDate, lines, logActivity, num, refreshSite, removeImage, requireAdmin, str, uploadImage } from "@/lib/admin";
import { slugify } from "@/lib/format";

const enc = encodeURIComponent;
type Table = "announcements" | "posters" | "reviews" | "services" | "routes" | "locations";

const PATHS: Record<Table, string> = {
  announcements: "/admin/announcements",
  posters: "/admin/posters",
  reviews: "/admin/reviews",
  services: "/admin/services",
  routes: "/admin/routes",
  locations: "/admin/locations",
};
const LABELS: Record<Table, string> = {
  announcements: "announcement",
  posters: "poster",
  reviews: "review",
  services: "service",
  routes: "route",
  locations: "location",
};
const IMAGE_FIELD: Partial<Record<Table, string>> = { posters: "image_url", reviews: "photo_url" };

/** Only allow site-relative links or http(s) URLs in CTAs. */
function safeUrl(v: string | null) {
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {}
  throw new Error("Links must start with / (a page on this site) or https://");
}

type Built = { row: Record<string, unknown>; label: string; image?: string | null };

async function build(table: Table, fd: FormData, supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]): Promise<Built> {
  switch (table) {
    case "announcements": {
      const title = str(fd, "title");
      if (!title) throw new Error("Title is required.");
      return {
        label: title,
        row: {
          title,
          description: str(fd, "description"),
          cta_text: str(fd, "cta_text"),
          cta_url: safeUrl(str(fd, "cta_url")),
          starts_at: istDate(fd, "starts_at"),
          ends_at: istDate(fd, "ends_at"),
          active: bool(fd, "active"),
        },
      };
    }
    case "posters": {
      // Title is optional: a finished poster design can go live with just the image.
      const title = str(fd, "title") ?? "";
      const image = await uploadImage(supabase, fd.get("image"), "posters");
      if (!image && !str(fd, "id")) throw new Error("Upload a poster image.");
      const frequency = str(fd, "frequency");
      return {
        label: title || "poster",
        image,
        row: {
          title,
          ...(image ? { image_url: image } : {}),
          cta_text: str(fd, "cta_text"),
          cta_url: safeUrl(str(fd, "cta_url")),
          placement: str(fd, "placement") === "all" ? "all" : "home",
          frequency: frequency === "hours" || frequency === "every_visit" ? frequency : "session",
          frequency_hours: Math.min(720, Math.max(1, num(fd, "frequency_hours") ?? 24)),
          starts_at: istDate(fd, "starts_at"),
          ends_at: istDate(fd, "ends_at"),
          active: bool(fd, "active"),
        },
      };
    }
    case "reviews": {
      const name = str(fd, "customer_name");
      const review = str(fd, "review");
      if (!name || !review) throw new Error("Customer name and review text are required.");
      const photo = await uploadImage(supabase, fd.get("photo"), "reviews");
      return {
        label: name,
        image: photo,
        row: {
          customer_name: name,
          review,
          rating: Math.min(5, Math.max(1, num(fd, "rating") ?? 5)),
          review_date: str(fd, "review_date"),
          ...(photo ? { photo_url: photo } : {}),
          published: bool(fd, "published"),
        },
      };
    }
    case "services": {
      const title = str(fd, "title");
      const summary = str(fd, "summary");
      if (!title || !summary) throw new Error("Title and summary are required.");
      return {
        label: title,
        row: {
          title,
          slug: slugify(str(fd, "slug") ?? title),
          summary,
          body: str(fd, "body"),
          steps: lines(fd, "steps"),
          faqs: faqs(fd, "faqs"),
          seo_title: str(fd, "seo_title"),
          seo_description: str(fd, "seo_description"),
          display_order: num(fd, "display_order") ?? 0,
          active: bool(fd, "active"),
        },
      };
    }
    case "routes": {
      const to = str(fd, "to_city");
      if (!to) throw new Error("Destination city is required.");
      const from = str(fd, "from_city") ?? "Vijayawada";
      let slug = slugify(str(fd, "slug") ?? `${from}-to-${to}-cab`);
      if (!/-to-.+-cab$/.test(slug)) slug = `${slugify(from)}-to-${slugify(to)}-cab`;
      return {
        label: `${from} to ${to}`,
        row: {
          from_city: from,
          to_city: to,
          slug,
          distance_km: num(fd, "distance_km"),
          duration: str(fd, "duration"),
          description: str(fd, "description"),
          highlights: lines(fd, "highlights"),
          faqs: faqs(fd, "faqs"),
          seo_title: str(fd, "seo_title"),
          seo_description: str(fd, "seo_description"),
          display_order: num(fd, "display_order") ?? 0,
          active: bool(fd, "active"),
        },
      };
    }
    case "locations": {
      const name = str(fd, "name");
      if (!name) throw new Error("Area name is required.");
      return {
        label: name,
        row: { name, slug: slugify(name), description: str(fd, "description"), display_order: num(fd, "display_order") ?? 0, active: bool(fd, "active") },
      };
    }
  }
}

async function save(table: Table, fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const base = PATHS[table];
  let target: string;
  try {
    const { row, label, image } = await build(table, fd, supabase);
    const imageField = IMAGE_FIELD[table];
    if (id && image && imageField) {
      const { data: old } = await supabase.from(table).select(imageField).eq("id", id).single();
      await removeImage(supabase, (old as Record<string, string> | null)?.[imageField]);
    }
    const { error } = id ? await supabase.from(table).update(row).eq("id", id) : await supabase.from(table).insert(row);
    if (error) throw new Error(error.code === "23505" ? "That URL slug is already used." : error.message);
    await logActivity(supabase, id ? "updated" : "added", LABELS[table], label);
    refreshSite();
    target = `${base}?msg=${enc(`${LABELS[table][0].toUpperCase()}${LABELS[table].slice(1)} saved.`)}`;
  } catch (e) {
    target = `${base}?${id ? `edit=${id}&` : "edit=new&"}error=${enc(errorMessage(e))}`;
  }
  redirect(target);
}

async function remove(table: Table, fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  if (id) {
    const imageField = IMAGE_FIELD[table];
    const { data } = await supabase.from(table).delete().eq("id", id).select("*").single();
    if (data && imageField) await removeImage(supabase, (data as Record<string, string>)[imageField]);
    const d = (data ?? {}) as Record<string, string>;
    await logActivity(supabase, "deleted", LABELS[table], d.title ?? d.name ?? d.customer_name ?? d.to_city ?? null);
    refreshSite();
  }
  redirect(`${PATHS[table]}?msg=${enc("Deleted.")}`);
}

async function toggle(table: Table, fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const field = table === "reviews" ? "published" : "active";
  const value = fd.get("value") === "true";
  if (id) {
    await supabase.from(table).update({ [field]: value }).eq("id", id);
    await logActivity(supabase, value ? "published" : "unpublished", LABELS[table]);
    refreshSite();
  }
  redirect(PATHS[table]);
}

export async function saveAnnouncement(fd: FormData) { return save("announcements", fd); }
export async function deleteAnnouncement(fd: FormData) { return remove("announcements", fd); }
export async function toggleAnnouncement(fd: FormData) { return toggle("announcements", fd); }

export async function savePoster(fd: FormData) { return save("posters", fd); }
export async function deletePoster(fd: FormData) { return remove("posters", fd); }
export async function togglePoster(fd: FormData) { return toggle("posters", fd); }

export async function saveReview(fd: FormData) { return save("reviews", fd); }
export async function deleteReview(fd: FormData) { return remove("reviews", fd); }
export async function toggleReview(fd: FormData) { return toggle("reviews", fd); }

export async function saveService(fd: FormData) { return save("services", fd); }
export async function deleteService(fd: FormData) { return remove("services", fd); }
export async function toggleService(fd: FormData) { return toggle("services", fd); }

export async function saveRoute(fd: FormData) { return save("routes", fd); }
export async function deleteRoute(fd: FormData) { return remove("routes", fd); }
export async function toggleRoute(fd: FormData) { return toggle("routes", fd); }

export async function saveLocation(fd: FormData) { return save("locations", fd); }
export async function deleteLocation(fd: FormData) { return remove("locations", fd); }
export async function toggleLocation(fd: FormData) { return toggle("locations", fd); }
