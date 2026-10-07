export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <p className="mb-12 font-serif text-sm tracking-[0.3em] text-base-content/40 uppercase">
        Shutdown Ritual
      </p>
      {children}
    </main>
  );
}
