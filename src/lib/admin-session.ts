// Admin PIN session: a signed cookie holding only an expiry time. Uses Web Crypto so the
// same code runs in proxy.ts and in server actions/pages.

export const ADMIN_COOKIE = "vct_admin";
export const SESSION_SECONDS = 12 * 60 * 60; // signed in for 12 hours

const encoder = new TextEncoder();

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) return null;
  return s;
}

async function sign(value: string, key: string) {
  const k = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, encoder.encode(value)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison, so response timing reveals nothing about a guess. */
export function safeEqual(a: string, b: string) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export async function createSessionToken() {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not set.");
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${exp}.${await sign(exp, key)}`;
}

export async function isValidSession(token: string | undefined | null) {
  const key = secret();
  if (!key || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(exp, key));
}

export const adminConfigured = () => Boolean(process.env.ADMIN_PIN && secret());
