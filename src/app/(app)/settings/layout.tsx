import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 pt-12 pb-24 sm:pt-20">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-light tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-base-content/60">
          Make the ritual fit your day.
        </p>
      </div>
      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10">
        <SettingsNav />
        <div>{children}</div>
      </div>
    </main>
  );
}
