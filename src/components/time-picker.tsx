"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const HOURS = Array.from({ length: 24 }, (_, h) => pad(h));
const MINUTE_STEP = 15;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// A calm stand-in for <input type="time">: a serif trigger and a popover of
// hour and minute columns. Submits `name` as "HH:MM", like the native input.
export function TimePicker({
  label,
  name,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const panelId = useId();

  const [hour, minute] = value.split(":");
  // Keep an off-step minute (e.g. 09:10) selectable rather than dropping it.
  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, i) =>
    pad(i * MINUTE_STEP),
  );
  if (!minutes.includes(minute)) {
    minutes.push(minute);
    minutes.sort();
  }

  function close({ refocus }: { refocus: boolean }) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col gap-1.5"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          close({ refocus: true });
        }
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <span
        id={labelId}
        className="text-xs font-medium tracking-[0.2em] text-base-content/50 uppercase"
      >
        {label}
      </span>
      <input type="hidden" name={name} value={value} />

      <button
        ref={triggerRef}
        type="button"
        autoFocus={autoFocus}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={labelId}
        aria-describedby={`${labelId}-value`}
        className={`flex h-14 w-full items-center justify-between rounded-field border bg-base-100/70 px-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          open ? "border-primary" : "border-base-300 hover:border-primary/40"
        }`}
      >
        <span
          id={`${labelId}-value`}
          className="font-serif text-2xl font-light tracking-tight tabular-nums"
        >
          {hour}
          <span className="text-base-content/40">:</span>
          {minute}
        </span>
        <HugeiconsIcon
          aria-hidden
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className={`size-4 text-base-content/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={labelId}
          className="absolute top-full right-0 left-0 z-20 mt-2 grid grid-cols-2 gap-1 rounded-box border border-base-300 bg-base-100 p-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.18)] motion-safe:animate-pop"
        >
          <Column
            label="Hour"
            options={HOURS}
            selected={hour}
            onSelect={(h) => onChange(`${h}:${minute}`)}
            autoFocus
          />
          <Column
            label="Minute"
            options={minutes}
            selected={minute}
            onSelect={(m) => onChange(`${hour}:${m}`)}
            onCommit={() => close({ refocus: true })}
          />
        </div>
      )}
    </div>
  );
}

// One scrolling listbox. Arrow keys move the selection; Enter (or a click)
// on a minute commits and closes.
function Column({
  label,
  options,
  selected,
  onSelect,
  onCommit,
  autoFocus,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onCommit?: () => void;
  autoFocus?: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // Open centred on the current value, and focus it.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    active?.scrollIntoView({ block: "center" });
    if (autoFocus) active?.focus({ preventScroll: true });
  }, [autoFocus]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step =
      e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : undefined;
    if (step === undefined) return;
    e.preventDefault();
    const next = Math.min(options.length - 1, Math.max(0, index + step));
    onSelect(options[next]);
    const el = listRef.current?.children[next] as HTMLElement | undefined;
    el?.focus();
    el?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={label}
      className="flex max-h-56 snap-y flex-col gap-0.5 overflow-y-auto overscroll-contain py-2 [mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none]"
    >
      {options.map((option, i) => {
        const isSelected = option === selected;
        return (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => {
              onSelect(option);
              onCommit?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onCommit) {
                e.preventDefault();
                onCommit();
                return;
              }
              onKeyDown(e, i);
            }}
            className={`shrink-0 snap-center rounded-field py-2 text-center font-serif text-lg tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary ${
              isSelected
                ? "bg-primary/12 text-primary"
                : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
