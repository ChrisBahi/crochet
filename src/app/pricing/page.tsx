import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "290",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    desc: "Pour les advisors et dirigeants qui démarrent sur le marché privé.",
    features: [
      "3 Rooms actives simultanément",
      "1 utilisateur",
      "Match Engine inclus",
      "NDA automatique",
      "30 documents par Room",
      "Support email 48h",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "590",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    desc: "Pour les fonds et family offices qui opèrent plusieurs dossiers en parallèle.",
    features: [
      "10 Rooms actives simultanément",
      "3 utilisateurs",
      "Tout Starter +",
      "Vision Call (appel vidéo intégré)",
      "Export MEMO en PDF",
      "Support prioritaire 24h",
    ],
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "1 490",
    priceId: process.env.STRIPE_PRICE_SCALE ?? "",
    desc: "Pour les boutiques M&A et structures multi-fonds avec volume élevé.",
    features: [
      "Rooms illimitées",
      "5 utilisateurs",
      "Tout Pro +",
      "Onboarding dédié",
      "SLA 99,9% garanti",
      "Account manager dédié",
    ],
    highlight: false,
  },
]

export default async function PricingPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }))

  const tx = {
    fr: {
      badge: "Tarification",
      title: "Infrastructure privée.",
      titleItalic: "Tarif transparent.",
      sub: "Essai 14 jours inclus. CB requise uniquement au premier partage de Room.",
      perMonth: "/mois",
      popular: "Le plus choisi",
      start: "Démarrer l'essai",
      startPaid: "Choisir ce plan",
      login: "Se connecter d'abord",
      faqTitle: "Questions fréquentes",
      faq: [
        { q: "L'essai est-il vraiment gratuit ?", a: "Oui. 14 jours d'accès complet sans CB. La carte n'est demandée qu'au premier partage de Room avec une contrepartie." },
        { q: "Puis-je changer de plan ?", a: "Oui, à tout moment. Le changement est proratisé au jour." },
        { q: "Qu'est-ce qu'une Room ?", a: "Une Room est un espace privé et sécurisé (NDA signé) entre deux parties pour négocier un deal. Elle comprend chat chiffré, partage de documents, appel Vision et validation bilatérale." },
        { q: "Mes données sont-elles sécurisées ?", a: "Oui. Toutes les données sont isolées par RLS (Row Level Security) : chaque membre ne voit que ses propres dossiers. NDA obligatoire avant tout accès. Hébergement UE. RGPD conforme." },
      ],
      footer: "© 2025 CROCHET — CONFIDENTIEL",
    },
    en: {
      badge: "Pricing",
      title: "Private infrastructure.",
      titleItalic: "Transparent pricing.",
      sub: "14-day trial included. Card required only on first Room share.",
      perMonth: "/month",
      popular: "Most popular",
      start: "Start trial",
      startPaid: "Choose this plan",
      login: "Log in first",
      faqTitle: "Frequently asked questions",
      faq: [
        { q: "Is the trial really free?", a: "Yes. 14 days full access, no credit card needed. Your card is only requested when you first share a Room with a counterpart." },
        { q: "Can I change plans?", a: "Yes, anytime. Changes are prorated to the day." },
        { q: "What is a Room?", a: "A Room is a private, secure space (NDA signed) between two parties to negotiate a deal. It includes encrypted chat, document sharing, Vision call, and bilateral validation." },
        { q: "Is my data secure?", a: "Yes. All data is isolated via RLS (Row Level Security): each member only sees their own files. NDA required before any access. EU hosting. GDPR compliant." },
      ],
      footer: "© 2025 CROCHET — CONFIDENTIAL",
    },
  }[lang]

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE", fontFamily: "var(--font-dm-sans), sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#0A0A0A", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: "clamp(16px, 4vw, 48px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 700, color: "#FFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            CROCHET.
          </span>
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href={session ? "/app" : "/login"} style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 500, color: "#FFF", textDecoration: "none", padding: "8px 20px", border: "1px solid #505050", background: "#1A1A1A", letterSpacing: "0.04em" }}>
            {session ? (lang === "fr" ? "Mon espace" : "My space") : (lang === "fr" ? "Accès privé" : "Private access")}
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "72px clamp(16px, 4vw, 48px) 0", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A746E", marginBottom: 24 }}>
          {tx.badge}
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#0A0A0A", margin: "0 0 4px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {tx.title}
        </h1>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#0A0A0A", margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {tx.titleItalic}
        </h1>
        <p style={{ fontSize: 15, color: "#7A746E", margin: "0 0 64px", lineHeight: 1.6 }}>
          {tx.sub}
        </p>
      </section>

      {/* ── PLANS ── */}
      <section style={{ padding: "0 clamp(16px, 4vw, 48px) 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0, border: "1px solid #E0DAD0" }}>
          {plans.map((plan, i) => (
            <div key={plan.id} style={{
              padding: "40px 36px",
              background: plan.highlight ? "#0A0A0A" : "#FFFFFF",
              borderRight: i < plans.length - 1 ? "1px solid #E0DAD0" : "none",
              position: "relative",
            }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -1, left: 36, background: "#FFFFFF", color: "#0A0A0A", fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", border: "1px solid #E0DAD0", borderTop: "none" }}>
                  {tx.popular}
                </div>
              )}

              <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: plan.highlight ? "#AAA" : "#7A746E", marginBottom: 20 }}>
                {plan.name}
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 52, fontWeight: 800, color: plan.highlight ? "#FFFFFF" : "#0A0A0A", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {plan.price}€
                </span>
                <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: plan.highlight ? "#AAA" : "#7A746E", marginLeft: 4 }}>
                  {tx.perMonth}
                </span>
              </div>

              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: plan.highlight ? "#C0BAB4" : "#7A746E", lineHeight: 1.6, margin: "0 0 32px", minHeight: 48 }}>
                {plan.desc}
              </p>

              <div style={{ borderTop: `1px solid ${plan.highlight ? "#1A1A1A" : "#E0DAD0"}`, paddingTop: 28, marginBottom: 32 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: plan.highlight ? "#AAA" : "#B0AA9E", flexShrink: 0, paddingTop: 2 }}>→</span>
                    <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: plan.highlight ? "#E0DAD0" : "#5A5450", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {session ? (
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <input type="hidden" name="plan" value={plan.id} />
                  <button type="submit" style={{
                    display: "block", width: "100%", textAlign: "center",
                    fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: plan.highlight ? "#0A0A0A" : "#FFFFFF",
                    background: plan.highlight ? "#FFFFFF" : "#0A0A0A",
                    padding: "14px 0", border: "none", cursor: "pointer",
                  }}>
                    {tx.startPaid}
                  </button>
                </form>
              ) : (
                <Link href="/register" style={{
                  display: "block", textAlign: "center",
                  fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: plan.highlight ? "#0A0A0A" : "#FFFFFF",
                  background: plan.highlight ? "#FFFFFF" : "#0A0A0A",
                  padding: "14px 0", textDecoration: "none",
                }}>
                  {tx.start}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "0 clamp(16px, 4vw, 48px) 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A746E", marginBottom: 40 }}>
            {tx.faqTitle}
          </div>
          {tx.faq.map((item, i) => (
            <div key={i} style={{ borderTop: "1px solid #E0DAD0", padding: "28px 0" }}>
              <div style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#0A0A0A", marginBottom: 12, lineHeight: 1.3 }}>
                {item.q}
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#7A746E", lineHeight: 1.75, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #E0DAD0", paddingTop: 28 }}>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#B0AA9E", margin: 0 }}>
              {lang === "fr" ? "Une autre question ? " : "Another question? "}
              <Link href="mailto:contact@crochett.ai" style={{ color: "#0A0A0A", textDecoration: "none", borderBottom: "1px solid #0A0A0A" }}>
                contact@crochett.ai
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0A0A0A", borderTop: "1px solid #1A1A1A", padding: "24px clamp(16px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 14, fontWeight: 700, color: "#AAA", letterSpacing: "0.06em", textTransform: "uppercase" }}>CROCHET.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/faq" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>FAQ</Link>
          <Link href="/rgpd" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>RGPD</Link>
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#666", letterSpacing: "0.08em" }}>{tx.footer}</span>
      </footer>

    </div>
  )
}
