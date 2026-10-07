import { Suspense } from "react";
import { NewRitualButton } from "@/components/rituals/ritual-dialog";
import {
  RitualList,
  RitualListSkeleton,
} from "@/components/rituals/ritual-list";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "./(auth)/actions";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-serif text-sm tracking-[0.3em] text-base-content/40 uppercase">
          Shutdown Ritual
        </span>
        <div className="flex items-center gap-2">
          <Suspense>
            <UserName />
          </Suspense>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-12 pb-24 sm:pt-20">
        <div className="text-center">
          <Suspense fallback={<Greeting />}>
            <UserGreeting />
          </Suspense>
          <p className="mx-auto mt-4 max-w-md text-base-content/60">
            Take a breath. Let&apos;s gently wrap up today and make space for
            tomorrow.
          </p>
        </div>

        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-light tracking-tight">
              Your rituals
            </h2>
            <NewRitualButton />
          </div>
          <Suspense fallback={<RitualListSkeleton />}>
            <RitualList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

async function UserName() {
  const user = await getCurrentUser();
  return (
    <span className="hidden text-sm text-base-content/60 sm:inline">
      {user.firstName} {user.lastName}
    </span>
  );
}

async function UserGreeting() {
  const user = await getCurrentUser();
  return <Greeting name={user.firstName} />;
}

function Greeting({ name }: { name?: string }) {
  return (
    <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
      Good evening{name ? `, ${name}` : ""}
    </h1>
  );
}
