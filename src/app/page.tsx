import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  const candidaterHref = session ? "/app/opportunities/new" : "/login";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
      }}>
        {/* Left logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            fontStyle: "normal",
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            CROCHET.
          </span>
        </Link>

        {/* Right nav */}
        <nav>
          <Link href={candidaterHref} style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#7A746E",
            textDecoration: "none",
          }}>
            Candidater
          </Link>
        </nav>
      </header>

      {/* Body */}
      <main style={{
        flex: 1,
        background: "#F5F2EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Link href={session ? "/app/matches" : "/login"} style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#FFFFFF",
          background: "#0A0A0A",
          padding: "14px 36px",
          textDecoration: "none",
        }}>
          {session ? "Accéder à la plateforme" : "Se connecter"}
        </Link>
      </main>
    </div>
  );
}
