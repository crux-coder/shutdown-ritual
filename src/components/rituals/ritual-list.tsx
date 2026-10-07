import { getRituals } from "@/lib/rituals/queries";
import { RITUAL_MOMENTS } from "@/lib/rituals/options";
import { SortableRituals } from "./sortable-rituals";

export async function RitualList() {
  const rituals = await getRituals();

  if (rituals.length === 0) {
    return (
      <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
        <p className="font-serif text-lg">No rituals yet</p>
        <p className="mt-1 text-sm text-base-content/60">
          Start with one small routine — a Friday wrap-up or a Monday plan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {RITUAL_MOMENTS.map((moment) => {
        const group = rituals.filter((r) => r.moment === moment.id);
        if (group.length === 0) return null;
        return (
          <section key={moment.id}>
            <h3 className="mb-3 text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
              {moment.label}
            </h3>
            <SortableRituals rituals={group} />
          </section>
        );
      })}
    </div>
  );
}

export function RitualListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton h-20 w-full" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
