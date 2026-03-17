"use client";

import Link from "next/link";

const REGISTER_URL = "/register?ref=sowefund&role=investisseur";

export default function SowefundPartnerPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F5F2EE" }}>

      {/* ── HEADER ── */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
        paddingInline: "clamp(24px, 5vw, 80px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              CROCHET.
            </span>
          </Link>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            color: "#555",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            ×
          </span>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            SOWEFUND
          </span>
        </div>

        <Link href={REGISTER_URL} style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#0A0A0A",
          background: "#FFFFFF",
          textDecoration: "none",
          padding: "10px 24px",
          display: "inline-block",
        }}>
          Accéder →
        </Link>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "#F5F2EE",
        padding: "96px clamp(24px, 5vw, 80px) 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Watermark */}
        <div style={{
          position: "absolute", right: -60, top: -40,
          fontSize: 500, fontFamily: "var(--font-playfair), Georgia, serif",
          fontWeight: 700, color: "rgba(0,0,0,0.03)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
        }}>C</div>

        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#7A746E", marginBottom: 32,
          }}>
            Partenariat exclusif · Sowefund × Crochet
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 800,
            color: "#0A0A0A",
            margin: "0 0 8px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 760,
          }}>
            Sowefund vous ouvre l&apos;accès
          </h1>
          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 800,
            color: "#0A0A0A",
            margin: "0 0 40px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}>
            au M&amp;A PME qualifié par IA.
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 17,
            color: "#5A5450",
            margin: "0 0 48px",
            lineHeight: 1.75,
            maxWidth: 540,
          }}>
            Cessions de sociétés entre 500k et 5M€, analysées par IA, avec
            NDA automatique et closing intégré. Un service sélectionné par
            Sowefund, en accès exclusif pour ses membres.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Link href={REGISTER_URL} style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              background: "#0A0A0A",
              textDecoration: "none",
              padding: "16px 40px",
              display: "inline-block",
            }}>
              Demander mon accès →
            </Link>
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              color: "#B0AA9E",
              letterSpacing: "0.08em",
            }}>
              Trial 14 jours offert · Aucune carte requise
            </span>
          </div>
        </div>
      </section>

      {/* ── POURQUOI ── */}
      <section style={{
        background: "#0A0A0A",
        padding: "72px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#666", marginBottom: 48,
          }}>
            Pourquoi ce partenariat
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 1,
            background: "#1A1A1A",
          }}>
            {[
              {
                num: "01",
                title: "Deal flow hors levée de fonds",
                body: "Vos investisseurs cherchent du rendement sur l'économie réelle. Les PME en cession entre 500k et 5M€ représentent 85% des transactions M&A en France — et restent sous-adressées.",
              },
              {
                num: "02",
                title: "Qualification IA avant contact",
                body: "Chaque dossier est analysé par IA (Claude Opus) : EBITDA, valorisation, secteur, maturité. Vous recevez un MÉMO structuré et un D-Score avant d'engager la moindre conversation.",
              },
              {
                num: "03",
                title: "NDA automatique + Secure Room",
                body: "Dès qu'un match est validé, une Room privée s'ouvre avec NDA signé des deux côtés. Chat chiffré, documents partagés, propositions de RDV — tout est intégré.",
              },
            ].map((item) => (
              <div key={item.num} style={{
                background: "#0A0A0A",
                padding: "36px 32px",
                borderTop: "1px solid #1E1E1E",
              }}>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10, color: "#444", letterSpacing: "0.1em", marginBottom: 20,
                }}>
                  {item.num}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 22, fontWeight: 700, color: "#FFFFFF",
                  margin: "0 0 14px", lineHeight: 1.2,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13, color: "#888", lineHeight: 1.75, margin: 0,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFRE PARTENAIRE ── */}
      <section style={{
        background: "#FFFFFF",
        borderTop: "1px solid #E0DAD0",
        borderBottom: "1px solid #E0DAD0",
        padding: "72px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "start",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                color: "#7A746E", marginBottom: 24,
              }}>
                Offre réservée Sowefund
              </div>
              <h2 style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(32px, 3.5vw, 48px)",
                fontWeight: 700, color: "#0A0A0A",
                margin: "0 0 24px", lineHeight: 1.1,
              }}>
                14 jours pour voir ce que le marché ne montre pas.
              </h2>
              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 15, color: "#7A746E", lineHeight: 1.8, margin: 0,
              }}>
                Accès complet à la plateforme — dossiers qualifiés en temps réel,
                matching algorithmique, Secure Rooms. Sans engagement.
                Si vous ne trouvez pas de valeur en 14 jours, on se serre la main et on passe.
              </p>
            </div>

            <div style={{
              background: "#F5F2EE",
              border: "1px solid #E0DAD0",
              padding: "36px 40px",
            }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#7A746E", marginBottom: 28, paddingBottom: 20,
                borderBottom: "1px solid #E0DAD0",
              }}>
                Ce que vous obtenez
              </div>
              {[
                "Trial 14 jours offert (aucune carte requise)",
                "Accès illimité aux dossiers qualifiés",
                "Matching algorithmique personnalisé",
                "Secure Rooms avec NDA automatique",
                "Support prioritaire via votre contact Sowefund",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18,
                }}>
                  <span style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 10, color: "#16A34A", flexShrink: 0, paddingTop: 1,
                  }}>
                    ✓
                  </span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14, color: "#0A0A0A", lineHeight: 1.5,
                  }}>
                    {item}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E0DAD0", paddingTop: 28, marginTop: 8 }}>
                <Link href={REGISTER_URL} style={{
                  display: "block", textAlign: "center",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#FFFFFF", background: "#0A0A0A", padding: "16px 0", textDecoration: "none",
                }}>
                  Demander mon accès →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0A0A0A",
        borderTop: "1px solid #1A1A1A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "28px clamp(24px, 5vw, 80px)",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <span style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 14, fontWeight: 700, color: "#AAA",
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          CROCHET.
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9, color: "#444", letterSpacing: "0.08em",
        }}>
          © 2025 CROCHET — CONFIDENTIEL
        </span>
      </footer>

    </div>
  );
}
