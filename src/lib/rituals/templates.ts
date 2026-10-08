// Ready-made rituals to start from, so a new ritual needn't begin blank.
// Each one only fills in the form; the user can change anything before saving.

import type { RitualFormValues } from "./form";

// Who a template is for, in the order the picker offers them.
export const TEMPLATE_AUDIENCES = [
  { id: "anyone", label: "Anyone" },
  { id: "engineers", label: "Engineers" },
  { id: "designers", label: "Designers" },
  { id: "managers", label: "Managers" },
  { id: "writers", label: "Writers" },
  { id: "freelancers", label: "Freelancers" },
  { id: "students", label: "Students" },
] as const;

export type TemplateAudience = (typeof TEMPLATE_AUDIENCES)[number]["id"];

export type RitualTemplate = {
  id: string;
  audience: TemplateAudience;
  // A few words on what it's for, shown under the name.
  summary: string;
  values: RitualFormValues;
};

const WEEKDAYS_ONLY: RitualFormValues["days"] = [1, 2, 3, 4, 5];

// Templates lead with their steps, so they start without a description.
function template(
  id: string,
  audience: TemplateAudience,
  summary: string,
  values: Omit<RitualFormValues, "description" | "days" | "integrations"> &
    Partial<Pick<RitualFormValues, "days" | "integrations">>,
): RitualTemplate {
  return {
    id,
    audience,
    summary,
    values: {
      description: "",
      days: WEEKDAYS_ONLY,
      integrations: [],
      ...values,
    },
  };
}

// The ritual every new user starts with, so they can feel a shutdown before
// designing their own. Also inserted by the
// *_default_ritual_and_first_day_cards.sql migration; keep them in sync.
export const DEFAULT_RITUAL: RitualFormValues = {
  title: "Shutdown for the day",
  description: "",
  steps: [
    "Check for anything truly urgent; park the rest",
    "Capture every open task somewhere you trust",
    "Look over tomorrow’s calendar",
  ],
  days: WEEKDAYS_ONLY,
  integrations: [],
};

export const RITUAL_TEMPLATES: RitualTemplate[] = [
  // Anyone
  template(
    "newport-shutdown",
    "anyone",
    "Close every loop, then say it out loud",
    {
      title: "Cal Newport shutdown",
      integrations: ["gmail", "todoist", "google_calendar"],
      steps: [
        "Check email and messages for anything truly urgent",
        "Capture every open task somewhere you trust",
        "Look over tomorrow’s calendar and rough out a plan",
      ],
    },
  ),
  template("leave-the-desk", "anyone", "A clear line between work and home", {
    title: "Leave the desk",
    steps: [
      "Close every app and tab you won’t need tomorrow",
      "Clear your desk",
      "Turn off work notifications on your phone",
      "Step outside, or change clothes, to mark the end",
    ],
  }),
  template("weekly-review", "anyone", "Look back on Friday, set up next week", {
    title: "Weekly review",
    days: [5],
    integrations: ["todoist", "google_calendar"],
    steps: [
      "Look back at what got done and what slipped",
      "Skim your inboxes; park anything that can wait",
      "Choose the few things that matter next week",
    ],
  }),

  // Engineers
  template(
    "engineer-end-of-day",
    "engineers",
    "Leave the code easy to pick back up",
    {
      title: "Engineer’s end of day",
      integrations: ["github"],
      steps: [
        "Push your work in progress to a branch",
        "Leave a note on where you stopped and what’s next",
        "Capture pending reviews for tomorrow",
        "Move your tickets to where they really are",
      ],
    },
  ),

  // Designers
  template(
    "design-wrap-up",
    "designers",
    "Keep the work and the feedback findable",
    {
      title: "Design wrap-up",
      integrations: ["todoist"],
      steps: [
        "Name and tidy today’s files and frames",
        "Share work in progress where the team can see it",
        "Write down feedback to act on and questions to ask",
        "Note where to start tomorrow",
      ],
    },
  ),

  // Managers
  template("managers-close", "managers", "Nobody waits on you overnight", {
    title: "Manager’s close",
    integrations: ["gmail", "google_calendar"],
    steps: [
      "Check for urgent blockers; park the rest",
      "Make sure today’s decisions are written down and shared",
      "Note anything to raise in upcoming one-on-ones",
      "Look over tomorrow’s meetings and what each one needs",
    ],
  }),

  // Writers
  template(
    "writing-wrap-up",
    "writers",
    "Stop where tomorrow is easy to start",
    {
      title: "Writing wrap-up",
      steps: [
        "Stop mid-sentence, or mid-thought",
        "Note today’s progress",
        "Write a line on what the next section needs",
        "Back up today’s work",
      ],
    },
  ),

  // Freelancers
  template(
    "freelancer-close",
    "freelancers",
    "Hours logged, clients up to date",
    {
      title: "Freelancer’s close",
      integrations: ["gmail", "todoist"],
      steps: [
        "Log today’s hours against each client",
        "Send only the updates you promised for today",
        "Note anything to invoice",
        "Plan tomorrow around the nearest deadlines",
      ],
    },
  ),
  template("weekly-admin", "freelancers", "Get paid, keep work coming in", {
    title: "Weekly admin",
    days: [5],
    integrations: ["gmail"],
    steps: [
      "Send invoices for finished work",
      "Follow up on anything unpaid",
      "Update your list of leads and proposals",
      "Back up client files",
    ],
  }),

  // Students
  template("study-wrap-up", "students", "Make today’s learning stick", {
    title: "Study wrap-up",
    integrations: ["todoist"],
    steps: [
      "Spend five minutes recalling what you learned today",
      "Write down questions to ask",
      "Check what’s due this week",
      "Pack your bag for tomorrow",
    ],
  }),
];
