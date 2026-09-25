import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, ImageInput, PageHeader, Select, Toggle } from "@/components/admin/ui";
import { requireAdmin, toIstInput } from "@/lib/admin";
import type { Poster } from "@/lib/types";
import { deletePoster, savePoster, togglePoster } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

const FREQ: Record<string, string> = { session: "Once per visit", hours: "Every few hours", every_visit: "Every page load" };

export default async function Posters({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posters").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Poster[];
  const editing = sp.edit === "new" ? ({} as Partial<Poster>) : rows.find((r) => r.id === sp.edit);
  // Open the optional section when editing a poster that already uses any of those settings
  const hasDetails = Boolean(
    editing && (editing.title || editing.cta_text || editing.cta_url || editing.placement === "all" || (editing.frequency && editing.frequency !== "session") || editing.starts_at || editing.ends_at),
  );
  const label = (p: Poster) => p.title || `Poster uploaded ${new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <PageHeader
        title="Popup posters"
        description="The newest enabled poster pops up when a visitor opens the website. Turn it off here and it disappears within seconds."
        action={{ href: "?edit=new", label: "Upload poster" }}
      />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? "Edit poster" : "New poster"} action={savePoster} id={editing.id} cancelHref="/admin/posters">
          <div className="md:col-span-2">
            <ImageInput
              name="image"
              label={editing.id ? "Replace poster image" : "Poster image"}
              current={editing.image_url}
              hint="Your finished poster design is all you need. Portrait 4:5 works best (e.g. 1080×1350), up to 5 MB."
            />
          </div>
          <div className="md:col-span-2">
            <Toggle name="active" label="Show this poster on the website" defaultChecked={editing.active ?? true} />
          </div>

          {/* Everything below is optional: a designed poster can go live with just the image */}
          <details open={hasDetails} className="group rounded-2xl border border-line bg-paper/50 md:col-span-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-sm font-bold">More options</span>
                <span className="block text-xs text-graphite">Title, button, where and how often it shows, schedule. All optional.</span>
              </span>
              <span aria-hidden className="grid size-8 place-items-center rounded-full border border-line bg-surface text-graphite transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
              <Field name="title" label="Title (optional)" defaultValue={editing.title} className="md:col-span-2" hint="Shown under the poster. Leave empty to show the poster image only." />
              <Field name="cta_text" label="Button text (optional)" defaultValue={editing.cta_text} placeholder="Book now" />
              <Field name="cta_url" label="Link (optional)" defaultValue={editing.cta_url} placeholder="/book" hint="With no button text, tapping the poster opens this link." />
              <Select name="placement" label="Show on" defaultValue={editing.placement} options={[{ value: "home", label: "Homepage only" }, { value: "all", label: "Every page" }]} />
              <Select name="frequency" label="How often" defaultValue={editing.frequency} options={Object.entries(FREQ).map(([value, label]) => ({ value, label }))} />
              <Field name="frequency_hours" label="Hours between showings" type="number" min={1} max={720} defaultValue={editing.frequency_hours ?? 24} hint="Used when 'Every few hours' is selected." />
              <div className="hidden md:block" />
              <Field name="starts_at" label="Start (IST, optional)" type="datetime-local" defaultValue={toIstInput(editing.starts_at)} />
              <Field name="ends_at" label="End (IST, optional)" type="datetime-local" defaultValue={toIstInput(editing.ends_at)} />
            </div>
          </details>
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/posters"
        items={rows.map((p) => ({ id: p.id, title: label(p), subtitle: `${p.placement === "all" ? "Every page" : "Homepage"}, ${p.frequency === "hours" ? `every ${p.frequency_hours} hours` : FREQ[p.frequency].toLowerCase()}`, active: p.active, image: p.image_url }))}
        onToggle={togglePoster}
        onDelete={deletePoster}
        onLabel="Enabled"
        offLabel="Disabled"
        empty="No posters yet. Upload one to run a promotion."
      />
    </>
  );
}
