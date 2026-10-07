import { useId } from "react";

// Day above, night below — the sun setting into the shutdown.
export function Logo({ className }: { className?: string }) {
  const clipId = useId();

  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <path
          fill="#e6a677"
          d="M0 0H100V45C98 47 94 53 85 53S58 42 40 41 12 40 0 48Z"
        />
        <path
          fill="#3a4e6b"
          d="M0 100H100V50C98 52 94 58 85 58S58 47 40 46 12 45 0 53Z"
        />
      </g>
      <circle cx="50" cy="21.5" r="9" fill="#fddb91" />
      <circle cx="50" cy="78" r="8.5" fill="#fdf6ec" />
      <g fill="#fdf6ec">
        <path d="M76.5 72.2Q77 74.3 79.1 74.8Q77 75.3 76.5 77.4Q76 75.3 73.9 74.8Q76 74.3 76.5 72.2Z" />
        <circle cx="85" cy="67.5" r="0.6" />
        <circle cx="67.8" cy="84.6" r="0.6" />
      </g>
    </svg>
  );
}
