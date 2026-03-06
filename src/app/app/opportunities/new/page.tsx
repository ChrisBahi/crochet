import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OpportunityForm } from "./opportunity-form"

export default async function NewOpportunityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: settings, error: sErr } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .single()

  if (sErr) throw sErr
  const workspaceId = settings?.active_workspace_id
  if (!workspaceId) throw new Error("No active workspace")

  async function createOpportunity(
    prevState: { error?: string | null },
    formData: FormData
  ): Promise<{ error?: string | null }> {
    "use server"
    void prevState
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: settings } = await supabase
      .from("user_settings")
      .select("active_workspace_id")
      .eq("user_id", user.id)
      .single()

    const workspaceId = settings?.active_workspace_id
    if (!workspaceId) throw new Error("No active workspace")

    const title = String(formData.get("title") || "").trim()
    if (!title) return { error: "Le titre est obligatoire." }

    const description = String(formData.get("description") || "").trim()
    const longDesc = String(formData.get("long_description") || "").trim()

    // Merge short + long description for richer context
    const fullDescription = longDesc
      ? `${description}\n\n${longDesc}`
      : description

    const sector = String(formData.get("sector") || "").trim() || null
    const geo = String(formData.get("geo") || "").trim() || null
    const dealType = String(formData.get("deal_type") || "").trim() || null
    const stage = String(formData.get("stage") || "").trim() || null

    const amountRaw = formData.get("amount")
    const valuationRaw = formData.get("valuation")
    const revenueRaw = formData.get("revenue")
    const amount = amountRaw ? Number(amountRaw) || null : null
    const valuation = valuationRaw ? Number(valuationRaw) || null : null
    const revenue = revenueRaw ? Number(revenueRaw) || null : null

    // Doc links — collect all *_url fields
    const urlFields = [
      "pitch_deck_url",
      "website_url",
      "doc_bilan_url",
      "doc_kbis_url",
      "doc_teaser_url",
      "doc_captable_url",
      "doc_dataroom_url",
      "doc_bp_url",
      "doc_expertise_url",
      "doc_patrimoine_url",
      "doc_bail_url",
    ] as const

    const links: Record<string, string> = {}
    for (const field of urlFields) {
      const val = String(formData.get(field) || "").trim()
      if (val) links[field] = val
    }

    // Use pitch_deck_url at top level if provided
    const pitchDeckUrl = links["pitch_deck_url"] ?? null
    const websiteUrl = links["website_url"] ?? null

    const { data: opp, error } = await supabase
      .from("opportunities")
      .insert({
        workspace_id: workspaceId,
        created_by: user.id,
        title,
        description: fullDescription,
        sector,
        geo,
        deal_type: dealType,
        stage,
        amount,
        valuation,
        revenue,
        pitch_deck_url: pitchDeckUrl,
        website_url: websiteUrl,
      })
      .select("id")
      .single()

    if (error) return { error: error.message }

    const opportunityId = opp.id

    // Create deck row as "pending" immediately
    await supabase.from("opportunity_decks").upsert({
      opportunity_id: opportunityId,
      status: "pending",
    }, { onConflict: "opportunity_id" })

    // Trigger qualification synchronously (user waits ~5s)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      const cookies = await (await import("next/headers")).cookies()
      const cookieHeader = cookies.getAll().map(c => `${c.name}=${c.value}`).join("; ")

      await fetch(`${baseUrl}/api/qualify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      })
    } catch {
      // Qualification failed silently — deck stays "pending", detail page handles it
    }

    redirect(`/app/opportunities/${opportunityId}`)
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 52px" }}>
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#7A746E",
        marginBottom: 12,
      }}>
        Nouveau signal
      </div>
      <h1 style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontStyle: "italic",
        fontSize: 28,
        fontWeight: 700,
        color: "#0A0A0A",
        margin: "0 0 8px",
        lineHeight: 1.2,
      }}>
        Soumettre un dossier
      </h1>
      <p style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 13,
        color: "#7A746E",
        margin: "0 0 32px",
        lineHeight: 1.7,
      }}>
        Votre dossier sera qualifié par le moteur et transformé en signal investissable.
      </p>
      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />
      <OpportunityForm action={createOpportunity} />
    </div>
  )
}
