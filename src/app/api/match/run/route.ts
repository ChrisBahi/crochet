import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scoreMatch } from "@/lib/matching/scoreMatch"

export async function POST() {

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 })
  }

  // workspace actif
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .single()

  const workspaceId = settings?.active_workspace_id

  if (!workspaceId) {
    return NextResponse.json({ error: "no workspace" }, { status: 400 })
  }

  // récupérer opportunités
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("workspace_id", workspaceId)

  if (!opportunities || opportunities.length < 2) {
    return NextResponse.json({ message: "not enough opportunities" })
  }

  let created = 0

  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {

      const a = opportunities[i]
      const b = opportunities[j]

      if (a.id === b.id) continue
      const scoring = scoreMatch(a, b)

      const { error } = await supabase
        .from("matches")
        .insert({
          workspace_id: workspaceId,
          opportunity_a: a.id,
          opportunity_b: b.id,
          score: scoring.score,
          reason: scoring.reason
        })

      if (!error) created++
    }
  }

  return NextResponse.json({
    matches_created: created
  })
}
