import type { Metadata } from "next";
import { ContactLink, LegalPage, Part } from "../legal-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Eventide stores, why, who else sees it, and how to remove it.",
};

// A plain-language account of the data the app keeps. Keep it in step with
// what the code actually stores and sends.
export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="How we handle your data"
      intro="Eventide is a small app. We keep only what it needs to work, we don’t sell your data, and there are no ads, analytics or trackers."
      updated="8 October 2026"
    >
      <Part title="What we store">
        <ul>
          <li>
            <strong>Your account:</strong> your email address and password.
            Passwords are stored hashed by our sign-in provider; we never see
            them. If you sign in with Google, we get your name, email address
            and profile picture from Google instead, and no password.
          </li>
          <li>
            <strong>About you:</strong> your first name, your time zone and your
            work hours, so the right rituals open at the right time.
          </li>
          <li>
            <strong>Your rituals:</strong> their names, descriptions, steps and
            schedules, and which ones (and which steps) you ticked off each day.
          </li>
          <li>
            <strong>Your note for tomorrow:</strong> the note you leave on the
            shutdown screen, kept until you put it away.
          </li>
          <li>
            <strong>Your settings:</strong> your shutdown phrase, how you close
            the day, your sounds, and whether you’ve seen the welcome cards.
          </li>
          <li>
            <strong>Connected apps:</strong> if you connect Todoist, the access
            Todoist grants us (stored encrypted) and the email you use there.
            We never see your Todoist password.
          </li>
        </ul>
      </Part>

      <Part title="Your notes stay yours">
        <p>
          Your notes and rituals are visible only to you: the database itself
          refuses to show them to any other account. We don’t read them, use
          them for anything else, or send them to AI.
        </p>
      </Part>

      <Part title="When AI is involved">
        <p>
          Only if you choose “Tailor one for me”. Your answers to its three
          questions (what you do, what makes it hard to switch off, how you want
          to feel) are sent to OpenAI to write ritual suggestions. Nothing else
          is sent: not your name, email, notes or existing rituals. OpenAI
          handles them under its API terms.
        </p>
      </Part>

      <Part title="Connected apps">
        <p>
          Only if you connect one in Settings. With Todoist, we read the tasks
          due today or overdue to show them in your rituals, and add or complete
          tasks when you ask us to. We don’t keep copies of your tasks.
          Disconnecting revokes our access and deletes what we stored for it.
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
            <strong>OpenAI</strong>, only for tailored suggestions, as above.
          </li>
          <li>
            <strong>Todoist</strong>, only if you connect it, as above.
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
          You can clear your note at any time by emptying it or putting it away,
          delete any ritual from the Rituals page, and change your name and
          settings in Settings. To remove everything, go to Settings, then
          Profile, and choose Delete account: your account and all its data are
          deleted straight away and can’t be recovered.
        </p>
      </Part>

      <Part title="Questions">
        <p>
          Write to <ContactLink /> about anything on this page, or to ask what
          we hold about you.
        </p>
      </Part>
    </LegalPage>
  );
}
