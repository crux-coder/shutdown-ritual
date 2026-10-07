import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink, LegalPage, Part } from "../legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The agreement between you and Eventide, in plain language.",
};

// The terms of use, written to be read. Keep them in step with the privacy
// page and with what the app actually does.
export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="The terms of using Eventide"
      intro="The short version: use Eventide for your own days, be kind to it, and know that your rituals and notes are yours. The details are below."
      updated="8 October 2026"
    >
      <Part title="Agreeing to these terms">
        <p>
          By creating an account or using Eventide, you agree to these terms and
          to how we handle your data, as set out on the{" "}
          <Link href="/privacy">privacy page</Link>. If you don’t agree, please
          don’t use the app.
        </p>
      </Part>

      <Part title="Your account">
        <ul>
          <li>You need to be at least 16 to use Eventide.</li>
          <li>
            Use an email address you can receive mail at: it’s how you confirm
            your account and reset your password.
          </li>
          <li>
            Keep your password to yourself. You’re responsible for what happens
            in your account, so let us know straight away if you think someone
            else has got into it.
          </li>
          <li>One account is for one person.</li>
        </ul>
      </Part>

      <Part title="Your rituals and notes">
        <p>
          What you write in Eventide stays yours. You let us store it and show
          it back to you, because that’s how the app works, and we use it for
          nothing else. Please don’t put anything in it that you’re not allowed
          to share with us.
        </p>
      </Part>

      <Part title="Using it fairly">
        <p>Please don’t:</p>
        <ul>
          <li>
            try to get into other people’s accounts or data, or past the app’s
            security;
          </li>
          <li>
            overload the app, scrape it, or call it automatically, including
            asking for AI suggestions over and over;
          </li>
          <li>use it for anything unlawful or to harm anyone.</li>
        </ul>
      </Part>

      <Part title="Suggestions from AI">
        <p>
          When you choose “Tailor one for me”, OpenAI writes ritual suggestions
          from your answers. They’re written by a machine and can miss the mark,
          so read them before you save one: you decide what goes into your day.
        </p>
      </Part>

      <Part title="Not a substitute for care">
        <p>
          Eventide helps you start and end your workday with intention. It isn’t
          medical, psychological or professional advice. If work is weighing on
          your health, please talk to someone qualified.
        </p>
      </Part>

      <Part title="The app itself">
        <p>
          Eventide is a small app. We work to keep it running well, but we can’t
          promise it will always be available or free of mistakes. We may
          change, add or remove features as the app grows. If we ever stop
          running it, we’ll give you notice by email before we do.
        </p>
        <p>
          Eventide is provided “as is”. As far as the law allows, we aren’t
          liable for indirect losses, or for losses that come from the app being
          unavailable, from data you didn’t keep elsewhere, or from acting on a
          suggestion. Nothing here limits rights you have by law that can’t be
          limited.
        </p>
      </Part>

      <Part title="Leaving, or being asked to">
        <p>
          You can stop using Eventide whenever you like. To remove your account
          and everything in it, go to Settings, then Profile, and choose Delete
          account. If someone breaks these terms, we may suspend or close their
          account, and we’ll say why unless the law stops us.
        </p>
      </Part>

      <Part title="Changes to these terms">
        <p>
          If we change these terms, we’ll update the date at the top. If a
          change matters, we’ll tell you by email before it applies. Carrying on
          using Eventide after that means you accept the new terms.
        </p>
      </Part>

      <Part title="Questions">
        <p>
          Write to <ContactLink /> about anything on this page.
        </p>
      </Part>
    </LegalPage>
  );
}
