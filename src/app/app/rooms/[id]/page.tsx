import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { redirect } from "next/navigation"
import { RoomShell } from "@/components/secure-room/room-shell"

export const dynamic = "force-dynamic"

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id: roomId } = await params
  const supabase = await createClient()

  // Room
  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single()

  if (roomErr || !room) redirect("/app/rooms")

  // Messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })

  // Opportunity via match → opportunity_a or directly from room.opportunity_id
  let opportunity: Record<string, unknown> | null = null
  let deck: Record<string, unknown> | null = null

  if (room.opportunity_id) {
    const { data: opp } = await supabase
      .from("opportunities")
      .select("id, title, deal_type, sector, geo, stage, amount, valuation, pitch_deck_url, website_url")
      .eq("id", room.opportunity_id)
      .maybeSingle()
    opportunity = opp

    if (opp?.id) {
      const { data: d } = await supabase
        .from("opportunity_decks")
        .select("summary, d_score, tags, status, nda_text")
        .eq("opportunity_id", opp.id as string)
        .maybeSingle()
      deck = d
    }
  } else if (room.match_id) {
    // Legacy: resolve through matches table
    const { data: match } = await supabase
      .from("matches")
      .select("opportunity_a")
      .eq("id", room.match_id)
      .maybeSingle()

    if (match?.opportunity_a) {
      const { data: opp } = await supabase
        .from("opportunities")
        .select("id, title, deal_type, sector, geo, stage, amount, valuation, pitch_deck_url, website_url")
        .eq("id", match.opportunity_a)
        .maybeSingle()
      opportunity = opp
    }
  }

  // Current user profile
  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("name, firm")
    .eq("user_id", user.id)
    .maybeSingle()

  const displayName = (profile?.name as string) ?? user.email?.split("@")[0] ?? "Vous"
  const ndaSigned = !!(deck?.nda_text)

  return (
    <RoomShell
      roomId={roomId}
      roomRef={`ROOM-${roomId.slice(0, 8).toUpperCase()}`}
      roomStatus={(room.status as string) ?? "active"}
      opportunity={opportunity}
      deck={deck}
      ndaSigned={ndaSigned}
      initialMessages={messages ?? []}
      userId={user.id}
      displayName={displayName}
    />
  )
}
