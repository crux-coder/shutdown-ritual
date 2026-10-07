import { Logout01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <Link href="/today" aria-label="Today">
        <Logo className="size-7" />
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="btn btn-outline btn-sm gap-1.5 border-base-300 font-normal text-base-content/70 hover:border-base-300 hover:bg-base-200 hover:text-base-content"
        >
          <HugeiconsIcon
            aria-hidden
            icon={Logout01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Sign out
        </button>
      </form>
    </header>
  );
}
