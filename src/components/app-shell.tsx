"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { NotificationBell } from "@/components/notification-bell"
import { useLang } from "@/lib/lang/context"

const NAV_FR = [
  { href: "/app/matches",       label: "Matches" },
  { href: "/app/opportunities", label: "Opportunités" },
  { href: "/app/rooms",         label: "Rooms" },
  { href: "/app/profile",       label: "Profil" },
  { href: "/app/billing",       label: "Abonnement" },
]

const NAV_EN = [
  { href: "/app/matches",       label: "Matches" },
  { href: "/app/opportunities", label: "Opportunities" },
  { href: "/app/rooms",         label: "Rooms" },
  { href: "/app/profile",       label: "Profile" },
  { href: "/app/billing",       label: "Billing" },
]

const ADMIN_NAV = { href: "/app/admin", label: "Admin" }

export function AppShell({
  children,
  userId,
  isAdmin = false,
}: {
  children: React.ReactNode
  userId: string | null
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const { lang, setLang } = useLang()
  const baseNav = lang === "en" ? NAV_EN : NAV_FR
  const nav = isAdmin ? [...baseNav, ADMIN_NAV] : baseNav

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#0A0A0A" }}>
      {/* Header */}
      <header className="no-print" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#FFFFFF", borderBottom: "2px solid #0A0A0A",
        display: "flex", alignItems: "center",
        height: 56, paddingInline: 32, gap: 40,
      }}>
        {/* Logo */}
        <Link href="/app" style={{ textDecoration: "none", flexShrink: 0 }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontStyle: "normal", fontSize: 18, fontWeight: 700,
            color: "#0A0A0A", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            CROCHETT.
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 0, flex: 1 }}>
          {nav.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "0 16px", height: 56,
                  display: "flex", alignItems: "center",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  color: active ? "#0A0A0A" : "#7A746E",
                  borderBottom: active ? "2px solid #0A0A0A" : "2px solid transparent",
                  marginBottom: "-2px",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <Link
            href="/app/opportunities/new"
            style={{
              padding: "7px 16px", background: "#0A0A0A", color: "#FFFFFF",
              textDecoration: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            {lang === "en" ? "Submit" : "Soumettre"}
          </Link>

          {userId && <NotificationBell userId={userId} />}

          <button
            onClick={logout}
            style={{
              padding: "7px 14px", background: "transparent",
              color: "#7A746E", border: "1px solid #E0DAD0",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {lang === "en" ? "Sign out" : "Sortir"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
