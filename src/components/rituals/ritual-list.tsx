import { getRituals } from "@/lib/rituals/queries";
import { SortableRituals } from "./sortable-rituals";

export async function RitualList() {
  const rituals = await getRituals();

  if (rituals.length === 0) {
    return (
      <div className="rounded-box border border-dashed border-base-300 px-6 py-10 text-center">
        <p className="font-serif text-lg">No rituals yet</p>
        <p className="mt-1 text-sm text-base-content/60">
          Start with one small routine — a daily shutdown or a Friday wrap-up.
        </p>
      </div>
    );
  }

  return <SortableRituals rituals={rituals} />;
}

export function RitualListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton h-20 w-full" />
      <div className="skeleton h-20 w-full" />
    </div>
  );
}
