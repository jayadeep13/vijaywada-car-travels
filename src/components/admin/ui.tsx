import Link from "next/link";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-graphite">{description}</p>}
      </div>
      {action && <Link href={action.href} className="btn btn-primary !min-h-10 !text-sm">{action.label}</Link>}
    </div>
  );
}

export function Flash({ msg, error }: { msg?: string; error?: string }) {
  if (error) return <p role="alert" className="mb-5 rounded-xl bg-[#fdecea] px-4 py-3 text-sm font-semibold text-danger">{error}</p>;
  if (msg) return <p role="status" className="mb-5 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">{msg}</p>;
  return null;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>;
}

type FieldProps = {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
  step?: string;
  min?: number;
  max?: number;
};

export function Field({ name, label, defaultValue, type = "text", required, placeholder, hint, className = "", step, min, max }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} step={step} min={min} max={max} className="field" />
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}

export function TextArea({ name, label, defaultValue, rows = 4, hint, className = "", required }: { name: string; label: string; defaultValue?: string | null; rows?: number; hint?: string; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}{required && <span className="text-danger"> *</span>}</label>
      <textarea id={name} name={name} rows={rows} required={required} defaultValue={defaultValue ?? ""} className="field" />
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-6 w-11 rounded-full bg-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

export function Select({ name, label, defaultValue, options, className = "" }: { name: string; label: string; defaultValue?: string | null; options: { value: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue ?? options[0]?.value} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function ImageInput({ name, label, current, hint }: { name: string; label: string; current?: string | null; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <div className="flex items-center gap-4">
        {current && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="size-16 shrink-0 rounded-xl border border-line object-cover" />
        )}
        <input id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-4 file:py-2 file:font-semibold" />
      </div>
      <p className="mt-1 text-xs text-mist">{hint ?? "JPG, PNG, WebP or AVIF, up to 5 MB."}</p>
    </div>
  );
}

export function StatusBadge({ active, on = "Active", off = "Inactive" }: { active: boolean; on?: string; off?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${active ? "bg-accent-soft text-accent-strong" : "bg-paper text-graphite"}`}>
      {active ? on : off}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-graphite">{children}</div>;
}
