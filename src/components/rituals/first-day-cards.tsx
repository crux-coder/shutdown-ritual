"use client";

import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { dismissTailorNudge, dismissWelcome } from "@/lib/profile-actions";
import { TailorRitualButton } from "./ritual-dialog";

// Cards on Today for someone new: a welcome to the ritual they start with,
// then, after their first shutdown, an offer to make it their own. Each shows
// until it's put away.

export function WelcomeCard({ opens }: { opens: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card
      eyebrow="Welcome"
      title="Your shutdown ritual is ready"
      actions={
        <>
          <Link
            href="/rituals"
            className="btn btn-ghost btn-sm font-normal text-base-content/70"
          >
            Make your own ritual
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(dismissWelcome)}
            className="btn btn-sm"
          >
            Got it
          </button>
        </>
      }
    >
      We’ve set you up with a short one to start. {opens}
    </Card>
  );
}

export function TailorNudge({
  suggestionsEnabled,
}: {
  // Whether OpenAI is set up; without it, this points to the Rituals page.
  suggestionsEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const dismiss = () => startTransition(dismissTailorNudge);

  return (
    <Card
      eyebrow="Make it yours"
      title="How did your first shutdown feel?"
      actions={
        <>
          <button
            type="button"
            disabled={pending}
            onClick={dismiss}
            className="btn btn-ghost btn-sm font-normal text-base-content/70"
          >
            Not now
          </button>
          {suggestionsEnabled ? (
            <TailorRitualButton
              className="btn btn-primary btn-sm"
              onCreated={dismiss}
            >
              <HugeiconsIcon
                aria-hidden
                icon={SparklesIcon}
                strokeWidth={2}
                className="size-4"
              />
              Tailor my ritual
            </TailorRitualButton>
          ) : (
            <Link href="/rituals" className="btn btn-primary btn-sm">
              Make your own ritual
            </Link>
          )}
        </>
      }
    >
      {suggestionsEnabled
        ? "Answer three quick questions and get rituals shaped around your work."
        : "Shape your rituals around your own work, or start from a template."}
    </Card>
  );
}

function Card({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="mb-8 rounded-box border border-primary/25 bg-primary/5 px-6 py-5 motion-safe:animate-rise"
    >
      <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-xl">{title}</h2>
      <p className="mt-2 leading-relaxed text-base-content/70">{children}</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">{actions}</div>
    </section>
  );
}
