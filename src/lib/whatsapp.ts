export type WhatsAppTrip = {
  vehicle?: string | null;
  service?: string | null;
  pickup?: string | null;
  destination?: string | null;
  date?: string | null;
  time?: string | null;
  passengers?: number | string | null;
  name?: string | null;
};

export function whatsappLink(number: string | null | undefined, company: string, trip: WhatsAppTrip = {}) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  const lines = [`Hello ${company}, I would like to enquire about a car booking.`];
  const add = (label: string, v: unknown) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") lines.push(`${label}: ${v}`);
  };
  if (Object.values(trip).some(Boolean)) lines.push("");
  add("Name", trip.name);
  add("Vehicle", trip.vehicle);
  add("Service", trip.service);
  add("Pickup", trip.pickup);
  add("Destination", trip.destination);
  add("Date", trip.date);
  add("Time", trip.time);
  add("Passengers", trip.passengers);
  return `https://wa.me/${full}?text=${encodeURIComponent(lines.join("\n"))}`;
}
