import { Plus } from "lucide-react";
import type { Faq } from "@/lib/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  if (!faqs?.length) return null;
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f, i) => (
        <details key={i} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-bold [&::-webkit-details-marker]:hidden">
            {f.q}
            <Plus className="size-5 shrink-0 text-graphite transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <p className="max-w-2xl pb-5 leading-relaxed text-graphite">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
