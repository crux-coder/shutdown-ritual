import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Sky } from "@/components/sky";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const description =
  "A calm, intentional way to start your workday and close it properly.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eventide",
    template: "%s · Eventide",
  },
  description,
  applicationName: "Eventide",
  openGraph: {
    type: "website",
    siteName: "Eventide",
    title: "Eventide",
    description,
  },
  twitter: { card: "summary_large_image" },
  // Opened from the home screen, it runs full screen like an app.
  appleWebApp: { capable: true, title: "Eventide", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1a17" },
  ],
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
