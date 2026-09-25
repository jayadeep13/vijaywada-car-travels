import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vijayawada Car Travels",
    short_name: "VCT Cabs",
    description: "Affordable car rental with driver in Vijayawada: local, airport and outstation cabs.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#0d6150",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
