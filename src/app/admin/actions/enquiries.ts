"use server";
import { redirect } from "next/navigation";
import { logActivity, requireAdmin, str } from "@/lib/admin";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/types";

export async function updateEnquiry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status") as EnquiryStatus | null;
  if (!id) redirect("/admin/enquiries");
  const patch: Record<string, unknown> = { admin_notes: str(formData, "admin_notes")?.slice(0, 2000) ?? null };
  if (status && ENQUIRY_STATUSES.includes(status)) patch.status = status;
  const { data, error } = await supabase.from("enquiries").update(patch).eq("id", id).select("name").single();
  if (error) redirect(`/admin/enquiries/${id}?error=${encodeURIComponent(error.message)}`);
  await logActivity(supabase, `marked ${status}`, "enquiry", data?.name);
  redirect(`/admin/enquiries/${id}?msg=${encodeURIComponent("Enquiry updated.")}`);
}

export async function markUnread(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("enquiries").update({ is_read: false }).eq("id", id);
  redirect("/admin/enquiries");
}

export async function deleteEnquiry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    const { data } = await supabase.from("enquiries").delete().eq("id", id).select("name").single();
    await logActivity(supabase, "deleted", "enquiry", data?.name);
  }
  redirect(`/admin/enquiries?msg=${encodeURIComponent("Enquiry deleted.")}`);
}
