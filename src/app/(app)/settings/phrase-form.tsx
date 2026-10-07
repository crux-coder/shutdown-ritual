"use client";

import { useActionState } from "react";
import {
  DEFAULT_SHUTDOWN_PHRASE,
  MAX_SHUTDOWN_PHRASE_LENGTH,
} from "@/lib/profile";
import { updateShutdownPhrase } from "./actions";
import { SaveButton, SaveStatus } from "./settings-section";

export function PhraseForm({ phrase }: { phrase: string }) {
  const [state, formAction, pending] = useActionState(
    updateShutdownPhrase,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase">
          Phrase
        </span>
        <input
          type="text"
          name="shutdownPhrase"
          defaultValue={phrase}
          placeholder={DEFAULT_SHUTDOWN_PHRASE}
          maxLength={MAX_SHUTDOWN_PHRASE_LENGTH}
          required
          className="h-14 w-full rounded-field border border-base-300 bg-base-100/70 px-4 text-lg transition-colors duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        <span className="text-sm text-base-content/50">
          Case and punctuation don&rsquo;t matter when you type it.
        </span>
      </label>

      <div className="flex items-center justify-end gap-4">
        <SaveStatus state={state} />
        <SaveButton pending={pending} />
      </div>
    </form>
  );
}
