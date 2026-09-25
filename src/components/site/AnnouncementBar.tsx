"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Announcement } from "@/lib/types";

const KEY = "vct-announcement-dismissed";

export function AnnouncementBar({ announcement }: { announcement: Announcement | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    try {
      setVisible(sessionStorage.getItem(KEY) !== announcement.id);
    } catch {
      setVisible(true);
    }
  }, [announcement]);

  if (!announcement || !visible) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, announcement.id);
    } catch {}
    setVisible(false);
  };

  const external = announcement.cta_url?.startsWith("http");

  return (
    <div role="region" aria-label="Announcement" className="bg-accent text-white">
      <div className="container-x flex min-h-10 items-center gap-3 py-2 text-sm">
        <p className="flex-1 text-center font-semibold">
          {announcement.title}
          {announcement.description && <span className="font-normal text-white/80"> {announcement.description}</span>}
          {announcement.cta_url && announcement.cta_text && (
            external ? (
              <a href={announcement.cta_url} className="ml-2 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                {announcement.cta_text}
              </a>
            ) : (
              <Link href={announcement.cta_url} className="ml-2 underline underline-offset-4">{announcement.cta_text}</Link>
            )
          )}
        </p>
        <button type="button" onClick={dismiss} aria-label="Dismiss announcement" className="grid size-8 place-items-center rounded-full hover:bg-white/10">
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
