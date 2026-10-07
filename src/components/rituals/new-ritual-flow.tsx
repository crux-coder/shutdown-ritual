"use client";

import {
  ArrowRight01Icon,
  GridViewIcon,
  PencilEdit02Icon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useState, useTransition } from "react";
import { getRitualSuggestions } from "@/lib/rituals/actions";
import {
  DEFAULT_RITUAL_VALUES,
  type RitualFormValues,
} from "@/lib/rituals/form";
import {
  MAX_ANSWER_LENGTH,
  SUGGESTION_QUESTIONS,
  hasExample,
  toggleExample,
  type SuggestionAnswers,
} from "@/lib/rituals/questions";
import type { RitualSuggestion } from "@/lib/rituals/suggest";
import type { RitualTemplate } from "@/lib/rituals/templates";
import { HiddenRitualFields, RitualFields } from "./ritual-fields";
import { TemplatePicker } from "./template-picker";

// Making a new ritual, one screen at a time: choose how to start, then either
// answer three questions and save one of the AI's suggestions as it is, or
// pick a template (or a blank form) and edit it in the ritual form. Shared by onboarding and the Rituals
// page, which each wrap it in their own form and buttons.

type Stage =
  | { kind: "choose" }
  | { kind: "question"; index: number }
  | { kind: "suggestions" }
  | { kind: "templates" }
  | { kind: "form"; from: "templates" | "choose" };

// What the form starts from: a suggestion, a template, or a blank form.
type StartingPoint = { key: string; values: RitualFormValues };

const BLANK: StartingPoint = { key: "blank", values: DEFAULT_RITUAL_VALUES };
const LAST_QUESTION = SUGGESTION_QUESTIONS.length - 1;

export type NewRitualFlow = ReturnType<typeof useNewRitualFlow>;

// `startWith: "questions"` skips the choice and opens on the first AI
// question; Back still leads to the choice.
export function useNewRitualFlow({
  startWith = "choice",
}: { startWith?: "choice" | "questions" } = {}) {
  const [stage, setStage] = useState<Stage>(
    startWith === "questions"
      ? { kind: "question", index: 0 }
      : { kind: "choose" },
  );
  const [answers, setAnswers] = useState<SuggestionAnswers>({
    work: "",
    struggle: "",
    feeling: "",
  });
  const [suggestions, setSuggestions] = useState<RitualSuggestion[]>([]);
  // The suggestion chosen, saved by "Use this ritual".
  const [selected, setSelected] = useState<number | null>(null);
  const [suggestError, setSuggestError] = useState(false);
  const [suggesting, startSuggesting] = useTransition();
  const [picked, setPicked] = useState<StartingPoint>(BLANK);
  const [pickedTemplate, setPickedTemplate] = useState<RitualTemplate | null>(
    null,
  );
  // Fresh until the next submit; after that, an error keeps what was sent.
  const [fresh, setFresh] = useState(true);

  const question =
    stage.kind === "question" ? SUGGESTION_QUESTIONS[stage.index] : null;

  function suggest() {
    setStage({ kind: "suggestions" });
    setSuggestError(false);
    setSelected(null);
    startSuggesting(async () => {
      const result = await getRitualSuggestions(answers);
      setSuggestions("suggestions" in result ? result.suggestions : []);
      setSuggestError("error" in result);
    });
  }

  function edit(point: StartingPoint, from: "templates" | "choose") {
    setPicked(point);
    setFresh(true);
    setStage({ kind: "form", from });
  }

  return {
    stage,
    question,
    answers,
    suggestions,
    suggestError,
    suggesting,
    picked,
    pickedTemplate,
    fresh,
    isLastQuestion: stage.kind === "question" && stage.index === LAST_QUESTION,
    answered: question ? answers[question.id].trim() !== "" : false,
    setAnswer(answer: string) {
      if (question) setAnswers((a) => ({ ...a, [question.id]: answer }));
    },
    startQuestions() {
      setStage({ kind: "question", index: 0 });
    },
    browseTemplates() {
      setStage({ kind: "templates" });
    },
    startBlank() {
      edit(BLANK, "choose");
    },
    selected,
    select(index: number) {
      setSelected(index);
    },
    // Whether suggestions are on their way; the footer holds the place of
    // "Use this ritual" meanwhile.
    loadingSuggestions: stage.kind === "suggestions" && suggesting,
    // Whether the footer should offer "Use this ritual", which saves the
    // selected suggestion as it is.
    choosingSuggestion:
      stage.kind === "suggestions" && !suggesting && suggestions.length > 0,
    pickTemplate(template: RitualTemplate) {
      setPickedTemplate(template);
      edit({ key: template.id, values: template.values }, "templates");
    },
    suggest,
    next() {
      if (stage.kind !== "question" || !question) return;
      if (!answers[question.id].trim()) return;
      if (stage.index === LAST_QUESTION) suggest();
      else setStage({ kind: "question", index: stage.index + 1 });
    },
    // One screen back within the flow; does nothing on the first screen.
    back() {
      if (stage.kind === "question")
        setStage(
          stage.index === 0
            ? { kind: "choose" }
            : { kind: "question", index: stage.index - 1 },
        );
      else if (stage.kind === "suggestions")
        setStage({ kind: "question", index: LAST_QUESTION });
      else if (stage.kind === "templates") setStage({ kind: "choose" });
      else if (stage.kind === "form") setStage({ kind: stage.from });
    },
    // For the form's onSubmit.
    submitted() {
      setFresh(false);
    },
  };
}

// The current screen of the flow. Render it inside the form that saves the
// ritual; `submitted` is what that form last sent, if saving failed.
export function NewRitualScreen({
  flow,
  suggestionsEnabled,
  submitted,
}: {
  flow: NewRitualFlow;
  // Whether OpenAI is set up; without it, AI isn't offered.
  suggestionsEnabled: boolean;
  submitted?: RitualFormValues;
}) {
  const { stage, question } = flow;

  if (stage.kind === "choose") {
    return (
      <div className="flex flex-col gap-3 motion-safe:animate-rise">
        {suggestionsEnabled && (
          <Choice
            icon={SparklesIcon}
            title="Tailor one for me"
            hint="Three quick questions"
            onClick={flow.startQuestions}
          />
        )}
        <Choice
          icon={GridViewIcon}
          title="Use a template"
          hint="Ready-made for different kinds of work"
          onClick={flow.browseTemplates}
        />
        <Choice
          icon={PencilEdit02Icon}
          title="Start blank"
          hint="Write your own"
          onClick={flow.startBlank}
        />
      </div>
    );
  }

  if (question) {
    return (
      <QuestionScreen
        key={question.id}
        question={question}
        answer={flow.answers[question.id]}
        onChange={flow.setAnswer}
        onSubmit={flow.next}
      />
    );
  }

  if (stage.kind === "suggestions") {
    if (flow.suggesting) return <SuggestionsLoading />;
    if (flow.suggestError || flow.suggestions.length === 0) {
      return (
        <p
          role="alert"
          className="py-8 text-center text-base-content/60 motion-safe:animate-rise"
        >
          Couldn’t come up with anything just now.{" "}
          <button type="button" onClick={flow.suggest} className="link">
            Try again
          </button>
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <div
          role="radiogroup"
          aria-label="Suggested rituals"
          className="flex flex-col gap-3"
        >
          {flow.suggestions.map((suggestion, index) => (
            <SuggestionCard
              key={index}
              suggestion={suggestion}
              selected={flow.selected === index}
              delayMs={index * 90}
              onSelect={() => flow.select(index)}
            />
          ))}
        </div>
        {flow.selected !== null && flow.suggestions[flow.selected] && (
          <HiddenRitualFields values={flow.suggestions[flow.selected].values} />
        )}
        <button
          type="button"
          onClick={flow.suggest}
          className="btn btn-outline btn-sm mt-1 self-center border-base-300 font-normal text-base-content/70 hover:border-primary/50 hover:bg-base-200/60 hover:text-base-content"
        >
          <HugeiconsIcon
            aria-hidden
            icon={SparklesIcon}
            strokeWidth={2}
            className="size-4 text-primary"
          />
          Suggest others
        </button>
      </div>
    );
  }

  if (stage.kind === "templates") {
    return (
      <TemplatePicker picked={flow.pickedTemplate} onPick={flow.pickTemplate} />
    );
  }

  return (
    <RitualFields
      key={flow.fresh ? flow.picked.key : "submitted"}
      values={flow.fresh || !submitted ? flow.picked.values : submitted}
    />
  );
}

function Choice({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: IconSvgElement;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-box border border-base-300 bg-base-200/40 px-5 py-4 text-left transition-colors hover:border-primary/50 hover:bg-base-200/70 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <HugeiconsIcon
        aria-hidden
        icon={icon}
        strokeWidth={1.75}
        className="size-5 shrink-0 text-primary"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-base-content/50">{hint}</span>
      </span>
      <HugeiconsIcon
        aria-hidden
        icon={ArrowRight01Icon}
        strokeWidth={2}
        className="size-4 shrink-0 text-base-content/30 transition-colors group-hover:text-primary"
      />
    </button>
  );
}

function QuestionScreen({
  question,
  answer,
  onChange,
  onSubmit,
}: {
  question: (typeof SUGGESTION_QUESTIONS)[number];
  answer: string;
  onChange: (answer: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 motion-safe:animate-rise">
      <label className="flex flex-col gap-4">
        <span className="text-center font-serif text-2xl font-light tracking-tight">
          {question.question}
        </span>
        <input
          type="text"
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="In a few words"
          maxLength={MAX_ANSWER_LENGTH}
          autoFocus
          className="h-14 w-full rounded-field border border-base-300 bg-base-100/70 px-4 text-lg transition-colors duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </label>
      <div
        role="group"
        aria-label="Examples"
        className="flex flex-wrap justify-center gap-1.5"
      >
        {question.examples.map((example) => (
          <button
            key={example}
            type="button"
            aria-pressed={hasExample(answer, example)}
            onClick={() => onChange(toggleExample(answer, example))}
            className="cursor-pointer rounded-full border border-base-300 px-3 py-1 text-sm text-base-content/60 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-base-content"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

function SuggestionsLoading() {
  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">Writing your rituals…</span>
      <div className="skeleton h-28 w-full" />
      <div className="skeleton h-28 w-full" />
      <div className="skeleton h-28 w-full" />
    </div>
  );
}

function SuggestionCard({
  suggestion,
  selected,
  delayMs,
  onSelect,
}: {
  suggestion: RitualSuggestion;
  selected: boolean;
  delayMs: number;
  onSelect: () => void;
}) {
  const { title, steps } = suggestion.values;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      style={{ animationDelay: `${delayMs}ms` }}
      className="group flex w-full cursor-pointer items-start gap-4 rounded-box border border-base-300 bg-base-200/40 px-5 py-5 text-left transition-colors hover:border-primary/50 hover:bg-base-200/70 focus-visible:outline-2 focus-visible:outline-primary aria-checked:border-primary aria-checked:bg-primary/10 motion-safe:animate-rise"
    >
      <span
        aria-hidden
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-base-content/30 transition-colors group-hover:border-primary group-aria-checked:border-primary group-aria-checked:bg-primary"
      >
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth={3}
          className="size-3 text-primary-content opacity-0 transition-opacity group-aria-checked:opacity-100"
        />
      </span>
      {/* Steps as spans laid out like a list: a button may only hold
          phrasing content. */}
      <span className="flex min-w-0 flex-col gap-3">
        <span className="text-base font-medium">{title}</span>
        <span className="flex flex-col gap-2 text-sm leading-snug text-base-content/75">
          {steps.map((step, i) => (
            <span key={i} className="flex gap-3">
              <span className="w-3 shrink-0 text-right text-base-content/35 tabular-nums">
                {i + 1}
              </span>
              <span>{step}</span>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
