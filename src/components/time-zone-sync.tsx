"use client";

import { useEffect } from "react";
import { updateTimeZone } from "@/lib/profile-actions";

// Saves the browser's time zone when it differs from the stored one, so
// "today" follows the user around.
export function TimeZoneSync({ stored }: { stored: string | null }) {
  useEffect(() => {
    const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (current && current !== stored) {
      updateTimeZone(current);
    }
  }, [stored]);

  return null;
}
