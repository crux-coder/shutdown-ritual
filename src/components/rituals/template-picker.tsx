"use client";

import { useState } from "react";
import type { RitualFormValues } from "@/lib/rituals/form";
import { RITUAL_TEMPLATES, type RitualTemplate } from "@/lib/rituals/templates";

// What a new-ritual form should show, given an optional template pick: the
// picked template from the pick until the next submit, then what was
// submitted (so an error keeps the user's edits), else `fallback`.
export function useRitualTemplate(
  submitted: RitualFormValues | undefined,
  fallback: RitualFormValues,
) {
  // The template last picked, highlighted until another is.
  const [picked, setPicked] = useState<RitualTemplate | null>(null);
  const [fresh, setFresh] = useState(false);

  return {
    picked,
    values: (fresh && picked?.values) || submitted || fallback,
    // RitualFields read their values once, so a new pick remounts them.
    fieldsKey: fresh ? picked?.id : "submitted",
    pick(template: RitualTemplate) {
      setPicked(template);
      setFresh(true);
    },
    // For the form's onSubmit.
    submitted() {
      setFresh(false);
    },
  };
}

export function TemplatePicker({
  picked,
  onPick,
}: {
  picked: RitualTemplate | null;
  onPick: (template: RitualTemplate) => void;
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Start from a template</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {RITUAL_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            aria-pressed={picked?.id === template.id}
            onClick={() => onPick(template)}
            className="flex cursor-pointer flex-col gap-0.5 rounded-box border border-base-300 p-3 text-left transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary/10"
          >
            <span className="text-sm font-medium">{template.values.title}</span>
            <span className="text-xs text-base-content/60">
              {template.summary}
            </span>
          </button>
        ))}
      </div>
      <p className="label">Or write your own below.</p>
    </fieldset>
  );
}
