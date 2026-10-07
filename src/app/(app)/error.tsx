"use client";

import { ErrorState } from "@/components/error-state";

// Inside the app, so the navigation stays put while the page shows the error.
export default function Error(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorState {...props} />;
}
