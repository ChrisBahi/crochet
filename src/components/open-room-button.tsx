"use client"

import { useState } from "react"
import { activateRoom } from "@/app/app/matches/actions"

export function OpenRoomButton({
  matchId,
  opportunityId,
}: {
  matchId: string
  opportunityId: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await activateRoom(matchId, opportunityId)
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: "12px 28px",
        background: loading ? "#F5F0E8" : "#052e16",
        color: loading ? "#7A746E" : "#22c55e",
        border: `1px solid ${loading ? "#E0DAD0" : "#16a34a"}`,
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.1s",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading ? (
        <>
          <span style={{
            display: "inline-block",
            width: 10,
            height: 10,
            border: "1.5px solid #7A746E",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          Ouverture…
        </>
      ) : (
        <>🔒 Ouvrir la Room</>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}
