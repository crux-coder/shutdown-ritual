"use client";

import { ShutDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, useTransition } from "react";
import { normalizePhrase } from "@/lib/profile";
import { shutDownDay } from "@/lib/profile-actions";
import { playSound, type SoundId } from "@/lib/sounds";
import {
  keepNightShowing,
  LEAVE_MS,
  NightButton,
  NightScreen,
  PromptButton,
} from "./day-prompt";

// Closing the day, once the end-of-day rituals are done: the screen goes dark,
// and typing the shutdown phrase there shuts the day down.
export function ShutdownFlow({
  phrase,
  sound,
  delayMs = 0,
}: {
  phrase: string;
  // Played as the phrase is completed.
  sound: SoundId;
  delayMs?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PromptButton
        icon={ShutDownIcon}
        label="Shut down for the day"
        delayMs={delayMs}
        onClick={() => setOpen(true)}
      />
      {open && (
        <PhraseScreen
          phrase={phrase}
          sound={sound}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function PhraseScreen({
  phrase,
  sound,
  onClose,
}: {
  phrase: string;
  sound: SoundId;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();

  const target = normalizePhrase(phrase);
  const progress = normalizePhrase(typed);
  const offTrack = progress !== "" && !target.startsWith(progress);

  function type(value: string) {
    if (pending) return;
    setTyped(value);

    // The last keystroke closes the day; it counts as the user gesture the
    // sound needs. The night stays up while the shut-down view takes over.
    if (normalizePhrase(value) === target) {
      playSound(sound);
      keepNightShowing();
      startTransition(shutDownDay);
    }
  }

  // "Not yet": fade the night away, then go back to the rituals.
  function close() {
    if (pending) return;
    setLeaving(true);
    setTimeout(onClose, LEAVE_MS);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <NightScreen leaving={leaving}>
      {/* Once the phrase is typed, it fades out ahead of "Done for the day". */}
      <div
        data-done={pending || undefined}
        className="flex w-full max-w-xl flex-col items-center gap-12 transition-opacity duration-500 data-done:opacity-0"
      >
        <HugeiconsIcon
          aria-hidden
          icon={ShutDownIcon}
          strokeWidth={1.25}
          className="size-14 opacity-30 motion-safe:animate-rise"
          style={{ animationDelay: "500ms" }}
        />
        <div
          className="flex w-full flex-col items-center gap-8 motion-safe:animate-rise"
          style={{ animationDelay: "800ms" }}
        >
          <div>
            <p className="text-sm tracking-[0.2em] uppercase opacity-40">
              Say it, then type it
            </p>
            <p className="mt-4 font-serif text-3xl font-light tracking-tight text-balance sm:text-4xl">
              &ldquo;{phrase}&rdquo;
            </p>
          </div>
          <label className="flex w-full flex-col gap-3">
            <span className="sr-only">Type your shutdown phrase</span>
            <input
              type="text"
              value={typed}
              onChange={(e) => type(e.target.value)}
              readOnly={pending}
              aria-invalid={offTrack || undefined}
              aria-describedby="shutdown-phrase-hint"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="h-14 w-full border-b border-[#ece4d8]/20 bg-transparent px-2 text-center text-xl text-[#ece4d8] caret-[#ece4d8]/60 transition-colors duration-300 focus:border-[#ece4d8]/50 focus:outline-none aria-invalid:border-[#e3a37a]/60"
            />
            <span
              id="shutdown-phrase-hint"
              aria-live="polite"
              className="min-h-5 text-sm opacity-50"
            >
              {offTrack ? "Not quite — check the phrase above." : ""}
            </span>
          </label>
        </div>
        <NightButton delayMs={1400} disabled={pending} onClick={close}>
          Not yet
        </NightButton>
      </div>
    </NightScreen>
  );
}
