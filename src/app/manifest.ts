import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Privatio — Vendi casa senza commissioni",
    short_name: "Privatio",
    description:
      "Marketplace immobiliare italiano. Pubblica gratis, scegli un'agenzia convenzionata, zero commissioni per il venditore.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0B1D3A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
