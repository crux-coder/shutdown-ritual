import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site-chrome";

// Where to write about the privacy page, the terms or an account.
export const CONTACT_EMAIL = "mustaficjasmin7@gmail.com";

// The frame of the privacy and terms pages: a short intro, then Parts.
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-6 pt-12 pb-24 sm:px-10 sm:pt-20">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl font-light tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-base-content/65">
          {intro}
        </p>
        <p className="mt-3 text-sm text-base-content/45">
          Last updated {updated}
        </p>

        <div className="mt-14 flex flex-col gap-12">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Part({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-light tracking-tight">{title}</h2>
      <div className="mt-4 leading-relaxed text-base-content/70 [&_a]:link [&_li]:mt-2 [&_p+p]:mt-3 [&_strong]:font-medium [&_strong]:text-base-content [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function ContactLink() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
