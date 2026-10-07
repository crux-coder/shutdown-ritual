import { siGithub, siGmail, siGooglecalendar, siTodoist } from "simple-icons";
import type { RitualIntegration } from "@/lib/rituals/options";

// Logos for the integrations, from Simple Icons, drawn in the current text
// colour.
const ICONS: Record<RitualIntegration, { path: string }> = {
  gmail: siGmail,
  google_calendar: siGooglecalendar,
  todoist: siTodoist,
  github: siGithub,
};

export function IntegrationIcon({
  integration,
  className,
}: {
  integration: RitualIntegration;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={ICONS[integration].path} />
    </svg>
  );
}
