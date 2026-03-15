"use client"

import { useTransition } from "react"
import { setVerificationStatus } from "./actions"

type Status = "unverified" | "pending" | "verified"

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  verified:   { label: "Vérifié",     color: "#2D6A4F", bg: "#F0FFF4" },
  pending:    { label: "En cours",    color: "#B7791F", bg: "#FFFBEB" },
  unverified: { label: "Non vérifié", color: "#7A746E", bg: "#F5F0EB" },
}

export function KycActions({ userId, current }: { userId: string; current: Status }) {
  const [isPending, startTransition] = useTransition()

  const next = current === "unverified"
    ? "pending"
    : current === "pending"
    ? "verified"
    : "unverified"

  const cfg = STATUS_CONFIG[current]

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        padding: "3px 8px",
        borderRadius: 2,
      }}>
        {cfg.label}
      </span>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => setVerificationStatus(userId, next))}
        style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
          background: "none",
          border: "1px solid #E0DAD0",
          padding: "3px 10px",
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.5 : 1,
          letterSpacing: "0.04em",
        }}
      >
        → {STATUS_CONFIG[next].label}
      </button>
    </div>
  )
}
