import { Logo } from "@/components/logo";

// A quiet frame: the logo at the top, the page's main part centred in the
// space below, and room above and below it for AuthTop and AuthBottom (see
// ./frame.tsx).
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-dvh flex-1 grid-rows-[auto_auto_1fr_auto] justify-items-center px-6">
      <header className="row-start-1 flex items-center gap-3 pt-8">
        <Logo className="size-7" />
        <p className="font-serif text-xs tracking-[0.3em] text-base-content/40 uppercase">
          Shutdown Ritual
        </p>
      </header>
      {children}
    </main>
  );
}
