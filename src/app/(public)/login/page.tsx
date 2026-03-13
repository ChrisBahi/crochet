import LoginButton from "./login-button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F2EE",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Header */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}>
            CROCHET.
          </span>
        </Link>
        <Link href="/register" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 13,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: "#7A746E",
          textDecoration: "none",
        }}>
          Demander l&apos;accès
        </Link>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: "1px solid #E0DAD0",
          padding: "48px 44px",
        }}>

          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: "#7A746E",
            marginBottom: 16,
          }}>
            Accès membres
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontStyle: "italic",
            fontSize: 30,
            fontWeight: 700,
            color: "#0A0A0A",
            margin: "0 0 8px",
            lineHeight: 1.2,
          }}>
            Connexion.
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
            lineHeight: 1.7,
            margin: "0 0 32px",
          }}>
            Réseau privé. Accès réservé aux membres admis.
          </p>

          <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

          <LoginButton />

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            color: "#7A746E",
            marginTop: 24,
            lineHeight: 1.7,
            textAlign: "center" as const,
          }}>
            Pas encore membre ?{" "}
            <Link href="/register" style={{ color: "#0A0A0A", textDecoration: "underline" }}>
              Soumettre une candidature
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}
