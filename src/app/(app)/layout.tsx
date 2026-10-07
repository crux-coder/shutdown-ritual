import { AppHeader } from "@/components/app-header";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader />
      <Sidebar />
      {/* The navigation floats over the page and never shifts it: on phones
          its bottom bar sits in the padding every page already has (pb-24). */}
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
