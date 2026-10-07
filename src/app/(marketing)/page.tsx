import {
  CheckListIcon,
  ShutDownIcon,
  SparklesIcon,
  SunriseIcon,
  SunsetIcon,
  Tick02Icon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { DEFAULT_SHUTDOWN_PHRASE } from "@/lib/profile";
import { RITUAL_MOMENTS } from "@/lib/rituals/options";
import { RITUAL_TEMPLATES, TEMPLATE_AUDIENCES } from "@/lib/rituals/templates";
import { SiteFooter, SiteHeader } from "./site-chrome";

export const metadata: Metadata = {
  title: { absolute: "Shutdown Ritual · End your workday on purpose" },
  description:
    "Small rituals to start your workday with intention and close it properly, so the evening is yours.",
};

// Signed-in visitors never see this: the proxy sends them on to /today.
export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <WhyItWorks />
        <Features />
        <PrivateByDefault />
        <Templates />
        <ClosingCall />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-12 pb-24 sm:px-10 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pb-32">
      <div className="motion-safe:animate-rise">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
          A calmer end to every workday
        </p>
        <h1 className="mt-5 font-serif text-5xl leading-[1.05] font-light tracking-tight text-balance sm:text-6xl lg:text-7xl">
          End your workday on purpose.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-base-content/65">
          Shutdown Ritual turns the last few minutes of your day into a small,
          repeatable routine. Close every loop, say your shutdown phrase, and
          let the evening be yours.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Start your first ritual
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg font-normal">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-base-content/50">
          No card needed to sign up.
        </p>
      </div>

      <div
        className="motion-safe:animate-rise"
        style={{ animationDelay: "150ms" }}
      >
        <RitualPreview />
      </div>
    </section>
  );
}

// A still of the today view: one ritual part-way through its steps, and the
// phrase that closes the day.
function RitualPreview() {
  const steps = [
    { text: "Check email and messages for anything urgent", done: true },
    { text: "Capture every open task somewhere you trust", done: true },
    { text: "Look over tomorrow’s calendar", done: false },
  ];

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="rounded-box border border-base-300 bg-base-100/80 p-6 shadow-xl shadow-base-content/5 backdrop-blur-sm">
        <p className="text-center font-serif text-2xl font-light">
          Good evening, Sam
        </p>
        <div className="mt-6 rounded-box border border-base-300 bg-base-200/40">
          <div className="flex items-center gap-4 px-5 pt-4">
            <div className="flex-1">
              <p className="text-lg font-medium">Evening shutdown</p>
              <p className="text-xs text-base-content/50">2 of 3 done</p>
            </div>
            <span className="size-8 rounded-full border border-base-content/25" />
          </div>
          <ol className="flex flex-col gap-0.5 p-3">
            {steps.map((step) => (
              <li
                key={step.text}
                className="flex items-center gap-3 rounded-field px-3 py-2"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    step.done
                      ? "border-primary bg-primary"
                      : "border-base-content/25"
                  }`}
                >
                  {step.done && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      strokeWidth={3}
                      className="size-3 text-primary-content"
                    />
                  )}
                </span>
                <span
                  className={`text-sm ${
                    step.done
                      ? "text-base-content/40 line-through decoration-base-content/30"
                      : "text-base-content/80"
                  }`}
                >
                  {step.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-8 rotate-2 rounded-box bg-neutral px-5 py-4 text-neutral-content shadow-xl sm:-right-8">
        <p className="text-[0.65rem] tracking-[0.25em] uppercase opacity-60">
          Type to close the day
        </p>
        <p className="mt-1 font-serif text-lg">
          {DEFAULT_SHUTDOWN_PHRASE}
          <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-pulse bg-neutral-content/70" />
        </p>
      </div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-6xl scroll-mt-8 px-6 py-20 sm:px-10 sm:py-28"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-5 text-lg leading-relaxed text-base-content/65">
            {intro}
          </p>
        )}
      </div>
      <div className="mt-14">{children}</div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: CheckListIcon,
      title: "Start with a ready-made ritual",
      text: "Tell us your name and work hours, and a short shutdown ritual is waiting. No blank page, nothing to design.",
    },
    {
      icon: ShutDownIcon,
      title: "Close your day",
      text: "When work ends, tick off the steps, leave a note for tomorrow, and hold to shut down. The screen goes dark, and you’re done.",
    },
    {
      icon: SparklesIcon,
      title: "Make it yours, later",
      text: "Once you’ve felt it, answer three quick questions for rituals shaped around your work, or pick a template.",
    },
  ];

  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="Three small steps to a real ending"
    >
      <ol className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-box border border-base-300 bg-base-100/60 p-7 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <HugeiconsIcon
                aria-hidden
                icon={step.icon}
                strokeWidth={1.75}
                className="size-6 text-primary"
              />
              <span className="font-serif text-3xl font-light text-base-content/20">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-8 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-base-content/60">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function WhyItWorks() {
  const points = [
    {
      title: "Capture, don’t carry",
      text: "Write down every open loop, and your mind no longer has to hold on to it.",
    },
    {
      title: "A clear ending",
      text: "A phrase you say, or a button you hold, becomes a daily signal that work is over.",
    },
    {
      title: "An easier start",
      text: "Tonight’s notes become tomorrow’s first step, so mornings begin with intention.",
    },
  ];

  return (
    <section className="bg-neutral text-neutral-content">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
            Why it works
          </p>
          {/* Our own words, not a quotation: no quote marks. */}
          <p className="mt-6 font-serif text-3xl leading-snug font-light text-balance sm:text-4xl">
            Unfinished work keeps tugging at your attention. A shutdown ritual
            gives every open loop a place to go, so your mind can let it go too.
          </p>
          <p className="mt-6 text-neutral-content/60">
            Inspired by{" "}
            <a
              href="https://calnewport.com/drastically-reduce-stress-with-a-work-shutdown-ritual/"
              className="link link-hover text-neutral-content/80"
            >
              Cal Newport’s work shutdown ritual
            </a>
            , which he also writes about in <em>Deep Work</em>. We made it
            something you’ll actually do every day.
          </p>
        </div>
        <ul className="flex flex-col justify-center gap-8">
          {points.map((point) => (
            <li key={point.title} className="border-l border-accent/40 pl-6">
              <h3 className="text-lg font-medium">{point.title}</h3>
              <p className="mt-1 leading-relaxed text-neutral-content/65">
                {point.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  const features: { icon: IconSvgElement; title: string; text: string }[] = [
    {
      icon: SunriseIcon,
      title: "Morning and evening",
      text: "Set your work hours, and the right rituals open at the start and end of your day.",
    },
    {
      icon: CheckListIcon,
      title: "Steps, not walls of text",
      text: "Break each ritual into a short checklist you can move through without thinking.",
    },
    {
      icon: VolumeHighIcon,
      title: "A sound to finish on",
      text: "A soft chime as you close your morning, and another as you shut down for the night.",
    },
    {
      icon: SunsetIcon,
      title: "A sky that keeps time",
      text: "The app shifts from sunrise to dusk with your day, a quiet cue of where you are in it.",
    },
  ];

  return (
    <Section
      eyebrow="Made for your day"
      title="Quiet by design"
      intro="No streaks to protect, no dashboards to check. Just what helps you start well and stop well."
    >
      <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature.title} className="flex gap-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-field bg-primary/10">
              <HugeiconsIcon
                aria-hidden
                icon={feature.icon}
                strokeWidth={1.75}
                className="size-5 text-primary"
              />
            </span>
            <div>
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <p className="mt-1 leading-relaxed text-base-content/60">
                {feature.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function PrivateByDefault() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 sm:px-10">
      <div className="flex flex-col gap-6 rounded-box border border-base-300 bg-base-100/60 p-8 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl font-light tracking-tight sm:text-3xl">
            Your notes stay yours
          </h2>
          <p className="mt-3 leading-relaxed text-base-content/65">
            The notes you leave for tomorrow and your rituals are visible only
            to you. They’re never sold, never used for ads, and never sent to
            AI. The only thing that is: your answers to the three questions,
            when you ask for tailored suggestions.
          </p>
        </div>
        <Link
          href="/privacy"
          className="btn btn-ghost shrink-0 self-start font-normal sm:self-center"
        >
          How we handle your data
        </Link>
      </div>
    </section>
  );
}

const FEATURED_TEMPLATES = [
  "newport-shutdown",
  "engineer-end-of-day",
  "writing-wrap-up",
];

function Templates() {
  const templates = FEATURED_TEMPLATES.map((id) =>
    RITUAL_TEMPLATES.find((t) => t.id === id)!,
  );

  return (
    <Section
      eyebrow="Templates"
      title="Rituals for every kind of work"
      intro="Start from one written for how you work, then make it your own."
    >
      <ul className="mb-8 flex flex-wrap gap-2">
        {TEMPLATE_AUDIENCES.map((audience) => (
          <li
            key={audience.id}
            className="rounded-full border border-base-300 bg-base-100/60 px-4 py-1.5 text-sm text-base-content/70"
          >
            {audience.label}
          </li>
        ))}
      </ul>
      <ul className="grid gap-6 md:grid-cols-3">
        {templates.map((template) => (
          <li
            key={template.id}
            className="flex flex-col rounded-box border border-base-300 bg-base-100/60 p-7 backdrop-blur-sm"
          >
            <p className="text-xs text-base-content/45">
              {
                RITUAL_MOMENTS.find((m) => m.id === template.values.moment)!
                  .label
              }
            </p>
            <h3 className="mt-2 font-serif text-2xl font-light">
              {template.values.title}
            </h3>
            <p className="mt-1 text-sm text-base-content/60">
              {template.summary}
            </p>
            <ol className="mt-5 flex list-inside list-decimal flex-col gap-1.5 border-t border-base-300 pt-5 text-sm text-base-content/70 marker:text-base-content/30">
              {template.values.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ClosingCall() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
      <div className="rounded-box bg-primary px-8 py-16 text-center text-primary-content sm:px-16 sm:py-20">
        <h2 className="mx-auto max-w-2xl font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
          Tonight, try stopping on purpose.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-primary-content/80">
          It takes a minute to set up, and a few minutes at the end of each day.
        </p>
        <Link
          href="/sign-up"
          className="btn btn-lg mt-10 border-0 bg-primary-content text-primary hover:bg-primary-content/90"
        >
          Start your first ritual
        </Link>
      </div>
    </section>
  );
}
