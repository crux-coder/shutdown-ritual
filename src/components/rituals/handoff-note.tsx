"use client";

import { useTransition } from "react";
import { dismissHandoffNote } from "@/lib/profile-actions";

// The note the user left at their last shutdown, waiting at the top of the
// next day until they put it away.
export function HandoffNote({ note }: { note: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-label="Your note from last time"
      className="mb-8 rounded-box border border-primary/25 bg-primary/5 px-6 py-5 motion-safe:animate-rise"
    >
      <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
        You left this for today
      </p>
      <p className="mt-3 leading-relaxed whitespace-pre-line">{note}</p>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(dismissHandoffNote)}
          className="btn btn-ghost btn-sm font-normal text-base-content/60"
        >
          {pending && <span className="loading loading-spinner loading-xs" />}
          Got it
        </button>
      </div>
    </section>
  );
}
