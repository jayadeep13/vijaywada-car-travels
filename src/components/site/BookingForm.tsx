"use client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { submitBooking, type BookingState } from "@/app/actions/booking";
import { SERVICE_TYPES } from "@/lib/types";

type CarOption = { slug: string; name: string; seating_capacity: number };
export type BookingDefaults = { car?: string; service?: string; pickup?: string; destination?: string; date?: string; passengers?: string };

const initial: BookingState = { status: "idle" };

export function BookingForm({ cars, defaults }: { cars: CarOption[]; defaults: BookingDefaults }) {
  const [state, action, pending] = useActionState(submitBooking, initial);
  const err = state.fieldErrors ?? {};
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.status === "success" && state.whatsapp) {
      window.location.href = state.whatsapp;
    }
  }, [state.status, state.whatsapp]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-line bg-surface p-8 text-center md:p-12">
        <CheckCircle2 className="mx-auto size-12 text-accent" aria-hidden />
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Request received</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-graphite">{state.message}</p>
        {state.whatsapp && <p className="mt-1 text-sm text-graphite">Taking you to WhatsApp to send your details…</p>}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {state.whatsapp && (
            <a href={state.whatsapp} className="btn btn-accent">
              <MessageCircle className="size-5" aria-hidden />
              Open WhatsApp
            </a>
          )}
          <Link href="/" className="btn btn-ghost">Back to home</Link>
        </div>
      </div>
    );
  }

  const fieldClass = (name: string) => `field ${err[name] ? "!border-danger" : ""}`;
  const errorText = (name: string) =>
    err[name] ? <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-danger">{err[name]}</p> : null;
  const aria = (name: string) => (err[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});

  return (
    <form action={action} noValidate className="rounded-[var(--radius-card)] border border-line bg-surface p-5 md:p-8">
      {state.status === "error" && state.message && (
        <p role="alert" className="mb-6 rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-semibold text-danger">{state.message}</p>
      )}

      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-lg font-extrabold tracking-tight md:col-span-2">Trip details</legend>
        <div>
          <label htmlFor="service_type" className="label">Service</label>
          <select id="service_type" name="service_type" defaultValue={defaults.service ?? "local"} className={fieldClass("service_type")} {...aria("service_type")}>
            {SERVICE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {errorText("service_type")}
        </div>
        <div>
          <label htmlFor="car" className="label">Vehicle</label>
          <select id="car" name="car" defaultValue={defaults.car ?? ""} className="field">
            <option value="">Suggest the right car for me</option>
            {cars.map((c) => <option key={c.slug} value={c.slug}>{c.name} ({c.seating_capacity} seats)</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pickup" className="label">Pickup location</label>
          <input id="pickup" name="pickup" required defaultValue={defaults.pickup ?? "Vijayawada"} className={fieldClass("pickup")} {...aria("pickup")} />
          {errorText("pickup")}
        </div>
        <div>
          <label htmlFor="destination" className="label">Destination</label>
          <input id="destination" name="destination" defaultValue={defaults.destination} placeholder="City, airport or address" className="field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="travel_date" className="label">Date</label>
            <input id="travel_date" name="travel_date" type="date" min={today} defaultValue={defaults.date} className={fieldClass("travel_date")} {...aria("travel_date")} />
            {errorText("travel_date")}
          </div>
          <div>
            <label htmlFor="pickup_time" className="label">Pickup time</label>
            <input id="pickup_time" name="pickup_time" type="time" className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="passengers" className="label">Passengers</label>
          <input id="passengers" name="passengers" type="number" inputMode="numeric" min={1} max={60} defaultValue={defaults.passengers} className={fieldClass("passengers")} {...aria("passengers")} />
          {errorText("passengers")}
        </div>
      </fieldset>

      <fieldset className="mt-8 grid gap-5 border-t border-line pt-8 md:grid-cols-2">
        <legend className="sr-only">Your details</legend>
        <p className="text-lg font-extrabold tracking-tight md:col-span-2" aria-hidden>Your details</p>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" required autoComplete="name" className={fieldClass("name")} {...aria("name")} />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="phone" className="label">Mobile number</label>
          <input id="phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" className={fieldClass("phone")} {...aria("phone")} />
          {errorText("phone")}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="email" className="label">Email (optional)</label>
          <input id="email" name="email" type="email" autoComplete="email" className={fieldClass("email")} {...aria("email")} />
          {errorText("email")}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="message" className="label">Anything else? (optional)</label>
          <textarea id="message" name="message" rows={3} maxLength={1000} placeholder="Flight number, luggage, stops on the way…" className="field" />
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className="btn btn-accent mt-8 w-full !min-h-[3.25rem] text-base disabled:opacity-60 md:w-auto md:px-10">
        {pending ? "Sending request…" : "Request booking"}
      </button>
      <p className="mt-3 text-sm text-graphite">This is a booking request. We will call you to confirm the car and fare.</p>
    </form>
  );
}
