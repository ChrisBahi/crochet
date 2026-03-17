"use client";

import Link from "next/link";

const CONTACT_EMAIL = "contact@crochett.ai";
const CONTACT_SUBJECT = encodeURIComponent("Partenariat apporteur d'affaires — Expert-comptable");
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${CONTACT_SUBJECT}`;

export default function ExpertsComptablesPage() {
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
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "0.04em",
          }}>
            EXPERTS-COMPTABLES
          </span>
        </div>

        <a href={CONTACT_HREF} style={{
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
          Devenir partenaire →
        </a>
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
            Programme apporteur d'affaires · 20% de rev share récurrent
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 800,
            color: "#0A0A0A",
            margin: "0 0 8px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 760,
          }}>
            Vos clients ont des projets de cession.
          </h1>
          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 800,
            color: "#0A0A0A",
            margin: "0 0 40px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}>
            Vous les accompagnez — et vous êtes rémunéré.
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 17,
            color: "#5A5450",
            margin: "0 0 48px",
            lineHeight: 1.75,
            maxWidth: 540,
          }}>
            Recommandez Crochet. à vos clients cédants ou repreneurs.
            À chaque abonnement activé, vous touchez 20% récurrents — sans
            gestion, sans friction, sans engagement.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <a href={CONTACT_HREF} style={{
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
              Devenir apporteur d'affaires →
            </a>
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              color: "#B0AA9E",
              letterSpacing: "0.08em",
            }}>
              Gratuit · Convention signée · Suivi en temps réel
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
            Pourquoi devenir apporteur
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
                title: "Vous connaissez déjà les cédants",
                body: "En tant qu'expert-comptable, vous êtes le premier informé des projets de cession de vos clients. Vous n'avez pas à chercher — vous recommandez au bon moment.",
              },
              {
                num: "02",
                title: "Zéro friction, zéro vente",
                body: "Vous ne vendez rien. Vous recommandez un outil. Votre client s'inscrit avec votre lien, vous êtes automatiquement crédité. Convention apporteur signée en 5 minutes.",
              },
              {
                num: "03",
                title: "20% récurrents, pas une commission ponctuelle",
                body: "Tant que votre client est abonné, vous touchez 20% de son abonnement chaque mois. Starter 290€ → 58€/mois. Pro 590€ → 118€/mois. Scale 1490€ → 298€/mois.",
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

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{
        background: "#F5F2EE",
        padding: "72px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#7A746E", marginBottom: 48,
          }}>
            Comment ça marche
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 2,
            background: "#E0DAD0",
          }}>
            {[
              {
                step: "1",
                title: "Vous signalez votre intérêt",
                body: "Répondez à ce mail pour recevoir votre convention apporteur et votre lien de tracking personnalisé.",
              },
              {
                step: "2",
                title: "Vous recommandez",
                body: "Partagez votre lien à vos clients concernés par une cession ou une reprise. Aucun argumentaire commercial requis.",
              },
              {
                step: "3",
                title: "Votre client s'inscrit",
                body: "Il active son essai 14 jours, puis choisit un plan. Vous êtes automatiquement lié à son compte.",
              },
              {
                step: "4",
                title: "Vous percevez 20% récurrents",
                body: "Virement mensuel automatique. Dashboard de suivi en temps réel. Tant que le client est abonné, vous touchez.",
              },
            ].map((item) => (
              <div key={item.step} style={{
                background: "#F5F2EE",
                padding: "36px 28px",
              }}>
                <div style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: 40, fontWeight: 800, color: "#E0DAD0",
                  lineHeight: 1, marginBottom: 20,
                }}>
                  {item.step}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14, fontWeight: 700, color: "#0A0A0A",
                  margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "0.01em",
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13, color: "#7A746E", lineHeight: 1.75, margin: 0,
                }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULATION ── */}
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
                Simulation de revenus
              </div>
              <h2 style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(32px, 3.5vw, 48px)",
                fontWeight: 700, color: "#0A0A0A",
                margin: "0 0 24px", lineHeight: 1.1,
              }}>
                5 clients abonnés. Un revenu passif structuré.
              </h2>
              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 15, color: "#7A746E", lineHeight: 1.8, margin: 0,
              }}>
                Un expert-comptable avec 200 clients a statistiquement
                5 à 10 projets de cession ou reprise actifs chaque année.
                Chaque recommandation convertie devient un revenu récurrent
                sans charge supplémentaire.
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
                Exemple · 5 clients Plan Pro (590€/mois)
              </div>

              {[
                { label: "Abonnement client", value: "590 €/mois" },
                { label: "Votre part (20%)", value: "118 €/mois par client" },
                { label: "5 clients → revenu mensuel", value: "590 €/mois" },
                { label: "Revenu annuel récurrent", value: "7 080 €/an" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 16,
                  paddingBottom: i < 3 ? 16 : 0,
                  borderBottom: i < 3 ? "1px solid #E0DAD0" : "none",
                }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13, color: "#7A746E",
                  }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 13, fontWeight: 700,
                    color: i === 3 ? "#16A34A" : "#0A0A0A",
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: "1px solid #E0DAD0", paddingTop: 28, marginTop: 8 }}>
                <a href={CONTACT_HREF} style={{
                  display: "block", textAlign: "center",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "#FFFFFF", background: "#0A0A0A", padding: "16px 0", textDecoration: "none",
                }}>
                  Rejoindre le programme →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{
        background: "#F5F2EE",
        padding: "72px clamp(24px, 5vw, 80px)",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#7A746E", marginBottom: 48,
          }}>
            Questions fréquentes
          </div>

          {[
            {
              q: "Est-ce que je dois vendre quelque chose à mes clients ?",
              a: "Non. Vous recommandez un outil. Vous envoyez votre lien, votre client s'inscrit s'il est intéressé. Aucun argumentaire commercial, aucune obligation de résultat.",
            },
            {
              q: "Y a-t-il un engagement de durée ?",
              a: "Aucun. La convention apporteur est résiliable à tout moment. Les commissions sur les clients déjà convertis continuent tant qu'ils restent abonnés.",
            },
            {
              q: "Comment sont calculées et versées les commissions ?",
              a: "20% du montant HT de chaque abonnement mensuel ou annuel. Versement mensuel par virement, avec tableau de bord de suivi en temps réel.",
            },
            {
              q: "Mes clients gardent-ils leur confidentialité ?",
              a: "Oui. La plateforme est conçue pour ça : identité confidentielle jusqu'au NDA signé, données chiffrées, dossiers accessibles uniquement aux parties validées.",
            },
          ].map((item, i) => (
            <div key={i} style={{
              borderTop: "1px solid #D5CFC8",
              padding: "28px 0",
            }}>
              <h4 style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14, fontWeight: 700, color: "#0A0A0A",
                margin: "0 0 12px", lineHeight: 1.4,
              }}>
                {item.q}
              </h4>
              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 13, color: "#7A746E", lineHeight: 1.75, margin: 0,
              }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        background: "#0A0A0A",
        padding: "80px clamp(24px, 5vw, 80px)",
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9, color: "#444", letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 32,
        }}>
          PROGRAMME APPORTEUR D'AFFAIRES
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(32px, 4vw, 56px)",
          fontWeight: 800, color: "#FFFFFF",
          margin: "0 0 16px", lineHeight: 1.1,
        }}>
          Une recommandation.
        </h2>
        <h2 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: "clamp(32px, 4vw, 56px)",
          fontWeight: 800, color: "#FFFFFF",
          margin: "0 0 40px", lineHeight: 1.1,
        }}>
          Un revenu récurrent.
        </h2>
        <a href={CONTACT_HREF} style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#0A0A0A", background: "#FFFFFF",
          padding: "18px 48px", textDecoration: "none",
          display: "inline-block",
        }}>
          Rejoindre le programme →
        </a>
        <div style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10, color: "#444", letterSpacing: "0.08em",
          marginTop: 24,
        }}>
          contact@crochett.ai · Réponse sous 24h
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
          © 2025 CROCHET — PROGRAMME PARTENAIRES
        </span>
      </footer>

    </div>
  );
}
