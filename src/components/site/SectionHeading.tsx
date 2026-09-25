import Link from "next/link";

export function SectionHeading({ title, intro, action, id }: { title: string; intro?: string; action?: { href: string; label: string }; id?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 id={id} className="text-3xl font-extrabold tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.1]">{title}</h2>
        {intro && <p className="mt-3 text-base leading-relaxed text-graphite md:text-lg">{intro}</p>}
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-bold text-accent underline-offset-4 hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
