import Link from "next/link";
import { Logo } from "@/components/logo";

// The header and footer shared by the public pages: the landing page and
// the privacy page.

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <Logo className="size-8" />
        <span className="hidden font-serif text-sm tracking-[0.3em] text-base-content/50 uppercase sm:inline">
          Shutdown Ritual
        </span>
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/sign-in" className="btn btn-ghost btn-sm font-normal">
          Sign in
        </Link>
        <Link href="/sign-up" className="btn btn-primary btn-sm">
          Get started
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-base-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-10">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="size-7" />
            <span className="font-serif text-sm tracking-[0.3em] text-base-content/50 uppercase">
              Shutdown Ritual
            </span>
          </Link>
          <p className="mt-4 text-sm text-base-content/55">
            A calm, intentional way to start your workday and close it properly.
            Free to use.
          </p>
        </div>
        <nav className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-medium">Get started</p>
            <Link
              href="/sign-up"
              className="link link-hover text-base-content/60"
            >
              Create an account
            </Link>
            <Link
              href="/sign-in"
              className="link link-hover text-base-content/60"
            >
              Sign in
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">About</p>
            <Link
              href="/privacy"
              className="link link-hover text-base-content/60"
            >
              Privacy
            </Link>
          </div>
        </nav>
      </div>
      <p className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-base-content/40 sm:px-10">
        © <CurrentYear /> Shutdown Ritual
      </p>
    </footer>
  );
}

// Read when the page is built, so the static page can include it.
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}
