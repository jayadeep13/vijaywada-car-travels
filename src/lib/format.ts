const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function rupees(value: number | null | undefined) {
  return value == null ? "On request" : inr.format(value);
}

export function startingPrice(p: { reg_4hr_40km: number | null; day_12hr: number | null } | null) {
  if (!p) return null;
  const vals = [p.reg_4hr_40km, p.day_12hr].filter((v): v is number => typeof v === "number" && v > 0);
  return vals.length ? Math.min(...vals) : null;
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });
}
