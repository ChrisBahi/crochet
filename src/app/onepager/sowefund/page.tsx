import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partenariat Sowefund × Crochet.",
  description: "One-pager partenariat — réunion co-distribution M&A PME",
  robots: "noindex",
  openGraph: {
    title: "Partenariat Sowefund × Crochet.",
    description: "One-pager partenariat — réunion co-distribution M&A PME",
    type: "article",
    url: "/onepager/sowefund",
    images: [{ url: "/og-image.png", width: 1200, height: 1200 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partenariat Sowefund × Crochet.",
    description: "One-pager partenariat — réunion co-distribution M&A PME",
    images: ["/og-image.png"],
  },
}

export default function OnePageSowefund() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "DM Sans, system-ui, sans-serif", color: "#0A0A0A" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, paddingBottom: 28, borderBottom: "2px solid #0A0A0A" }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", color: "#7A746E", textTransform: "uppercase", marginBottom: 10 }}>
              CONFIDENTIEL — PROPOSITION PARTENARIAT
            </div>
            <h1 style={{ fontSize: 32, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, lineHeight: 1.2, margin: "0 0 8px" }}>
              Sowefund vous ouvre l&apos;accès<br />au M<span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>&</span>A PME qualifié par IA.
            </h1>
            <p style={{ fontSize: 13, color: "#7A746E", margin: 0 }}>
              Proposition confidentielle — Mars 2026
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 32 }}>
            <div style={{ fontSize: 22, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em" }}>
              CROCHET.
            </div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", letterSpacing: "0.1em", marginTop: 4 }}>
              × SOWEFUND
            </div>
          </div>
        </div>

        {/* Le gap de marché */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            01 — LE GAP
          </div>
          <div style={{ background: "#0A0A0A", color: "#fff", borderRadius: 8, padding: "18px 22px", fontSize: 14, lineHeight: 1.6 }}>
            <strong>85% des cessions PME (500k–5M€) ne passent par aucune plateforme structurée.</strong>
            {" "}Les cédants et repreneurs se trouvent par réseau ou par hasard — cycle 6–18 mois, taux d'échec élevé.
            Sowefund maîtrise ces réseaux. Crochet. structure le processus.
          </div>
        </div>

        {/* Ce qu'on apporte */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            02 — CE QUE CROCHET.AI APPORTE À VOS CLIENTS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { num: "01", title: "Analyse IA", body: "Dossier scoré en 60 sec. MÉMO structuré + D-Score valorisation. Zéro friction pour le cédant." },
              { num: "02", title: "Matching ciblé", body: "Chaque dossier mis en regard des repreneurs et fonds actifs. Seuls les matches pertinents remontent." },
              { num: "03", title: "Secure Room NDA", body: "Room privée auto-créée. NDA automatique, chat sécurisé, partage documents, RDV intégré." },
            ].map((item) => (
              <div key={item.num} style={{ background: "#F5F0E8", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", marginBottom: 8 }}>{item.num}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#7A746E", lineHeight: 1.55 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chiffres clés */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            03 — CHIFFRES CLÉS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { value: "85%", label: "M&A PME non couverts par les plateformes existantes" },
              { value: "50–100", label: "Leads qualifiés estimés dès la semaine 1 via Sowefund" },
              { value: "5–10k€", label: "Abonnement mensuel fonds & investisseurs" },
              { value: "14j", label: "Trial offert à votre réseau — zéro friction" },
            ].map((stat) => (
              <div key={stat.value} style={{ border: "1px solid #E0DAD0", borderRadius: 8, padding: "14px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Offre partenariat */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            04 — OFFRE PARTENARIAT CO-BRANDÉ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✓", title: "Landing co-brandée Sowefund", body: "Page dédiée crochett.ai/partenaires/sowefund + tracking UTM complet." },
                { icon: "✓", title: "Bypass qualification directe", body: "?ref=sowefund&role=investisseur → accès direct formulaire investisseur." },
                { icon: "✓", title: "Trial 14j offert", body: "Configuré dans Stripe. Vos contacts entrent sans friction commerciale." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: 10, fontSize: 12 }}>
                  <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>{item.icon}</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.title}</span>
                    {" "}<span style={{ color: "#7A746E" }}>{item.body}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#F5F0E8", borderRadius: 8, padding: "18px 20px" }}>
              <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                Modèle économique
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>
                <div style={{ marginBottom: 8 }}>
                  Sowefund recommande → client s'abonne → <strong>20% rev share</strong> récurrent mensuel
                </div>
                <div style={{ fontSize: 12, color: "#7A746E" }}>
                  5k€/mois × 20% = 1 000€/mois par client fonds<br />
                  10 clients = 10 000€/mois récurrent pour Sowefund
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            05 — 3 PROCHAINES ÉTAPES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { step: "J+0", action: "Signature convention apporteur d'affaires (template disponible)" },
              { step: "J+3", action: "Activation landing page co-branded + premier envoi réseau investisseurs Sowefund" },
              { step: "J+30", action: "Bilan : leads générés, taux conversion, premier revenu partagé" },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 16, fontSize: 13 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#7A746E", flexShrink: 0, width: 36, fontSize: 11 }}>{item.step}</span>
                <span>{item.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 20, borderTop: "1px solid #E0DAD0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", letterSpacing: "0.1em" }}>
            CONFIDENTIEL — NE PAS DIFFUSER
          </div>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E" }}>
            contact@crochett.ai · crochett.ai/partenaires/sowefund?ref=sowefund
          </div>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 1cm 1.5cm; size: A4; }
          }
          @media screen {
            body { max-width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}
