import type { MetadataRoute } from "next";
import { absoluteAssetUrl } from "@/lib/public-assets";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fluenverse.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fluenverse",
    short_name: "Fluenverse",
    description: "Sessões conversacionais de inglês para fluência e confiança na comunicação.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5b47d6",
    lang: "pt-BR",
    categories: ["education", "language", "productivity"],
    icons: [
      {
        src: absoluteAssetUrl("/favicon-f.png", siteUrl),
        sizes: "640x640",
        type: "image/png"
      }
    ]
  };
}
