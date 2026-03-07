import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { scoreMatch } from "@/lib/matching/scoreMatch"

const P_SCORE_THRESHOLD = 60

export async function POST() {

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 })
  }

  // Workspace actif
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .single()

  const workspaceId = settings?.active_workspace_id
  if (!workspaceId) {
    return NextResponse.json({ error: "no workspace" }, { status: 400 })
  }

  // Récupérer les opportunités avec leur D-Score depuis opportunity_decks
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*, opportunity_decks(d_score)")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")

  if (!opportunities || opportunities.length < 2) {
    return NextResponse.json({ message: "not enough opportunities" })
  }

  let created = 0

  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {

      const a = opportunities[i]
      const b = opportunities[j]

      // Skip si même auteur
      if (a.created_by && b.created_by && a.created_by === b.created_by) continue

      const { p_score, why } = await scoreMatch(a, b)

      if (p_score < P_SCORE_THRESHOLD) continue

      // D-Scores des deux dossiers (0 par défaut si pas encore qualifiés)
      const dScoreA: number = (a.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0
      const dScoreB: number = (b.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0

      // M-Score = 60% P-Score + 40% D-Score moyen
      const fitScore = Math.round(p_score * 0.6 + ((dScoreA + dScoreB) / 2) * 0.4)
      const rankingScore = fitScore

      // Insérer deux lignes : une par côté de la relation
      const rows = [
        {
          workspace_id: workspaceId,
          opportunity_id: a.id,
          member_id: b.created_by ?? null,
          fit_score: fitScore,
          ranking_score: rankingScore,
          breakdown: { d_score: dScoreA, p_score },
          why,
          status: "pending",
        },
        {
          workspace_id: workspaceId,
          opportunity_id: b.id,
          member_id: a.created_by ?? null,
          fit_score: fitScore,
          ranking_score: rankingScore,
          breakdown: { d_score: dScoreB, p_score },
          why,
          status: "pending",
        },
      ]

      for (const row of rows) {
        const { error } = await supabase
          .from("opportunity_matches")
          .insert(row)

        if (!error) created++
      }
    }
  }

  return NextResponse.json({ matches_created: created })
}
