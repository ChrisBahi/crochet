import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crochet.",
    short_name: "Crochet.",
    description: "Infrastructure privee de transactions",
    start_url: "/",
    display: "standalone",
    background_color: "#DDD4C6",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/favicon-32x32-v2.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16-v2.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  };
}
