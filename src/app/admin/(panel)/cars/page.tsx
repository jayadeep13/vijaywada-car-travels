import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { EmptyState, Flash, PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { rupees, startingPrice } from "@/lib/format";
import type { Car } from "@/lib/types";
import { moveCar, toggleCar } from "../../actions/cars";

export default async function AdminCars({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  const { msg, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("cars").select("*, car_pricing(*)").order("display_order").order("name");
  const cars = ((data ?? []) as Car[]).map((c) => ({ ...c, car_pricing: Array.isArray(c.car_pricing) ? c.car_pricing[0] : c.car_pricing }));

  return (
    <>
      <PageHeader title="Cars" description="Add cars, change prices and photos. Changes appear on the website within seconds." action={{ href: "/admin/cars/new", label: "Add car" }} />
      <Flash msg={msg} error={error} />
      {cars.length === 0 ? (
        <EmptyState>No cars yet. <Link href="/admin/cars/new" className="font-bold text-accent">Add your first car</Link>.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="num w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-graphite">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Car</th>
                <th className="px-4 py-3 font-semibold">Local from</th>
                <th className="px-4 py-3 font-semibold">Per km</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cars.map((c, i) => (
                <tr key={c.id} className={c.active ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <form action={moveCar}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="up" />
                        <button disabled={i === 0} className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-30" aria-label={`Move ${c.name} up`}><ArrowUp className="size-4" /></button>
                      </form>
                      <form action={moveCar}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="down" />
                        <button disabled={i === cars.length - 1} className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-30" aria-label={`Move ${c.name} down`}><ArrowDown className="size-4" /></button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt="" className="h-10 w-14 rounded-lg object-cover" />
                      ) : (
                        <span className="h-10 w-14 rounded-lg bg-paper" />
                      )}
                      <div>
                        <Link href={`/admin/cars/${c.id}`} className="font-bold hover:underline">{c.name}</Link>
                        <p className="text-xs text-graphite">{c.category}, {c.seating_capacity} seats</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{rupees(startingPrice(c.car_pricing))}</td>
                  <td className="px-4 py-3">{rupees(c.car_pricing?.out_per_km)}</td>
                  <td className="px-4 py-3">
                    <form action={toggleCar} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="active" /><input type="hidden" name="value" value={String(!c.active)} />
                      <StatusBadge active={c.active} />
                      <button className="text-xs font-bold text-accent hover:underline">{c.active ? "Deactivate" : "Activate"}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCar}>
                      <input type="hidden" name="id" value={c.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value={String(!c.featured)} />
                      <button className="text-xs font-bold hover:underline">{c.featured ? "Yes, on homepage" : "No"}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/cars/${c.id}`} className="font-bold text-accent hover:underline">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
