"use client";

import { ErrorState } from "@/components/error-state";
import "./globals.css";

// Replaces the root layout when it fails, so it brings its own document.
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-base-100 font-sans text-base-content">
        <title>Something went wrong · Eventide</title>
        <ErrorState {...props} />
      </body>
    </html>
  );
}
