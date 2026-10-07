import type { Metadata } from "next";
import { signOut } from "../actions";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <div className="w-full max-w-sm">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          Nice to meet you
        </h1>
        <p className="mt-3 text-base-content/60">
          What should we call you at the end of the day?
        </p>
      </header>

      <OnboardingForm />

      <form action={signOut} className="mt-8 text-center">
        <button
          type="submit"
          className="link link-hover text-sm text-base-content/60"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
