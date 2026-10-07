"use client";

import { ShutDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  MAX_HANDOFF_NOTE_LENGTH,
  normalizePhrase,
  type ShutdownMode,
} from "@/lib/profile";
import { saveHandoffNote, shutDownDay } from "@/lib/profile-actions";
import { playSound, unlockSound, type SoundId } from "@/lib/sounds";
import { HoldButton } from "@/components/hold-button";
import {
  keepNightShowing,
  LEAVE_MS,
  NightScreen,
  PromptButton,
} from "./day-prompt";

// Closing the day: the screen goes dark, there's room to leave a note for
// tomorrow, and typing the shutdown phrase (or one button, if the user
// prefers) shuts the day down. Available at any point in the evening, with
// or without rituals done; unfinished ones simply stay unticked.
export function ShutdownFlow({
  phrase,
  sound,
  mode,
  note,
  quiet = false,
  label = "Shut down for the day",
  delayMs = 0,
}: {
  phrase: string;
  // Played as the day closes.
  sound: SoundId;
  mode: ShutdownMode;
  // A note already left today, to pick up where it was.
  note: string;
  // A small text link instead of the big button, for finishing early.
  quiet?: boolean;
  label?: ReactNode;
  delayMs?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {quiet ? (
        <div
          className="flex justify-center motion-safe:animate-rise"
          style={{ animationDelay: `${delayMs}ms` }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="link link-hover text-sm text-base-content/50"
          >
            {label}
          </button>
        </div>
      ) : (
        <PromptButton
          icon={ShutDownIcon}
          label={label}
          delayMs={delayMs}
          onClick={() => setOpen(true)}
        />
      )}
      {open && (
        <ShutdownScreen
          phrase={phrase}
          sound={sound}
          mode={mode}
          note={note}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// Waits this long after the last keystroke before saving the note.
const NOTE_SAVE_DELAY_MS = 600;

function ShutdownScreen({
  phrase,
  sound,
  mode,
  note: savedNote,
  onClose,
}: {
  phrase: string;
  sound: SoundId;
  mode: ShutdownMode;
  note: string;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState(savedNote);
  const [leaving, setLeaving] = useState(false);
  const [pending, startTransition] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSaved = useRef(savedNote);

  const target = normalizePhrase(phrase);
  const progress = normalizePhrase(typed);
  const offTrack = progress !== "" && !target.startsWith(progress);
  // In phrase mode, the button waits for the phrase.
  const ready = mode === "button" || progress === target;
  const holdRef = useRef<HTMLButtonElement>(null);

  // Saves the note if it changed since the last save.
  async function saveNote(value: string) {
    clearTimeout(saveTimer.current);
    if (value === lastSaved.current) return;
    lastSaved.current = value;
    await saveHandoffNote(value);
  }

  function editNote(value: string) {
    setNote(value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(value), NOTE_SAVE_DELAY_MS);
  }

  // Called from a click or keystroke, which counts as the user gesture the
  // sound needs. The night stays up while the shut-down view takes over.
  // Runs when the hold completes. Its sound was unlocked as the hold began,
  // since a timer finishing isn't a gesture the browser lets play audio.
  function finish() {
    if (pending || !ready) return;
    playSound(sound);
    keepNightShowing();
    startTransition(async () => {
      await saveNote(note);
      await shutDownDay();
    });
  }

  function type(value: string) {
    if (pending) return;
    setTyped(value);
    // The phrase unlocks the button rather than closing the day itself, so
    // the ending stays a choice; focus moves there for the keyboard.
    if (normalizePhrase(value) === target) {
      requestAnimationFrame(() => holdRef.current?.focus());
    }
  }

  // "Not yet": keep the note, fade the night away, then go back.
  function close() {
    if (pending) return;
    void saveNote(note);
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

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  return (
    <NightScreen leaving={leaving}>
      {/* Once the day closes, this fades out ahead of "Done for today". */}
      <div
        data-done={pending || undefined}
        className="flex w-full max-w-xl flex-col items-center gap-10 transition-opacity duration-500 data-done:opacity-0"
      >
        <HugeiconsIcon
          aria-hidden
          icon={ShutDownIcon}
          strokeWidth={1.25}
          className="size-12 opacity-30 motion-safe:animate-rise"
          style={{ animationDelay: "500ms" }}
        />

        <label
          className="flex w-full flex-col gap-3 motion-safe:animate-rise"
          style={{ animationDelay: "700ms" }}
        >
          <span className="text-sm opacity-60">
            Anything you want to leave here for tomorrow?
          </span>
          <textarea
            value={note}
            onChange={(e) => editNote(e.target.value)}
            onBlur={() => void saveNote(note)}
            readOnly={pending}
            rows={3}
            maxLength={MAX_HANDOFF_NOTE_LENGTH}
            aria-describedby="handoff-note-privacy"
            placeholder="Optional. It’ll be here when you start tomorrow."
            className="w-full resize-none rounded-field border border-[#ece4d8]/15 bg-[#ece4d8]/5 px-4 py-3 text-base leading-relaxed text-[#ece4d8] caret-[#ece4d8]/60 placeholder:text-[#ece4d8]/30 focus:border-[#ece4d8]/40 focus:outline-none"
          />
          <span id="handoff-note-privacy" className="text-xs opacity-35">
            Only you can see this note.
          </span>
        </label>

        {mode === "phrase" && (
          <div
            className="flex w-full flex-col items-center gap-6 motion-safe:animate-rise"
            style={{ animationDelay: "900ms" }}
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
                aria-describedby="shutdown-phrase-hint"
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-14 w-full border-b border-[#ece4d8]/20 bg-transparent px-2 text-center text-xl text-[#ece4d8] caret-[#ece4d8]/60 transition-colors duration-300 focus:border-[#ece4d8]/50 focus:outline-none"
              />
              {/* A gentle nudge, not a correction: no red, no "wrong". */}
              <span
                id="shutdown-phrase-hint"
                aria-live="polite"
                className="min-h-5 text-sm opacity-40"
              >
                {offTrack ? "Just the words above, in your own time." : ""}
              </span>
            </label>
          </div>
        )}

        {/* The main way out of the screen, with "Not yet" quietly below. */}
        <div
          className="flex flex-col items-center gap-4 motion-safe:animate-rise"
          style={{ animationDelay: "1100ms" }}
        >
          <HoldButton
            ref={holdRef}
            onHoldStart={unlockSound}
            onComplete={finish}
            disabled={pending || !ready}
            className="btn btn-lg h-16 gap-3 rounded-full border border-[#ece4d8]/35 bg-[#ece4d8]/10 px-10 font-normal text-[#ece4d8] shadow-none hover:border-[#ece4d8]/60 hover:bg-[#ece4d8]/15 disabled:border-[#ece4d8]/10 disabled:bg-transparent disabled:text-[#ece4d8]/30"
            fillClassName="bg-[#d08f72]/85"
          >
            <HugeiconsIcon
              aria-hidden
              icon={ShutDownIcon}
              strokeWidth={1.75}
              className="size-5"
            />
            Hold to shut down
          </HoldButton>
          <button
            type="button"
            disabled={pending}
            onClick={close}
            className="cursor-pointer px-3 py-2 text-sm text-[#ece4d8]/40 underline-offset-4 transition-colors hover:text-[#ece4d8]/70 hover:underline focus-visible:outline-2 focus-visible:outline-[#ece4d8]/50 disabled:pointer-events-none"
          >
            Not yet
          </button>
        </div>
      </div>
    </NightScreen>
  );
}
