import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Partenariat Kelly Massol × Crochet.",
  description: "One-pager ambassadrice — programme d'affiliation Crochett.ai",
  robots: "noindex",
}

export default function OnePagerKellyMassol() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "DM Sans, system-ui, sans-serif", color: "#0A0A0A" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, paddingBottom: 28, borderBottom: "2px solid #0A0A0A" }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", color: "#7A746E", textTransform: "uppercase", marginBottom: 10 }}>
              CONFIDENTIEL — PROPOSITION AMBASSADRICE
            </div>
            <h1 style={{ fontSize: 32, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, lineHeight: 1.2, margin: "0 0 8px" }}>
              1 mention.<br />Des revenus récurrents.
            </h1>
            <p style={{ fontSize: 13, color: "#7A746E", margin: 0 }}>
              Proposition confidentielle pour Kelly Massol — Mars 2026
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 32 }}>
            <div style={{ fontSize: 22, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em" }}>
              CROCHET.
            </div>
            <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", letterSpacing: "0.1em", marginTop: 4 }}>
              × KELLY MASSOL
            </div>
          </div>
        </div>

        {/* Le contexte */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            01 — CE QU&apos;EST CROCHETT.AI
          </div>
          <div style={{ background: "#0A0A0A", color: "#fff", borderRadius: 8, padding: "18px 22px", fontSize: 14, lineHeight: 1.6 }}>
            <strong>La plateforme qui connecte cédants et repreneurs de PME via l&apos;IA.</strong>
            {" "}Les entrepreneurs de ta communauté — qu&apos;ils cherchent à vendre, à racheter, ou à transmettre — sont exactement notre cible.
            Matching qualifié, Secure Room NDA, analyse IA du dossier. Zéro intermédiaire inutile.
          </div>
        </div>

        {/* Ce qu'on te propose */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            02 — CE QU&apos;ON TE PROPOSE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { num: "01", title: "1 mention suffit", body: "Un post LinkedIn, un épisode podcast, une newsletter — c'est tout ce qu'on demande. Ton lien tracké fait le reste." },
              { num: "02", title: "20% récurrent", body: "Pour chaque abonné qui arrive via ton lien, tu touches 20% de l'abonnement tant qu'il reste client. Chaque mois." },
              { num: "03", title: "Lien tracké simple", body: "crochett.ai?ref=kelly — tu vois en temps réel les inscriptions, les conversions et les revenus générés." },
            ].map((item) => (
              <div key={item.num} style={{ background: "#F5F0E8", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#7A746E", marginBottom: 8 }}>{item.num}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#7A746E", lineHeight: 1.55 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* L'exemple chiffré */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            03 — CE QUE ÇA REPRÉSENTE CONCRÈTEMENT
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { value: "1 490€", label: "Abonnement Scale/mois (plan le plus courant pour les fonds)" },
              { value: "20%", label: "Rev share récurrent — chaque mois, tant que le client reste" },
              { value: "298€", label: "Par client Scale et par mois pour toi" },
              { value: "2 980€", label: "Si 10 abonnés Scale — chaque mois, automatiquement" },
            ].map((stat) => (
              <div key={stat.value} style={{ border: "1px solid #E0DAD0", borderRadius: 8, padding: "14px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: "#7A746E", lineHeight: 1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pourquoi ça matche */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            04 — POURQUOI TON AUDIENCE EST PARFAITE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "✓", title: "Entrepreneurs qui vendent", body: "Fondatrice qui cède, associée qui sort, dirigeante qui transmet — ils sont dans ta communauté." },
                { icon: "✓", title: "Entrepreneurs qui rachètent", body: "Reprise d'entreprise, croissance externe — un profil très présent dans l'écosystème que tu touches." },
                { icon: "✓", title: "Investisseurs privés", body: "Family offices, business angels, fonds — ils cherchent du deal flow qualifié hors des circuits classiques." },
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
                Ton lien d&apos;affiliation
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, background: "#0A0A0A", color: "#F5F0E8", borderRadius: 6, padding: "10px 14px", marginBottom: 12, wordBreak: "break-all" }}>
                crochett.ai/register?ref=kelly
              </div>
              <div style={{ fontSize: 12, color: "#7A746E", lineHeight: 1.6 }}>
                Dashboard affilié disponible — tu vois en temps réel les inscriptions, les abonnements actifs et tes revenus générés.
              </div>
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.14em", color: "#7A746E", textTransform: "uppercase", marginBottom: 12 }}>
            05 — 3 ÉTAPES POUR DÉMARRER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { step: "J+0", action: "On signe une convention d'affiliation simple (1 page, template disponible)" },
              { step: "J+3", action: "Ton lien est actif + tu as accès à ton dashboard affilié en temps réel" },
              { step: "J+7", action: "1 mention dans le format de ton choix — et les revenus récurrents commencent" },
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
            contact@crochett.ai · crochett.ai/onepager/kelly-massol
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
