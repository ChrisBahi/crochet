"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    const params = new URLSearchParams(window.location.search)
    return params.get("error_description") ?? params.get("error")
  })

  useEffect(() => {
    if (error) return

    const supabase = createClient()

    // createBrowserClient auto-detects ?code= and handles PKCE exchange.
    // Access control is enforced server-side in middleware.
    async function checkAndRedirect(session: { user: { email?: string } }) {
      const email = session.user.email
      if (!email) {
        await supabase.auth.signOut()
        router.replace("/unauthorized")
        return
      }
      router.replace("/app")
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkAndRedirect(session)
      }
    })

    // In case the session is already set (fast exchange), check immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkAndRedirect(session)
    })

    return () => subscription.unsubscribe()
  }, [router, error])

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
