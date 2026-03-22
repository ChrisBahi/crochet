import type { Metadata } from "next";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/jetbrains-mono/400.css";
import "./globals.css";
import { LangProvider } from "@/lib/lang/context";

export const metadata: Metadata = {
  metadataBase: new URL("https://crochett.ai"),
  applicationName: "Infrastructure privée",
  manifest: "/manifest.webmanifest",
  title: "Crochet — Infrastructure privée de transactions",
  description: "CROCHET transforme un dossier brut en signal investissable.",
  icons: {
    icon: [
      { url: "/favicon-32x32-v2.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16-v2.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon-32x32-v2.png"],
    apple: [{ url: "/apple-touch-icon-v2.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    siteName: "Infrastructure privée",
    images: [{ url: "/og-image.png", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
