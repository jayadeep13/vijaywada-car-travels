"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Goes back to the previous page on this site, or to `fallback` when the visitor landed here directly. */
export function BackButton({ fallback = "/", className = "" }: { fallback?: string; className?: string }) {
  const router = useRouter();

  function goBack() {
    let cameFromSite = false;
    try {
      // The Navigation API only lists this site's history entries, so index > 0 means an earlier page here.
      // document.referrer is the fallback (it only reflects full page loads, not client-side navigation).
      const nav = (window as Window & { navigation?: { currentEntry?: { index: number } } }).navigation;
      cameFromSite = nav?.currentEntry
        ? nav.currentEntry.index > 0
        : Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {}
    if (cameFromSite && window.history.length > 1) router.back();
    else router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`group inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-2 pr-4 pl-3 text-sm font-bold text-ink transition-colors hover:border-ink ${className}`}
    >
      <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
      Back
    </button>
  );
}
