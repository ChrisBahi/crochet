"use client";

import Link from "next/link";

const ONEPAGERS = [
  {
    slug: "sowefund",
    title: "CROCHET × SOWEFUND",
    desc: "Partenariat deal flow M&A PME — pour la réunion Sowefund",
    tag: "Investisseurs / Fonds",
  },
  {
    slug: "experts-comptables",
    title: "CROCHET × EXPERTS-COMPTABLES",
    desc: "Programme apporteur d'affaires — rev share 20%",
    tag: "Apporteurs d'affaires",
  },
];

export default function OnepagerIndex() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
      fontFamily: "-apple-system, 'Helvetica Neue', Arial, sans-serif",
    }}>
      <div style={{
        fontFamily: "monospace",
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 32,
      }}>
        ONE-PAGERS — USAGE INTERNE
      </div>

      <div style={{
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 32,
        fontWeight: 700,
        color: "#FFFFFF",
        marginBottom: 48,
        textAlign: "center",
      }}>
        Documents PDF imprimables
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 560 }}>
        {ONEPAGERS.map((p) => (
          <Link
            key={p.slug}
            href={`/onepager/${p.slug}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#111",
              border: "1px solid #1E1E1E",
              padding: "20px 24px",
              textDecoration: "none",
              transition: "border-color 0.15s",
            }}
          >
            <div>
              <div style={{
                fontFamily: "Georgia, serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{p.desc}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#444",
                border: "1px solid #2A2A2A",
                padding: "3px 8px",
              }}>{p.tag}</span>
              <span style={{ fontSize: 11, color: "#555" }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 48,
        fontFamily: "monospace",
        fontSize: 9,
        color: "#333",
        letterSpacing: "0.08em",
      }}>
        © 2026 CROCHET — CONFIDENTIEL
      </div>
    </div>
  );
}
