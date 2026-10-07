import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/rituals", label: "Rituals" },
] as const;

export function AppHeader({
  current,
}: {
  current: (typeof NAV)[number]["href"];
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <Link href="/" className="flex items-center gap-3">
        <Logo className="size-7" />
        <span className="hidden font-serif text-sm tracking-[0.3em] text-base-content/40 uppercase sm:inline">
          Shutdown Ritual
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <nav className="mr-2 flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === current ? "page" : undefined}
              className="btn btn-ghost btn-sm font-normal text-base-content/60 aria-[current=page]:text-base-content"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Suspense>
          <UserName />
        </Suspense>
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost btn-sm font-normal">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

async function UserName() {
  const user = await getCurrentUser();
  return (
    <span className="mr-1 hidden text-sm text-base-content/60 md:inline">
      {user.firstName} {user.lastName}
    </span>
  );
}
