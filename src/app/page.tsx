import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

  const appHref = session ? "/app" : "/login";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F5F2EE" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
        paddingInline: 48,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M17 8.5A6 6 0 1 0 17 15.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.01em",
          }}>
            rochet.
          </span>
        </Link>

        {/* Right nav — no middle links */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={appHref} style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#FFFFFF",
            textDecoration: "none",
            padding: "8px 20px",
            border: "1px solid #3A3A3A",
          }}>
            {session ? "Tableau de bord" : "Accès privé"}
          </Link>
          <Link href="/register" style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#0A0A0A",
            background: "#FFFFFF",
            textDecoration: "none",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            Candidater →
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "#F5F2EE",
        padding: "80px 48px 0",
        flex: 1,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background watermark C */}
        <div style={{
          position: "absolute",
          right: -60,
          top: -40,
          fontSize: 600,
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontWeight: 700,
          color: "rgba(0,0,0,0.04)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.05em",
        }}>
          C
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "flex-start" }}>

          {/* Left */}
          <div style={{ paddingBottom: 80 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#7A746E",
              marginBottom: 36,
            }}>
              Infrastructure · Transactions privées
            </div>

            <h1 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontSize: "clamp(52px, 5.5vw, 76px)",
              fontWeight: 800,
              color: "#0A0A0A",
              margin: "0 0 0",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
              Le signal,
            </h1>
            <h1 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(52px, 5.5vw, 76px)",
              fontWeight: 800,
              color: "#0A0A0A",
              margin: "0 0 40px",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
              pas le bruit.
            </h1>

            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 16,
              color: "#5A5450",
              margin: "0 0 44px",
              lineHeight: 1.75,
              maxWidth: 480,
            }}>
              Crochet. organise les introductions qualifiées entre acteurs
              sérieux du marché privé. Accès sur invitation. Matching
              algorithmique. Discrétion absolue.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href={appHref} style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "#FFFFFF",
                background: "#0A0A0A",
                padding: "14px 32px",
                textDecoration: "none",
              }}>
                Accéder à la plateforme
              </Link>
              <Link href="/register" style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#0A0A0A",
                background: "transparent",
                border: "1px solid #C8C2B8",
                padding: "14px 32px",
                textDecoration: "none",
              }}>
                Soumettre une demande
              </Link>
            </div>

            <div style={{
              marginTop: 36,
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "#B0AA9E",
              textTransform: "uppercase",
            }}>
              Accès sur invitation · Données confidentielles · Infrastructure sécurisée
            </div>
          </div>

          {/* Right — Deal card mockup */}
          <div style={{ paddingTop: 40, paddingBottom: 0 }}>
            <div style={{
              background: "#FFFFFF",
              border: "1px solid #E0DAD0",
              padding: "28px 32px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}>
              {/* Card header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid #F0EDE8",
              }}>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#7A746E",
                }}>
                  Signal actif — OPP-2847
                </span>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  color: "#16A34A",
                  textTransform: "uppercase",
                }}>
                  ● Live
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#0A0A0A",
                marginBottom: 6,
              }}>
                Services industriels · Lyon
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                color: "#7A746E",
                marginBottom: 28,
              }}>
                Cession majoritaire 65% · CA 4.2M€ · EBITDA 22%
              </div>

              {/* Scores */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 24 }}>
                {[
                  { label: "Taille", value: "12–18M€" },
                  { label: "D-Score", value: "87" },
                  { label: "M-Score", value: "79" },
                ].map((item, i) => (
                  <div key={i} style={{ paddingRight: i < 2 ? 16 : 0, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? "1px solid #F0EDE8" : "none" }}>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#B0AA9E",
                      marginBottom: 6,
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#0A0A0A",
                      letterSpacing: "-0.02em",
                    }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 16 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#B0AA9E",
                  }}>
                    Probabilité closing
                  </span>
                  <span style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 11,
                    color: "#0A0A0A",
                    fontWeight: 600,
                  }}>
                    79%
                  </span>
                </div>
                <div style={{ height: 3, background: "#F0EDE8", borderRadius: 2 }}>
                  <div style={{ height: 3, width: "79%", background: "#0A0A0A", borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TROIS PILIERS ── */}
      <section style={{
        background: "#FFFFFF",
        padding: "80px 48px",
        borderTop: "1px solid #E0DAD0",
        borderBottom: "1px solid #E0DAD0",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 48,
          }}>
            Infrastructure
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
            {[
              {
                num: "01",
                title: "Qualification IA",
                body: "Déposez un PDF, un bilan ou un deck. Le moteur extrait CA, EBITDA, valorisation, secteur — génère un MEMO structuré et un D-Score de maturité. En moins de 60 secondes.",
                tag: "Analyse automatique",
              },
              {
                num: "02",
                title: "Matching ciblé",
                body: "Chaque dossier est confronté aux critères des membres actifs — ticket, géographie, secteur, type d'opération. Seuls les matches pertinents sont présentés.",
                tag: "Pas de spam, pas de bruit",
              },
              {
                num: "03",
                title: "Secure Room",
                body: "Un match validé ouvre une Room privée. Chat chiffré, partage de documents, appel Vision, propositions de RDV, et validation bilatérale du deal.",
                tag: "NDA signé · Closing intégré",
              },
            ].map((pillar, i) => (
              <div key={i} style={{
                padding: "40px 36px",
                borderRight: i < 2 ? "1px solid #E0DAD0" : "none",
                borderLeft: i === 0 ? "1px solid #E0DAD0" : "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10,
                  color: "#C8C2B8",
                  letterSpacing: "0.1em",
                  marginBottom: 20,
                }}>
                  {pillar.num}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#0A0A0A",
                  margin: "0 0 16px",
                  lineHeight: 1.2,
                }}>
                  {pillar.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  color: "#7A746E",
                  lineHeight: 1.75,
                  margin: "0 0 24px",
                }}>
                  {pillar.body}
                </p>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9,
                  color: "#C8C2B8",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  borderTop: "1px solid #E0DAD0",
                  paddingTop: 16,
                }}>
                  {pillar.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION ── */}
      <section style={{ background: "#0A0A0A", padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 64 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#555",
              marginBottom: 24,
            }}>
              Admission sélective
            </div>
            <h2 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(36px, 4vw, 56px)",
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 20px",
              lineHeight: 1.1,
            }}>
              Accès sur candidature.
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 15,
              color: "#555",
              lineHeight: 1.8,
              margin: 0,
              maxWidth: 440,
            }}>
              Chaque membre est vérifié avant admission. Crochet. est réservé aux
              professionnels du deal — fonds d&apos;investissement, family offices,
              advisors M&A, dirigeants de sociétés en cession ou en croissance.
            </p>
          </div>

          <div style={{ flex: "0 0 380px", border: "1px solid #1A1A1A", padding: "40px" }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#555",
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid #1A1A1A",
            }}>
              Profils admis
            </div>

            {[
              "Fonds d'investissement (PE, VC, dette)",
              "Family offices & investisseurs privés",
              "Advisors M&A & banquiers d'affaires",
              "Dirigeants en cession / transmission",
              "Sociétés en levée de fonds",
            ].map((profil, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#333", flexShrink: 0, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                  {profil}
                </span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #1A1A1A", paddingTop: 24, marginTop: 8 }}>
              <Link href="/register" style={{
                display: "block",
                textAlign: "center",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0A0A0A",
                background: "#FFFFFF",
                padding: "14px 0",
                textDecoration: "none",
              }}>
                Soumettre ma candidature
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0A0A0A",
        borderTop: "1px solid #1A1A1A",
        padding: "24px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="1.5" />
            <path d="M17 8.5A6 6 0 1 0 17 15.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#444", letterSpacing: "0.02em" }}>
            rochet.
          </span>
        </span>
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "Connexion", href: "/login" },
            { label: "Candidature", href: "/register" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#3A3A3A",
              textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#2A2A2A", letterSpacing: "0.08em" }}>
          © 2025 CROCHET — CONFIDENTIEL
        </span>
      </footer>

    </div>
  );
}
