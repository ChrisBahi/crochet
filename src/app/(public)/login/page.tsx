"use client"

export const dynamic = 'force-dynamic'

import LoginButton from "./login-button"
import Link from "next/link"
import { Suspense } from "react"
import { useLang } from "@/lib/lang/context"

const t = {
  fr: {
    headerLink: "Demander l'accès",
    label: "Accès membres",
    title: "Connexion.",
    subtitle: "Réseau privé. Accès réservé aux membres admis.",
    notMember: "Pas encore membre ?",
    apply: "Soumettre une candidature",
  },
  en: {
    headerLink: "Request access",
    label: "Member access",
    title: "Sign in.",
    subtitle: "Private network. Access reserved for admitted members.",
    notMember: "Not a member yet?",
    apply: "Submit an application",
  },
}

export default function LoginPage() {
  const { lang } = useLang()
  const tx = t[lang]

  return (
    <div style={{ minHeight: "100vh", background: "#F5F2EE", display: "flex", flexDirection: "column" }}>

      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20, fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
          }}>
            CROCHET.
          </span>
        </Link>
        <Link href="/register" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" as const,
          color: "#7A746E", textDecoration: "none",
        }}>
          {tx.headerLink}
        </Link>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#FFFFFF", border: "1px solid #E0DAD0", padding: "48px 44px" }}>

          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" as const,
            color: "#7A746E", marginBottom: 16,
          }}>
            {tx.label}
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontStyle: "italic", fontSize: 30, fontWeight: 700,
            color: "#0A0A0A", margin: "0 0 8px", lineHeight: 1.2,
          }}>
            {tx.title}
          </h1>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13, color: "#7A746E", lineHeight: 1.7, margin: "0 0 32px",
          }}>
            {tx.subtitle}
          </p>

          <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

          <Suspense>
            <LoginButton />
          </Suspense>

          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11, color: "#7A746E", marginTop: 24, lineHeight: 1.7, textAlign: "center" as const,
          }}>
            {tx.notMember}{" "}
            <Link href="/register" style={{ color: "#0A0A0A", textDecoration: "underline" }}>
              {tx.apply}
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
