"use client"

import Link from "next/link"
import { LangSwitcher } from "@/components/lang-switcher"
import { useLang } from "@/lib/lang/context"
import styles from "./home-client.module.css"

const t = {
  fr: {
    tagline: "Infrastructure · Transactions privées",
    h1a: "Le signal,",
    h1b: "pas le bruit.",
    desc: "Crochet. organise les introductions qualifiées entre acteurs sérieux du marché privé. Accès sur invitation. Matching algorithmique. Discrétion absolue.",
    badge: "Accès sur invitation · Données confidentielles · Infrastructure sécurisée",
    cardHeader: "Signal actif — OPP-2847",
    cardTitle: "Services industriels · Lyon",
    cardSub: "Cession majoritaire 65% · CA 4.2M€ · EBITDA 22%",
    scores: [{ label: "Taille", value: "12–18M€" }, { label: "D-Score", value: "87" }, { label: "M-Score", value: "79" }],
    closingLabel: "Probabilité closing",
    stats: [
      { value: "NDA", label: "Signé avant chaque room" },
      { value: "IA", label: "Qualification automatique" },
      { value: "2", label: "Parties pour clôturer" },
      { value: "48h", label: "Délai de réponse admission" },
    ],
    infraLabel: "Infrastructure",
    pillars: [
      { num: "01", title: "Qualification IA", body: "Déposez un PDF, un bilan ou un deck. Le moteur extrait CA, EBITDA, valorisation, secteur — génère un MEMO structuré et un D-Score de maturité. En moins de 60 secondes.", tag: "Analyse automatique" },
      { num: "02", title: "Matching ciblé", body: "Chaque dossier est confronté aux critères des membres actifs — ticket, géographie, secteur, type d'opération. Seuls les matches pertinents sont présentés.", tag: "Pas de spam, pas de bruit" },
      { num: "03", title: "Secure Room", body: "Un match validé ouvre une Room privée. Chat chiffré, partage de documents, appel Vision, propositions de RDV, et validation bilatérale du deal.", tag: "NDA signé · Closing intégré" },
    ],
    admissionLabel: "Admission sélective",
    admissionTitle: "Accès sur candidature.",
    admissionDesc: "Chaque membre est vérifié avant admission. Crochet. est réservé aux professionnels du deal — fonds d'investissement, family offices, advisors M&A, dirigeants de sociétés en cession ou en croissance.",
    admittedLabel: "Profils admis",
    profiles: [
      "Fonds d'investissement (PE, VC, dette)",
      "Family offices & investisseurs privés",
      "Advisors M&A & banquiers d'affaires",
      "Dirigeants en cession / transmission",
      "Sociétés en levée de fonds",
    ],
    cta: "Soumettre ma candidature",
    headerCTA1: "Accès privé",
    copyright: "© 2025 CROCHET — CONFIDENTIEL",
  },
  en: {
    tagline: "Infrastructure · Private Transactions",
    h1a: "The signal,",
    h1b: "not the noise.",
    desc: "Crochet. organises qualified introductions between serious private market participants. Invitation-only access. Algorithmic matching. Absolute discretion.",
    badge: "Invitation-only · Confidential data · Secure infrastructure",
    cardHeader: "Active signal — OPP-2847",
    cardTitle: "Industrial services · Lyon",
    cardSub: "Majority sale 65% · Revenue €4.2M · EBITDA 22%",
    scores: [{ label: "Size", value: "€12–18M" }, { label: "D-Score", value: "87" }, { label: "M-Score", value: "79" }],
    closingLabel: "Closing probability",
    stats: [
      { value: "NDA", label: "Signed before each room" },
      { value: "AI", label: "Automatic qualification" },
      { value: "2", label: "Parties to close" },
      { value: "48h", label: "Admission response time" },
    ],
    infraLabel: "Infrastructure",
    pillars: [
      { num: "01", title: "AI Qualification", body: "Upload a PDF, financial statements or a deck. The engine extracts revenue, EBITDA, valuation, sector — generates a structured MEMO and a maturity D-Score. In under 60 seconds.", tag: "Automatic analysis" },
      { num: "02", title: "Targeted matching", body: "Each file is matched against active members' criteria — ticket size, geography, sector, deal type. Only relevant matches are presented.", tag: "No spam, no noise" },
      { num: "03", title: "Secure Room", body: "A validated match opens a private Room. Encrypted chat, document sharing, Vision call, meeting proposals, and bilateral deal validation.", tag: "NDA signed · Integrated closing" },
    ],
    admissionLabel: "Selective admission",
    admissionTitle: "Application-based access.",
    admissionDesc: "Every member is verified before admission. Crochet. is reserved for deal professionals — investment funds, family offices, M&A advisors, company executives in sale or growth mode.",
    admittedLabel: "Admitted profiles",
    profiles: [
      "Investment funds (PE, VC, debt)",
      "Family offices & private investors",
      "M&A advisors & investment bankers",
      "Executives in sale / succession",
      "Companies raising funds",
    ],
    cta: "Submit my application",
    headerCTA1: "Private access",
    copyright: "© 2025 CROCHET — CONFIDENTIAL",
  },
}

export function HomeClient({ appHref }: { appHref: string }) {
  const { lang } = useLang()
  const tx = t[lang]

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F5F2EE" }}>

      {/* ── HEADER ── */}
      <header className={styles.header} style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            CROCHET.
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={appHref} style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#FFFFFF",
            background: "#1A1A1A",
            textDecoration: "none",
            padding: "10px 20px",
            border: "1px solid #505050",
            display: "inline-block",
            letterSpacing: "0.04em",
          }}>
            {tx.headerCTA1}
          </Link>
          <Link href="/register" style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#000000",
            background: "#FFFFFF",
            textDecoration: "none",
            padding: "10px 20px",
            display: "inline-block",
            letterSpacing: "0.04em",
          }}>
            +Signal →
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className={styles.heroSection} style={{ background: "#F5F2EE", flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", right: -60, top: -40,
          fontSize: 600, fontFamily: "var(--font-playfair), Georgia, serif",
          fontWeight: 700, color: "rgba(0,0,0,0.04)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
        }}>C</div>

        <div className={styles.heroGrid}>
          <div style={{ paddingBottom: 80 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "#7A746E", marginBottom: 36,
            }}>
              {tx.tagline}
            </div>
            <h1 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontSize: "clamp(48px, 5.5vw, 76px)", fontWeight: 800,
              color: "#0A0A0A", margin: "0", lineHeight: 1.05, letterSpacing: "-0.02em",
            }}>
              {tx.h1a}
            </h1>
            <h1 style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(48px, 5.5vw, 76px)", fontWeight: 800,
              color: "#0A0A0A", margin: "0 0 40px", lineHeight: 1.05, letterSpacing: "-0.02em",
            }}>
              {tx.h1b}
            </h1>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 16, color: "#5A5450", margin: "0 0 20px", lineHeight: 1.75, maxWidth: 480,
            }}>
              {tx.desc}
            </p>
            <div style={{
              marginTop: 16, fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9, letterSpacing: "0.1em", color: "#B0AA9E", textTransform: "uppercase",
            }}>
              {tx.badge}
            </div>
          </div>

          {/* Deal card mockup */}
          <div style={{ paddingTop: 40 }}>
            <div style={{
              background: "#FFFFFF", border: "1px solid #E0DAD0",
              padding: "28px 32px", boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #F0EDE8",
              }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A746E" }}>
                  {tx.cardHeader}
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.1em", color: "#16A34A", textTransform: "uppercase" }}>
                  ● Live
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0A0A0A", marginBottom: 6 }}>
                {tx.cardTitle}
              </div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#7A746E", marginBottom: 28 }}>
                {tx.cardSub}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 24 }}>
                {tx.scores.map((item, i) => (
                  <div key={i} style={{ paddingRight: i < 2 ? 16 : 0, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? "1px solid #F0EDE8" : "none" }}>
                    <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B0AA9E", marginBottom: 6 }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 24, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #F0EDE8", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#B0AA9E" }}>
                    {tx.closingLabel}
                  </span>
                  <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "#0A0A0A", fontWeight: 600 }}>79%</span>
                </div>
                <div style={{ height: 3, background: "#F0EDE8", borderRadius: 2 }}>
                  <div style={{ height: 3, width: "79%", background: "#0A0A0A", borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className={styles.statsSection} style={{ background: "#0A0A0A", borderTop: "1px solid #F0EDE8" }}>
        <div className={styles.statsGrid}>
          {tx.stats.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: 42, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TROIS PILIERS ── */}
      <section id="plateforme" className={styles.pillarsSection} style={{ background: "#FFFFFF", borderTop: "1px solid #E0DAD0", borderBottom: "1px solid #E0DAD0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A746E", marginBottom: 48 }}>
            {tx.infraLabel}
          </div>
          <div className={styles.pillarsGrid}>
            {tx.pillars.map((pillar, i) => (
              <div key={i} className={styles.pillarItem}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "#C8C2B8", letterSpacing: "0.1em", marginBottom: 20 }}>
                  {pillar.num}
                </div>
                <h3 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic", fontSize: 26, fontWeight: 700, color: "#0A0A0A", margin: "0 0 16px", lineHeight: 1.2 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#7A746E", lineHeight: 1.75, margin: "0 0 24px" }}>
                  {pillar.body}
                </p>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#C8C2B8", letterSpacing: "0.1em", textTransform: "uppercase", borderTop: "1px solid #E0DAD0", paddingTop: 16 }}>
                  {pillar.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION ── */}
      <section className={styles.admissionSection} style={{ background: "#111111" }}>
        <div className={styles.admissionInner}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#AAA", marginBottom: 24 }}>
              {tx.admissionLabel}
            </div>
            <h2 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 700, color: "#FFFFFF", margin: "0 0 20px", lineHeight: 1.1 }}>
              {tx.admissionTitle}
            </h2>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 15, color: "#C0BAB4", lineHeight: 1.8, margin: 0, maxWidth: 440 }}>
              {tx.admissionDesc}
            </p>
          </div>

          <div className={styles.admissionCard}>
            <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#AAA", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #2A2A2A" }}>
              {tx.admittedLabel}
            </div>
            {tx.profiles.map((profil, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#666", flexShrink: 0, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#C0BAB4", lineHeight: 1.5 }}>
                  {profil}
                </span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: 24, marginTop: 8 }}>
              <Link href="/register" style={{
                display: "block", textAlign: "center",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#0A0A0A", background: "#FFFFFF", padding: "14px 0", textDecoration: "none",
              }}>
                {tx.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer} style={{ background: "#0A0A0A", borderTop: "1px solid #1A1A1A" }}>
        <span style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: 14, fontWeight: 700, color: "#AAA", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          CROCHET.
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/pricing" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {lang === "fr" ? "Tarifs" : "Pricing"}
          </Link>
          <Link href="/faq" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            FAQ
          </Link>
          <Link href="/rgpd" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            RGPD
          </Link>
          <LangSwitcher />
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#666", letterSpacing: "0.08em" }}>
          {tx.copyright}
        </span>
      </footer>

    </div>
  )
}
