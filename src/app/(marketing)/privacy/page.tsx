import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "../site-chrome";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Eventide stores, why, who else sees it, and how to remove it.",
};

// A plain-language account of the data the app keeps. Keep it in step with
// what the code actually stores and sends.
export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 pt-12 pb-24 sm:px-10 sm:pt-20">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
          Privacy
        </p>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
          How we handle your data
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-base-content/65">
          Eventide is a small app. We keep only what it needs to work, we don’t
          sell your data, and there are no ads, analytics or trackers.
        </p>
        <p className="mt-3 text-sm text-base-content/45">
          Last updated 7 October 2026
        </p>

        <div className="mt-14 flex flex-col gap-12">
          <Part title="What we store">
            <ul>
              <li>
                <strong>Your account:</strong> your email address and password.
                Passwords are stored hashed by our sign-in provider; we never
                see them.
              </li>
              <li>
                <strong>About you:</strong> your first name, your time zone and
                your work hours, so the right rituals open at the right time.
              </li>
              <li>
                <strong>Your rituals:</strong> their names, descriptions, steps
                and schedules, and which ones (and which steps) you ticked off
                each day.
              </li>
              <li>
                <strong>Your note for tomorrow:</strong> the note you leave on
                the shutdown screen, kept until you put it away.
              </li>
              <li>
                <strong>Your settings:</strong> your shutdown phrase, how you
                close the day, your sounds, and whether you’ve seen the welcome
                cards.
              </li>
            </ul>
          </Part>

          <Part title="Your notes stay yours">
            <p>
              Your notes and rituals are visible only to you: the database
              itself refuses to show them to any other account. We don’t read
              them, use them for anything else, or send them to AI.
            </p>
          </Part>

          <Part title="When AI is involved">
            <p>
              Only if you choose “Tailor one for me”. Your answers to its three
              questions (what you do, what makes it hard to switch off, how you
              want to feel) are sent to OpenAI to write ritual suggestions.
              Nothing else is sent: not your name, email, notes or existing
              rituals. OpenAI handles them under its API terms.
            </p>
          </Part>

          <Part title="Who else is involved">
            <ul>
              <li>
                <strong>Supabase</strong> stores your data and handles sign-in.
              </li>
              <li>
                <strong>Railway</strong> runs the app.
              </li>
              <li>
                <strong>OpenAI</strong>, only for tailored suggestions, as
                above.
              </li>
            </ul>
          </Part>

          <Part title="Cookies">
            <p>
              Just the ones that keep you signed in. Sounds are made in your
              browser, so playing them shares nothing.
            </p>
          </Part>

          <Part title="Removing your data">
            <p>
              You can clear your note at any time by emptying it or putting it
              away, delete any ritual from the Rituals page, and change your
              name and settings in Settings. To remove everything, go to
              Settings, then Profile, and choose Delete account: your account
              and all its data are deleted straight away and can’t be recovered.
            </p>
          </Part>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Part({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-light tracking-tight">{title}</h2>
      <div className="mt-4 leading-relaxed text-base-content/70 [&_li]:mt-2 [&_strong]:font-medium [&_strong]:text-base-content [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
