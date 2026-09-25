"use server";
import { redirect } from "next/navigation";
import { bool, errorMessage, lines, logActivity, num, refreshSite, removeImage, requireAdmin, str, uploadImage } from "@/lib/admin";
import { slugify } from "@/lib/format";

const enc = encodeURIComponent;

export async function saveCar(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  let target: string;
  try {
    const name = str(formData, "name");
    if (!name) throw new Error("Vehicle name is required.");
    const slug = slugify(str(formData, "slug") ?? name);
    if (!slug) throw new Error("Slug is required.");

    const car: Record<string, unknown> = {
      name,
      slug,
      category: str(formData, "category") ?? "Sedan",
      seating_capacity: num(formData, "seating_capacity") ?? 4,
      fuel_type: str(formData, "fuel_type"),
      transmission: str(formData, "transmission"),
      air_conditioned: bool(formData, "air_conditioned"),
      description: str(formData, "description"),
      features: lines(formData, "features"),
      featured: bool(formData, "featured"),
      active: bool(formData, "active"),
      display_order: num(formData, "display_order") ?? 0,
    };
    const image = await uploadImage(supabase, formData.get("image"), "cars");
    if (image) car.image_url = image;

    let carId = id;
    if (id) {
      if (image) {
        const { data: old } = await supabase.from("cars").select("image_url").eq("id", id).single();
        await removeImage(supabase, old?.image_url);
      }
      const { error } = await supabase.from("cars").update(car).eq("id", id);
      if (error) throw new Error(error.code === "23505" ? "Another car already uses this slug." : error.message);
    } else {
      const { data, error } = await supabase.from("cars").insert(car).select("id").single();
      if (error) throw new Error(error.code === "23505" ? "Another car already uses this slug." : error.message);
      carId = data.id;
    }

    const pricing = {
      car_id: carId,
      day_12hr: num(formData, "day_12hr"),
      day_24hr: num(formData, "day_24hr"),
      day_fuel_km_per_litre: num(formData, "day_fuel_km_per_litre"),
      day_chauffeur_12hr: num(formData, "day_chauffeur_12hr"),
      day_chauffeur_24hr: num(formData, "day_chauffeur_24hr"),
      day_extra_hour: num(formData, "day_extra_hour"),
      reg_4hr_40km: num(formData, "reg_4hr_40km"),
      reg_8hr_80km: num(formData, "reg_8hr_80km"),
      reg_extra_hour: num(formData, "reg_extra_hour"),
      reg_extra_km: num(formData, "reg_extra_km"),
      out_per_km: num(formData, "out_per_km"),
      out_chauffeur: num(formData, "out_chauffeur"),
      out_min_km: num(formData, "out_min_km"),
      out_notes: str(formData, "out_notes"),
    };
    const { error: pErr } = await supabase.from("car_pricing").upsert(pricing);
    if (pErr) throw new Error(pErr.message);

    // Gallery uploads (multiple)
    const gallery = formData.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
    if (gallery.length) {
      const { count } = await supabase.from("car_images").select("id", { count: "exact", head: true }).eq("car_id", carId!);
      let order = count ?? 0;
      for (const file of gallery.slice(0, 10)) {
        const url = await uploadImage(supabase, file, `cars/${slug}`);
        if (url) await supabase.from("car_images").insert({ car_id: carId, url, alt: `${name} photo`, sort_order: order++ });
      }
    }

    await logActivity(supabase, id ? "updated" : "added", "car", name);
    refreshSite();
    target = `/admin/cars/${carId}?msg=${enc("Car saved. The website is updated.")}`;
  } catch (e) {
    target = `/admin/cars/${id ?? "new"}?error=${enc(errorMessage(e))}`;
  }
  redirect(target);
}

export async function deleteCar(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (!id) redirect("/admin/cars");
  const { data: car } = await supabase.from("cars").select("name, image_url, car_images(url)").eq("id", id).single();
  const { error } = await supabase.from("cars").delete().eq("id", id);
  if (error) redirect(`/admin/cars/${id}?error=${enc(error.message)}`);
  if (car) {
    await removeImage(supabase, car.image_url);
    for (const img of (car.car_images as { url: string }[]) ?? []) await removeImage(supabase, img.url);
    await logActivity(supabase, "deleted", "car", car.name);
  }
  refreshSite();
  redirect(`/admin/cars?msg=${enc("Car deleted.")}`);
}

export async function toggleCar(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const field = str(formData, "field");
  if (!id || (field !== "active" && field !== "featured")) redirect("/admin/cars");
  const value = formData.get("value") === "true";
  const { data } = await supabase.from("cars").update({ [field]: value }).eq("id", id).select("name").single();
  await logActivity(supabase, value ? (field === "active" ? "activated" : "featured") : field === "active" ? "deactivated" : "unfeatured", "car", data?.name);
  refreshSite();
  redirect("/admin/cars");
}

export async function moveCar(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const dir = str(formData, "dir");
  const { data: cars } = await supabase.from("cars").select("id, display_order").order("display_order").order("name");
  if (!cars || !id) redirect("/admin/cars");
  const i = cars.findIndex((c) => c.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i >= 0 && j >= 0 && j < cars.length) {
    [cars[i], cars[j]] = [cars[j], cars[i]];
    // Renumber so ordering is always clean
    await Promise.all(cars.map((c, idx) => supabase.from("cars").update({ display_order: idx + 1 }).eq("id", c.id)));
    refreshSite();
  }
  redirect("/admin/cars");
}

export async function deleteCarImage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const carId = str(formData, "car_id");
  if (id) {
    const { data } = await supabase.from("car_images").select("url").eq("id", id).single();
    await supabase.from("car_images").delete().eq("id", id);
    await removeImage(supabase, data?.url);
    refreshSite();
  }
  redirect(`/admin/cars/${carId}?msg=${enc("Photo removed.")}`);
}
