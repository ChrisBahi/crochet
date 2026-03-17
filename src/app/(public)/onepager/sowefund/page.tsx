"use client";

export default function OnepagerSowefund() {
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

      {/* Bouton impression — masqué à l'impression */}
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
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#0A0A0A",
            }}>SOWEFUND</span>
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#999",
          }}>
            CONFIDENTIEL — MARS 2026
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
            Deal flow M&A PME qualifié par IA —<br />
            le segment que Sowefund ne couvre pas encore.
          </h1>
          <p style={{
            fontSize: 13,
            color: "#5A5450",
            lineHeight: 1.7,
            maxWidth: "85%",
          }}>
            Cessions de sociétés entre <strong>500k et 5M€</strong>, analysées automatiquement,
            avec NDA intégré et closing sécurisé. Un canal complémentaire pour vos investisseurs
            qui cherchent du rendement sur l'économie réelle.
          </p>
        </div>

        {/* ── 2 COLONNES PRINCIPALES ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 22 }}>

          {/* Colonne gauche — Le problème / La solution */}
          <div>
            <Section label="Le problème">
              <p style={{ fontSize: 12, color: "#5A5450", lineHeight: 1.7 }}>
                <strong>85%</strong> des transactions M&A en France sont des PME entre 500k et 5M€.
                Elles restent sous-adressées : trop petites pour les banques d'affaires,
                trop complexes pour les plateformes grand public.
              </p>
              <p style={{ fontSize: 12, color: "#5A5450", lineHeight: 1.7, marginTop: 8 }}>
                Vos investisseurs le savent — ils manquent juste d'un deal flow qualifié,
                sécurisé, et structuré.
              </p>
            </Section>

            <Section label="Ce que Crochet apporte">
              {[
                ["Analyse IA automatique", "Chaque dossier reçoit un MÉMO structuré + D-Score (Claude Opus) avant tout contact humain."],
                ["Matching algorithmique", "L'IA croise critères secteur, taille, horizon et stratégie. Seuls les matchs pertinents remontent."],
                ["Secure Room + NDA auto", "Dès validation, une room privée s'ouvre : NDA signé des deux côtés, chat chiffré, docs partagés."],
              ].map(([titre, body]) => (
                <div key={titre} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#0A0A0A", marginBottom: 2 }}>
                    {titre}
                  </div>
                  <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </Section>
          </div>

          {/* Colonne droite — Chiffres + Offre */}
          <div>
            <Section label="Chiffres clés">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["500k – 5M€", "Taille cible des cessions"],
                  ["85%", "du volume M&A France"],
                  ["14 jours", "Trial offert Sowefund"],
                  ["< 48h", "Analyse IA d'un dossier"],
                ].map(([val, label]) => (
                  <div key={label} style={{
                    background: "#F5F2EE",
                    border: "1px solid #E0DAD0",
                    padding: "12px 14px",
                  }}>
                    <div style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 20,
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

            <Section label="Offre partenariat Sowefund">
              {[
                "Trial 14 jours offert — aucune carte requise",
                "Bypass qualification : accès direct formulaire investisseur",
                "Support prioritaire via contact Sowefund dédié",
                "Convention apporteur d'affaires (rev share 20%)",
                "Co-branding possible : landing /partenaires/sowefund",
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

        {/* ── MODÈLE ÉCONOMIQUE ── */}
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
            Modèle économique — Fonds & Family Office
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              ["5 000 – 10 000 €", "/mois/client", "Tarif cible fonds"],
              ["10 clients", "= 600 k€/an", "Objectif an 1"],
              ["20%", "rev share", "Sur chaque apport Sowefund"],
            ].map(([val, unit, label]) => (
              <div key={label}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}>{val}</span>
                  <span style={{ fontSize: 11, color: "#666" }}>{unit}</span>
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{label}</div>
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
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 12,
          }}>
            Prochaines étapes proposées
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["01", "Convention apporteur d'affaires", "Signature du partenariat + rev share 20%"],
              ["02", "Onboarding 5 investisseurs beta", "Accès gratuit 14j, feedback direct"],
              ["03", "Co-branding & distribution", "Email Sowefund + landing dédiée live"],
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
            crochett.ai/partenaires/sowefund · ref=sowefund
          </div>
        </div>

      </div>

      {/* Marge basse hors impression */}
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
