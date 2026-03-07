import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));

  const appHref = session ? "/app" : "/login";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid #1A1A1A",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 11A9 9 0 1 1 11 2"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.02em",
          }}>
            rochet.
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href={appHref} style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#7A746E",
            textDecoration: "none",
          }}>
            {session ? "Tableau de bord" : "Se connecter"}
          </Link>
          <Link href="/register" style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#0A0A0A",
            background: "#FFFFFF",
            padding: "8px 20px",
            textDecoration: "none",
          }}>
            Demander l&apos;accès
          </Link>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "#0A0A0A",
        padding: "100px 48px 80px",
        borderBottom: "1px solid #1A1A1A",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Overline */}
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#555",
            marginBottom: 32,
          }}>
            Infrastructure privée · Transactions M&amp;A · Accès sur sélection
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(48px, 6vw, 80px)",
            fontWeight: 700,
            color: "#FFFFFF",
            margin: "0 0 16px",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            maxWidth: 820,
          }}>
            Le signal, pas le bruit.
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 18,
            color: "#555",
            margin: "0 0 56px",
            lineHeight: 1.7,
            maxWidth: 560,
          }}>
            CROCHET transforme un dossier brut en signal investissable —
            qualification IA, matching ciblé, Secure Room pour chaque deal.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link href="/register" style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#0A0A0A",
              background: "#FFFFFF",
              padding: "16px 40px",
              textDecoration: "none",
            }}>
              Demander l&apos;accès
            </Link>
            <Link href={appHref} style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#7A746E",
              border: "1px solid #2A2A2A",
              padding: "16px 40px",
              textDecoration: "none",
            }}>
              {session ? "Accéder à la plateforme" : "Se connecter →"}
            </Link>
          </div>

          {/* KPIs */}
          <div style={{
            display: "flex",
            gap: 0,
            marginTop: 72,
            borderTop: "1px solid #1A1A1A",
            paddingTop: 40,
          }}>
            {[
              { value: "NDA", label: "Signé avant chaque room" },
              { value: "IA", label: "Qualification automatique" },
              { value: "2", label: "Parties pour clôturer" },
              { value: "48h", label: "Délai de réponse admission" },
            ].map((kpi, i) => (
              <div key={i} style={{
                flex: 1,
                paddingRight: 32,
                borderRight: i < 3 ? "1px solid #1A1A1A" : "none",
                paddingLeft: i > 0 ? 32 : 0,
              }}>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {kpi.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  color: "#555",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TROIS PILIERS ── */}
      <section style={{
        background: "#F5F2EE",
        padding: "80px 48px",
        borderBottom: "1px solid #E0DAD0",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

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
                body: "Un match validé ouvre une Room privée. Chat chiffré, partage de documents, appel Vision, propositions de RDV, et validation bilatérale du deal. Tout en un seul endroit.",
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

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{
        background: "#FFFFFF",
        padding: "80px 48px",
        borderBottom: "1px solid #E0DAD0",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 48,
          }}>
            Protocole
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
            {[
              {
                step: "01",
                title: "Soumission",
                body: "Déposez un document ou remplissez le formulaire. Le moteur IA qualifie en temps réel.",
              },
              {
                step: "02",
                title: "Qualification",
                body: "MEMO structuré généré. D-Score attribué. Le dossier est rendu visible aux membres correspondants.",
              },
              {
                step: "03",
                title: "Match",
                body: "Une contrepartie identifiée valide le match. Les deux parties confirment l'intérêt.",
              },
              {
                step: "04",
                title: "Closing",
                body: "La Secure Room s'ouvre. NDA signé. Négociation. Validation bilatérale. Documents déverrouillés.",
              },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "0 32px 0",
                borderLeft: "1px solid #E0DAD0",
                paddingLeft: 32,
                paddingRight: i < 3 ? 32 : 0,
                position: "relative",
              }}>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#F0EDE8",
                  lineHeight: 1,
                  marginBottom: 16,
                  letterSpacing: "-0.02em",
                }}>
                  {s.step}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0A0A0A",
                  marginBottom: 10,
                }}>
                  {s.title}
                </div>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  color: "#7A746E",
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION ── */}
      <section style={{
        background: "#0A0A0A",
        padding: "100px 48px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 64 }}>

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
              Chaque membre est vérifié avant admission. CROCHET est réservé aux
              professionnels du deal — fonds d&apos;investissement, family offices,
              advisors M&A, dirigeants de sociétés en cession ou en croissance.
            </p>
          </div>

          <div style={{
            flex: "0 0 380px",
            border: "1px solid #1A1A1A",
            padding: "40px",
          }}>
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
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 9,
                  color: "#333",
                  flexShrink: 0,
                  paddingTop: 2,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  color: "#888",
                  lineHeight: 1.5,
                }}>
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
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 11A9 9 0 1 1 11 2"
              stroke="#444"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#444",
            letterSpacing: "0.02em",
          }}>
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
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#2A2A2A",
          letterSpacing: "0.08em",
        }}>
          © 2025 CROCHET — CONFIDENTIEL
        </span>
      </footer>

    </div>
  );
}
