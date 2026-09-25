import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = await requireAdmin();
  const { count: unread } = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("is_read", false);

  return <AdminShell unread={unread ?? 0}>{children}</AdminShell>;
}
