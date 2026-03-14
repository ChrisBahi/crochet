import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
  const appHref = session ? "/app" : "/login";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "40px 48px",
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontSize: 16,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          CROCHET.
        </span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link href={appHref} style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: "#666",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Connexion
          </Link>
          <Link href="/register" style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#FFFFFF",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "1px solid #333",
            padding: "8px 20px",
          }}>
            Candidature
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontSize: "clamp(56px, 8vw, 110px)",
          fontWeight: 800,
          color: "#FFFFFF",
          margin: "0 0 0",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
        }}>
          Le signal,
        </h1>
        <h1 style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(56px, 8vw, 110px)",
          fontWeight: 800,
          color: "#FFFFFF",
          margin: "0 0 48px",
          lineHeight: 1.02,
          letterSpacing: "-0.03em",
        }}>
          pas le bruit.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 14,
          color: "#555",
          margin: 0,
          letterSpacing: "0.04em",
          maxWidth: 480,
          lineHeight: 1.75,
        }}>
          Infrastructure privée pour transactions qualifiées.<br />
          Accès sur candidature. Matching algorithmique. Discrétion absolue.
        </p>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#333",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          crochett.ai
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#333",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          © 2025 — Confidentiel
        </span>
      </div>

    </div>
  );
}
