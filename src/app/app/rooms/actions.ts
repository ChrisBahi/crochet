"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { redirect } from "next/navigation"

export async function createDemoRoom() {
  const user = await requireUser()
  const supabase = await createClient()

  // Get active workspace
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const workspaceId = settings?.active_workspace_id ?? null

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ workspace_id: workspaceId, status: "active", created_by: user.id })
    .select("id")
    .single()

  if (error || !room) throw new Error("Impossible de créer la room démo")

  redirect(`/app/rooms/${room.id}`)
}
