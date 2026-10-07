import type { Metadata } from "next";
import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StatusPage eyebrow="404" title="Nothing out here">
      <p>
        This page has slipped past the horizon. The link may be old, or the
        address mistyped.
      </p>
    </StatusPage>
  );
}
