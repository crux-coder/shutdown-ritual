import { Suspense } from "react";
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

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <Suspense fallback={<Greeting />}>
          <UserGreeting />
        </Suspense>
        <p className="mt-4 max-w-md text-base-content/60">
          Take a breath. Let&apos;s gently wrap up today and make space for
          tomorrow.
        </p>
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
