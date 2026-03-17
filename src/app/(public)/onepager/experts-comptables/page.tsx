"use client";

export default function OnepagerExpertsComptables() {
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 14mm;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page { box-shadow: none !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #E8E4DF; }
        .page {
          width: 210mm;
          min-height: 297mm;
          background: #FFFFFF;
          margin: 0 auto;
          padding: 14mm 16mm 12mm;
          font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
          box-shadow: 0 4px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          gap: 0;
        }
      `}</style>

      {/* Bouton impression */}
      <div className="no-print" style={{
        textAlign: "center",
        padding: "20px 0 12px",
        fontFamily: "monospace",
        fontSize: 12,
        color: "#888",
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#0A0A0A",
            color: "#FFF",
            border: "none",
            padding: "10px 28px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          Imprimer / Exporter PDF →
        </button>
        <div style={{ marginTop: 8 }}>Chrome : Imprimer → Enregistrer en PDF · Désactiver les en-têtes/pieds de page</div>
      </div>

      <div className="page">

        {/* ── TOP BAR ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #0A0A0A",
          paddingBottom: 10,
          marginBottom: 22,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#0A0A0A",
            }}>CROCHET.</span>
            <span style={{ fontSize: 13, color: "#888" }}>×</span>
            <span style={{
              fontFamily: "Georgia, serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#0A0A0A",
            }}>EXPERTS-COMPTABLES</span>
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#999",
          }}>
            PROGRAMME APPORTEUR D&apos;AFFAIRES — MARS 2026
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: 34,
            fontWeight: 800,
            color: "#0A0A0A",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            marginBottom: 10,
          }}>
            Vos clients cédants méritent<br />
            mieux qu&apos;une annonce Le Bon Coin.
          </h1>
          <p style={{
            fontSize: 13,
            color: "#5A5450",
            lineHeight: 1.7,
            maxWidth: "85%",
          }}>
            En tant qu'expert-comptable, vous connaissez avant tout le monde les cédants de votre
            portefeuille. Crochet transforme cette connaissance en revenus récurrents —
            <strong> 20% de rev share</strong> sur chaque client que vous amenez, sans aucune friction commerciale.
          </p>
        </div>

        {/* ── 2 COLONNES PRINCIPALES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>

          {/* Colonne gauche */}
          <div>
            <Section label="Pourquoi vous êtes idéalement placé">
              {[
                ["Vous savez qui va céder", "Vos clients vous parlent de leur retraite, de leur succession, de leur envie de passer la main — souvent 2 à 3 ans avant d'agir."],
                ["Vous êtes de confiance", "Recommander Crochet, c'est signer de votre nom. Ce n'est pas de la vente, c'est un service rendu au bon moment."],
                ["Zéro effort commercial", "Un email, un lien. On s'occupe du reste : qualification IA, matching, closing sécurisé."],
              ].map(([titre, body]) => (
                <div key={titre} style={{ marginBottom: 11 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0A0A0A", marginBottom: 2 }}>{titre}</div>
                  <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </Section>

            <Section label="Comment ça marche">
              {[
                ["1 — Vous recommandez", "Vous envoyez le lien Crochet à votre client. Il s'inscrit via votre lien tracké."],
                ["2 — Crochet qualifie", "L'IA analyse le dossier, génère un MÉMO + D-Score, trouve les repreneurs."],
                ["3 — Vous touchez 20%", "Sur chaque abonnement payant de votre filleul, automatiquement, chaque mois."],
              ].map(([titre, body]) => (
                <div key={titre} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#0A0A0A",
                    fontWeight: 700,
                    flexShrink: 0,
                    paddingTop: 1,
                  }}>{titre.split(" — ")[0]}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0A0A0A", marginBottom: 2 }}>
                      {titre.split(" — ")[1]}
                    </div>
                    <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.6 }}>{body}</div>
                  </div>
                </div>
              ))}
            </Section>
          </div>

          {/* Colonne droite */}
          <div>
            <Section label="Ce que vous gagnez concrètement">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  ["20%", "rev share mensuel récurrent"],
                  ["290 – 1490 €", "tarif mensuel côté client"],
                  ["58 – 298 €", "que vous touchez / mois / client"],
                  ["0 €", "d'effort commercial de votre part"],
                ].map(([val, label]) => (
                  <div key={label} style={{
                    background: "#F5F2EE",
                    border: "1px solid #E0DAD0",
                    padding: "11px 13px",
                  }}>
                    <div style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 19,
                      fontWeight: 700,
                      color: "#0A0A0A",
                      lineHeight: 1,
                      marginBottom: 4,
                    }}>{val}</div>
                    <div style={{ fontSize: 10, color: "#888", lineHeight: 1.4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section label="Ce que vous obtenez en rejoignant">
              {[
                "Lien tracké personnalisé (ref=votre-cabinet)",
                "Dashboard suivi de vos filleuls en temps réel",
                "Convention apporteur d'affaires signée",
                "Beta gratuite 3 mois pour votre propre accès",
                "Formation accès plateforme (30 min, en visio)",
                "Priorité sur les matchs de votre région",
              ].map((item) => (
                <div key={item} style={{
                  display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7,
                }}>
                  <span style={{ fontSize: 10, color: "#16A34A", flexShrink: 0, paddingTop: 2 }}>✓</span>
                  <span style={{ fontSize: 11, color: "#0A0A0A", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </Section>
          </div>
        </div>

        {/* ── SIMULATION REVENUS ── */}
        <div style={{
          background: "#0A0A0A",
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#555",
            marginBottom: 12,
          }}>
            Simulation revenus — pour un cabinet de 80 clients
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              ["2 cédants/an", "qui s'abonnent", "scénario conservateur"],
              ["~150 €/mois", "revenus récurrents", "en régime de croisière"],
              ["5 cédants/an", "scénario réaliste", "~375 €/mois récurrents"],
              ["20%", "sans risque", "aucun stock, aucune mise de fonds"],
            ].map(([val, unit, label]) => (
              <div key={label}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}>{val}</span>
                  <span style={{ fontSize: 10, color: "#666" }}>{unit}</span>
                </div>
                <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROCHAINES ÉTAPES ── */}
        <div style={{
          border: "1px solid #E0DAD0",
          padding: "14px 18px",
          marginBottom: 18,
        }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 12,
          }}>
            Pour démarrer — 3 étapes, moins de 48h
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["01", "Convention signée", "On vous envoie la convention apporteur d'affaires par email. Signature électronique, 5 minutes."],
              ["02", "Votre lien tracké", "Vous recevez votre URL personnalisée + tableau de bord filleuls."],
              ["03", "Premier test", "Pensez à un client qui parle de céder. Envoyez-lui le lien. Observez."],
            ].map(([num, titre, body]) => (
              <div key={num}>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 10, color: "#CCC", marginBottom: 6,
                }}>{num}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0A0A0A", marginBottom: 3 }}>{titre}</div>
                <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.5 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          borderTop: "1px solid #E0DAD0",
          paddingTop: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
        }}>
          <div style={{ fontSize: 11, color: "#0A0A0A" }}>
            <strong>crochett.ai</strong>
            <span style={{ color: "#999", marginLeft: 16 }}>contact@crochett.ai</span>
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 9,
            color: "#BBB",
            letterSpacing: "0.08em",
          }}>
            crochett.ai/partenaires/experts-comptables
          </div>
        </div>

      </div>

      <div className="no-print" style={{ height: 40 }} />
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "monospace",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#7A746E",
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "1px solid #E8E4DF",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}
