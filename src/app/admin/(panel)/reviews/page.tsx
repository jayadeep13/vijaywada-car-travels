import { FormCard, ResourceList } from "@/components/admin/ResourceList";
import { Field, Flash, ImageInput, PageHeader, TextArea, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Review } from "@/lib/types";
import { deleteReview, saveReview, toggleReview } from "../../actions/content";

type SP = { edit?: string; msg?: string; error?: string };

export default async function Reviews({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Review[];
  const editing = sp.edit === "new" ? ({} as Partial<Review>) : rows.find((r) => r.id === sp.edit);

  return (
    <>
      <PageHeader title="Reviews" description="Add only genuine customer reviews, with the customer's permission." action={{ href: "?edit=new", label: "Add review" }} />
      <Flash msg={sp.msg} error={sp.error} />
      {editing && (
        <FormCard title={editing.id ? "Edit review" : "New review"} action={saveReview} id={editing.id} cancelHref="/admin/reviews">
          <Field name="customer_name" label="Customer name" defaultValue={editing.customer_name} required />
          <Field name="rating" label="Rating (1 to 5)" type="number" min={1} max={5} defaultValue={editing.rating ?? 5} required />
          <TextArea name="review" label="Review" defaultValue={editing.review} rows={4} required className="md:col-span-2" />
          <Field name="review_date" label="Date" type="date" defaultValue={editing.review_date} />
          <ImageInput name="photo" label="Photo (optional)" current={editing.photo_url} />
          <Toggle name="published" label="Published" defaultChecked={editing.published ?? true} />
        </FormCard>
      )}
      <ResourceList
        basePath="/admin/reviews"
        items={rows.map((r) => ({ id: r.id, title: r.customer_name, subtitle: `${r.rating}/5: ${r.review}`, active: r.published, image: r.photo_url }))}
        onToggle={toggleReview}
        onDelete={deleteReview}
        onLabel="Published"
        offLabel="Hidden"
        empty="No reviews yet. The reviews section stays hidden on the website until you publish one."
      />
    </>
  );
}
