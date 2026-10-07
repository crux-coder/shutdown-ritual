"use client";

import {
  PlugSocketIcon,
  Sun03Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/settings", label: "Profile", icon: UserIcon },
  { href: "/settings/day", label: "Your day", icon: Sun03Icon },
  {
    href: "/settings/integrations",
    label: "Integrations",
    icon: PlugSocketIcon,
  },
] as const;

// One link per settings page, in a column: beside the page on wider screens,
// above it on narrow ones.
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex flex-col gap-1 sm:sticky sm:top-24"
    >
      {SECTIONS.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === pathname ? "page" : undefined}
          className="flex items-center gap-2.5 rounded-field px-3 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-200 hover:text-base-content focus-visible:outline-2 focus-visible:outline-primary aria-[current=page]:bg-base-200 aria-[current=page]:font-medium aria-[current=page]:text-base-content"
        >
          <HugeiconsIcon
            aria-hidden
            icon={icon}
            strokeWidth={2}
            className="size-4"
          />
          {label}
        </Link>
      ))}
    </nav>
  );
}
