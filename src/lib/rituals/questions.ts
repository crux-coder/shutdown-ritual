// The three questions onboarding asks before suggesting rituals. Shared by the
// question screens and the server action that turns the answers into rituals.

export const SUGGESTION_QUESTIONS = [
  {
    id: "work",
    question: "What do you do?",
    examples: ["Engineer", "Designer", "Manager", "Writer", "Student"],
  },
  {
    id: "struggle",
    question: "What makes it hard to switch off?",
    examples: [
      "Work stays on my mind",
      "Loose ends",
      "Working late",
      "No plan for tomorrow",
    ],
  },
  {
    id: "feeling",
    question: "How do you want to feel when you log off?",
    examples: ["Calm", "Clear-headed", "Ready for tomorrow", "Fully off work"],
  },
] as const;

export type SuggestionQuestionId = (typeof SUGGESTION_QUESTIONS)[number]["id"];

export type SuggestionAnswers = Record<SuggestionQuestionId, string>;

export const MAX_ANSWER_LENGTH = 300;

// Tapping an example adds it to the answer, or takes it back out, so several
// can be combined with words of the user's own.
export function toggleExample(answer: string, example: string): string {
  const parts = answer
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const next = parts.includes(example)
    ? parts.filter((p) => p !== example)
    : [...parts, example];
  return next.join(", ");
}

export function hasExample(answer: string, example: string): boolean {
  return answer
    .split(",")
    .map((p) => p.trim())
    .includes(example);
}
