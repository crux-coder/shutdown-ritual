"use client";

import {
  Moon02Icon,
  Plant03Icon,
  Settings01Icon,
  Sun03Icon,
  SunriseIcon,
  SunsetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Daypart } from "@/lib/daypart";

const NAV = [
  { href: "/today", label: "Today", icon: TodayIcon },
  { href: "/rituals", label: "Rituals", icon: RitualsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

// A small floating panel, vertically centered on the left. It rests as an
// icon rail and opens while hovered (or while a link has keyboard focus).
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group fixed top-1/2 left-3 z-30 flex w-[3.625rem] -translate-y-1/2 flex-col overflow-hidden rounded-box border border-base-300/70 bg-base-100/80 p-2 shadow-lg shadow-base-content/5 backdrop-blur-md transition-[width] duration-300 ease-out has-focus-visible:w-44 hover:w-44 sm:left-4">
      {/* Nothing reflows between states: the panel's width animates and
          clips the labels, while the icons stay put — the 40px buttons
          fill the rail exactly. */}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              href === pathname || pathname.startsWith(`${href}/`)
                ? "page"
                : undefined
            }
            className="btn flex-nowrap justify-start gap-3 border-0 bg-transparent px-3 font-normal whitespace-nowrap text-base-content/60 shadow-none hover:bg-base-200 hover:text-base-content aria-[current=page]:bg-base-200 aria-[current=page]:text-base-content"
          >
            <Icon />
            <span className="opacity-0 transition-opacity duration-200 group-has-focus-visible:opacity-100 group-hover:opacity-100">
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Today follows the sky: one icon per part of the day, shown by
// <html data-daypart> (set by <Sky>) so it is right from the first paint.
const DAYPART_ICONS: Record<
  Daypart,
  { icon: IconSvgElement; visible: string }
> = {
  morning: { icon: SunriseIcon, visible: "in-data-[daypart=morning]:block" },
  afternoon: { icon: Sun03Icon, visible: "in-data-[daypart=afternoon]:block" },
  evening: { icon: SunsetIcon, visible: "in-data-[daypart=evening]:block" },
  night: { icon: Moon02Icon, visible: "in-data-[daypart=night]:block" },
};

function TodayIcon() {
  return Object.entries(DAYPART_ICONS).map(([daypart, { icon, visible }]) => (
    <HugeiconsIcon
      key={daypart}
      aria-hidden
      icon={icon}
      strokeWidth={2}
      className={`hidden size-4 shrink-0 ${visible}`}
    />
  ));
}

function RitualsIcon() {
  return (
    <HugeiconsIcon
      aria-hidden
      icon={Plant03Icon}
      strokeWidth={2}
      className="size-4 shrink-0"
    />
  );
}

function SettingsIcon() {
  return (
    <HugeiconsIcon
      aria-hidden
      icon={Settings01Icon}
      strokeWidth={2}
      className="size-4 shrink-0"
    />
  );
}
