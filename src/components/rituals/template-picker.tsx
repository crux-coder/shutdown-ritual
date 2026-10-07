"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { RITUAL_MOMENTS } from "@/lib/rituals/options";
import {
  RITUAL_TEMPLATES,
  TEMPLATE_AUDIENCES,
  type RitualTemplate,
  type TemplateAudience,
} from "@/lib/rituals/templates";

export function TemplatePicker({
  picked,
  onPick,
}: {
  picked: RitualTemplate | null;
  onPick: (template: RitualTemplate) => void;
}) {
  // Open on the picked template's audience, so it stays in view.
  const [audience, setAudience] = useState<TemplateAudience>(
    picked?.audience ?? "anyone",
  );
  const templates = RITUAL_TEMPLATES.filter((t) => t.audience === audience);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Who it’s for"
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]"
      >
        {TEMPLATE_AUDIENCES.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={audience === a.id}
            onClick={() => setAudience(a.id)}
            className="shrink-0 cursor-pointer rounded-full border border-base-300 px-3 py-1 text-xs transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-content"
          >
            {a.label}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300">
        {templates.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              aria-pressed={picked?.id === template.id}
              onClick={() => onPick(template)}
              className="group flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-base-200/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary aria-pressed:bg-primary/10"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {template.values.title}
                </span>
                <span className="text-xs text-base-content/60">
                  {template.summary}
                </span>
              </span>
              <span className="shrink-0 text-right text-xs text-base-content/40">
                {momentLabel(template)}
                <br />
                {template.values.steps.length} steps
              </span>
              <HugeiconsIcon
                aria-hidden
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="size-4 shrink-0 text-base-content/30 transition-colors group-hover:text-primary"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function momentLabel(template: RitualTemplate) {
  return RITUAL_MOMENTS.find((m) => m.id === template.values.moment)!.label;
}
