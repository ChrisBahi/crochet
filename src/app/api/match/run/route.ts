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
// Max concurrent Claude calls per batch
const BATCH_SIZE = 5

type Opportunity = Record<string, unknown> & {
  id: string
  workspace_id: string | null
  created_by: string | null
  opportunity_decks: { d_score?: number } | null
}

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

  // Load existing matches to avoid duplicates
  const { data: existingMatches } = await supabase
    .from("opportunity_matches")
    .select("opportunity_id, member_id")

  const existingPairs = new Set(
    (existingMatches ?? []).map((m: { opportunity_id: string; member_id: string }) => `${m.opportunity_id}:${m.member_id}`)
  )

  let skipped_complement = 0
  let skipped_structured = 0
  let skipped_mscore = 0
  let skipped_duplicate = 0

  // ── Step 1: collect qualifying pairs (fast, no AI) ────────────────
  type QualifyingPair = {
    a: Opportunity
    b: Opportunity
    preScore: number
    dScoreA: number
    dScoreB: number
  }
  const qualifying: QualifyingPair[] = []

  for (let i = 0; i < opportunities.length; i++) {
    for (let j = i + 1; j < opportunities.length; j++) {
      const a = opportunities[i] as Opportunity
      const b = opportunities[j] as Opportunity

      if (a.created_by && b.created_by && a.created_by === b.created_by) continue
      if (!areComplementary(a.deal_type as string, b.deal_type as string)) { skipped_complement++; continue }

      const preScore = structuredScore(a, b)
      if (preScore < STRUCTURED_THRESHOLD) { skipped_structured++; continue }

      const dScoreA: number = (a.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0
      const dScoreB: number = (b.opportunity_decks as { d_score?: number } | null)?.d_score ?? 0

      qualifying.push({ a, b, preScore, dScoreA, dScoreB })
    }
  }

  // ── Step 2: score all qualifying pairs in parallel (batches of BATCH_SIZE) ──
  type ScoredPair = QualifyingPair & { p_score: number; why: string[] }
  const scored: ScoredPair[] = []

  for (let i = 0; i < qualifying.length; i += BATCH_SIZE) {
    const batch = qualifying.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (pair) => {
        const result = await scoreMatch(pair.a, pair.b)
        return { ...pair, p_score: result.p_score, why: result.why }
      })
    )
    for (const result of results) {
      if (result.status === "fulfilled") scored.push(result.value)
      else { console.error("[match/run] scoreMatch failed:", result.reason); skipped_mscore++ }
    }
  }

  // ── Step 3: insert matches that pass M-Score threshold ────────────
  let created = 0
  const updatedUserIds = new Set<string>()

  for (const { a, b, preScore, dScoreA, dScoreB, p_score, why } of scored) {
    const fitScore = Math.round(p_score * 0.5 + preScore * 0.3 + ((dScoreA + dScoreB) / 2) * 0.2)

    if (fitScore < MSCORE_THRESHOLD) { skipped_mscore++; continue }

    const rows = [
      {
        workspace_id: a.workspace_id,
        opportunity_id: a.id,
        member_id: b.created_by ?? null,
        fit_score: fitScore,
        ranking_score: fitScore,
        breakdown: { d_score: dScoreA, p_score, structured_score: preScore },
        why,
        status: "pending",
      },
      {
        workspace_id: b.workspace_id,
        opportunity_id: b.id,
        member_id: a.created_by ?? null,
        fit_score: fitScore,
        ranking_score: fitScore,
        breakdown: { d_score: dScoreB, p_score, structured_score: preScore },
        why,
        status: "pending",
      },
    ]

    for (const row of rows) {
      const pairKey = `${row.opportunity_id}:${row.member_id}`
      if (existingPairs.has(pairKey)) { skipped_duplicate++; continue }

      const { error, data: insertedMatch } = await supabase
        .from("opportunity_matches")
        .insert(row)
        .select("id")
        .single()

      if (!error && insertedMatch) {
        created++
        existingPairs.add(pairKey)
        if (row.member_id) updatedUserIds.add(row.member_id)

        if (row.workspace_id && row.member_id) {
          try {
            const { data: authUser } = await supabase.auth.admin.getUserById(row.member_id)
            await createNotification({
              supabase,
              userId: row.member_id,
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

  // ── Step 4: update P-Score for affected users ─────────────────────
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
    pairs_evaluated: qualifying.length,
    matches_created: created,
    skipped: {
      not_complementary: skipped_complement,
      low_structured_score: skipped_structured,
      low_mscore: skipped_mscore,
      duplicates: skipped_duplicate,
    },
  })
}
