import type { Metadata } from "next";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { login } from "../actions/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  invalid: "Wrong PIN. Try again.",
  rate: "Too many wrong attempts. Wait 15 minutes and try again.",
  setup: "The admin PIN is not set up on the server yet (ADMIN_PIN and ADMIN_SESSION_SECRET).",
  database: "PIN accepted, but the database key is missing on the server (SUPABASE_SERVICE_ROLE_KEY).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-paper p-4">
      <div className="w-full max-w-xs text-center">
        <Image src="/vctlogo.webp" alt="Vijayawada Car Travels" width={900} height={265} className="mx-auto h-12 w-auto" priority />
        <div className="mx-auto mt-8 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <LockKeyhole className="size-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-graphite">Enter your PIN to continue.</p>

        {error && ERRORS[error] && (
          <p role="alert" className="mt-5 rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-semibold text-danger">{ERRORS[error]}</p>
        )}

        <form action={login} className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-lift">
          <label htmlFor="pin" className="sr-only">PIN</label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={12}
            required
            autoFocus
            placeholder="••••"
            className="field text-center text-2xl font-bold tracking-[0.6em] placeholder:tracking-[0.6em] placeholder:text-mist"
          />
          <button type="submit" className="btn btn-primary w-full">Unlock</button>
        </form>
      </div>
    </main>
  );
}
