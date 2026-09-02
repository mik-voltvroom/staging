import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VVOS Vehicle Intelligence",
    short_name: "VVOS Check",
    description: "Mobiele Volt & Vroom voertuiginspectie en VVOS Voertuigrapport.",
    start_url: "/dashboard/voertuigcheck",
    display: "standalone",
    background_color: "#f7f9fb",
    theme_color: "#ffffff",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
