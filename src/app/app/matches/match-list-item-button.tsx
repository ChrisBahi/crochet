"use client"

import { useRouter } from "next/navigation"

export function MatchListItemButton({
  matchId,
  active,
  children,
}: {
  matchId: string
  active: boolean
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(`/app/matches?match=${matchId}`)}
      style={{
        width: "100%",
        display: "block",
        padding: "16px 24px",
        borderBottom: "1px solid #E0DAD0",
        background: active ? "#F5F0E8" : "transparent",
        borderLeft: active ? "3px solid #0A0A0A" : "3px solid transparent",
        borderTop: "none",
        borderRight: "none",
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor: "#E0DAD0",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
