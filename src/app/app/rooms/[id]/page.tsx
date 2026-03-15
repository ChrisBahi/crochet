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

  // Validations for this room
  const { data: validations } = await supabase
    .from("room_validations")
    .select("user_id, created_at")
    .eq("room_id", roomId)

  const displayName = (profile?.name as string) ?? user.email?.split("@")[0] ?? "Vous"

  // Demo fallback: if no real opportunity, inject mock data so the room is explorable
  const isDemo = !opportunity && !room.match_id && !room.opportunity_id
  const resolvedOpportunity = opportunity ?? (isDemo ? {
    id: "demo",
    title: "Services industriels · Lyon",
    deal_type: "Cession majoritaire 65%",
    sector: "Industrie B2B",
    geo: "Lyon, France",
    stage: "NDA signé",
    amount: "12–18M€",
    valuation: "15M€",
    pitch_deck_url: null,
    website_url: null,
  } : null)
  const resolvedDeck = deck ?? (isDemo ? {
    summary: "Société de services industriels B2B basée à Lyon. Leader régional dans la maintenance avec un carnet de commandes récurrent (85% de récurrence). CA 4,2M€ stable sur 5 ans, croissance organique 8%/an. EBITDA 22%. Cession majoritaire initiée par le fondateur pour transmission patrimoniale.",
    d_score: 87,
    tags: ["Industrie", "B2B", "Récurrent", "PME", "Lyon"],
    status: "qualified",
    nda_text: "NDA-DEMO-CROCHET-V1",
  } : null)

  // Vérification réelle de la signature NDA en base
  const opportunityId = (resolvedOpportunity as { id?: string } | null)?.id
  let ndaSigned = false
  if (isDemo) {
    // En démo : NDA toujours considéré signé pour pouvoir explorer la room
    ndaSigned = true
  } else if (opportunityId) {
    const { data: sig } = await supabase
      .from("nda_signatures")
      .select("id")
      .eq("opportunity_id", opportunityId)
      .eq("user_id", user.id)
      .maybeSingle()
    ndaSigned = !!sig
  }

  return (
    <RoomShell
      roomId={roomId}
      roomRef={isDemo ? "ROOM-DEMO" : `ROOM-${roomId.slice(0, 8).toUpperCase()}`}
      roomStatus={(room.status as string) ?? "active"}
      opportunity={resolvedOpportunity}
      deck={resolvedDeck}
      ndaSigned={ndaSigned}
      initialMessages={messages ?? []}
      userId={user.id}
      displayName={displayName}
      initialValidations={validations ?? []}
    />
  )
}
