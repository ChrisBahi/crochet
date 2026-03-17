"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

/**
 * Invisible component — when deckStatus is "pending" or "processing",
 * polls by calling router.refresh() every 3s until the server re-renders
 * with status "done" or "error", at which point it stops.
 */
export function DeckStatusPoller({
  opportunityId,
  deckStatus,
}: {
  opportunityId: string
  deckStatus: string
}) {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (deckStatus !== "pending" && deckStatus !== "processing") return

    intervalRef.current = setInterval(() => {
      router.refresh()
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [deckStatus, opportunityId, router])

  return null
}
