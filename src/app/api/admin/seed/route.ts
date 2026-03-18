import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// Seed opportunities: created_by=null + workspace_id=null → identifiable sans FK fictive
const SEED_OPPORTUNITIES = [
  // ── CÔTÉ VENTE / CESSION ─────────────────────────────────────────────────
  {
    created_by: null,
    title: "SaaS RH – 2,8M€ ARR, 35% croissance",
    description: "Plateforme SaaS de gestion RH et paie pour TPE/PME. 320 clients actifs, croissance 35%/an, NRR 118%, churn < 3%. Cession totale envisagée avec accompagnement 12 mois. Fondateur partant pour nouveau projet.",
    sector: "tech",
    geo: "france",
    stage: "mature",
    deal_type: "cession",
    amount: 8500000,
    valuation: 8500000,
    revenue: 2800000,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Réseau boulangeries artisanales – 15 points de vente IDF",
    description: "Réseau structuré 15 boulangeries en Île-de-France, CA 6,2M€, EBITDA 14%. Propriétaire fondateur approchant la retraite. Baux 3-6-9 sécurisés, équipes stables. Cession totale souhaitée.",
    sector: "consumer",
    geo: "france",
    stage: "mature",
    deal_type: "cession",
    amount: 4500000,
    valuation: 4500000,
    revenue: 6200000,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Cabinet expertise comptable – 80 clients PME fidélisés",
    description: "Cabinet comptable et social à Paris 8ème, revenu récurrent 1,1M€, 80 clients PME depuis 10+ ans, taux de rétention 97%. Cession partielle avec maintien du gérant 24 mois sur accord. Valorisation raisonnable.",
    sector: "finance",
    geo: "france",
    stage: "mature",
    deal_type: "cession",
    amount: 2200000,
    valuation: 2200000,
    revenue: 1100000,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Usinage de précision – sous-traitant Airbus / Safran",
    description: "PME industrielle spécialisée usinage de précision aéronautique. CA 7,8M€, EBITDA 18%, certification EN9100. Locaux propriété, parc machines récent. Dirigeant fondateur souhaitant céder pour retraite, disponible accompagnement.",
    sector: "industrie",
    geo: "france",
    stage: "mature",
    deal_type: "cession",
    amount: 6000000,
    valuation: 6000000,
    revenue: 7800000,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Clinique vétérinaire – Neuilly-sur-Seine",
    description: "Clinique vétérinaire pluri-disciplinaire à Neuilly-sur-Seine. CA 1,4M€ en croissance, 3 vétérinaires dont 1 associé sortant. Succession partielle avec reprise progressive recommandée. Clientèle premium fidélisée.",
    sector: "santé",
    geo: "france",
    stage: "mature",
    deal_type: "succession",
    amount: 900000,
    valuation: 900000,
    revenue: 1400000,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "E-commerce mode premium – Levée série A, 3,5M€ GMV",
    description: "Site e-commerce mode haut de gamme, 3,5M€ GMV, 28k clients actifs, marge brute 62%. Équipe 8 personnes, tech propriétaire. Levée Série A pour financer croissance internationale + ouvertures retail. Valorisation 11M€ pre-money.",
    sector: "consumer",
    geo: "france",
    stage: "growth",
    deal_type: "equity",
    amount: 2000000,
    valuation: 12000000,
    revenue: 3200000,
    status: "active",
    workspace_id: null,
  },
  // ── CÔTÉ ACHAT / INVESTISSEMENT ──────────────────────────────────────────
  {
    created_by: null,
    title: "Family office – Cession PME santé / services, tickets 3-10M€",
    description: "Family office parisien actif depuis 15 ans, 12 participations en portefeuille. Recherche cessions PME secteurs santé, services aux entreprises, consumer premium. LBO primaire, accompagnement équipe dirigeante souhaité. Tickets 3 à 10M€.",
    sector: "santé",
    geo: "france",
    stage: "mature",
    deal_type: "equity",
    amount: 5000000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Fonds PE – Transmission industrielle, tickets 5-20M€",
    description: "Fonds de private equity spécialisé transmission PME industrielles et logistique. Horizon 5-7 ans, profil LBO primaire avec build-up possible. Tickets 5 à 20M€. Équipe opérationnelle disponible pour accompagnement post-acquisition.",
    sector: "industrie",
    geo: "france",
    stage: "mature",
    deal_type: "equity",
    amount: 10000000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Repreneur opérationnel – SaaS B2B rentable, 500k-3M€",
    description: "Entrepreneur avec 2 exits SaaS, cherche reprise opérationnelle d'un logiciel B2B profitable. Apport personnel 400k€, capacité LBO totale 2,5M€. Secteur tech / fintech / RH. Implication quotidienne, pas de tour de table.",
    sector: "tech",
    geo: "france",
    stage: "mature",
    deal_type: "cession",
    amount: 2500000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Prêteur alternatif – Dette senior PME, 500k-5M€",
    description: "Acteur de dette privée spécialisé financement PME. Tickets 500k à 5M€, secteurs tech, industrie légère, services. Taux 6-10%, durée 3-7 ans, pas de prise de participation. Réponse sous 10 jours ouvrés.",
    sector: "finance",
    geo: "france",
    stage: "mature",
    deal_type: "debt",
    amount: 2000000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Business angel – Seed / Série A tech, tickets 150-500k€",
    description: "Business angel avec portefeuille 14 startups tech (SaaS, marketplace, fintech, deeptech). Apporte capital + réseau CVC / VC Tier 1. Tickets 150k à 500k€. Conviction forte et implication board. Secteurs tech, IA, B2B.",
    sector: "tech",
    geo: "france",
    stage: "growth",
    deal_type: "equity",
    amount: 300000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Fonds seed legaltech & IA B2B – tickets 300k-1,2M€",
    description: "Fonds d'investissement spécialisé dans les startups legaltech, regtech et IA B2B en phase pre-seed et seed. Portefeuille actif de 8 participations. Tickets 300k à 1,2M€, prise de participation minoritaire, accompagnement go-to-market et accès réseau avocats/cabinets partenaires. Conviction forte sur l'automatisation des contrats et la conformité réglementaire.",
    sector: "tech",
    geo: "france",
    stage: "seed",
    deal_type: "equity",
    amount: 800000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
  {
    created_by: null,
    title: "Family office immobilier & diversification – PME IDF, tickets 3-15M€",
    description: "Family office parisien diversifié : portefeuille immobilier commercial + participations PME. Recherche opportunités de cession PME rentables en Île-de-France, tous secteurs (consumer, services, industrie légère). Tickets 3 à 15M€. Horizon long terme, pas de LBO agressif.",
    sector: "consumer",
    geo: "france",
    stage: "mature",
    deal_type: "equity",
    amount: 7000000,
    valuation: null,
    revenue: null,
    status: "active",
    workspace_id: null,
  },
]

export async function POST(req: Request) {
  const supabase = createAdminClient()

  // Verify admin authorization via JWT
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "") ?? ""
  const { data: { user } } = await supabase.auth.getUser(token)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)

  if (!user || !adminEmails.includes(user.email ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // Look up admin's workspace_id so matches are visible in the matches view
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()
  let workspaceId: string | null = settings?.active_workspace_id ?? null
  // Fallback: first workspace the admin belongs to
  if (!workspaceId) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
    workspaceId = member?.workspace_id ?? null
  }

  // Check if already seeded (seed records: created_by=null)
  const { count } = await supabase
    .from("opportunities")
    .select("*", { count: "exact", head: true })
    .is("created_by", null)

  if ((count ?? 0) > 0) {
    return NextResponse.json({
      error: "Déjà seedé",
      existing: count,
      message: `${count} opportunités de seed existent déjà.`,
    }, { status: 409 })
  }

  // Insert seed opportunities with admin's workspace_id so matches are visible
  const seedWithWorkspace = SEED_OPPORTUNITIES.map(o => ({ ...o, workspace_id: workspaceId }))
  const { data: inserted, error } = await supabase
    .from("opportunities")
    .insert(seedWithWorkspace)
    .select("id")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert opportunity_decks with d_scores so M-Score formula uses full weights
  // Scores reflect realistic AI-generated quality assessments
  const D_SCORES = [78, 72, 68, 81, 65, 70, 74, 83, 76, 69, 63, 71, 79]
  const MEMOS = [
    "SaaS RH profitable à fort taux de rétention (NRR 118%). Dossier structuré, croissance validée, accompagnement fondateur prévu.",
    "Réseau boulangeries solide en IDF, baux sécurisés et équipes stables. Valorisation cohérente avec l'EBITDA de 14%.",
    "Cabinet comptable à clientèle PME très fidèle (rétention 97%). Revenu récurrent, cession partielle avec maintien gérant.",
    "PME industrielle certifiée EN9100, sous-traitant grands donneurs d'ordre. Actifs tangibles importants, EBITDA solide.",
    "Clinique vétérinaire premium à clientèle fidèle. Succession progressive avec vétérinaire associé restant en place.",
    "E-commerce mode haut de gamme à forte marge brute. Levée Série A documentée, métriques cohérentes avec la valorisation.",
    "Family office actif avec track record 15 ans et 12 participations. Tickets bien dimensionnés pour LBO primaire PME.",
    "Fonds PE transmission industrielle, équipe opérationnelle disponible. Horizon et ticket adaptés au marché cible.",
    "Repreneur expérimenté avec 2 exits SaaS. Capacité LBO démontrée, profil opérationnel crédible.",
    "Prêteur alternatif avec processus rapide (10j). Conditions de marché, secteurs ciblés cohérents avec l'offre PME.",
    "Business angel actif avec portefeuille diversifié. Apport réseau VC Tier 1, tickets adaptés aux dossiers seed/série A.",
    "Family office diversifié avec capacité de décision rapide. Approche long terme, tickets adaptés aux PME IDF.",
    "Fonds seed spécialisé legaltech et IA B2B. Ticket 300k-1,2M€ adapté aux pre-seed, réseau cabinets d'avocats partenaires.",
  ]

  if (inserted && inserted.length > 0) {
    const decks = inserted.map((opp: { id: string }, idx: number) => ({
      opportunity_id: opp.id,
      d_score: D_SCORES[idx] ?? 70,
      summary: MEMOS[idx] ?? "Dossier qualifié par l'équipe Crochett.",
      tags: [],
      status: "done",
    }))
    await supabase.from("opportunity_decks").insert(decks)
  }

  return NextResponse.json({
    seeded: inserted?.length ?? 0,
    message: `${inserted?.length ?? 0} dossiers de seed insérés avec d_scores. Lancez maintenant le Match Engine.`,
  })
}

export async function DELETE(req: Request) {
  const supabase = createAdminClient()

  const authHeader = req.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "") ?? ""
  const { data: { user } } = await supabase.auth.getUser(token)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)

  if (!user || !adminEmails.includes(user.email ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // Delete seed opportunities + their matches
  // Strategy 1: records with created_by=null (current seed format)
  const { data: seedByNull } = await supabase
    .from("opportunities")
    .select("id")
    .is("created_by", null)

  // Strategy 2: records matching known seed titles (legacy seeds inserted with created_by=admin_id)
  const SEED_TITLES = SEED_OPPORTUNITIES.map(o => o.title)
  const { data: seedByTitle } = await supabase
    .from("opportunities")
    .select("id")
    .in("title", SEED_TITLES)

  const allSeedIds = Array.from(new Set([
    ...(seedByNull ?? []).map((o: { id: string }) => o.id),
    ...(seedByTitle ?? []).map((o: { id: string }) => o.id),
  ]))

  if (allSeedIds.length === 0) {
    return NextResponse.json({ message: "Aucun dossier de seed à supprimer." })
  }

  // Delete matches referencing seed opps (both directions)
  await supabase.from("opportunity_matches").delete().in("opportunity_id", allSeedIds)
  // Also clean orphaned rows where member_id IS NULL (created when seed.created_by=null matched real users)
  await supabase.from("opportunity_matches").delete().is("member_id", null)
  const { error } = await supabase.from("opportunities").delete().in("id", allSeedIds)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: allSeedIds.length, message: `${allSeedIds.length} dossiers de seed supprimés (nettoyage complet).` })
}
