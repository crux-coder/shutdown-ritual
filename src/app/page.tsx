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
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </form>
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

async function UserGreeting() {
  const user = await getCurrentUser();
  const name = user.email.split("@")[0];
  return <Greeting name={name} />;
}

function Greeting({ name }: { name?: string }) {
  return (
    <h1 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
      Good evening{name ? `, ${name}` : ""}
    </h1>
  );
}
