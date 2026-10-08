// Parsing and validation for ritual forms, shared by the ritual actions and
// the first-ritual onboarding step.

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_STEP_LENGTH,
  MAX_STEPS,
  MAX_TITLE_LENGTH,
  RITUAL_INTEGRATIONS,
  WEEKDAYS,
  type Ritual,
  type RitualIntegration,
  type Weekday,
} from "./options";

export type RitualFormValues = {
  title: string;
  description: string;
  steps: string[];
  days: Weekday[];
  integrations: RitualIntegration[];
};

export const DEFAULT_RITUAL_VALUES: RitualFormValues = {
  title: "",
  description: "",
  steps: [],
  days: [1, 2, 3, 4, 5],
  integrations: [],
};

export function toFormValues(ritual?: Ritual): RitualFormValues {
  if (!ritual) return DEFAULT_RITUAL_VALUES;
  return {
    title: ritual.title,
    description: ritual.description ?? "",
    steps: ritual.steps,
    days: ritual.days,
    integrations: ritual.integrations,
  };
}

const INTEGRATION_IDS = new Set<string>(RITUAL_INTEGRATIONS.map((i) => i.id));
const WEEKDAY_IDS = new Set<number>(WEEKDAYS.map((d) => d.id));

export function readRitualValues(formData: FormData): RitualFormValues {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    // Blank steps are left out rather than refused.
    steps: formData
      .getAll("steps")
      .map((s) => String(s).trim())
      .filter(Boolean),
    days: [...new Set(formData.getAll("days").map(Number))]
      .filter((d) => WEEKDAY_IDS.has(d))
      .sort((a, b) => a - b) as Weekday[],
    integrations: formData
      .getAll("integrations")
      .map(String)
      .filter((i) => INTEGRATION_IDS.has(i)) as RitualIntegration[],
  };
}

export function validateRitual(values: RitualFormValues): string | undefined {
  if (!values.title) return "Give your ritual a name.";
  if (values.title.length > MAX_TITLE_LENGTH)
    return `Names can be up to ${MAX_TITLE_LENGTH} characters.`;
  if (values.description.length > MAX_DESCRIPTION_LENGTH)
    return `Descriptions can be up to ${MAX_DESCRIPTION_LENGTH} characters.`;
  if (values.steps.length > MAX_STEPS)
    return `A ritual can have up to ${MAX_STEPS} steps.`;
  if (values.steps.some((s) => s.length > MAX_STEP_LENGTH))
    return `Steps can be up to ${MAX_STEP_LENGTH} characters.`;
  if (values.days.length === 0) return "Pick at least one day.";
}

export function toRitualRow(values: RitualFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    steps: values.steps,
    days: values.days,
    integrations: values.integrations,
  };
}
