// Ready-made rituals to start from, so a new ritual needn't begin blank.
// Each one only fills in the form; the user can change anything before saving.

import type { RitualFormValues } from "./form";

export type RitualTemplate = {
  id: string;
  // A few words on what it's for, shown under the name.
  summary: string;
  values: RitualFormValues;
};

const WEEKDAYS_ONLY: RitualFormValues["days"] = [1, 2, 3, 4, 5];

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  {
    id: "newport-shutdown",
    summary: "Close every loop, then say it out loud",
    values: {
      title: "Cal Newport shutdown",
      description:
        "Check email and messages one last time for anything urgent. Capture every open task somewhere you trust. Look over tomorrow’s calendar and rough out a plan. Then say your shutdown phrase, and stop thinking about work.",
      moment: "end_of_day",
      days: WEEKDAYS_ONLY,
      integrations: ["gmail"],
    },
  },
  {
    id: "engineer-end-of-day",
    summary: "Leave the code easy to pick back up",
    values: {
      title: "Engineer’s end of day",
      description:
        "Push your work in progress to a branch. Leave a note on where you stopped and what’s next. Answer review requests, and move your tickets to where they really are.",
      moment: "end_of_day",
      days: WEEKDAYS_ONLY,
      integrations: ["github", "linear"],
    },
  },
  {
    id: "morning-plan",
    summary: "Decide what today is for",
    values: {
      title: "Plan the day",
      description:
        "Look over today’s calendar. Pick the one thing that matters most, and block time for it before anything else gets in.",
      moment: "start_of_day",
      days: WEEKDAYS_ONLY,
      integrations: [],
    },
  },
  {
    id: "weekly-review",
    summary: "Look back on Friday, set up next week",
    values: {
      title: "Weekly review",
      description:
        "Look back at what got done and what slipped. Empty your inboxes and lists. Choose the few things that matter next week.",
      moment: "end_of_day",
      days: [5],
      integrations: ["notion"],
    },
  },
];
