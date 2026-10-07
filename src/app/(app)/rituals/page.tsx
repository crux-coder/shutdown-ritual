import type { Metadata } from "next";
import { Suspense } from "react";
import { NewRitualButton } from "@/components/rituals/ritual-dialog";
import {
  RitualList,
  RitualListSkeleton,
} from "@/components/rituals/ritual-list";
import { suggestionsEnabled } from "@/lib/rituals/suggest";

export const metadata: Metadata = { title: "Rituals" };

export default function RitualsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-12 pb-24 sm:pt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-light tracking-tight">
              Your rituals
            </h1>
            <p className="mt-2 text-base-content/60">
              Shape the routines that close your days.
            </p>
          </div>
          <NewRitualButton suggestionsEnabled={suggestionsEnabled()} />
        </div>
        <Suspense fallback={<RitualListSkeleton />}>
          <RitualList />
        </Suspense>
      </main>
    </div>
  );
}
