import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateNda, type NdaParty } from "@/lib/nda/generate"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const opportunityId = typeof body.opportunity_id === "string" ? body.opportunity_id : ""
  if (!opportunityId) {
    return NextResponse.json({ error: "opportunity_id required" }, { status: 400 })
  }

  const { data: opp } = await supabase
    .from("opportunities")
    .select("id, title, deal_type, sector, created_by")
    .eq("id", opportunityId)
    .maybeSingle()

  if (!opp) {
    return NextResponse.json({ error: "opportunity not found" }, { status: 404 })
  }

  const { data: existingDeck } = await supabase
    .from("opportunity_decks")
    .select("nda_text")
    .eq("opportunity_id", opportunityId)
    .maybeSingle()

  if (existingDeck?.nda_text) {
    return NextResponse.json({ ready: true, generated: false })
  }

  const [{ data: divulgateurProfile }, { data: recepteurProfile }] = await Promise.all([
    supabase
      .from("investor_profiles")
      .select("name, firm, role, country")
      .eq("user_id", opp.created_by)
      .maybeSingle(),
    supabase
      .from("investor_profiles")
      .select("name, firm, role, country")
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  const divulgateur: NdaParty = {
    name: divulgateurProfile?.name ?? divulgateurProfile?.firm ?? opp.title ?? "Partie Divulgatrice",
    firm: divulgateurProfile?.firm ?? null,
    role: divulgateurProfile?.role ?? null,
    country: divulgateurProfile?.country ?? "France",
  }

  const recepteur: NdaParty = {
    name: recepteurProfile?.name ?? recepteurProfile?.firm ?? (user.email?.split("@")[0] ?? "Investisseur"),
    firm: recepteurProfile?.firm ?? null,
    role: recepteurProfile?.role ?? null,
    country: recepteurProfile?.country ?? "France",
    email: user.email ?? null,
  }

  const nda = await generateNda({
    opportunityId,
    opportunityTitle: opp.title,
    dealType: opp.deal_type,
    sector: opp.sector,
    divulgateur,
    recepteur,
  })

  const { error: upsertError } = await supabase.from("opportunity_decks").upsert({
    opportunity_id: opportunityId,
    nda_text: JSON.stringify({ sections: nda.sections }),
    nda_reference: nda.reference,
    nda_date: nda.date,
  }, { onConflict: "opportunity_id" })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ ready: true, generated: true })
}
