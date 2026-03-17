import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "One-pagers — Crochett.ai",
  description: "Documents de présentation partenaires",
  robots: "noindex",
}

export default function OnePagersIndex() {
  const docs = [
    {
      href: "/onepager/sowefund",
      label: "Sowefund",
      desc: "One-pager partenariat — réunion de co-distribution M&A PME",
      tag: "Partenariat distribution",
    },
    {
      href: "/onepager/experts-comptables",
      label: "Experts-comptables",
      desc: "One-pager programme apporteur d'affaires — rev share 20%",
      tag: "Programme apporteur",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "DM Sans, system-ui, sans-serif", padding: "60px 40px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.15em", color: "#7A746E", textTransform: "uppercase", marginBottom: 16 }}>
            CROCHETT.AI — DOCUMENTS INTERNES
          </div>
          <h1 style={{ fontSize: 32, fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, lineHeight: 1.2, margin: "0 0 12px" }}>
            Hub one-pagers
          </h1>
          <p style={{ color: "#7A746E", fontSize: 14, margin: 0 }}>
            Documents de présentation à imprimer ou partager en PDF pour les réunions partenaires.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {docs.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              style={{
                display: "block",
                background: "#fff",
                border: "1px solid #E0DAD0",
                borderRadius: 8,
                padding: "24px 28px",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em", color: "#7A746E", textTransform: "uppercase", marginBottom: 8 }}>
                    {doc.tag}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{doc.label}</div>
                  <div style={{ fontSize: 13, color: "#7A746E" }}>{doc.desc}</div>
                </div>
                <div style={{ fontSize: 18, color: "#7A746E", flexShrink: 0 }}>→</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #E0DAD0", fontSize: 11, color: "#7A746E", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
          CONFIDENTIEL — USAGE INTERNE UNIQUEMENT
        </div>
      </div>
    </div>
  )
}
