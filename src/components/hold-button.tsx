"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";

// A button that has to be held, filling as it goes, so an action happens on
// purpose rather than by a stray tap. Letting go early drains it back.
//
// Works with a pointer (press and hold) and the keyboard (hold Space or
// Enter). Assistive tech that activates buttons without pressing them, like
// screen readers and switch controls, completes it straight away: holding is
// never the only way through.
export function HoldButton({
  onComplete,
  onHoldStart,
  holdMs = 1200,
  disabled = false,
  className = "",
  fillClassName = "",
  ref,
  children,
}: {
  onComplete: () => void;
  // Called by the gesture that starts a hold, e.g. to unlock audio.
  onHoldStart?: () => void;
  holdMs?: number;
  disabled?: boolean;
  className?: string;
  fillClassName?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const progress = useRef(0);
  const done = useRef(false);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function setFill(value: number, drain: boolean) {
    const fill = fillRef.current;
    if (!fill) return;
    fill.style.transition = drain ? "transform 400ms ease-out" : "none";
    fill.style.transform = `scaleX(${value})`;
  }

  function complete() {
    if (done.current) return;
    done.current = true;
    cancelAnimationFrame(frame.current);
    setFill(1, false);
    onComplete();
  }

  function start() {
    if (disabled || done.current) return;
    onHoldStart?.();
    cancelAnimationFrame(frame.current);
    // Picks up from wherever a drain had got to.
    const began = performance.now() - progress.current * holdMs;
    const tick = (now: number) => {
      progress.current = Math.min(1, (now - began) / holdMs);
      setFill(progress.current, false);
      if (progress.current >= 1) complete();
      else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }

  function cancel() {
    if (done.current) return;
    cancelAnimationFrame(frame.current);
    progress.current = 0;
    setFill(0, true);
  }

  const isHoldKey = (key: string) => key === " " || key === "Enter";

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        // Keeps the hold going if the finger drifts off the button. Not
        // essential, so a pointer that can't be captured still holds.
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {}
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      // Holding stands in for the keys' usual click, so they don't fire one.
      onKeyDown={(e) => {
        if (!isHoldKey(e.key)) return;
        e.preventDefault();
        if (!e.repeat) start();
      }}
      onKeyUp={(e) => {
        if (!isHoldKey(e.key)) return;
        e.preventDefault();
        cancel();
      }}
      // A click with no pointer behind it (detail 0) comes from assistive
      // tech; pointer clicks are handled by the hold above.
      onClick={(e) => {
        if (e.detail === 0) complete();
      }}
      // Long presses on touch screens would otherwise open a menu.
      onContextMenu={(e) => e.preventDefault()}
      className={`relative isolate touch-none overflow-hidden select-none [-webkit-touch-callout:none] ${className}`}
    >
      <span
        ref={fillRef}
        aria-hidden
        // Starts empty through `transform`, the same property the hold
        // animates; Tailwind's scale-x-0 sets `scale`, which would multiply
        // with it and keep the fill at zero.
        style={{ transform: "scaleX(0)" }}
        className={`absolute inset-0 -z-10 origin-left ${fillClassName}`}
      />
      {children}
    </button>
  );
}
