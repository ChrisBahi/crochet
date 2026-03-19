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
  title: "Crochet — Infrastructure privée de transactions",
  description: "CROCHET transforme un dossier brut en signal investissable.",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.svg" },
  openGraph: { images: [{ url: "/og-image.svg", width: 1200, height: 630 }] },
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
