"use client"
/**
 * OfficialDoc — mise en page document officiel CROCHET
 * Utilisé pour le MEMO de qualification et le NDA.
 */
import React from "react"

export interface DocSection {
  number: string
  title: string
  content: string
}

interface OfficialDocProps {
  kind: "MEMO" | "NDA"
  subtitle: string
  metaLine: string
  title: string
  titleItalic: string
  reference: string
  date: string
  generatedAt?: string    // ISO datetime — date + heure de génération
  sections: DocSection[]
  partyNames?: string[]   // noms à afficher en GRAS MAJUSCULE
  children?: React.ReactNode
}

// Rend le texte avec les noms de parties + termes contractuels en gras
function renderContent(text: string, partyNames: string[]): React.ReactNode {
  const contractTerms: string[] = []
  const allTerms = [...new Set([...partyNames, ...contractTerms])].filter(Boolean)
  if (allTerms.length === 0) return text
  const escaped = allTerms.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi")
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, i) => {
        const isPartyName = partyNames.find(n => n.toLowerCase() === part.toLowerCase())
        const isContractTerm = contractTerms.find(n => n.toLowerCase() === part.toLowerCase())
        if (isPartyName) {
          return <strong key={i} style={{ fontWeight: 700 }}>{part.toUpperCase()}</strong>
        }
        if (isContractTerm) {
          return <strong key={i} style={{ fontWeight: 700 }}>{part}</strong>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso)
  const datePart = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
  const timePart = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  return `${datePart} à ${timePart} UTC`
}

export function OfficialDoc({
  subtitle,
  metaLine,
  title,
  titleItalic,
  reference,
  date,
  generatedAt,
  sections,
  partyNames = [],
  children,
}: OfficialDocProps) {
  const genLabel = generatedAt ? formatGeneratedAt(generatedAt) : null

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh" }}>

      {/* ── CSS print rules ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #FAF7F2; margin: 0; }
          @page { size: A4; margin: 0; }

          /* Header répété sur chaque page */
          .doc-print-header {
            display: flex !important;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 56px;
            background: #FAF7F2;
            padding: 14px 52px 0;
            box-sizing: border-box;
            z-index: 300;
            align-items: flex-start;
            justify-content: space-between;
            border-bottom: 1.5px solid #0A0A0A;
          }

          /* Footer répété sur chaque page */
          .doc-print-footer {
            display: flex !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 32px;
            background: #FAF7F2;
            padding: 0 52px;
            box-sizing: border-box;
            z-index: 300;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #E0D8CC;
          }

          /* Filigrane C fixe → répété sur chaque page */
          .doc-watermark {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            transform: translate(-50%, -50%) !important;
          }

          /* Masquer le header app (AppShell) à l'impression */
          header.no-print { display: none !important; }

          /* Corps : marge pour header + footer */
          .doc-body {
            padding-top: 72px !important;
            padding-bottom: 48px !important;
          }

          /* Numéro de page CSS (Chromium) */
          .doc-page-num::after {
            content: "PAGE " counter(page);
          }
        }

        /* Masqué à l'écran, visible uniquement à l'impression */
        .doc-print-header { display: none; }
        .doc-print-footer { display: none; }
      `}</style>

      {/* ── Header print-only (répété sur chaque page imprimée) ── */}
      <div className="doc-print-header">
        <div>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: "#0A0A0A",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}>
            crochet.
          </div>
          <div style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 11,
            fontStyle: "italic",
            color: "#0A0A0A",
            lineHeight: 1,
          }}>
            C
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 8,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          textAlign: "right",
          paddingTop: 2,
        }}>
          {subtitle}
          {" · "}
          <span className="doc-page-num" />
        </div>
      </div>

      {/* ── Footer print-only (répété sur chaque page imprimée) ── */}
      <div className="doc-print-footer">
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 7.5,
          color: "#B0A898",
          fontStyle: "italic",
          letterSpacing: "0.02em",
        }}>
          Document confidentiel — Propriété de Crochet. — Ne pas diffuser
        </span>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 7.5,
          color: "#B0A898",
          letterSpacing: "0.04em",
        }}>
          contact@crochet.app
        </span>
      </div>

      {/* ── Grand C filigrane transparent centré (répété à l'impression via position: fixed) ── */}
      <div className="doc-watermark" style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontSize: 520,
        fontWeight: 700,
        fontStyle: "italic",
        color: "rgba(10,10,10,0.05)",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 0,
        lineHeight: 1,
        letterSpacing: "-0.04em",
      }}>
        C
      </div>

      {/* ── Corps principal ── */}
      <div className="doc-body" style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "48px 72px 80px",
        position: "relative",
        zIndex: 1,
      }}>

        {/* En-tête visible à l'écran */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
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

        {/* Filet épais */}
        <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 48 }} />

        {/* Bloc titre */}
        <div style={{ marginBottom: 32 }}>
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

        {/* Filet fin */}
        <div style={{ borderTop: "1px solid #C8C2B8", marginBottom: 16 }} />

        {/* Ligne méta */}
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 4,
        }}>
          {metaLine}
        </div>

        {/* Date et heure de génération */}
        {genLabel ? (
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            letterSpacing: "0.04em",
            color: "#B0A898",
            fontStyle: "italic",
            marginBottom: 48,
          }}>
            Généré le {genLabel}
          </div>
        ) : (
          <div style={{ marginBottom: 48 }} />
        )}

        {/* Intro (section 00) */}
        {sections.length > 0 && sections[0].number === "00" && (
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#0A0A0A",
            lineHeight: 1.9,
            marginBottom: 48,
            textAlign: "justify",
          }}>
            {renderContent(sections[0].content, partyNames)}
          </p>
        )}

        {/* Sections numérotées */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {sections.filter(s => s.number !== "00").map(section => (
            <div key={section.number}>

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
                      <span style={{ paddingLeft: 16, display: "block" }}>
                        {renderContent(para, partyNames)}
                      </span>
                    ) : renderContent(para, partyNames)}
                  </p>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Enfants (bloc signature, etc.) */}
        {children && (
          <div style={{ marginTop: 60 }}>
            {children}
          </div>
        )}

        {/* Pied de page visible à l'écran */}
        <div style={{
          marginTop: 60,
          borderTop: "1px solid #E0D8CC",
          paddingTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            color: "#B0A898",
            fontStyle: "italic",
          }}>
            Document confidentiel — Propriété de Crochet. — Ne pas diffuser
          </span>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            color: "#B0A898",
            letterSpacing: "0.04em",
          }}>
            {reference} · {date}
          </span>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 9,
            color: "#B0A898",
          }}>
            contact@crochet.app
          </span>
        </div>

      </div>
    </div>
  )
}
