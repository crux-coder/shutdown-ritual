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
import { playSound, type SoundId } from "@/lib/sounds";
import {
  keepNightShowing,
  LEAVE_MS,
  NightButton,
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
  function finish() {
    if (pending) return;
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
    // The last keystroke of the phrase closes the day.
    if (normalizePhrase(value) === target) finish();
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
            placeholder="Optional. It’ll be here when you start tomorrow."
            className="w-full resize-none rounded-field border border-[#ece4d8]/15 bg-[#ece4d8]/5 px-4 py-3 text-base leading-relaxed text-[#ece4d8] caret-[#ece4d8]/60 placeholder:text-[#ece4d8]/30 focus:border-[#ece4d8]/40 focus:outline-none"
          />
        </label>

        <div
          className="flex w-full flex-col items-center gap-6 motion-safe:animate-rise"
          style={{ animationDelay: "900ms" }}
        >
          {mode === "phrase" ? (
            <>
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
            </>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              autoFocus
              className="btn btn-lg h-16 rounded-full border-0 bg-[#ece4d8] px-10 font-normal text-[#1b1418] hover:bg-[#ece4d8]/90"
            >
              I’m done for today
            </button>
          )}
        </div>

        <NightButton delayMs={1300} disabled={pending} onClick={close}>
          Not yet
        </NightButton>
      </div>
    </NightScreen>
  );
}
