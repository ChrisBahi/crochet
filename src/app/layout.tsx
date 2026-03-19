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
  title: "Crochet — Infrastructure privée de transactions",
  description: "CROCHET transforme un dossier brut en signal investissable.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
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
