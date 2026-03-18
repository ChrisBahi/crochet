"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

type SeedResult = { seeded?: number; deleted?: number; message: string; error?: string }

export function SeedButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  async function getToken() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? ""
  }

  async function handleSeed() {
    setLoading(true)
    setResult(null)
    try {
      const token = await getToken()
      const res = await fetch(`${window.location.origin}/api/admin/seed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: SeedResult = await res.json()
      if (!res.ok && res.status !== 409) {
        setResult({ success: false, message: data.error ?? `Erreur ${res.status}` })
      } else if (res.status === 409) {
        setResult({ success: false, message: data.message })
      } else {
        setResult({ success: true, message: data.message })
      }
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Erreur inconnue" })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setResult(null)
    setShowConfirmDelete(false)
    try {
      const token = await getToken()
      const res = await fetch(`${window.location.origin}/api/admin/seed`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: SeedResult = await res.json()
      setResult({ success: res.ok, message: data.message ?? data.error ?? `Erreur ${res.status}` })
    } catch (e) {
      setResult({ success: false, message: e instanceof Error ? e.message : "Erreur inconnue" })
    } finally {
      setLoading(false)
    }
  }

  const btnBase: React.CSSProperties = {
    padding: "10px 18px",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "var(--font-dm-sans), sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={handleSeed}
          disabled={loading}
          style={{
            ...btnBase,
            background: loading ? "#E0DAD0" : "#22c55e",
            color: loading ? "#7A746E" : "#fff",
          }}
        >
          {loading ? "En cours…" : "Seeder la plateforme (13 dossiers)"}
        </button>

        {!showConfirmDelete ? (
          <button
            onClick={() => setShowConfirmDelete(true)}
            disabled={loading}
            style={{
              ...btnBase,
              background: "transparent",
              color: "#7A746E",
              border: "1px solid #E0DAD0",
            }}
          >
            Supprimer seed
          </button>
        ) : (
          <>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{ ...btnBase, background: "#C0392B", color: "#fff" }}
            >
              Confirmer suppression
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={loading}
              style={{ ...btnBase, background: "transparent", color: "#7A746E", border: "1px solid #E0DAD0" }}
            >
              Annuler
            </button>
          </>
        )}
      </div>

      {result && (
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: result.success ? "#2D6A4F" : "#C0392B",
          lineHeight: 1.5,
        }}>
          {result.message}
        </div>
      )}

      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 11,
        color: "#7A746E",
        lineHeight: 1.5,
      }}>
        Insère 13 dossiers réalistes (6 cédants + 7 investisseurs) pour simuler l&apos;activité avant les premiers vrais clients.
        Après le seed, lancez le Match Engine pour générer les matches.
      </div>
    </div>
  )
}
