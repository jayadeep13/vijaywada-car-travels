import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSession } from "./admin-session";
import { createServiceClient } from "./supabase/server";

/** Server-side authorization for every admin page and action: a valid PIN session is required. */
export async function requireAdmin() {
  if (!(await isValidSession((await cookies()).get(ADMIN_COOKIE)?.value))) redirect("/admin/login");
  const supabase = createServiceClient();
  if (!supabase) redirect("/admin/login?error=database");
  return { supabase };
}

type Supa = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export async function logActivity(supabase: Supa, action: string, entity: string, label?: string | null) {
  await supabase.from("activity_log").insert({ action, entity, entity_label: label ?? null });
}

/** Public pages are cached; refresh them all after any admin change. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function sniff(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 && b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69) return "image/avif";
  return null;
}

/** Validates an uploaded image (type, size, magic bytes) and stores it in the "media" bucket. */
export async function uploadImage(supabase: Supa, file: FormDataEntryValue | null, folder: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type || !ALLOWED.has(type)) throw new Error("Upload a JPG, PNG, WebP or AVIF image.");
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ALLOWED.get(type)}`;
  const { error } = await supabase.storage.from("media").upload(path, bytes, { contentType: type, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

/** Best effort: removes a file from storage when its public URL points at our bucket. */
export async function removeImage(supabase: Supa, url: string | null | undefined) {
  if (!url) return;
  const marker = "/storage/v1/object/public/media/";
  const i = url.indexOf(marker);
  if (i === -1) return;
  await supabase.storage.from("media").remove([url.slice(i + marker.length)]);
}

// ---- FormData helpers ----
export const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};
export const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`"${k.replace(/_/g, " ")}" must be a positive number.`);
  return n;
};
export const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
export const lines = (fd: FormData, k: string) =>
  (str(fd, k) ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
/** FAQ text: blocks separated by a blank line; first line is the question, the rest the answer. */
export const faqs = (fd: FormData, k: string) =>
  (str(fd, k) ?? "")
    .split(/\n\s*\n/)
    .map((block) => {
      const [q, ...a] = block.trim().split("\n");
      return { q: (q ?? "").trim(), a: a.join(" ").trim() };
    })
    .filter((f) => f.q && f.a);
export const faqsToText = (list: { q: string; a: string }[] | null | undefined) =>
  (list ?? []).map((f) => `${f.q}\n${f.a}`).join("\n\n");
/** datetime-local (IST) to ISO */
export const istDate = (fd: FormData, k: string) => {
  const v = str(fd, k);
  return v ? new Date(`${v}:00+05:30`).toISOString() : null;
};
export const toIstInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000);
  return d.toISOString().slice(0, 16);
};

export function errorMessage(e: unknown) {
  if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) throw e;
  return e instanceof Error ? e.message : "Something went wrong.";
}
