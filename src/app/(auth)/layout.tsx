import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-12 flex flex-col items-center gap-4">
        <Logo className="size-12" />
        <p className="font-serif text-sm tracking-[0.3em] text-base-content/40 uppercase">
          Shutdown Ritual
        </p>
      </div>
      {children}
    </main>
  );
}
