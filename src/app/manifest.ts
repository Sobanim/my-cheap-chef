import type { MetadataRoute } from "next";

// Next.js file-based convention: this is served as /manifest.webmanifest
// automatically, and linked into <head> without any extra wiring.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Cheap Chef — Varím zo zliav",
    short_name: "Cheap Chef",
    description:
      "Appka ti povie, čo uvariť z produktov, ktoré sú práve v zľave v Lidli.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#faf7f2",
    lang: "sk",
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
