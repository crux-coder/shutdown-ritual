"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useOptimistic, useTransition } from "react";
import { IntegrationIcon } from "@/components/integration-icon";
import { reorderRituals } from "@/lib/rituals/actions";
import {
  RITUAL_INTEGRATIONS,
  formatDays,
  type Ritual,
} from "@/lib/rituals/options";
import { EditRitualButton } from "./ritual-dialog";

// The user's rituals, reorderable by dragging the handle (or with the
// keyboard: focus the handle, Space to lift, arrows to move, Space to drop).
export function SortableRituals({ rituals }: { rituals: Ritual[] }) {
  const id = useId();
  const [items, setItems] = useOptimistic(rituals);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((r) => r.id === active.id);
    const to = items.findIndex((r) => r.id === over.id);
    const next = arrayMove(items, from, to);

    // Show the new order right away; the action refreshes the page with it.
    startTransition(async () => {
      setItems(next);
      await reorderRituals(next.map((r) => r.id));
    });
  }

  return (
    <DndContext
      // A stable id keeps dnd-kit's generated aria ids the same on server
      // and client.
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((ritual) => (
            <RitualCard key={ritual.id} ritual={ritual} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function RitualCard({ ritual }: { ritual: Ritual }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ritual.id });
  const integrations = RITUAL_INTEGRATIONS.filter((i) =>
    ritual.integrations.includes(i.id),
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative flex gap-2 rounded-box border border-base-300 bg-base-200/40 py-4 pr-4 pl-2 ${
        isDragging ? "z-10 bg-base-100 shadow-lg shadow-base-content/10" : ""
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Reorder ${ritual.title}`}
        className="btn btn-ghost btn-xs h-6 shrink-0 cursor-grab touch-none px-0.5 text-base-content/30 hover:text-base-content/60 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <HugeiconsIcon
          aria-hidden
          icon={DragDropVerticalIcon}
          strokeWidth={2}
          className="size-4"
        />
      </button>
      <div className="min-w-0 flex-1">
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
        {ritual.steps.length > 0 && (
          <ol className="mt-2 flex list-inside list-decimal flex-col gap-0.5 text-sm text-base-content/60 marker:text-base-content/30">
            {ritual.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
        {integrations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {integrations.map((i) => (
              <span key={i.id} className="badge badge-sm badge-outline gap-1">
                <IntegrationIcon integration={i.id} className="size-3" />
                {i.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
