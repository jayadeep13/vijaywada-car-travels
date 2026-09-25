import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Card, Flash, TextArea } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDate, telHref } from "@/lib/format";
import { ENQUIRY_STATUSES, type Enquiry } from "@/lib/types";
import { deleteEnquiry, markUnread, updateEnquiry } from "../../../actions/enquiries";
import { STATUS_STYLE } from "@/components/admin/status";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> };

export default async function EnquiryDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { msg, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const e = data as Enquiry;
  if (!e.is_read) await supabase.from("enquiries").update({ is_read: true }).eq("id", id);

  const digits = e.phone.replace(/\D/g, "");
  const wa = `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}?text=${encodeURIComponent(`Hello ${e.name}, this is regarding your car booking request${e.destination ? ` to ${e.destination}` : ""}.`)}`;

  const rows: [string, React.ReactNode][] = [
    ["Service", e.service_type],
    ["Vehicle", e.vehicle_name ?? "Customer asked us to suggest"],
    ["Pickup", e.pickup],
    ["Destination", e.destination ?? "-"],
    ["Travel date", e.travel_date ? formatDate(e.travel_date) : "-"],
    ["Pickup time", e.pickup_time ?? "-"],
    ["Passengers", e.passengers ?? "-"],
    ["Email", e.email ? <a href={`mailto:${e.email}`} className="hover:underline">{e.email}</a> : "-"],
    ["Received", formatDate(e.created_at, true)],
  ];

  return (
    <>
      <Link href="/admin/enquiries" className="text-sm font-semibold text-graphite hover:text-ink">Booking enquiries</Link>
      <div className="mb-6 mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{e.name}</h1>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[e.status]}`}>{e.status}</span>
      </div>
      <Flash msg={msg} error={error} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex flex-wrap gap-2 border-b border-line p-5">
            <a href={telHref(e.phone)} className="btn btn-primary !min-h-10 !text-sm"><Phone className="size-4" aria-hidden />{e.phone}</a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 !text-sm"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>
          </div>
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 px-5 py-3 text-sm">
                <dt className="text-graphite">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {e.message && (
            <div className="border-t border-line p-5">
              <p className="text-sm text-graphite">Message</p>
              <p className="mt-1 whitespace-pre-line">{e.message}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <form action={updateEnquiry} className="space-y-4 p-5">
              <input type="hidden" name="id" value={e.id} />
              <fieldset>
                <legend className="label">Status</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ENQUIRY_STATUSES.map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold capitalize has-[:checked]:border-ink has-[:checked]:bg-paper">
                      <input type="radio" name="status" value={s} defaultChecked={e.status === s} className="accent-[var(--color-accent)]" />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <TextArea name="admin_notes" label="Internal notes" defaultValue={e.admin_notes} rows={4} hint="Only visible to admins." />
              <SubmitButton>Save</SubmitButton>
            </form>
          </Card>
          <div className="flex gap-3">
            <form action={markUnread}><input type="hidden" name="id" value={e.id} /><SubmitButton variant="ghost">Mark unread</SubmitButton></form>
            <form action={deleteEnquiry}><input type="hidden" name="id" value={e.id} /><SubmitButton variant="danger" confirm="Delete this enquiry permanently?">Delete</SubmitButton></form>
          </div>
        </div>
      </div>
    </>
  );
}
