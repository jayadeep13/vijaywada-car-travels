import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, PageHeader, TextArea, Toggle } from "@/components/admin/ui";
import { requireAdmin, toIstInput } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/lib/types";
import { deleteAnnouncement, saveAnnouncement, toggleAnnouncement } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

export default async function Announcements({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Announcement[];
  const editing = sp.edit === "new" ? ({} as Partial<Announcement>) : rows.find((r) => r.id === sp.edit);

  const schedule = (a: Announcement) =>
    [a.starts_at && `From ${formatDate(a.starts_at, true)}`, a.ends_at && `until ${formatDate(a.ends_at, true)}`].filter(Boolean).join(" ") || "No schedule";

  return (
    <>
      <PageHeader title="Announcements" description="The newest active announcement shows in a slim, dismissible bar at the top of the website." action={{ href: "?edit=new", label: "New announcement" }} />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? "Edit announcement" : "New announcement"} action={saveAnnouncement} id={editing.id} cancelHref="/admin/announcements">
          <Field name="title" label="Title" defaultValue={editing.title} required className="md:col-span-2" placeholder="Airport transfers available 24/7" />
          <TextArea name="description" label="Short description (optional)" defaultValue={editing.description} rows={2} className="md:col-span-2" />
          <Field name="cta_text" label="Button text" defaultValue={editing.cta_text} placeholder="Book now" />
          <Field name="cta_url" label="Button link" defaultValue={editing.cta_url} placeholder="/book or https://…" />
          <Field name="starts_at" label="Start (IST, optional)" type="datetime-local" defaultValue={toIstInput(editing.starts_at)} />
          <Field name="ends_at" label="End (IST, optional)" type="datetime-local" defaultValue={toIstInput(editing.ends_at)} />
          <Toggle name="active" label="Active" defaultChecked={editing.active ?? true} />
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/announcements"
        items={rows.map((a) => ({ id: a.id, title: a.title, subtitle: schedule(a), active: a.active }))}
        onToggle={toggleAnnouncement}
        onDelete={deleteAnnouncement}
        empty="No announcements yet."
      />
    </>
  );
}
