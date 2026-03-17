"use client"

import { useTransition } from "react"
import { signNda } from "./actions"

type Props = {
  opportunityId: string
  ndaReference: string
  alreadySigned: boolean
  signedAt?: string | null
}

export function NdaSignButton({ opportunityId, ndaReference, alreadySigned, signedAt }: Props) {
  const [pending, startTransition] = useTransition()

  if (alreadySigned) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#22c55e",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          Signé électroniquement
          {signedAt && (
            <span style={{ color: "#7A746E", marginLeft: 8 }}>
              · {new Date(signedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </span>
      </div>
    )
  }

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() => signNda(opportunityId, ndaReference))
      }
      style={{
        padding: "10px 28px",
        background: "#0A0A0A",
        color: "#FFFFFF",
        border: "none",
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? "En cours..." : "Signer électroniquement"}
    </button>
  )
}
