import Link from "next/link"
import { cookies } from "next/headers"

export default async function RgpdPage() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE", fontFamily: "var(--font-dm-sans), sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "#0A0A0A", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: "clamp(16px, 4vw, 48px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 700, color: "#FFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            CROCHET.
          </span>
        </Link>
        <Link href="/faq" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#AAA", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          FAQ
        </Link>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px clamp(16px, 4vw, 48px) 80px" }}>

        <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A746E", marginBottom: 24 }}>
          {lang === "fr" ? "Politique de confidentialité · RGPD" : "Privacy Policy · GDPR"}
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair), serif", fontStyle: "italic", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: "#0A0A0A", margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {lang === "fr" ? "Vos données. Votre contrôle." : "Your data. Your control."}
        </h1>
        <p style={{ fontSize: 13, color: "#B0AA9E", fontFamily: "var(--font-jetbrains), monospace", letterSpacing: "0.06em", marginBottom: 48 }}>
          {lang === "fr" ? "Dernière mise à jour : 15 mars 2026 · Version 1.0" : "Last updated: 15 March 2026 · Version 1.0"}
        </p>

        {[
          {
            title: lang === "fr" ? "1. Responsable du traitement" : "1. Data controller",
            body: lang === "fr"
              ? "CROCHET SAS (en cours d'immatriculation) — contact@crochett.ai — France. Pour toute question relative à vos données personnelles, contactez notre DPO à l'adresse ci-dessus."
              : "CROCHET SAS (incorporation in progress) — contact@crochett.ai — France. For any questions about your personal data, contact our DPO at the address above.",
          },
          {
            title: lang === "fr" ? "2. Données collectées" : "2. Data collected",
            body: lang === "fr"
              ? "Nous collectons uniquement les données nécessaires au fonctionnement du service : (a) Données d'identification : nom, prénom, adresse email, société, LinkedIn. (b) Données professionnelles : type d'investisseur, ticket d'investissement, secteurs, géographie. (c) Données de connexion : adresse IP, horodatage de connexion, user-agent (conservation 30 jours). (d) Données de deal : informations déposées dans les opportunités et Rooms (documents, messages, fichiers). Ces dernières ne sont jamais lues par l'équipe CROCHET."
              : "We only collect data necessary for the operation of the service: (a) Identification data: first name, last name, email address, company, LinkedIn. (b) Professional data: investor type, investment ticket, sectors, geography. (c) Connection data: IP address, connection timestamp, user-agent (retained 30 days). (d) Deal data: information submitted in opportunities and Rooms (documents, messages, files). This data is never read by the CROCHET team.",
          },
          {
            title: lang === "fr" ? "3. Bases légales" : "3. Legal bases",
            body: lang === "fr"
              ? "Exécution du contrat (Art. 6.1.b RGPD) : traitement des données pour fournir le service. Intérêt légitime (Art. 6.1.f) : sécurité de la plateforme, prévention des fraudes. Obligation légale (Art. 6.1.c) : conservation des preuves de signature NDA, obligations comptables. Consentement (Art. 6.1.a) : communications marketing (opt-in explicite)."
              : "Performance of contract (Art. 6.1.b GDPR): processing data to provide the service. Legitimate interest (Art. 6.1.f): platform security, fraud prevention. Legal obligation (Art. 6.1.c): retention of NDA signature evidence, accounting obligations. Consent (Art. 6.1.a): marketing communications (explicit opt-in).",
          },
          {
            title: lang === "fr" ? "4. Durées de conservation" : "4. Retention periods",
            body: lang === "fr"
              ? "Compte actif : données conservées pour la durée du contrat + 3 ans. Compte supprimé : données effacées dans les 30 jours (sauf obligations légales). Logs de connexion : 30 jours. Signatures NDA : 5 ans (valeur probatoire). Données de facturation : 10 ans (Code de commerce)."
              : "Active account: data retained for the duration of the contract + 3 years. Deleted account: data erased within 30 days (except legal obligations). Connection logs: 30 days. NDA signatures: 5 years (evidential value). Billing data: 10 years (Commercial Code).",
          },
          {
            title: lang === "fr" ? "5. Sous-traitants & transferts" : "5. Sub-processors & transfers",
            body: lang === "fr"
              ? "Nos sous-traitants sont tous établis en UE ou couverts par des garanties appropriées : Supabase Inc. (hébergement base de données, région EU West — Clauses Contractuelles Types), Vercel Inc. (hébergement applicatif, Edge Network Europe — SCC), Stripe Inc. (paiement — SCC + DPA), Resend Inc. (emails transactionnels — SCC). Aucun transfert de données de deal vers des pays tiers."
              : "Our sub-processors are all established in the EU or covered by appropriate safeguards: Supabase Inc. (database hosting, EU West region — Standard Contractual Clauses), Vercel Inc. (application hosting, European Edge Network — SCCs), Stripe Inc. (payments — SCCs + DPA), Resend Inc. (transactional emails — SCCs). No transfer of deal data to third countries.",
          },
          {
            title: lang === "fr" ? "6. Sécurité technique" : "6. Technical security",
            body: lang === "fr"
              ? "Row Level Security (RLS) PostgreSQL : isolation stricte des données par utilisateur. Chiffrement AES-256 au repos (Supabase). TLS 1.3 en transit. Accès sur invitation uniquement, vérification manuelle de chaque membre. NDA obligatoire signé avant tout accès à un document. Protection anti-capture d'écran (masquage onglet inactif). Interdiction d'impression via CSS."
              : "Row Level Security (RLS) PostgreSQL: strict data isolation per user. AES-256 encryption at rest (Supabase). TLS 1.3 in transit. Invitation-only access, manual verification of each member. Mandatory NDA signed before any document access. Anti-screen capture protection (inactive tab masking). Print prohibition via CSS.",
          },
          {
            title: lang === "fr" ? "7. Vos droits" : "7. Your rights",
            body: lang === "fr"
              ? "Conformément au RGPD, vous disposez des droits suivants, exercéables à contact@crochett.ai : Droit d'accès (Art. 15) : obtenir une copie de vos données. Droit de rectification (Art. 16) : corriger des données inexactes. Droit à l'effacement (Art. 17) : demander la suppression de vos données. Droit à la portabilité (Art. 20) : recevoir vos données dans un format structuré. Droit d'opposition (Art. 21) : vous opposer au traitement pour intérêt légitime. Délai de réponse : 30 jours. En cas de litige, vous pouvez saisir la CNIL (www.cnil.fr)."
              : "In accordance with GDPR, you have the following rights, exercisable at contact@crochett.ai: Right of access (Art. 15): obtain a copy of your data. Right to rectification (Art. 16): correct inaccurate data. Right to erasure (Art. 17): request deletion of your data. Right to portability (Art. 20): receive your data in a structured format. Right to object (Art. 21): object to processing based on legitimate interest. Response time: 30 days. In case of dispute, you can contact the CNIL (www.cnil.fr).",
          },
          {
            title: lang === "fr" ? "8. Cookies" : "8. Cookies",
            body: lang === "fr"
              ? "CROCHET utilise uniquement des cookies strictement nécessaires au fonctionnement du service : cookie de session (authentification Supabase, durée : session), cookie de langue (crochet_lang, durée : 1 an). Aucun cookie publicitaire ou de tracking tiers."
              : "CROCHET uses only strictly necessary cookies for the service to function: session cookie (Supabase authentication, duration: session), language cookie (crochet_lang, duration: 1 year). No advertising or third-party tracking cookies.",
          },
          {
            title: lang === "fr" ? "9. Modifications" : "9. Changes",
            body: lang === "fr"
              ? "Cette politique peut être mise à jour. En cas de modification substantielle, vous serez notifié par email 30 jours avant l'entrée en vigueur. La version en vigueur est toujours accessible sur cette page."
              : "This policy may be updated. In case of substantial changes, you will be notified by email 30 days before they take effect. The current version is always accessible on this page.",
          },
        ].map((section, i) => (
          <div key={i} style={{ borderTop: "1px solid #E0DAD0", padding: "32px 0" }}>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 700, color: "#0A0A0A", margin: "0 0 16px", lineHeight: 1.3 }}>
              {section.title}
            </h2>
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 14, color: "#5A5450", lineHeight: 1.85, margin: 0 }}>
              {section.body}
            </p>
          </div>
        ))}

        <div style={{ borderTop: "2px solid #0A0A0A", paddingTop: 32, marginTop: 16 }}>
          <p style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 10, color: "#B0AA9E", letterSpacing: "0.08em", margin: 0 }}>
            NDA-CROCHET-V1 · RGPD (UE) 2016/679 · Droit français applicable
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0A0A0A", borderTop: "1px solid #1A1A1A", padding: "24px clamp(16px, 4vw, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 14, fontWeight: 700, color: "#AAA", letterSpacing: "0.06em", textTransform: "uppercase" }}>CROCHET.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/faq" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>FAQ</Link>
          <Link href="/pricing" style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#666", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>{lang === "fr" ? "Tarifs" : "Pricing"}</Link>
        </div>
        <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 9, color: "#666", letterSpacing: "0.08em" }}>
          {lang === "fr" ? "© 2025 CROCHET — CONFIDENTIEL" : "© 2025 CROCHET — CONFIDENTIAL"}
        </span>
      </footer>

    </div>
  )
}
