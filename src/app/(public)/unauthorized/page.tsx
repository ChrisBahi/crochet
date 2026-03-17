import Link from "next/link"

export default function UnauthorizedPage() {
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
        flexShrink: 0,
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
            CROCHETT.
          </span>
        </Link>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: 520, width: "100%" }}>

          {/* Status tag */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
          }}>
            <span style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#B7791F",
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              color: "#7A746E",
            }}>
              Candidature en cours d&apos;examen
            </span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 42,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#0A0A0A",
            margin: "0 0 20px",
            lineHeight: 1.15,
          }}>
            Accès en attente de validation.
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 15,
            color: "#7A746E",
            lineHeight: 1.75,
            margin: "0 0 40px",
          }}>
            Votre profil est en cours d&apos;examen par l&apos;équipe CROCHETT.
            Chaque admission est traitée individuellement.
            Vous recevrez un email dès que votre candidature sera approuvée.
          </p>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #E0DAD0", marginBottom: 32 }} />

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              padding: "16px 20px",
              border: "1px solid #E0DAD0",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  marginBottom: 3,
                }}>
                  Délai de réponse
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                }}>
                  48h en moyenne après réception du dossier
                </div>
              </div>
            </div>

            <div style={{
              padding: "16px 20px",
              border: "1px solid #E0DAD0",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  marginBottom: 3,
                }}>
                  Contact
                </div>
                <a href="mailto:contact@crochett.ai" style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                  textDecoration: "none",
                }}>
                  contact@crochett.ai
                </a>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 36 }}>
            <Link href="/login" style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "1px solid #E0DAD0",
              paddingBottom: 2,
            }}>
              ← Retour à la connexion
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "20px 48px",
        borderTop: "1px solid #E0DAD0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          color: "#C8C2B8",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}>
          CROCHETT. · Infrastructure privée de transactions
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          color: "#C8C2B8",
        }}>
          crochett.ai
        </span>
      </footer>

    </div>
  )
}
