"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/status-page";

// What error.tsx boundaries show. The reference matches the server log, so
// someone writing in about it can be traced.
export function ErrorState({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      eyebrow="Something went wrong"
      title="That didn’t go to plan"
      actions={
        <button
          type="button"
          onClick={() => retry()}
          className="btn btn-primary"
        >
          Try again
        </button>
      }
    >
      <p>
        It’s on our side, not yours. Try again, or come back in a moment;
        nothing you’ve saved is lost.
      </p>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-base-content/40">
          Reference {error.digest}
        </p>
      )}
    </StatusPage>
  );
}
