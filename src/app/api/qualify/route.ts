import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(opp: Record<string, unknown>): string {
  const lines: string[] = [
    `Titre : ${opp.title ?? "—"}`,
    `Description : ${opp.description ?? "—"}`,
    `Secteur : ${opp.sector ?? "—"}`,
    `Géographie : ${opp.geo ?? "—"}`,
    `Type de deal : ${opp.deal_type ?? "—"}`,
    `Stade : ${opp.stage ?? "—"}`,
    opp.amount ? `Levée / Prix cible : ${opp.amount} €` : null,
    opp.valuation ? `Valorisation : ${opp.valuation} €` : null,
    opp.revenue ? `Revenus / CA : ${opp.revenue} €` : null,
    opp.pitch_deck_url ? `Lien deck/teaser : ${opp.pitch_deck_url}` : null,
    opp.website_url ? `Site web : ${opp.website_url}` : null,
  ].filter(Boolean) as string[]

  return `Tu es le moteur de qualification CROCHET. Analyse ce dossier d'investissement/cession et génère un MEMO de qualification structuré ainsi qu'un score de qualité (D-Score).

DOSSIER :
${lines.join("\n")}

Génère une réponse JSON avec exactement ce format :
{
  "memo": "...",
  "d_score": 72,
  "tags": ["tag1", "tag2", "tag3"]
}

Règles :
- Le MEMO doit faire 3 à 5 paragraphes, en français, analytique et factuel. Évalue : proposition de valeur, traction/historique financier, risques identifiés, attractivité pour acquéreurs/investisseurs.
- Le D-Score (0–100) : 0–30 dossier insuffisant, 31–60 correct, 61–80 solide, 81–100 exceptionnel. Pénalise les informations manquantes.
- Les tags : 3 à 5 mots-clés qualifiant le dossier (secteur, stade, type, géo).
- Réponds UNIQUEMENT avec le JSON, sans markdown, sans texte avant ou après.`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 })

  const body = await req.json()
  const { opportunity_id } = body

  if (!opportunity_id) {
    return NextResponse.json({ error: "opportunity_id required" }, { status: 400 })
  }

  // Fetch opportunity
  const { data: opp, error: oppErr } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunity_id)
    .maybeSingle()

  if (oppErr || !opp) {
    return NextResponse.json({ error: "opportunity not found" }, { status: 404 })
  }

  // Set deck to processing
  await supabase.from("opportunity_decks").upsert({
    opportunity_id,
    status: "processing",
  }, { onConflict: "opportunity_id" })

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(opp) }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    const parsed = JSON.parse(raw) as { memo: string; d_score: number; tags: string[] }

    await supabase.from("opportunity_decks").upsert({
      opportunity_id,
      summary: parsed.memo,
      d_score: parsed.d_score,
      tags: parsed.tags,
      status: "done",
    }, { onConflict: "opportunity_id" })

    return NextResponse.json({ d_score: parsed.d_score, tags: parsed.tags })
  } catch (err) {
    await supabase.from("opportunity_decks").upsert({
      opportunity_id,
      status: "error",
    }, { onConflict: "opportunity_id" })
    console.error("[qualify]", err)
    return NextResponse.json({ error: "qualification failed" }, { status: 500 })
  }
}
