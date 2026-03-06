"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { redirect } from "next/navigation"

export async function requestIntro(matchId: string, opportunityId: string) {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const supabase = await createClient()

  // 1. Chercher une room déjà existante pour ce match
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle()

  if (existingRoom) {
    redirect(`/app/rooms/${existingRoom.id}`)
  }

  // 2. Créer la Secure Room
  const roomPayload: Record<string, unknown> = {
    match_id: matchId,
    workspace_id: wsId,
    status: "active",
  }
  // opportunity_id si la colonne existe déjà
  if (opportunityId) roomPayload.opportunity_id = opportunityId

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .insert(roomPayload)
    .select("id")
    .single()

  if (roomErr || !room) {
    throw new Error(roomErr?.message ?? "Impossible de créer la Room")
  }

  // 3. Message système d'ouverture
  await supabase.from("messages").insert({
    room_id: room.id,
    sender_id: user.id,
    created_by: user.id,
    content: `__SYSTEM__: Secure Room ouverte. NDA-CROCHET-V1 en vigueur. Intro demandée le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`,
  })

  // 4. Mettre à jour le statut du match
  await supabase
    .from("opportunity_matches")
    .update({ status: "intro_requested" })
    .eq("id", matchId)

  redirect(`/app/rooms/${room.id}`)
}
