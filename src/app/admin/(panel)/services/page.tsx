import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, PageHeader, TextArea, Toggle } from "@/components/admin/ui";
import { faqsToText, requireAdmin } from "@/lib/admin";
import type { Service } from "@/lib/types";
import { deleteService, saveService, toggleService } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

export default async function Services({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*").order("display_order");
  const rows = (data ?? []) as Service[];
  const editing = sp.edit === "new" ? ({} as Partial<Service>) : rows.find((r) => r.id === sp.edit);

  return (
    <>
      <PageHeader title="Services" description="Each service has its own page at /services/slug." action={{ href: "?edit=new", label: "Add service" }} />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? `Edit ${editing.title}` : "New service"} action={saveService} id={editing.id} cancelHref="/admin/services">
          <Field name="title" label="Title" defaultValue={editing.title} required />
          <Field name="slug" label="URL slug" defaultValue={editing.slug} hint="Changing this changes the page address." />
          <Field name="summary" label="One-line summary" defaultValue={editing.summary} required className="md:col-span-2" />
          <TextArea name="body" label="Short description" defaultValue={editing.body} rows={3} className="md:col-span-2" />
          <TextArea name="steps" label="How it works" defaultValue={editing.steps?.join("\n")} rows={4} hint="One step per line." className="md:col-span-2" />
          <TextArea name="faqs" label="FAQs" defaultValue={faqsToText(editing.faqs)} rows={8} hint="Question on one line, answer on the next. Leave a blank line between FAQs." className="md:col-span-2" />
          <Field name="seo_title" label="SEO title" defaultValue={editing.seo_title} hint="About 60 characters." />
          <Field name="seo_description" label="SEO description" defaultValue={editing.seo_description} hint="About 155 characters." />
          <Field name="display_order" label="Display order" type="number" defaultValue={editing.display_order ?? 0} />
          <Toggle name="active" label="Active" defaultChecked={editing.active ?? true} />
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/services"
        items={rows.map((s) => ({ id: s.id, title: s.title, subtitle: `/services/${s.slug}`, active: s.active }))}
        onToggle={toggleService}
        onDelete={deleteService}
        empty="No services yet."
      />
    </>
  );
}
