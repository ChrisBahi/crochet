/**
 * OfficialDoc — mise en page document officiel CROCHET
 * Utilisé pour le MEMO de qualification et le NDA.
 */

export interface DocSection {
  number: string
  title: string
  content: string  // texte brut, peut contenir des \n
}

interface OfficialDocProps {
  kind: "MEMO" | "NDA"
  subtitle: string        // ex: "MEMORANDUM DE QUALIFICATION · CONFIDENTIEL"
  metaLine: string        // ex: "MEMO-CROCHET-V1 · CONFIDENTIEL · DROIT FRANÇAIS"
  title: string           // première ligne du grand titre
  titleItalic: string     // deuxième ligne en italique
  reference: string       // ex: "MEMO-CROCHET-V1"
  date: string
  sections: DocSection[]
  children?: React.ReactNode  // zone signature / bas de page
}

export function OfficialDoc({
  subtitle,
  metaLine,
  title,
  titleItalic,
  reference,
  date,
  sections,
  children,
}: OfficialDocProps) {
  return (
    <div style={{
      background: "#FAF7F2",
      minHeight: "100vh",
      fontFamily: "var(--font-playfair), Georgia, serif",
    }}>
      {/* ── Print styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #FAF7F2; }
        }
      `}</style>

      <div style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "48px 72px 80px",
        position: "relative",
      }}>

        {/* ── Watermark ── */}
        <div style={{
          position: "fixed",
          top: "50%",
          right: "8%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 320,
          fontWeight: 700,
          fontStyle: "italic",
          color: "rgba(10,10,10,0.03)",
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
          lineHeight: 1,
        }}>
          C
        </div>

        {/* ── Header bar ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          position: "relative",
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#0A0A0A",
            letterSpacing: "-0.01em",
          }}>
            crochet.
          </span>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
          }}>
            {subtitle}
          </span>
        </div>

        {/* Thick rule */}
        <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 48, position: "relative", zIndex: 1 }} />

        {/* ── Title block ── */}
        <div style={{ marginBottom: 32, position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 64,
            fontWeight: 700,
            color: "#0A0A0A",
            lineHeight: 1.05,
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}>
            {title}
          </h1>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 64,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#0A0A0A",
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            {titleItalic}
          </h1>
        </div>

        {/* Thin rule */}
        <div style={{ borderTop: "1px solid #C8C2B8", marginBottom: 16, position: "relative", zIndex: 1 }} />

        {/* Meta line */}
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 56,
          position: "relative",
          zIndex: 1,
        }}>
          {metaLine}
        </div>

        {/* ── Intro / context ── */}
        {sections.length > 0 && sections[0].number === "00" && (
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#0A0A0A",
            lineHeight: 1.9,
            marginBottom: 48,
            textAlign: "justify",
            position: "relative",
            zIndex: 1,
          }}>
            {sections[0].content}
          </p>
        )}

        {/* ── Numbered sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, position: "relative", zIndex: 1 }}>
          {sections.filter(s => s.number !== "00").map(section => (
            <div key={section.number}>
              {/* Section header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr",
                alignItems: "baseline",
                gap: 16,
                borderTop: "1px solid #C8C2B8",
                paddingTop: 16,
                marginBottom: 16,
              }}>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  color: "#7A746E",
                  letterSpacing: "0.04em",
                }}>
                  {section.number}
                </span>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#0A0A0A",
                }}>
                  {section.title}
                </span>
              </div>

              {/* Section body — split on \n for sub-paragraphs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {section.content.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i} style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: "#0A0A0A",
                    lineHeight: 1.9,
                    margin: 0,
                    textAlign: "justify",
                  }}>
                    {para.startsWith("—") || para.startsWith("-") ? (
                      <span style={{ paddingLeft: 16, display: "block" }}>{para}</span>
                    ) : para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer / children (signature block etc.) ── */}
        {children && (
          <div style={{ marginTop: 60, position: "relative", zIndex: 1 }}>
            {children}
          </div>
        )}

        {/* ── Page footer ── */}
        <div style={{
          marginTop: 60,
          borderTop: "1px solid #C8C2B8",
          paddingTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            color: "#7A746E",
            letterSpacing: "0.06em",
          }}>
            {reference}
          </span>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            color: "#7A746E",
            letterSpacing: "0.06em",
          }}>
            {date}
          </span>
          <span style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9,
            color: "#7A746E",
            letterSpacing: "0.06em",
          }}>
            IA · CONFIDENTIEL
          </span>
        </div>

      </div>
    </div>
  )
}
