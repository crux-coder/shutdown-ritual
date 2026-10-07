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
import {
  Add01Icon,
  Cancel01Icon,
  DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useRef, useState } from "react";
import { MAX_STEP_LENGTH, MAX_STEPS } from "@/lib/rituals/options";

type Step = { id: string; text: string };

let nextId = 0;
function newStep(text = ""): Step {
  return { id: `step-${nextId++}`, text };
}

// A ritual's steps, as an editable list: Enter adds the next step, Backspace
// on an empty one removes it, and the handles reorder them. Each input is
// named `steps`, read in order by readRitualValues.
export function StepsField({ initial }: { initial: string[] }) {
  const dndId = useId();
  const [steps, setSteps] = useState(() => initial.map((s) => newStep(s)));
  const inputs = useRef(new Map<string, HTMLInputElement>());
  // The step to focus once it has rendered.
  const [focusId, setFocusId] = useState<string>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (focusId) inputs.current.get(focusId)?.focus();
  }, [focusId]);

  const full = steps.length >= MAX_STEPS;

  function add(after = steps.length - 1) {
    if (full) return;
    const step = newStep();
    setSteps((s) => [...s.slice(0, after + 1), step, ...s.slice(after + 1)]);
    setFocusId(step.id);
  }

  function remove(index: number) {
    setSteps((s) => s.filter((_, i) => i !== index));
    const previous = steps[index - 1] ?? steps[index + 1];
    setFocusId(previous?.id);
  }

  function edit(index: number, text: string) {
    setSteps((s) =>
      s.map((step, i) => (i === index ? { ...step, text } : step)),
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setSteps((s) =>
      arrayMove(
        s,
        s.findIndex((step) => step.id === active.id),
        s.findIndex((step) => step.id === over.id),
      ),
    );
  }

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        Steps
        <span className="font-normal text-base-content/50">(optional)</span>
      </legend>

      {steps.length > 0 && (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={steps} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-1.5">
              {steps.map((step, index) => (
                <StepRow
                  key={step.id}
                  step={step}
                  index={index}
                  inputRef={(el) => {
                    if (el) inputs.current.set(step.id, el);
                    else inputs.current.delete(step.id);
                  }}
                  onChange={(text) => edit(index, text)}
                  onEnter={() => add(index)}
                  onRemove={() => remove(index)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {!full && (
        <button
          type="button"
          onClick={() => add()}
          className="btn btn-ghost btn-sm mt-1 self-start text-base-content/70"
        >
          <HugeiconsIcon
            aria-hidden
            icon={Add01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Add a step
        </button>
      )}
      <p className="label">
        {steps.length === 0
          ? "Break it into a short checklist to tick off one at a time."
          : full
            ? `That’s the most a ritual can have: ${MAX_STEPS} steps.`
            : "Press Enter to add the next step."}
      </p>
    </fieldset>
  );
}

function StepRow({
  step,
  index,
  inputRef,
  onChange,
  onEnter,
  onRemove,
}: {
  step: Step;
  index: number;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (text: string) => void;
  onEnter: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });
  const label = `Step ${index + 1}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative flex items-center gap-1 rounded-field ${
        isDragging ? "z-10 bg-base-100 shadow-lg shadow-base-content/10" : ""
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Reorder ${label.toLowerCase()}`}
        className="btn btn-ghost btn-xs h-8 shrink-0 cursor-grab touch-none px-0.5 text-base-content/30 hover:text-base-content/60 active:cursor-grabbing"
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
      <input
        ref={inputRef}
        type="text"
        name="steps"
        aria-label={label}
        placeholder={index === 0 ? "e.g. Check email one last time" : label}
        value={step.text}
        maxLength={MAX_STEP_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Enter adds a step instead of submitting the form.
            e.preventDefault();
            onEnter();
          } else if (e.key === "Backspace" && step.text === "") {
            e.preventDefault();
            onRemove();
          }
        }}
        className="input input-sm w-full"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label.toLowerCase()}`}
        className="btn btn-ghost btn-sm btn-square shrink-0 text-base-content/40 hover:text-base-content/70"
      >
        <HugeiconsIcon
          aria-hidden
          icon={Cancel01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </button>
    </li>
  );
}
