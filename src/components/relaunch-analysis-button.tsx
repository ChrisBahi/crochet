"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RelaunchAnalysisButton({
  opportunityId,
  compact = false,
}: {
  opportunityId: string
  compact?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onRelaunch() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Relance impossible")
      }

      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Relance impossible")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: compact ? 0 : 14 }}>
      <button
        type="button"
        onClick={onRelaunch}
        disabled={loading}
        style={{
          border: "1px solid #0A0A0A",
          background: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: compact ? 11 : 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          padding: compact ? "6px 10px" : "10px 16px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Relance en cours..." : "Relancer l'analyse"}
      </button>

      {error ? (
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: "#9F3A2E",
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
