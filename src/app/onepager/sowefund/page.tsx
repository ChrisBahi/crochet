import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partenariat Sowefund × Crochett.ai",
  description: "One-pager partenariat — réunion co-distribution M&A PME",
  robots: "noindex",
}

export default function OnePageSowefund() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "DM Sans, system-ui, sans-serif", color: "#0A0A0A" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "56px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, paddingBottom: 32, borderBottom: "2px solid #0A0A0A" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", color: "#7A746E", textTransform: "uppercase", marginBottom: 10 }}>
              CROCHETT.AI × SOWEFUND
            </div>
            <h1 style={{ fontSize: 36, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, lineHeight: 1.15, margin: "0 0 10px" }}>
              Partenariat de<br /><em>co-distribution M&A PME</em>
            </h1>
            <p style={{ fontSize: 14, color: "#7A746E", margin: 0 }}>
              Proposition confidentielle — Mars 2026
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

        {/* Opportunity framing */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            01 — LE CONTEXTE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#F5F0E8", borderRadius: 8, padding: "20px 24px" }}>
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Ce que fait Sowefund
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Levées de fonds equity pour startups et PME innovantes. Vous maîtrisez l'accès aux investisseurs et aux entrepreneurs.
              </p>
            </div>
            <div style={{ background: "#F5F0E8", borderRadius: 8, padding: "20px 24px" }}>
              <div style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Ce que fait Crochett.ai
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                M&A PME — cessions et transmissions entre 500k et 5M€. Qualification IA, matching algorithmique, Secure Room NDA.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 16, background: "#0A0A0A", color: "#fff", borderRadius: 8, padding: "16px 24px", fontSize: 14, fontWeight: 500 }}>
            → Le gap : vous ne faites PAS le M&A PME. C'est exactement ce qu'on comble.
          </div>
        </div>

        {/* Value proposition */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            02 — LA PROPOSITION
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { num: "01", title: "Deal flow qualifié", body: "Vos investisseurs accèdent à un pipeline M&A PME analysé par IA — dossiers scorés, mémos structurés, valorisations vérifiées." },
              { num: "02", title: "Accès co-branded", body: "Landing page dédiée Sowefund, bypass qualification directe, trial 14 jours offert. Vos couleurs, votre audience." },
              { num: "03", title: "Revenue share", body: "Convention apporteur d'affaires formalisée. Revenus partagés sur chaque client amené et converti." },
            ].map((item) => (
              <div key={item.num} style={{ border: "1px solid #E0DAD0", borderRadius: 8, padding: "20px 20px" }}>
                <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", marginBottom: 8 }}>{item.num}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#7A746E", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What's already built */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            03 — CE QUI EST DÉJÀ CONSTRUIT POUR SOWEFUND
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Landing page /partenaires/sowefund dédiée avec vos éléments de marque",
              "Tracking UTM ?ref=sowefund — chaque lead Sowefund suivi dans la base",
              "?ref=sowefund&role=investisseur → bypass qualification IA, accès direct formulaire investisseur",
              "Trial 14 jours offert configuré dans Stripe — aucune friction d'achat",
              "Dashboard admin : matrice source × tunnel, entonnoir lead → approuvé par source",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 13 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0, fontFamily: "JetBrains Mono, monospace" }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Impact potentiel */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            04 — IMPACT POTENTIEL
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { value: "50–100", label: "Leads qualifiés dès la semaine 1", sub: "depuis votre réseau investisseurs" },
              { value: "5k€", label: "Abonnement mensuel fonds", sub: "par client converti Sowefund" },
              { value: "20%", label: "Rev share apporteur", sub: "sur chaque client actif" },
            ].map((stat) => (
              <div key={stat.value} style={{ textAlign: "center", background: "#F5F0E8", borderRadius: 8, padding: "20px 16px" }}>
                <div style={{ fontSize: 28, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: "#7A746E" }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prochaines étapes */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 14 }}>
            05 — PROCHAINES ÉTAPES PROPOSÉES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { step: "J+0", action: "Signature convention apporteur d'affaires (template prêt)" },
              { step: "J+3", action: "Activation landing page co-branded Sowefund" },
              { step: "J+7", action: "Premier envoi à votre réseau investisseurs (50–100 contacts)" },
              { step: "J+30", action: "Bilan : leads générés, taux conversion, premier revenu partagé" },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 20, fontSize: 13 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", color: "#7A746E", flexShrink: 0, width: 36 }}>{item.step}</span>
                <span>{item.action}</span>
              </div>
            ))}
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
