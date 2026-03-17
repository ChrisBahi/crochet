import { NextResponse } from "next/server"
import { createAdminClient as createClient } from "@/lib/supabase/admin"
import { scoreMatch, areComplementary, structuredScore } from "@/lib/matching/scoreMatch"
import { createNotification } from "@/lib/notifications/create"

// Vercel: allow up to 5 minutes for this route (Pro plan)
export const maxDuration = 300

// Only call Claude when the structured pre-score is high enough
const STRUCTURED_THRESHOLD = 30
// Only create a match when the final M-Score reaches this level
const MSCORE_THRESHOLD = 55

export async function POST(req: Request) {

  // Admin-only: verify secret header or admin email
  const supabase = createClient()
  const authHeader = req.headers.get("authorization")
  const adminSecret = process.env.MATCH_ENGINE_SECRET

  if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
    // Allow logged-in admins too
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace("Bearer ", "") ?? "")
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)
    if (!user || !adminEmails.includes(user.email ?? "")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
  }

  // Optional: reset existing matches before re-running (admin only)
  const url = new URL(req.url)
  if (url.searchParams.get("reset") === "true") {
    await supabase.from("opportunity_matches").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  }

  // Fetch ALL active opportunities across all workspaces
  const { data: opportunities, error: fetchError } = await supabase
    .from("opportunities")
    .select("*, opportunity_decks(d_score)")
    .eq("status", "active")

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!opportunities || opportunities.length < 2) {
    return NextResponse.json({ message: "not enough opportunities", count: opportunities?.length ?? 0 })
  }

  // Load existing matches to avoid duplicates (pair of opportunity IDs)
  const { data: existingMatches } = await supabase
    .from("opportunity_matches")
    .select("opportunity_id, member_id")

  const existingPairs = new Set(
    (existingMatches ?? []).map((m: { opportunity_id: string; member_id: string }) => `${m.opportunity_id}:${m.member_id}`)
  )

  let created = 0
  let skipped_complement = 0
  let skipped_structured = 0
  let skipped_mscore = 0
  let skipped_duplicate = 0
  const updatedUserIds = new Set<string>()

  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {

      const a = opportunities[i]
      const b = opportunities[j]

      // Skip if same author
      if (a.created_by && b.created_by && a.created_by === b.created_by) continue

      // Skip if deal types are not complementary
      if (!areComplementary(a.deal_type, b.deal_type)) {
        skipped_complement++
        continue
      }

      // Fast structured pre-score — skip Claude API if too low
      const preScore = structuredScore(a, b)
      if (preScore < STRUCTURED_THRESHOLD) {
        skipped_structured++
        continue
      }

      // D-Scores
      const dScoreA: number = (a.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0
      const dScoreB: number = (b.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0
      const dScoreAvg = (dScoreA + dScoreB) / 2

      // Call Claude for AI scoring
      const { p_score, why } = await scoreMatch(a, b)

      // M-Score = 50% AI p_score + 30% structured + 20% D-Score avg
      const fitScore = Math.round(p_score * 0.5 + preScore * 0.3 + dScoreAvg * 0.2)

      if (fitScore < MSCORE_THRESHOLD) {
        skipped_mscore++
        continue
      }

      // Insert two rows: one per side, with deduplication
      // opportunity_id = the COUNTERPART's opportunity (what the user will see in their match view)
      const rows = [
        {
          workspace_id: a.workspace_id,
          opportunity_id: b.id,           // A sees B's opportunity
          member_id: b.created_by ?? null,
          fit_score: fitScore,
          ranking_score: fitScore,
          breakdown: { d_score: dScoreB, p_score, structured_score: preScore },
          why,
          status: "pending",
        },
        {
          workspace_id: b.workspace_id,
          opportunity_id: a.id,           // B sees A's opportunity
          member_id: a.created_by ?? null,
          fit_score: fitScore,
          ranking_score: fitScore,
          breakdown: { d_score: dScoreA, p_score, structured_score: preScore },
          why,
          status: "pending",
        },
      ]

      for (const row of rows) {
        const pairKey = `${row.opportunity_id}:${row.member_id}`
        if (existingPairs.has(pairKey)) {
          skipped_duplicate++
          continue
        }

        const { error, data: insertedMatch } = await supabase
          .from("opportunity_matches")
          .insert(row)
          .select("id")
          .single()

        if (!error && insertedMatch) {
          created++
          existingPairs.add(pairKey)
          if (row.member_id) updatedUserIds.add(row.member_id)

          // Notify the recipient workspace owner
          if (row.workspace_id) {
            try {
              const { data: authUser } = await supabase.auth.admin.getUserById(
                row.member_id ?? row.workspace_id
              )
              await createNotification({
                supabase,
                userId: row.member_id ?? row.workspace_id,
                workspaceId: row.workspace_id,
                type: "new_match",
                title: "Nouveau match disponible",
                body: `Un nouveau match avec un M-Score de ${fitScore} vient d'être identifié pour votre dossier.`,
                link: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app/matches?match=${insertedMatch.id}`,
                email: authUser?.user?.email,
              })
            } catch (err) {
              console.error("[match/run] notification failed:", err)
            }
          }
        }
      }
    }
  }

  // Mise à jour du P-Score dans workspace_members pour chaque user concerné
  for (const userId of updatedUserIds) {
    const { data: recent } = await supabase
      .from("opportunity_matches")
      .select("breakdown")
      .eq("member_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (recent?.length) {
      const avg = Math.round(
        recent.reduce((sum, m) => {
          const b = m.breakdown as { p_score?: number } | null
          return sum + (b?.p_score ?? 0)
        }, 0) / recent.length
      )
      await supabase
        .from("workspace_members")
        .update({ p_score: avg })
        .eq("user_id", userId)
    }
  }

  return NextResponse.json({
    opportunities_scanned: opportunities.length,
    matches_created: created,
    skipped: {
      not_complementary: skipped_complement,
      low_structured_score: skipped_structured,
      low_mscore: skipped_mscore,
      duplicates: skipped_duplicate,
    },
  })
}
