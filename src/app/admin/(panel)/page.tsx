import Link from "next/link";
import { AlertTriangle, ArrowRight, BellDot, Car, CheckCircle2, Image as ImageIcon, Inbox, Megaphone, Plus, Settings } from "lucide-react";
import { Card, EmptyState } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { Enquiry } from "@/lib/types";

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString();
  let dbError: string | null = null;
  const count = (q: PromiseLike<{ count: number | null; error: { message: string } | null }>) =>
    q.then((r) => {
      if (r.error && !dbError) dbError = r.error.message || "the request was rejected (usually a wrong or deleted key)";
      return r.count ?? 0;
    });

  const [totalCars, activeCars, enquiries, unread, newEnq, announcements, posters, recentRes, activityRes] = await Promise.all([
    count(supabase.from("cars").select("id", { count: "exact", head: true })),
    count(supabase.from("cars").select("id", { count: "exact", head: true }).eq("active", true)),
    count(supabase.from("enquiries").select("id", { count: "exact", head: true })),
    count(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("is_read", false)),
    count(supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new")),
    count(supabase.from("announcements").select("id", { count: "exact", head: true }).eq("active", true).or(`ends_at.is.null,ends_at.gt.${now}`)),
    count(supabase.from("posters").select("id", { count: "exact", head: true }).eq("active", true).or(`ends_at.is.null,ends_at.gt.${now}`)),
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const recent = (recentRes.data ?? []) as Enquiry[];
  const activity = activityRes.data ?? [];

  const stats = [
    { label: "Total cars", value: totalCars, href: "/admin/cars", icon: Car, tint: "bg-[#e8f1fb] text-[#2f6b9a]" },
    { label: "Active cars", value: activeCars, href: "/admin/cars", icon: CheckCircle2, tint: "bg-accent-soft text-accent" },
    { label: "Booking enquiries", value: enquiries, href: "/admin/enquiries", icon: Inbox, tint: "bg-[#f3eefc] text-[#6b4fb3]" },
    { label: "Unread enquiries", value: unread, href: "/admin/enquiries?read=unread", icon: BellDot, tint: "bg-[#fff4e0] text-[#b7791f]", highlight: unread > 0 },
    { label: "Active announcements", value: announcements, href: "/admin/announcements", icon: Megaphone, tint: "bg-[#fde8ec] text-[#b4234a]" },
    { label: "Published posters", value: posters, href: "/admin/posters", icon: ImageIcon, tint: "bg-[#eef6e6] text-[#5f8a2c]" },
  ];
  const actions = [
    { href: "/admin/cars/new", label: "Add a car", icon: Plus },
    { href: "/admin/enquiries", label: "View bookings", icon: Inbox },
    { href: "/admin/settings", label: "Business settings", icon: Settings },
  ];

  return (
    <>
      {dbError && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-[#f5c2c0] bg-[#fdecea] p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-bold">Can&apos;t reach the database, so the numbers below may be wrong.</p>
            <p className="mt-1 text-[#8a1c14]">
              Check SUPABASE_SERVICE_ROLE_KEY in the server settings (.env.local). Supabase said: {dbError}
            </p>
          </div>
        </div>
      )}

      {/* Welcome banner */}
      <section
        className="relative overflow-hidden rounded-3xl p-6 text-white md:p-8"
        style={{ background: "linear-gradient(135deg, #0d6150 0%, #094a3d 55%, #0a0c0f 100%)" }}
      >
        <div aria-hidden className="absolute -right-16 -top-20 size-64 rounded-full bg-[#86ad49]/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Dashboard</h1>
            <p className="mt-2 max-w-md text-sm text-white/75 md:text-base">
              {newEnq > 0 ? `${newEnq} booking ${newEnq === 1 ? "enquiry is" : "enquiries are"} waiting for a first call.` : "All booking enquiries have been handled. Nice work."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map(({ href, label, icon: Icon }, i) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
                  i === 0 ? "bg-[#86ad49] text-white hover:bg-[#6e9339]" : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
                }`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, href, icon: Icon, tint, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`group rounded-2xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift ${highlight ? "border-[#e8b44c]" : "border-line"}`}
          >
            <span className={`grid size-10 place-items-center rounded-xl ${tint}`}>
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="num mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-graphite">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-extrabold">Recent enquiries</h2>
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline">
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-5"><EmptyState>Booking requests from the website will appear here.</EmptyState></div>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-paper">
                    {!e.is_read && <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{e.name}</span>
                      <span className="block truncate text-sm text-graphite">{e.service_type}: {e.pickup}{e.destination ? ` to ${e.destination}` : ""}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-graphite">
                      <span className="block font-bold capitalize text-ink">{e.status}</span>
                      {formatDate(e.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="border-b border-line px-5 py-4 font-extrabold">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="p-5 text-sm text-graphite">Changes made in the admin panel will be listed here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((a) => (
                <li key={a.id} className="px-5 py-3 text-sm">
                  <span className="font-semibold capitalize">{a.action}</span> {a.entity}
                  {a.entity_label && <span className="font-semibold">: {a.entity_label}</span>}
                  <span className="block text-xs text-mist">{formatDate(a.created_at, true)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
