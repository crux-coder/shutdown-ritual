// Parsing and validation for ritual forms, shared by the ritual actions and
// the first-ritual onboarding step.

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  RITUAL_INTEGRATIONS,
  RITUAL_MOMENTS,
  WEEKDAYS,
  type Ritual,
  type RitualIntegration,
  type RitualMoment,
  type Weekday,
} from "./options";

export type RitualFormValues = {
  title: string;
  description: string;
  moment: RitualMoment;
  days: Weekday[];
  integrations: RitualIntegration[];
};

export const DEFAULT_RITUAL_VALUES: RitualFormValues = {
  title: "",
  description: "",
  moment: "end_of_day",
  days: [1, 2, 3, 4, 5],
  integrations: [],
};

export function toFormValues(ritual?: Ritual): RitualFormValues {
  if (!ritual) return DEFAULT_RITUAL_VALUES;
  return {
    title: ritual.title,
    description: ritual.description ?? "",
    moment: ritual.moment,
    days: ritual.days,
    integrations: ritual.integrations,
  };
}

const MOMENT_IDS = new Set<string>(RITUAL_MOMENTS.map((m) => m.id));
const INTEGRATION_IDS = new Set<string>(RITUAL_INTEGRATIONS.map((i) => i.id));
const WEEKDAY_IDS = new Set<number>(WEEKDAYS.map((d) => d.id));

export function readRitualValues(formData: FormData): RitualFormValues {
  const moment = String(formData.get("moment") ?? "");
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    moment: (MOMENT_IDS.has(moment) ? moment : "end_of_day") as RitualMoment,
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
  if (values.days.length === 0) return "Pick at least one day.";
}

export function toRitualRow(values: RitualFormValues) {
  return {
    title: values.title,
    description: values.description || null,
    moment: values.moment,
    days: values.days,
    integrations: values.integrations,
  };
}
