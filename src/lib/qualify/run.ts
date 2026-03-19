import Anthropic from "@anthropic-ai/sdk"
import { createNotification } from "@/lib/notifications/create"
import { withRetry } from "@/lib/ai/withRetry"
import type { SupabaseClient } from "@supabase/supabase-js"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const QUESTION_LABELS: Record<string, string> = {
  q_growth_rate: "Taux de croissance annuel (%)",
  q_active_customers: "Nombre de clients / abonnés actifs",
  q_revenue_type: "Nature du revenu",
  q_runway: "Runway actuel (mois)",
  q_main_risk: "Principal risque identifié",
  q_cession_reason: "Motif de cession",
  q_dependance_dirigeant: "Dépendance vis-à-vis du dirigeant",
  q_employees: "Nombre d'employés (ETP)",
  q_dette_bancaire: "Niveau de dette bancaire",
  q_non_concurrence: "Clause de non-concurrence souhaitée",
  q_revenue_model: "Modèle économique",
  q_revenue_trend: "Évolution du CA sur 3 ans",
  q_debt_purpose: "Objet du financement",
  q_repayment_capacity: "Capacité de remboursement annuelle (€)",
  q_guarantees: "Garanties disponibles",
  q_revenue_stability: "Stabilité du revenu",
  q_rev_share_amount: "Part de revenu proposée au partenaire (%)",
  q_heirs: "Héritiers souhaitant reprendre",
  q_timeline: "Horizon de transmission",
  q_fiscal_optim: "Optimisation fiscale planifiée",
  q_immo_type: "Type de bien immobilier",
  q_occupancy: "Taux d'occupation actuel (%)",
  q_bail_duration: "Durée résiduelle du bail principal",
}

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

  // Include questionnaire answers if present
  const signal = opp.signal as Record<string, unknown> | null | undefined
  const questionnaire = signal?.questionnaire as Record<string, string> | undefined
  if (questionnaire && Object.keys(questionnaire).length > 0) {
    lines.push("")
    lines.push("QUESTIONNAIRE DE QUALIFICATION :")
    for (const [key, value] of Object.entries(questionnaire)) {
      const label = QUESTION_LABELS[key] ?? key
      lines.push(`${label} : ${value}`)
    }
  }

  return `Tu es le moteur de qualification CROCHET, expert en M&A, private equity et capital-investissement. Analyse ce dossier et rédige un MÉMORANDUM DE QUALIFICATION professionnel, dense et analytique.

DOSSIER :
${lines.join("\n")}

Génère une réponse JSON avec exactement ce format :
{
  "memo": "...",
  "d_score": 72,
  "tags": ["tag1", "tag2", "tag3"]
}

STRUCTURE DU MEMO (champ "memo") — rédige en continu, paragraphes séparés par \\n\\n :

§1 SYNTHÈSE EXÉCUTIVE (2-3 phrases) : Nature du dossier, positionnement marché, opportunité clé pour un acquéreur/investisseur.

§2 PROPOSITION DE VALEUR & MODÈLE ÉCONOMIQUE : Analyse du business model, avantages concurrentiels, propriété intellectuelle ou barrières à l'entrée, différenciation.

§3 TRACTION & DONNÉES FINANCIÈRES : Revenus, croissance, rentabilité, historique client, KPIs opérationnels. Si données manquantes, le noter explicitement.

§4 STRUCTURATION DU DEAL : Type de deal, valorisation implicite, multiples estimés (EV/CA, EV/EBITDA si applicable), conditions envisagées, niveau de risque deal.

§5 FACTEURS D'ATTRACTIVITÉ & RISQUES : 3 points forts pour un acquéreur stratégique ou financier. 2-3 risques identifiés (exécution, marché, dépendance, réglementaire).

§6 VERDICT CROCHET : Appréciation synthétique. Profil d'acquéreur/investisseur idéal (stratégique sectoriel, fonds PE, family office, etc.). Recommandation de priorité.

RÈGLES :
- Ton : professionnel, factuel, sans superlatif creux. Style mémorandum bancaire.
- Longueur : 400 à 600 mots minimum.
- D-Score (0–100) : 0–30 dossier insuffisant, 31–60 correct, 61–80 solide, 81–100 exceptionnel. Pénalise fortement les informations manquantes.
- Tags : 4 à 6 mots-clés précis (secteur, stade, géo, type, thèse).
- Réponds UNIQUEMENT avec le JSON brut, sans markdown, sans backticks, sans texte avant ou après.`
}

export async function runQualification(
  supabase: SupabaseClient,
  opportunity_id: string,
  user: { id: string; email?: string }
): Promise<{ d_score: number; tags: string[] }> {
  const { data: opp, error: oppErr } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunity_id)
    .maybeSingle()

  if (oppErr || !opp) throw new Error("opportunity not found")

  await supabase.from("opportunity_decks").upsert({
    opportunity_id,
    status: "processing",
  }, { onConflict: "opportunity_id" })

  try {
    const message = await withRetry(
      () => client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: buildPrompt(opp) }],
      }),
      "qualify memo"
    )

    let raw = (message.content[0] as { type: string; text: string }).text.trim()
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    const parsed = JSON.parse(raw) as { memo: string; d_score: number; tags: string[] }

    await supabase.from("opportunity_decks").upsert({
      opportunity_id,
      summary: parsed.memo,
      d_score: parsed.d_score,
      tags: parsed.tags,
      status: "done",
    }, { onConflict: "opportunity_id" })

    await createNotification({
      supabase,
      userId: user.id,
      type: "qualification_done",
      title: `Dossier qualifié — D-Score ${parsed.d_score}`,
      body: `Le moteur Crochet. a analysé "${opp.title}". Consultez le MEMO de qualification.`,
      link: `/app/opportunities/${opportunity_id}/memo`,
      email: user.email,
    })

    return { d_score: parsed.d_score, tags: parsed.tags }
  } catch (err) {
    console.error("[qualify] ERREUR DÉTAILLÉE:", JSON.stringify(err, Object.getOwnPropertyNames(err as object)))
    await supabase.from("opportunity_decks").upsert({
      opportunity_id,
      status: "error",
    }, { onConflict: "opportunity_id" })
    throw err
  }
}
