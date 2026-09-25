"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_SECONDS, adminConfigured, createSessionToken, safeEqual } from "@/lib/admin-session";

// A 4-digit PIN has only 10,000 combinations, so wrong guesses are strictly limited:
// 5 per device per 15 minutes, and 20 across all devices per 15 minutes (which then
// locks the PIN screen for everyone until the window passes). In-memory, per server instance.
const WINDOW_MS = 15 * 60_000;
const PER_IP = 5;
const GLOBAL = 20;
const failures = new Map<string, number[]>();

function recent(key: string) {
  const now = Date.now();
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list;
}

function recordFailure(ip: string) {
  const now = Date.now();
  recent(ip).push(now);
  recent("*").push(now);
  if (failures.size > 5000) failures.clear();
}

export async function login(formData: FormData) {
  if (!adminConfigured()) redirect("/admin/login?error=setup");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (recent(ip).length >= PER_IP || recent("*").length >= GLOBAL) redirect("/admin/login?error=rate");

  const pin = String(formData.get("pin") || "").replace(/\D/g, "").slice(0, 12);
  if (!pin || !safeEqual(pin, process.env.ADMIN_PIN!)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600)); // slows scripted guessing
    redirect("/admin/login?error=invalid");
  }

  (await cookies()).set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
