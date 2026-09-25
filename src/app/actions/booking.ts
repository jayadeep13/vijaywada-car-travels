"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { createPublicClient, supabaseConfigured } from "@/lib/supabase/server";
import { FALLBACK_CARS } from "@/lib/fallback-cars";
import { getSettings } from "@/lib/queries";
import { rateLimit } from "@/lib/rate-limit";
import { SERVICE_TYPES } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  whatsapp?: string | null;
};

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

const schema = z.object({
  car: optionalText(80),
  service_type: z.enum(SERVICE_TYPES.map((s) => s.value) as [string, ...string[]], { message: "Choose a service" }),
  pickup: z.string().trim().min(2, "Enter a pickup location").max(160),
  destination: optionalText(160),
  travel_date: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Choose a valid date")
    .transform((v) => (v ? v : null)),
  pickup_time: optionalText(10),
  passengers: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 60), "Enter 1 to 60 passengers"),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => /^(\+?91)?[6-9]\d{9}$/.test(v) || /^\+\d{8,15}$/.test(v), "Enter a valid mobile number"),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email")
    .transform((v) => (v ? v : null)),
  message: optionalText(1000),
});

export async function submitBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  // Honeypot: real people never fill this hidden field.
  if (formData.get("website")) return { status: "success", message: "Thank you." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`booking:${ip}`, 5, 10 * 60_000)) {
    return { status: "error", message: "Too many requests from this device. Please call or WhatsApp us instead." };
  }

  const raw = Object.fromEntries(
    ["car", "service_type", "pickup", "destination", "travel_date", "pickup_time", "passengers", "name", "phone", "email", "message"].map((k) => [
      k,
      (formData.get(k) as string | null) ?? undefined,
    ]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Check the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;

  let carId: string | null = null;
  let vehicleName: string | null = d.car ? (FALLBACK_CARS.find((c) => c.slug === d.car)?.name ?? null) : null;
  const serviceLabel = SERVICE_TYPES.find((s) => s.value === d.service_type)?.label ?? d.service_type;

  if (supabaseConfigured) {
    const supabase = createPublicClient();
    if (d.car) {
      const { data: car } = await supabase.from("cars").select("id, name").eq("slug", d.car).maybeSingle();
      carId = car?.id ?? null;
      vehicleName = car?.name ?? vehicleName;
    }

    const { error } = await supabase.from("enquiries").insert({
      name: d.name,
      phone: d.phone,
      email: d.email,
      car_id: carId,
      vehicle_name: vehicleName,
      service_type: serviceLabel,
      pickup: d.pickup,
      destination: d.destination,
      travel_date: d.travel_date,
      pickup_time: d.pickup_time,
      passengers: d.passengers,
      message: d.message,
    });
    // Saving the enquiry is best-effort: even if it fails, the traveller can
    // still reach us on WhatsApp below, so we don't block on this error.
    if (error) console.error("[booking]", error);
  }

  const settings = await getSettings();
  const dateLabel = d.travel_date
    ? new Date(`${d.travel_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return {
    status: "success",
    message: "Your booking request has been received. Our team will contact you for confirmation.",
    whatsapp: whatsappLink(settings.whatsapp, settings.company_name, {
      name: d.name,
      vehicle: vehicleName,
      service: serviceLabel,
      pickup: d.pickup,
      destination: d.destination,
      date: dateLabel,
      time: d.pickup_time,
      passengers: d.passengers,
    }),
  };
}
