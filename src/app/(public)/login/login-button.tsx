"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLang } from "@/lib/lang/context"

const t = {
  fr: { emailPlaceholder: "Adresse email", passwordPlaceholder: "Mot de passe", errorMsg: "Identifiants incorrects.", loadingBtn: "Connexion…", submitBtn: "Se connecter", linkedinBtn: "Continuer avec LinkedIn" },
  en: { emailPlaceholder: "Email address", passwordPlaceholder: "Password", errorMsg: "Incorrect credentials.", loadingBtn: "Signing in…", submitBtn: "Sign in", linkedinBtn: "Continue with LinkedIn" },
}

export default function LoginButton() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = searchParams.get("admin") === "1"
  const { lang } = useLang()
  const tx = t[lang]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(tx.errorMsg)
      setLoading(false)
    } else {
      router.push("/app")
    }
  }

  const onLinkedIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: 13,
    color: "#0A0A0A",
    background: "#FAFAFA",
    border: "1px solid #E0DAD0",
    outline: "none",
    boxSizing: "border-box" as const,
  }

  if (isAdmin) {
    return (
      <div>
        <form onSubmit={onEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder={tx.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={tx.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <p style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#C0392B", margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 24px",
              background: "#0A0A0A",
              color: "#FFFFFF",
              border: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? tx.loadingBtn : tx.submitBtn}
          </button>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={onLinkedIn}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "13px 24px",
        background: "#0A66C2",
        color: "#FFFFFF",
        border: "none",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      {tx.linkedinBtn}
    </button>
  )
}
