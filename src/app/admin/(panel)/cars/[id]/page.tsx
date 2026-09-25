import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Card, Field, Flash, ImageInput, TextArea, Toggle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import type { Car, CarImage, CarPricing } from "@/lib/types";
import { deleteCar, deleteCarImage, saveCar } from "../../../actions/cars";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string; error?: string }> };

export default async function CarEditor({ params, searchParams }: Props) {
  const { id } = await params;
  const { msg, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";

  let car: Car | null = null;
  if (!isNew) {
    const { data } = await supabase.from("cars").select("*, car_pricing(*), car_images(*)").eq("id", id).maybeSingle();
    if (!data) notFound();
    car = data as Car;
  }
  const p = (Array.isArray(car?.car_pricing) ? car?.car_pricing[0] : car?.car_pricing) as CarPricing | null | undefined;
  const images = ((car?.car_images ?? []) as CarImage[]).sort((a, b) => a.sort_order - b.sort_order);

  const section = "grid gap-4 p-5 md:grid-cols-2 md:p-6";
  const h = "border-b border-line px-5 py-4 font-extrabold md:px-6";

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <Link href="/admin/cars" className="text-sm font-semibold text-graphite hover:text-ink">Cars</Link>
          <h1 className="text-2xl font-extrabold tracking-tight">{isNew ? "Add car" : car!.name}</h1>
        </div>
        {!isNew && <Link href={`/cars/${car!.slug}`} target="_blank" className="text-sm font-bold text-accent">View on site</Link>}
      </div>
      <Flash msg={msg} error={error} />

      <form action={saveCar} className="space-y-6">
        {!isNew && <input type="hidden" name="id" value={car!.id} />}

        <Card>
          <h2 className={h}>Vehicle</h2>
          <div className={section}>
            <Field name="name" label="Vehicle name" defaultValue={car?.name} required />
            <Field name="slug" label="URL slug" defaultValue={car?.slug} hint="Used in /cars/slug. Leave empty to create from the name." />
            <Field name="category" label="Category" defaultValue={car?.category ?? "Sedan"} hint="e.g. Sedan, MUV, Premium SUV, Luxury Sedan" required />
            <Field name="seating_capacity" label="Seating capacity" type="number" min={1} max={60} defaultValue={car?.seating_capacity ?? 4} required />
            <Field name="fuel_type" label="Fuel type" defaultValue={car?.fuel_type} placeholder="Diesel, Petrol, CNG" />
            <Field name="transmission" label="Transmission" defaultValue={car?.transmission} placeholder="Manual or Automatic" />
            <TextArea name="description" label="Short description" defaultValue={car?.description} rows={3} className="md:col-span-2" />
            <TextArea name="features" label="Features" defaultValue={car?.features?.join("\n")} rows={3} hint="One per line." className="md:col-span-2" />
            <Field name="display_order" label="Display order" type="number" defaultValue={car?.display_order ?? 0} />
            <div className="flex flex-col justify-end gap-3 pb-2">
              <Toggle name="air_conditioned" label="Air conditioned" defaultChecked={car?.air_conditioned ?? true} />
              <Toggle name="featured" label="Show on homepage" defaultChecked={car?.featured ?? false} />
              <Toggle name="active" label="Active (visible on website)" defaultChecked={car?.active ?? true} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className={h}>Photos</h2>
          <div className="grid gap-5 p-5 md:p-6">
            <ImageInput name="image" label="Main image" current={car?.image_url} hint="Landscape photo, ideally 1600×1000. JPG, PNG, WebP or AVIF, up to 5 MB." />
            <div>
              <label htmlFor="gallery" className="label">Add gallery photos</label>
              <input id="gallery" name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-4 file:py-2 file:font-semibold" />
              <p className="mt-1 text-xs text-mist">Up to 10 at a time, 5 MB each.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className={h}>Local packages (Regular)</h2>
          <div className={section}>
            <Field name="reg_4hr_40km" label="4 hrs / 40 km (₹)" type="number" defaultValue={p?.reg_4hr_40km} />
            <Field name="reg_8hr_80km" label="8 hrs / 80 km (₹)" type="number" defaultValue={p?.reg_8hr_80km} />
            <Field name="reg_extra_hour" label="Extra hour (₹)" type="number" defaultValue={p?.reg_extra_hour} />
            <Field name="reg_extra_km" label="Extra km (₹)" type="number" defaultValue={p?.reg_extra_km} />
          </div>
        </Card>

        <Card>
          <h2 className={h}>Day rent</h2>
          <div className={section}>
            <Field name="day_12hr" label="12 hours (₹)" type="number" defaultValue={p?.day_12hr} />
            <Field name="day_24hr" label="24 hours (₹)" type="number" defaultValue={p?.day_24hr} />
            <Field name="day_chauffeur_12hr" label="Chauffeur allowance, 12 hrs (₹)" type="number" defaultValue={p?.day_chauffeur_12hr} />
            <Field name="day_chauffeur_24hr" label="Chauffeur allowance, 24 hrs (₹)" type="number" defaultValue={p?.day_chauffeur_24hr} />
            <Field name="day_extra_hour" label="Extra hour (₹)" type="number" defaultValue={p?.day_extra_hour} />
            <Field name="day_fuel_km_per_litre" label="Fuel charge (km per litre)" type="number" step="0.1" defaultValue={p?.day_fuel_km_per_litre} />
          </div>
        </Card>

        <Card>
          <h2 className={h}>Outstation</h2>
          <div className={section}>
            <Field name="out_per_km" label="Rate per km (₹)" type="number" defaultValue={p?.out_per_km} />
            <Field name="out_chauffeur" label="Chauffeur allowance per day (₹)" type="number" defaultValue={p?.out_chauffeur} />
            <Field name="out_min_km" label="Outstation tariff applies above (km)" type="number" defaultValue={p?.out_min_km} hint="Leave empty if not applicable." />
            <Field name="out_notes" label="Notes" defaultValue={p?.out_notes} placeholder="Above 350 km, outstation tariff applies." />
          </div>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-6">
          <SubmitButton>{isNew ? "Add car" : "Save changes"}</SubmitButton>
          <Link href="/admin/cars" className="btn btn-ghost !min-h-10 !text-sm">Cancel</Link>
        </div>
      </form>

      {!isNew && images.length > 0 && (
        <Card className="mt-6">
          <h2 className={h}>Gallery</h2>
          <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            {images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} className="aspect-[4/3] w-full object-cover" />
                <form action={deleteCarImage} className="p-2">
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="car_id" value={car!.id} />
                  <SubmitButton variant="danger" pendingText="Removing…" confirm="Remove this photo?">Remove</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!isNew && (
        <Card className="mt-6 border-danger/20">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <h2 className="font-extrabold">Delete this car</h2>
              <p className="text-sm text-graphite">To hide it temporarily, switch off Active instead. Deleting removes its prices and photos.</p>
            </div>
            <form action={deleteCar}>
              <input type="hidden" name="id" value={car!.id} />
              <SubmitButton variant="danger" pendingText="Deleting…" confirm={`Delete ${car!.name} permanently?`}>Delete car</SubmitButton>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
