import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import type { SettingsState } from "./actions";

// A card for one group of settings: a heading, a line of context, the form.
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-200/40 p-6">
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-1 text-sm text-base-content/60">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SettingsSkeleton() {
  return <div aria-hidden className="skeleton h-64 w-full" />;
}

// The result of the last save, next to the button that made it.
export function SaveStatus({ state }: { state: SettingsState }) {
  return (
    <p aria-live="polite" className="text-sm">
      {state?.status === "saved" && (
        <span className="flex items-center gap-1.5 text-success motion-safe:animate-pop">
          <HugeiconsIcon
            aria-hidden
            icon={Tick02Icon}
            strokeWidth={2}
            className="size-4"
          />
          Saved
        </span>
      )}
      {state?.status === "error" && (
        <span role="alert" className="text-error">
          {state.error}
        </span>
      )}
    </p>
  );
}

export function SaveButton({
  pending,
  disabled,
}: {
  pending: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary"
    >
      {pending && <span className="loading loading-sm loading-spinner" />}
      Save
    </button>
  );
}
