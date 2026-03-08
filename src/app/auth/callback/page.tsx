"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for OAuth error in URL params
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get("error")
    const oauthErrorDesc = params.get("error_description")

    if (oauthError) {
      setError(oauthErrorDesc ?? oauthError)
      return
    }

    const supabase = createClient()

    // createBrowserClient auto-detects ?code= and handles PKCE exchange.
    // We just listen for the result.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/app")
      }
    })

    // In case the session is already set (fast exchange), check immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/app")
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F2EE",
        fontFamily: "var(--font-dm-sans), sans-serif",
        gap: 16,
      }}>
        <div style={{ fontSize: 13, color: "#B91C1C", maxWidth: 400, textAlign: "center", lineHeight: 1.7 }}>
          Erreur de connexion : {error}
        </div>
        <a href="/login" style={{
          fontSize: 12,
          color: "#0A0A0A",
          textDecoration: "underline",
          letterSpacing: "0.04em",
        }}>
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0A0A0A",
    }}>
      <div>
        <div style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}>
          Le signal,
        </div>
        <div style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}>
          pas le bruit.
        </div>
      </div>
    </div>
  )
}
