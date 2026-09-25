import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, PageHeader, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Location } from "@/lib/types";
import { deleteLocation, saveLocation, toggleLocation } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

export default async function Locations({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("locations").select("*").order("display_order");
  const rows = (data ?? []) as Location[];
  const editing = sp.edit === "new" ? ({} as Partial<Location>) : rows.find((r) => r.id === sp.edit);

  return (
    <>
      <PageHeader title="Service areas" description="Areas listed on the homepage and the Locations page." action={{ href: "?edit=new", label: "Add area" }} />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? "Edit area" : "New area"} action={saveLocation} id={editing.id} cancelHref="/admin/locations">
          <Field name="name" label="Area name" defaultValue={editing.name} required />
          <Field name="display_order" label="Display order" type="number" defaultValue={editing.display_order ?? 0} />
          <Field name="description" label="Note (optional)" defaultValue={editing.description} className="md:col-span-2" />
          <Toggle name="active" label="Active" defaultChecked={editing.active ?? true} />
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/locations"
        items={rows.map((l) => ({ id: l.id, title: l.name, subtitle: l.description, active: l.active }))}
        onToggle={toggleLocation}
        onDelete={deleteLocation}
        empty="No areas yet."
      />
    </>
  );
}
