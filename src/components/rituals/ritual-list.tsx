import { getRituals } from "@/lib/rituals/queries";
import { EditRitualButton } from "./ritual-dialog";
import {
  RITUAL_INTEGRATIONS,
  RITUAL_MOMENTS,
  formatDays,
  type Ritual,
} from "@/lib/rituals/options";

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
            <ul className="flex flex-col gap-2">
              {group.map((ritual) => (
                <RitualCard key={ritual.id} ritual={ritual} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function RitualCard({ ritual }: { ritual: Ritual }) {
  const integrations = RITUAL_INTEGRATIONS.filter((i) =>
    ritual.integrations.includes(i.id),
  );

  return (
    <li className="rounded-box border border-base-300 bg-base-200/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-medium">{ritual.title}</p>
        <div className="flex shrink-0 items-start gap-2">
          <span className="text-xs text-base-content/60">
            {formatDays(ritual.days)}
          </span>
          <EditRitualButton ritual={ritual} />
        </div>
      </div>
      {ritual.description && (
        <p className="mt-1 text-sm text-base-content/60">
          {ritual.description}
        </p>
      )}
      {integrations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {integrations.map((i) => (
            <span key={i.id} className="badge badge-sm badge-outline">
              {i.label}
            </span>
          ))}
        </div>
      )}
    </li>
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
