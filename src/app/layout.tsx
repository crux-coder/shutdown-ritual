import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Sky } from "@/components/sky";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shutdown Ritual",
    template: "%s · Shutdown Ritual",
  },
  description: "A calm, intentional way to close out your workday.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      // The inline script in <Sky> sets data-daypart before hydration.
      suppressHydrationWarning
    >
      <body className="isolate flex min-h-full flex-col bg-base-100 font-sans text-base-content">
        <Sky />
        {children}
      </body>
    </html>
  );
}
