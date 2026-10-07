import type { MetadataRoute } from "next";

// Lets people add Eventide to their home screen and open it like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eventide",
    short_name: "Eventide",
    description:
      "A calm, intentional way to start your workday and close it properly.",
    start_url: "/today",
    display: "standalone",
    background_color: "#faf6f0",
    theme_color: "#faf6f0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
