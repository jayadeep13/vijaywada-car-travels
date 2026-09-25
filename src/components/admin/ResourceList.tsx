import Link from "next/link";
import { EmptyState, StatusBadge } from "./ui";
import { SubmitButton } from "./SubmitButton";

type Item = { id: string; title: string; subtitle?: string | null; active: boolean; image?: string | null };
type Action = (fd: FormData) => Promise<void>;

export function ResourceList({
  items,
  basePath,
  onToggle,
  onDelete,
  onLabel = "Active",
  offLabel = "Inactive",
  empty,
}: {
  items: Item[];
  basePath: string;
  onToggle: Action;
  onDelete: Action;
  onLabel?: string;
  offLabel?: string;
  empty: string;
}) {
  if (!items.length) return <EmptyState>{empty}</EmptyState>;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((it) => (
        <li key={it.id} className="flex flex-wrap items-center gap-4 p-4">
          {it.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`${basePath}?edit=${it.id}`} className="font-bold hover:underline">{it.title}</Link>
              <StatusBadge active={it.active} on={onLabel} off={offLabel} />
            </div>
            {it.subtitle && <p className="mt-0.5 truncate text-sm text-graphite">{it.subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <form action={onToggle}>
              <input type="hidden" name="id" value={it.id} />
              <input type="hidden" name="value" value={String(!it.active)} />
              <SubmitButton variant="ghost" pendingText="…">{it.active ? `Turn off` : `Turn on`}</SubmitButton>
            </form>
            <Link href={`${basePath}?edit=${it.id}`} className="btn btn-ghost !min-h-10 !text-sm">Edit</Link>
            <form action={onDelete}>
              <input type="hidden" name="id" value={it.id} />
              <SubmitButton variant="danger" pendingText="…" confirm={`Delete "${it.title}"?`}>Delete</SubmitButton>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FormCard({ title, children, action, id, cancelHref }: { title: string; children: React.ReactNode; action: Action; id?: string; cancelHref: string }) {
  return (
    <form action={action} className="mb-8 rounded-2xl border border-ink/15 bg-surface shadow-lift">
      <h2 className="border-b border-line px-5 py-4 font-extrabold">{title}</h2>
      {id && <input type="hidden" name="id" value={id} />}
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
      <div className="flex gap-3 border-t border-line px-5 py-4">
        <SubmitButton>Save</SubmitButton>
        <Link href={cancelHref} className="btn btn-ghost !min-h-10 !text-sm">Cancel</Link>
      </div>
    </form>
  );
}
