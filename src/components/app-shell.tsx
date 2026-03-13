"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const tabs = [
  { href: "/app", label: "Tableau de bord" },
  { href: "/app/opportunities", label: "Projets" },
  { href: "/app/matches", label: "Correspondances" },
  { href: "/app/rooms", label: "Salons" },
  { href: "/app/settings", label: "Paramètres" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontWeight: 700 }}>Crochet</div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {tabs.map(t => {
            const active = pathname === t.href
            return (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid #ddd",
                  background: active ? "#000" : "transparent",
                  color: active ? "#fff" : "#000",
                }}
              >
                {t.label}
              </Link>
            )
          })}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={logout}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
          >
            Logout
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
