import Link from "next/link"
import { cookies } from "next/headers"

export default async function FaqPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const tx = {
    fr: {
      badge: "Questions fréquentes",
      title: "Tout ce que vous",
      titleItalic: "devez savoir.",
      sub: "Sécurité, confidentialité, fonctionnement. Réponses directes.",
      sections: [
        {
          title: "Sécurité & confidentialité",
          items: [
            {
              q: "Comment mes données sont-elles protégées ?",
              a: "Toutes les données sont isolées par Row Level Security (RLS) au niveau base de données : chaque membre ne voit que les données auxquelles il est explicitement autorisé. Un investisseur ne peut jamais consulter les dossiers d'un autre investisseur. Le chiffrement TLS protège les données en transit. Les données au repos sont chiffrées par Supabase (PostgreSQL AES-256).",
            },
            {
              q: "Qui peut accéder à mes dossiers ?",
              a: "Uniquement vous, et la contrepartie à qui vous avez accordé l'accès dans une Room. L'équipe CROCHET n'accède jamais au contenu des Rooms ni aux documents partagés. Les administrateurs ont uniquement accès aux méta-données (statuts, scores) pour piloter le matching.",
            },
            {
              q: "Où sont hébergées les données ?",
              a: "En Europe (UE). Infrastructure Vercel (Edge Network européen) et Supabase (région EU West). Aucune donnée n'est transférée hors de l'UE. Nous sommes conformes au RGPD et au Chapitre V du règlement (transferts internationaux).",
            },
            {
              q: "Qu'est-ce que le NDA automatique ?",
              a: "Avant tout accès à un MEMO ou un document dans une Room, le membre doit signer un accord de confidentialité (NDA-CROCHET-V1). La signature est enregistrée en base avec horodatage et ID utilisateur. Aucun accès sans signature préalable — c'est une contrainte technique, pas seulement contractuelle.",
            },
            {
              q: "La Room peut-elle être capturée ou imprimée ?",
              a: "Des protections techniques sont en place : les contenus des Rooms sont masqués si l'onglet devient invisible (BlackScreenGuard), et l'impression est bloquée via CSS. Ces mesures ne sont pas infaillibles mais constituent une couche de protection dissuasive supplémentaire.",
            },
            {
              q: "Que se passe-t-il si je supprime mon compte ?",
              a: "Toutes vos données personnelles sont supprimées dans les 30 jours conformément au RGPD. Les Rooms auxquelles vous participez sont archivées. Vous pouvez exercer votre droit à l'effacement à tout moment via contact@crochett.ai.",
            },
          ],
        },
        {
          title: "Fonctionnement du matching",
          items: [
            {
              q: "Comment fonctionne le Match Engine ?",
              a: "Le moteur compare les critères de chaque investisseur actif (secteur, ticket, géographie, type d'opération) avec les opportunités qualifiées disponibles. Un algorithme de scoring calcule un M-Score (pertinence du match) et un D-Score (maturité du dossier). Seuls les matches au-dessus d'un seuil de pertinence sont présentés.",
            },
            {
              q: "Qui peut déposer une opportunité ?",
              a: "Uniquement les membres admis. Crochet. est une infrastructure sur invitation — chaque profil est vérifié manuellement avant activation. Les opportunités passent par une qualification IA (analyse de PDF, bilan, deck) avant d'être visibles par les investisseurs.",
            },
            {
              q: "Combien de temps pour obtenir un match ?",
              a: "Le matching est automatique après qualification du dossier. Si des investisseurs actifs correspondent aux critères, un match est généré dans les 24h. Si aucun profil ne correspond, le dossier reste en attente et est re-testé à chaque nouveau membre admis.",
            },
          ],
        },
        {
          title: "Tarification & essai",
          items: [
            {
              q: "L'essai est-il vraiment gratuit ?",
              a: "Oui. 14 jours d'accès complet, sans carte bancaire requise au départ. Votre CB n'est demandée qu'au moment du premier partage de Room avec une contrepartie — c'est-à-dire quand vous activez réellement le service pour une négociation.",
            },
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui, sans engagement. L'annulation prend effet à la fin de la période en cours. Aucun frais d'annulation.",
            },
            {
              q: "Le tarif inclut-il la qualification IA ?",
              a: "Oui, tous les plans incluent le Match Engine et la qualification automatique des dossiers (D-Score, MEMO structuré, analyse IA). L'export PDF du MEMO est disponible à partir du plan Pro.",
            },
          ],
        },
      ],
      contact: "Une question non couverte ici ?",
      contactLink: "Contactez-nous",
      footer: "© 2025 CROCHET — CONFIDENTIEL",
    },
    en: {
      badge: "Frequently asked questions",
      title: "Everything you",
      titleItalic: "need to know.",
      sub: "Security, privacy, how it works. Direct answers.",
      sections: [
        {
          title: "Security & confidentiality",
          items: [
            {
              q: "How is my data protected?",
              a: "All data is isolated via Row Level Security (RLS) at the database level: each member only sees data they are explicitly authorised to access. One investor can never view another investor's files. TLS encryption protects data in transit. Data at rest is encrypted by Supabase (PostgreSQL AES-256).",
            },
            {
              q: "Who can access my files?",
              a: "Only you, and the counterpart you have granted access to in a Room. The CROCHET team never accesses Room contents or shared documents. Admins only have access to meta-data (statuses, scores) to manage matching.",
            },
            {
              q: "Where is data hosted?",
              a: "In Europe (EU). Vercel infrastructure (European Edge Network) and Supabase (EU West region). No data is transferred outside the EU. We comply with GDPR and Chapter V of the regulation (international transfers).",
            },
            {
              q: "What is the automatic NDA?",
              a: "Before accessing any MEMO or document in a Room, the member must sign a non-disclosure agreement (NDA-CROCHET-V1). The signature is recorded in the database with timestamp and user ID. No access without prior signature — this is a technical constraint, not just contractual.",
            },
            {
              q: "Can the Room be captured or printed?",
              a: "Technical protections are in place: Room contents are hidden if the tab becomes invisible (BlackScreenGuard), and printing is blocked via CSS. These measures are not foolproof but provide an additional deterrent layer of protection.",
            },
            {
              q: "What happens if I delete my account?",
              a: "All your personal data is deleted within 30 days in accordance with GDPR. Rooms you participate in are archived. You can exercise your right to erasure at any time via contact@crochett.ai.",
            },
          ],
        },
        {
          title: "How matching works",
          items: [
            {
              q: "How does the Match Engine work?",
              a: "The engine compares each active investor's criteria (sector, ticket size, geography, deal type) with available qualified opportunities. A scoring algorithm calculates an M-Score (match relevance) and a D-Score (file maturity). Only matches above a relevance threshold are presented.",
            },
            {
              q: "Who can submit an opportunity?",
              a: "Only admitted members. Crochet. is an invitation-only infrastructure — every profile is manually verified before activation. Opportunities go through AI qualification (PDF analysis, financials, deck) before being visible to investors.",
            },
            {
              q: "How long to get a match?",
              a: "Matching is automatic after file qualification. If active investors match the criteria, a match is generated within 24 hours. If no profile matches, the file remains pending and is re-tested with each newly admitted member.",
            },
          ],
        },
        {
          title: "Pricing & trial",
          items: [
            {
              q: "Is the trial really free?",
              a: "Yes. 14 days of full access, no credit card required upfront. Your card is only requested when you first share a Room with a counterpart — i.e., when you actually activate the service for a negotiation.",
            },
            {
              q: "Can I cancel at any time?",
              a: "Yes, no commitment. Cancellation takes effect at the end of the current period. No cancellation fee.",
            },
            {
              q: "Does the price include AI qualification?",
              a: "Yes, all plans include the Match Engine and automatic file qualification (D-Score, structured MEMO, AI analysis). MEMO PDF export is available from the Pro plan.",
            },
          ],
        },
      ],
      contact: "A question not covered here?",
      contactLink: "Contact us",
      footer: "© 2025 CROCHET — CONFIDENTIAL",
    },
  }[lang]

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE", fontFamily: "var(--font-dm-sans), sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#0A0A0A", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: "clamp(16px, 4vw, 48px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 700, color: "#FFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            CROCHETT.
          </span>
        </Link>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/pricing" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#AAA", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {lang === "fr" ? "Tarifs" : "Pricing"}
          </Link>
          <Link href="/register" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 600, color: "#000", background: "#FFF", textDecoration: "none", padding: "8px 20px", letterSpacing: "0.04em" }}>
            +Signal →
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: "72px clamp(16px, 4vw, 48px) 64px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A746E", marginBottom: 24 }}>
          {tx.badge}
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#0A0A0A", margin: "0 0 4px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {tx.title}
        </h1>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: "#0A0A0A", margin: "0 0 24px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {tx.titleItalic}
        </h1>
        <p style={{ fontSize: 15, color: "#7A746E", margin: 0, lineHeight: 1.7 }}>
          {tx.sub}
        </p>
      </section>

      {/* ── FAQ SECTIONS ── */}
      {tx.sections.map((section, si) => (
        <section key={si} style={{ padding: "0 clamp(16px, 4vw, 48px) 64px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A746E", marginBottom: 32, paddingBottom: 16, borderBottom: "2px solid #0A0A0A" }}>
            {section.title}
          </div>
          {section.items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #E0DAD0", padding: "28px 0" }}>
              <div style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "#0A0A0A", marginBottom: 14, lineHeight: 1.3 }}>
                {item.q}
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#5A5450", lineHeight: 1.8, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}
        </section>
      ))}

      {/* ── CONTACT ── */}
      <section style={{ padding: "0 clamp(16px, 4vw, 48px) 80px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ background: "#0A0A0A", padding: "40px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: 22, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
              {tx.contact}
            </div>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#AAA", margin: 0 }}>
              contact@crochett.ai
            </p>
          </div>
          <Link href="mailto:contact@crochett.ai" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0A0A0A", background: "#FFFFFF", padding: "12px 28px", textDecoration: "none" }}>
            {tx.contactLink} →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0A0A0A", borderTop: "1px solid #1A1A1A", padding: "24px clamp(16px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 14, fontWeight: 700, color: "#AAA", letterSpacing: "0.06em", textTransform: "uppercase" }}>CROCHETT.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/pricing" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>{lang === "fr" ? "Tarifs" : "Pricing"}</Link>
          <Link href="/rgpd" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>RGPD</Link>
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#666", letterSpacing: "0.08em" }}>{tx.footer}</span>
      </footer>

    </div>
  )
}
