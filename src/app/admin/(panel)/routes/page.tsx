import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, PageHeader, TextArea, Toggle } from "@/components/admin/ui";
import { faqsToText, requireAdmin } from "@/lib/admin";
import type { Route } from "@/lib/types";
import { deleteRoute, saveRoute, toggleRoute } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

export default async function Routes({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("routes").select("*").order("display_order");
  const rows = (data ?? []) as Route[];
  const editing = sp.edit === "new" ? ({} as Partial<Route>) : rows.find((r) => r.id === sp.edit);

  return (
    <>
      <PageHeader title="Routes" description="Route pages live at /vijayawada-to-city-cab. Add a route only when it has something useful to say." action={{ href: "?edit=new", label: "Add route" }} />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? "Edit route" : "New route"} action={saveRoute} id={editing.id} cancelHref="/admin/routes">
          <Field name="from_city" label="From" defaultValue={editing.from_city ?? "Vijayawada"} required />
          <Field name="to_city" label="To" defaultValue={editing.to_city} required />
          <Field name="slug" label="URL slug" defaultValue={editing.slug} hint="Must end in -cab, e.g. vijayawada-to-hyderabad-cab" className="md:col-span-2" />
          <Field name="distance_km" label="Approx. distance (km)" type="number" defaultValue={editing.distance_km} />
          <Field name="duration" label="Travel time" defaultValue={editing.duration} placeholder="5 to 6 hours" />
          <TextArea name="description" label="Short description" defaultValue={editing.description} rows={2} className="md:col-span-2" />
          <TextArea name="highlights" label="Highlights" defaultValue={editing.highlights?.join("\n")} rows={3} hint="One per line." className="md:col-span-2" />
          <TextArea name="faqs" label="FAQs" defaultValue={faqsToText(editing.faqs)} rows={6} hint="Question on one line, answer on the next. Blank line between FAQs." className="md:col-span-2" />
          <Field name="seo_title" label="SEO title" defaultValue={editing.seo_title} />
          <Field name="seo_description" label="SEO description" defaultValue={editing.seo_description} />
          <Field name="display_order" label="Display order" type="number" defaultValue={editing.display_order ?? 0} />
          <Toggle name="active" label="Active" defaultChecked={editing.active ?? true} />
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/routes"
        items={rows.map((r) => ({ id: r.id, title: `${r.from_city} to ${r.to_city}`, subtitle: `/${r.slug}${r.distance_km ? `, ${r.distance_km} km` : ""}`, active: r.active }))}
        onToggle={toggleRoute}
        onDelete={deleteRoute}
        empty="No routes yet."
      />
    </>
  );
}
