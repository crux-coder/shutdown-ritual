import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

// The quiet, centred page shown when something isn't where it should be:
// the 404 and the error pages share it.
export function StatusPage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  // Extra buttons shown before the link home.
  actions?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Link href="/" aria-label="Home">
        <Logo className="size-10" />
      </Link>
      <p className="mt-10 text-xs font-medium tracking-[0.25em] text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      <div className="mt-5 max-w-md leading-relaxed text-pretty text-base-content/65">
        {children}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {actions}
        <Link
          href="/"
          className={actions ? "btn btn-ghost font-normal" : "btn btn-primary"}
        >
          Back to Eventide
        </Link>
      </div>
    </main>
  );
}
