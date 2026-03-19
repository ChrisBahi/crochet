import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programme Apporteur — Crochet. × Experts-comptables",
  description: "One-pager programme apporteur d'affaires — rev share 20%",
  robots: "noindex",
}

export default function OnePageExpertsComptables() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "DM Sans, system-ui, sans-serif", color: "#0A0A0A" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "56px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, paddingBottom: 32, borderBottom: "2px solid #0A0A0A" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", color: "#7A746E", textTransform: "uppercase", marginBottom: 10 }}>
              CROCHET.AI — PROGRAMME PARTENAIRES
            </div>
            <h1 style={{ fontSize: 36, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, lineHeight: 1.15, margin: "0 0 10px" }}>
              Programme apporteur<br /><em>experts-comptables</em>
            </h1>
            <p style={{ fontSize: 14, color: "#7A746E", margin: 0 }}>
              Rev share 20% · Zéro friction · Bêta gratuite — Mars 2026
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em" }}>
              CROCHET.
            </div>
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", letterSpacing: "0.1em", marginTop: 4 }}>
              crochett.ai
            </div>
          </div>
        </div>

        {/* Insight */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            01 — POURQUOI LES EXPERTS-COMPTABLES ?
          </div>
          <div style={{ background: "#F5F0E8", borderRadius: 8, padding: "24px 28px", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px", lineHeight: 1.5 }}>
              Vous connaissez tous les cédants de votre portefeuille avant qu'ils ne cèdent.
            </p>
            <p style={{ fontSize: 13, color: "#7A746E", margin: 0, lineHeight: 1.7 }}>
              Bilans, trésorerie, EBITDA, horizons de retraite : vous avez accès à l'information clé 3 à 5 ans avant la cession.
              Crochet. transforme cette connaissance en valeur — pour vos clients, et pour vous.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { value: "6–18 mois", label: "Cycle moyen de cession PME" },
              { value: "500k–5M€", label: "Cessions que nous traitons" },
              { value: "0", label: "Friction pour vous — vous recommandez, on s'occupe du reste" },
            ].map((stat) => (
              <div key={stat.value} style={{ border: "1px solid #E0DAD0", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 20, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "#7A746E", lineHeight: 1.5 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment ça marche */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            02 — COMMENT ÇA MARCHE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { num: "01", title: "Vous identifiez un client cédant", body: "Un client parle de transmission ? Retraite ? Rachat ? Vous pensez à Crochet." },
              { num: "02", title: "Vous lui partagez votre lien partenaire personnalisé", body: "Un lien unique avec votre code référence. Il s'inscrit — son dossier est analysé par notre IA en 60 secondes." },
              { num: "03", title: "On s'occupe de tout", body: "Qualification, matching avec les repreneurs et fonds, NDA, Secure Room. Votre client est en bonne main." },
              { num: "04", title: "Vous touchez 20% du revenu généré", body: "Tant que votre client est abonné. Automatiquement, via virement mensuel." },
            ].map((item) => (
              <div key={item.num} style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "16px 20px", border: "1px solid #E0DAD0", borderRadius: 8 }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#7A746E", flexShrink: 0, paddingTop: 2 }}>{item.num}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#7A746E", lineHeight: 1.5 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ce que vous gagnez */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            03 — CE QUE VOUS GAGNEZ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#0A0A0A", color: "#fff", borderRadius: 8, padding: "24px 24px" }}>
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                Rémunération
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#22c55e" }}>20%</span> du plan Starter (290€/mois) = <strong>58€/mois</strong>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#22c55e" }}>20%</span> du plan Pro (590€/mois) = <strong>118€/mois</strong>
                </div>
                <div>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#22c55e" }}>20%</span> du plan Scale (1490€/mois) = <strong>298€/mois</strong>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #374151", fontSize: 12, color: "#9CA3AF" }}>
                  Récurrent · Tant que le client est actif
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "✓", title: "Valeur ajoutée client", body: "Vous proposez une solution concrète à vos clients en réflexion de cession — pas juste du conseil." },
                { icon: "✓", title: "Zéro effort commercial", body: "Vous ne vendez pas. Vous recommandez. La plateforme se vend seule — IA, NDA, matching." },
                { icon: "✓", title: "Accès bêta gratuit", body: "Période bêta : vous testez pour vos clients sans engagement, avant tout le monde." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: 12, fontSize: 13, padding: "14px 16px", border: "1px solid #E0DAD0", borderRadius: 8 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ color: "#7A746E", lineHeight: 1.5 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ce que fait la plateforme */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            04 — LA PLATEFORME EN 3 POINTS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { num: "01", title: "Qualification IA", body: "Le dossier PDF de votre client est analysé en 60 secondes : CA, EBITDA, valorisation, secteur. MÉMO structuré + D-Score." },
              { num: "02", title: "Matching ciblé", body: "Chaque dossier est mis en regard des critères de fonds et repreneurs actifs. Seuls les matches pertinents sont présentés." },
              { num: "03", title: "Secure Room NDA", body: "Un match déclenche une Room privée. NDA automatique, chat sécurisé, partage de documents, proposition de RDV." },
            ].map((item) => (
              <div key={item.num} style={{ background: "#F5F0E8", borderRadius: 8, padding: "20px 20px" }}>
                <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", marginBottom: 8 }}>{item.num}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#7A746E", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div style={{ marginBottom: 48, background: "#F5F0E8", borderRadius: 8, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Rejoindre la bêta partenaires</div>
            <div style={{ fontSize: 13, color: "#7A746E" }}>
              5 cabinets max en bêta. Accès gratuit + accompagnement dédié.
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>contact@crochett.ai</div>
            <div style={{ fontSize: 12, color: "#7A746E", marginTop: 2 }}>crochett.ai/partenaires/experts-comptables</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 24, borderTop: "1px solid #E0DAD0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", letterSpacing: "0.1em" }}>
            CONFIDENTIEL — NE PAS DIFFUSER
          </div>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#7A746E" }}>
            contact@crochett.ai · crochett.ai
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body { margin: 0; }
            @page { margin: 1cm 1.5cm; size: A4; }
          }
        `}</style>
      </div>
    </div>
  )
}
