"use client";

import { useEffect } from "react";
import { DAYPART_SCRIPT, daypartAt } from "@/lib/daypart";

// A soft, fixed backdrop that follows the time of day — sunrise in the
// morning, sunset in the evening. The look lives in globals.css (.sky).
export function Sky() {
  // Keep up if the page stays open across a boundary; the layers crossfade.
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.daypart = daypartAt(
        new Date().getHours(),
      );
    };
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <script
        // Only runs during HTML parsing; on the client React renders it inert.
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: DAYPART_SCRIPT }}
      />
      <div aria-hidden className="sky">
        <div className="sky-morning" />
        <div className="sky-afternoon" />
        <div className="sky-evening" />
        <div className="sky-night" />
      </div>
    </>
  );
}
