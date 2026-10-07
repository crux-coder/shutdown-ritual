import { AppHeader } from "@/components/app-header";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <Sidebar />
      {/* The sidebar floats over the page and never shifts it. Small screens
          keep room for the rail; wider ones have enough margin already. */}
      <div className="flex flex-1 flex-col pl-20 md:pl-0">
        {children}
      </div>
    </>
  );
}
