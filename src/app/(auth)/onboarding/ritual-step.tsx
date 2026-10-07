"use client";

import {
  ArrowRight01Icon,
  GridViewIcon,
  PencilEdit02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useActionState, useState, useTransition } from "react";
import { RitualFields } from "@/components/rituals/ritual-fields";
import { TemplatePicker } from "@/components/rituals/template-picker";
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
import {
  createFirstRitual,
  skipFirstRitual,
  suggestFirstRituals,
} from "./actions";

// One screen at a time: choose how to start, then either answer the three
// questions and pick a suggestion, or pick a template, and finally edit it.
type Stage =
  | { kind: "choose" }
  | { kind: "question"; index: number }
  | { kind: "suggestions" }
  | { kind: "templates" }
  | { kind: "form"; from: "suggestions" | "templates" | "choose" };

// What the form starts from: a suggestion, a template, or a blank form.
type StartingPoint = { key: string; values: RitualFormValues };

const BLANK: StartingPoint = { key: "blank", values: DEFAULT_RITUAL_VALUES };
const LAST_QUESTION = SUGGESTION_QUESTIONS.length - 1;

export function RitualStep({
  backAction,
  suggestionsEnabled,
}: {
  backAction: () => Promise<void>;
  // Whether OpenAI is set up; without it, AI isn't offered.
  suggestionsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    createFirstRitual,
    undefined,
  );
  const [stage, setStage] = useState<Stage>({ kind: "choose" });
  const [answers, setAnswers] = useState<SuggestionAnswers>({
    work: "",
    struggle: "",
    feeling: "",
  });
  const [suggestions, setSuggestions] = useState<RitualSuggestion[]>([]);
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
  const answered = question ? answers[question.id].trim() !== "" : false;

  function suggest() {
    setStage({ kind: "suggestions" });
    setSuggestError(false);
    startSuggesting(async () => {
      const result = await suggestFirstRituals(answers);
      setSuggestions("suggestions" in result ? result.suggestions : []);
      setSuggestError("error" in result);
    });
  }

  function edit(
    point: StartingPoint,
    from: "suggestions" | "templates" | "choose",
  ) {
    setPicked(point);
    setFresh(true);
    setStage({ kind: "form", from });
  }

  function next() {
    if (stage.kind !== "question" || !answered) return;
    if (stage.index === LAST_QUESTION) suggest();
    else setStage({ kind: "question", index: stage.index + 1 });
  }

  // Back steps through this flow; from its first screen, it leaves the step.
  function back() {
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
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setFresh(false)}
      className="flex flex-col gap-8"
    >
      {stage.kind === "choose" && (
        <div className="flex flex-col gap-3 motion-safe:animate-rise">
          {suggestionsEnabled && (
            <Choice
              icon={SparklesIcon}
              title="Tailor one for me"
              hint="Three quick questions"
              onClick={() => setStage({ kind: "question", index: 0 })}
            />
          )}
          <Choice
            icon={GridViewIcon}
            title="Use a template"
            hint="Ready-made for different kinds of work"
            onClick={() => setStage({ kind: "templates" })}
          />
          <Choice
            icon={PencilEdit02Icon}
            title="Start blank"
            hint="Write your own"
            onClick={() => edit(BLANK, "choose")}
          />
        </div>
      )}

      {question && (
        <QuestionScreen
          key={question.id}
          question={question}
          answer={answers[question.id]}
          onChange={(answer) =>
            setAnswers((a) => ({ ...a, [question.id]: answer }))
          }
          onSubmit={next}
        />
      )}

      {stage.kind === "suggestions" &&
        (suggesting ? (
          <SuggestionsLoading />
        ) : suggestError || suggestions.length === 0 ? (
          <p
            role="alert"
            className="py-8 text-center text-base-content/60 motion-safe:animate-rise"
          >
            Couldn’t come up with anything just now.{" "}
            <button type="button" onClick={suggest} className="link">
              Try again
            </button>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                delayMs={index * 90}
                onPick={() =>
                  edit(
                    { key: `suggestion-${index}`, values: suggestion.values },
                    "suggestions",
                  )
                }
              />
            ))}
            <button
              type="button"
              onClick={suggest}
              className="link link-hover self-center text-sm text-base-content/50"
            >
              Suggest others
            </button>
          </div>
        ))}

      {stage.kind === "templates" && (
        <TemplatePicker
          picked={pickedTemplate}
          offerBlank={false}
          onPick={(template) => {
            if (!template) return;
            setPickedTemplate(template);
            edit({ key: template.id, values: template.values }, "templates");
          }}
        />
      )}

      {stage.kind === "form" && (
        <>
          <RitualFields
            key={fresh ? picked.key : "submitted"}
            values={fresh || !state?.values ? picked.values : state.values}
            minimal
          />
          {state?.error && (
            <p role="alert" className="text-sm text-error">
              {state.error}
            </p>
          )}
        </>
      )}

      <div className="flex items-center justify-between gap-2">
        {stage.kind === "choose" ? (
          <button
            type="submit"
            formAction={backAction}
            formNoValidate
            disabled={pending}
            className="btn btn-ghost"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={back}
            disabled={pending}
            className="btn btn-ghost"
          >
            Back
          </button>
        )}

        {stage.kind === "choose" && (
          <button
            type="submit"
            formAction={skipFirstRitual}
            formNoValidate
            className="btn btn-ghost text-base-content/60"
          >
            Skip for now
          </button>
        )}
        {question && (
          <button
            type="button"
            onClick={next}
            disabled={!answered}
            className="btn btn-primary btn-lg"
          >
            {stage.kind === "question" && stage.index === LAST_QUESTION
              ? "See rituals"
              : "Next"}
          </button>
        )}
        {stage.kind === "form" && (
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary btn-lg"
          >
            {pending && <span className="loading loading-spinner loading-sm" />}
            {pending ? "Creating…" : "Create ritual"}
          </button>
        )}
      </div>
    </form>
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
  delayMs,
  onPick,
}: {
  suggestion: RitualSuggestion;
  delayMs: number;
  onPick: () => void;
}) {
  const { title, steps } = suggestion.values;

  return (
    <button
      type="button"
      onClick={onPick}
      style={{ animationDelay: `${delayMs}ms` }}
      className="flex w-full cursor-pointer flex-col gap-2 rounded-box border border-base-300 bg-base-200/40 px-5 py-4 text-left transition-colors hover:border-primary/50 hover:bg-base-200/70 focus-visible:outline-2 focus-visible:outline-primary motion-safe:animate-rise"
    >
      <span className="font-medium">{title}</span>
      <span className="text-sm text-base-content/55">{steps.join(" · ")}</span>
    </button>
  );
}
