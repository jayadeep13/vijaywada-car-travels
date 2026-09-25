import Link from "next/link";
import { EmptyState, Flash, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { ENQUIRY_STATUSES, type Enquiry } from "@/lib/types";
import { STATUS_STYLE } from "@/components/admin/status";

type SP = { q?: string; status?: string; read?: string; page?: string; msg?: string; error?: string };
const PAGE_SIZE = 25;

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase.from("enquiries").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (sp.status && (ENQUIRY_STATUSES as readonly string[]).includes(sp.status)) query = query.eq("status", sp.status);
  if (sp.read === "unread") query = query.eq("is_read", false);
  const q = sp.q?.trim().replace(/[,()%*]/g, " ").slice(0, 60);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,pickup.ilike.%${q}%,destination.ilike.%${q}%,vehicle_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, count } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const rows = (data ?? []) as Enquiry[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const qs = (patch: Partial<SP>) => {
    const next = new URLSearchParams();
    const merged = { q: sp.q, status: sp.status, read: sp.read, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && next.set(k, v));
    const s = next.toString();
    return `/admin/enquiries${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Booking enquiries" description={`${count ?? 0} matching`} />
      <Flash msg={sp.msg} error={sp.error} />

      <form className="mb-4 flex flex-col gap-3 md:flex-row">
        <input name="q" defaultValue={sp.q} placeholder="Search name, phone, place or car" className="field md:max-w-sm" aria-label="Search enquiries" />
        <select name="status" defaultValue={sp.status ?? ""} className="field md:w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select name="read" defaultValue={sp.read ?? ""} className="field md:w-40" aria-label="Filter by read state">
          <option value="">Read and unread</option>
          <option value="unread">Unread only</option>
        </select>
        <button className="btn btn-primary !min-h-12 !text-sm">Filter</button>
        {(sp.q || sp.status || sp.read) && <Link href="/admin/enquiries" className="btn btn-ghost !min-h-12 !text-sm">Clear</Link>}
      </form>

      {rows.length === 0 ? (
        <EmptyState>No enquiries match these filters.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-line text-graphite">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Trip</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Travel date</th>
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((e) => (
                <tr key={e.id} className={`hover:bg-paper ${e.is_read ? "" : "font-semibold"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/enquiries/${e.id}`} className="flex items-center gap-2 font-bold hover:underline">
                      {!e.is_read && <span className="size-2 rounded-full bg-accent" aria-label="Unread" />}
                      {e.name}
                    </Link>
                    <span className="num text-xs text-graphite">{e.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{e.service_type}</span>
                    <span className="text-xs text-graphite">{e.pickup}{e.destination ? ` to ${e.destination}` : ""}</span>
                  </td>
                  <td className="px-4 py-3">{e.vehicle_name ?? <span className="text-graphite">Any</span>}</td>
                  <td className="px-4 py-3">{e.travel_date ? formatDate(e.travel_date) : "-"}{e.pickup_time ? `, ${e.pickup_time}` : ""}</td>
                  <td className="px-4 py-3 text-graphite">{formatDate(e.created_at, true)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[e.status]}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? <Link href={qs({ page: String(page - 1) })} className="font-bold text-accent">Previous</Link> : <span />}
          <span className="text-graphite">Page {page} of {pages}</span>
          {page < pages ? <Link href={qs({ page: String(page + 1) })} className="font-bold text-accent">Next</Link> : <span />}
        </nav>
      )}
    </>
  );
}
