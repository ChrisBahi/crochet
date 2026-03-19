"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { redirect } from "next/navigation"
import { createNotification } from "@/lib/notifications/create"

/**
 * Step 1 — Party A asks for an intro.
 * Sets match status to intro_requested + notifies the other party.
 * Does NOT create a room yet.
 */
export async function requestIntro(matchId: string, opportunityId: string) {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const supabase = await createClient()

  // Get match details to find the other party
  const { data: match } = await supabase
    .from("opportunity_matches")
    .select("member_id, status")
    .eq("id", matchId)
    .maybeSingle()

  if (!match) throw new Error("Match introuvable")
  if (match.status === "intro_requested" || match.status === "room_active" || match.status === "closing") {
    // Already past this step — redirect to room if it exists
    const { data: existingRoom } = await supabase
      .from("rooms")
      .select("id")
      .eq("match_id", matchId)
      .maybeSingle()
    if (existingRoom) redirect(`/app/rooms/${existingRoom.id}`)
    return
  }

  // Set status to intro_requested
  await supabase
    .from("opportunity_matches")
    .update({ status: "intro_requested" })
    .eq("id", matchId)

  // Notify the other party (member_id)
  if (match.member_id) {
    await createNotification({
      supabase,
      userId: match.member_id,
      workspaceId: wsId ?? undefined,
      type: "intro_requested",
      title: "Intro demandée",
      body: "Une contrepartie souhaite entrer en contact. Accédez à votre dossier pour confirmer.",
      link: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://crochett.ai"}/app/matches`,
      email: undefined,
    })
  }

  // Revalidate matches page
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/app/matches")
}

/**
 * Step 2 — Either party activates the Secure Room.
 * Creates the room and sets match status to room_active.
 */
export async function activateRoom(matchId: string, opportunityId: string) {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const supabase = await createClient()

  // Check for existing room
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle()

  if (existingRoom) {
    redirect(`/app/rooms/${existingRoom.id}`)
  }

  // Create the Secure Room
  const roomPayload: Record<string, unknown> = {
    match_id: matchId,
    workspace_id: wsId,
    status: "active",
  }
  if (opportunityId) roomPayload.opportunity_id = opportunityId

  const { data: room, error: roomErr } = await supabase
    .from("rooms")
    .insert(roomPayload)
    .select("id")
    .single()

  if (roomErr || !room) {
    throw new Error(roomErr?.message ?? "Impossible de créer la Room")
  }

  // System opening message
  await supabase.from("messages").insert({
    room_id: room.id,
    sender_id: user.id,
    created_by: user.id,
    content: `__SYSTEM__: Secure Room ouverte. NDA-CROCHET-V1 en vigueur. Room activée le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.`,
  })

  // Update match status to room_active
  await supabase
    .from("opportunity_matches")
    .update({ status: "room_active" })
    .eq("id", matchId)

  // Notify
  const { data: match } = await supabase
    .from("opportunity_matches")
    .select("member_id")
    .eq("id", matchId)
    .maybeSingle()

  if (match?.member_id) {
    await createNotification({
      supabase,
      userId: match.member_id,
      workspaceId: wsId ?? undefined,
      type: "intro_requested",
      title: "Secure Room ouverte",
      body: "La Room sécurisée est désormais active. Accédez-y pour commencer l'échange.",
      link: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://crochett.ai"}/app/rooms/${room.id}`,
      email: undefined,
    })
  }

  await createNotification({
    supabase,
    userId: user.id,
    workspaceId: wsId ?? undefined,
    type: "intro_requested",
    title: "Secure Room ouverte",
    body: "Votre Room sécurisée est accessible.",
    link: `/app/rooms/${room.id}`,
    email: user.email,
  })

  redirect(`/app/rooms/${room.id}`)
}
