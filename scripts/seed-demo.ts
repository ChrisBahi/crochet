#!/usr/bin/env ts-node
/**
 * CROCHET — Script de seed démo Sowefund
 *
 * Crée un dossier réaliste (PME industrielle lyonnaise, 5M€ CA, cession, D-Score 74)
 * dans le workspace de l'utilisateur spécifié.
 *
 * Usage :
 *   npm run seed:demo -- --email=demo@sowefund.com
 *   npm run seed:demo -- --email=demo@sowefund.com --clean  (supprime les dossiers démo existants avant)
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// ── Charger .env.local ────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..")
const envFile = path.join(ROOT, ".env.local")
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
  }
}

// ── Args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const emailArg = args.find(a => a.startsWith("--email="))?.split("=")[1]
const clean = args.includes("--clean")

if (!emailArg) {
  console.error("Usage: npm run seed:demo -- --email=votre@email.com")
  process.exit(1)
}

// ── Supabase admin client (bypass RLS) ───────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Données démo ─────────────────────────────────────────────────
const DEMO_OPPORTUNITY = {
  title: "Cession PME industrielle lyonnaise — Pièces mécaniques de précision",
  description: "Fabricant lyonnais spécialisé dans l'usinage de précision pour l'aéronautique et l'automobile. Fondé en 1998, l'entreprise emploie 32 personnes et dispose d'un parc machine récent (investissements 2021-2023). Le dirigeant, 61 ans, souhaite céder dans le cadre de son départ à la retraite. Equipe de management en place, autonome sur l'opérationnel.",
  long_description: `Historique & Positionnement
Fondée en 1998 par Jean-Pierre Durand, MECANIX Lyon SAS est un sous-traitant industriel de rang 2 spécialisé dans l'usinage 5 axes de pièces complexes. L'entreprise est certifiée EN 9100 (aéronautique) et IATF 16949 (automobile).

Clientèle & Revenus
La base clients est diversifiée : Safran (28%), Stellantis (22%), Thales (18%), autres industriels (32%). Aucun client ne représente plus de 30% du CA. Le carnet de commandes couvre 14 mois à date. CA 2024 : 5,1M€, EBITDA : 910K€ (17,8%).

Actifs & Outil industriel
Parc machine : 12 centres d'usinage CNC (dont 6 renouvelés en 2021-2023), 2 tours 5 axes, 1 fraiseuse grande capacité. Locaux : 2.200 m² propriété de l'entreprise, valeur estimée 680K€. Valeur nette comptable du parc machine : 1,4M€.

Points forts
- Rentabilité solide et stable depuis 5 ans
- Carnet de commandes long (14 mois)
- Certifications sectorielles à haute valeur (EN 9100)
- Équipe technique expérimentée, moyenne d'ancienneté 9 ans
- Outil industriel récent, investissements amortis

Contexte de cession
Cession totale (100% des parts). Le dirigeant s'engage sur une période de transition de 12 mois. Aucune clause de earn-out souhaitée. Valorisation cible : 4,5-5M€ (EV). Dette bancaire résiduelle : 380K€.`,
  deal_type: "cession",
  sector: "industrie",
  geo: "france",
  stage: "mature",
  status: "qualified",
  amount: 4750000,      // 4,75M€ — milieu fourchette
  valuation: 5100000,   // EV ~5,1M€
  revenue: 5100000,     // CA 5,1M€
  website_url: null as null,
  signal: {
    ca: 5100000,
    ebitda: 910000,
    dette_nette: 380000,
    valorisation: 5100000,
    secteur: "industrie",
    geo: "france",
    deal_type: "cession",
    maturite_score: 74,
    resume: "PME industrielle lyonnaise (usinage de précision), 5,1M€ CA, EBITDA 17,8%, carnet 14 mois, cession dirigeant retraite.",
    points_forts: ["EBITDA 17,8%", "EN 9100 aéro", "Carnet 14 mois", "Outil récent", "Mgmt autonome"],
    alertes: ["Dépendance Safran 28%", "Succès transition dirigeant"],
    q_cession_reason: "retraite",
    q_dependance_dirigeant: "moderee",
    q_employees: 32,
    q_dette_bancaire: "moderee",
    q_non_concurrence: "oui",
  },
}

const DEMO_MEMO = `MECANIX Lyon SAS est un sous-traitant industriel de rang 2, spécialisé dans l'usinage de précision 5 axes à destination des secteurs aéronautique et automobile. Avec 26 ans d'existence, l'entreprise présente un profil de maturité industrielle rare sur le marché de la cession PME.

Le dossier affiche un CA 2024 de 5,1M€ et un EBITDA de 910K€ (17,8%), en progression régulière sur 5 exercices. La stabilité des marges dans un environnement sectoriel contraignant témoigne de la maîtrise des coûts et de la valeur ajoutée des certifications EN 9100 et IATF 16949.

La base clients est diversifiée (4 comptes principaux, aucun > 30% du CA) avec un carnet de commandes de 14 mois — signal fort de visibilité et de confiance des donneurs d'ordre. Le parc machine a été renouvelé à 50% entre 2021 et 2023, réduisant le risque capex à court terme pour le repreneur.

L'outil industriel (12 centres CNC, 2 tours 5 axes, locaux propriété) représente une valeur d'actif estimée à 2,1M€ (parc machine 1,4M€ VNC + immobilier 680K€). La valorisation cible de 4,5-5M€ EV (dette résiduelle 380K€) correspond à un multiple d'environ 5x EBITDA, cohérent avec les transactions observées sur ce segment.

Le principal facteur de risque est la transition managériale : bien que l'équipe soit autonome et l'ancienneté moyenne de 9 ans, le dirigeant reste la figure centrale des relations clients grands comptes (Safran, Thales). La période d'accompagnement de 12 mois est un élément positif mais devra être soigneusement structurée.

En synthèse, MECANIX Lyon présente les caractéristiques d'un dossier de qualité : rentabilité démontrée, actifs tangibles, visibilité commerciale et certifications barrière à l'entrée. Le D-Score de 74/100 reflète la solidité du dossier tempérée par la sensibilité de la transition.`

const DEMO_NDA_TEXT = `ACCORD DE CONFIDENTIALITÉ

Entre les soussignés :

MECANIX Lyon SAS, société par actions simplifiée au capital de 80.000 €, immatriculée au RCS de Lyon sous le numéro 412 783 921, dont le siège social est situé 14 rue des Ateliers — 69120 Vaulx-en-Velin (ci-après « la Société »),

Et la partie investisseur identifiée dans la plateforme CROCHET lors de la signature électronique (ci-après « le Destinataire »).

ARTICLE 1 — OBJET
Le présent accord a pour objet de définir les conditions dans lesquelles des informations confidentielles relatives à la Société pourront être communiquées au Destinataire dans le cadre de l'évaluation d'une potentielle opération de cession.

ARTICLE 2 — INFORMATIONS COUVERTES
Sont considérées comme confidentielles : toutes données financières, commerciales, techniques, contractuelles ou stratégiques communiquées par la Société ou son conseil, sous quelque forme que ce soit.

ARTICLE 3 — OBLIGATIONS DU DESTINATAIRE
Le Destinataire s'engage à : (i) n'utiliser les informations qu'aux fins d'évaluation de l'opération, (ii) ne pas les divulguer à des tiers sans accord préalable écrit, (iii) les protéger avec le même soin que ses propres informations confidentielles.

ARTICLE 4 — DURÉE
Le présent accord prend effet à la date de signature et reste en vigueur pendant 24 mois.

ARTICLE 5 — LOI APPLICABLE
Le présent accord est soumis au droit français. Tout litige sera soumis à la compétence exclusive des tribunaux de Lyon.`

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`\nSeed démo Sowefund — utilisateur : ${emailArg}\n`)

  // 1. Trouver l'utilisateur par email
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers()
  if (userErr) { console.error("Erreur listUsers:", userErr.message); process.exit(1) }

  const user = users.find(u => u.email?.toLowerCase() === emailArg!.toLowerCase())
  if (!user) {
    console.error(`Utilisateur "${emailArg}" introuvable. Créez d'abord un compte sur l'application.`)
    process.exit(1)
  }
  console.log(`Utilisateur trouvé : ${user.id} (${user.email})`)

  // 2. Trouver son workspace actif
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!settings?.active_workspace_id) {
    console.error("Aucun workspace actif trouvé pour cet utilisateur.")
    process.exit(1)
  }
  const workspaceId = settings.active_workspace_id
  console.log(`Workspace : ${workspaceId}`)

  // 3. Optionnel : nettoyer les dossiers démo existants
  if (clean) {
    const { data: existing } = await supabase
      .from("opportunities")
      .select("id")
      .eq("workspace_id", workspaceId)
      .ilike("title", "%MECANIX%")

    if (existing && existing.length > 0) {
      const ids = existing.map(o => o.id)
      await supabase.from("opportunity_decks").delete().in("opportunity_id", ids)
      await supabase.from("opportunities").delete().in("id", ids)
      console.log(`Nettoyage : ${ids.length} dossier(s) MECANIX supprimé(s)`)
    }
  }

  // 4. Créer l'opportunité
  const { data: opp, error: oppErr } = await supabase
    .from("opportunities")
    .insert({
      ...DEMO_OPPORTUNITY,
      workspace_id: workspaceId,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (oppErr || !opp) { console.error("Erreur création opportunité:", oppErr?.message); process.exit(1) }
  console.log(`Opportunité créée : ${opp.id}`)

  // 5. Créer le deck (memo + NDA + D-Score)
  const { error: deckErr } = await supabase
    .from("opportunity_decks")
    .insert({
      opportunity_id: opp.id,
      summary: DEMO_MEMO,
      d_score: 74,
      tags: ["Industrie", "Cession", "Lyon", "Aéronautique", "Profitable", "Certifié EN 9100"],
      status: "done",
      nda_text: DEMO_NDA_TEXT,
      nda_reference: `NDA-CROCHET-${opp.id.slice(0, 8).toUpperCase()}`,
      nda_date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }),
    })

  if (deckErr) { console.error("Erreur création deck:", deckErr.message); process.exit(1) }
  console.log("Deck (memo + NDA + D-Score 74) créé")

  // 6. Résumé
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEED DEMO TERMINE

Dossier  : MECANIX Lyon SAS — Cession industrielle
CA       : 5,1M€  |  EBITDA : 910K€ (17,8%)
Valoris. : 4,75M€  |  D-Score : 74 / 100
Statut   : Qualifié · Memo généré · NDA configuré

Lien direct :
${appUrl}/app/opportunities/${opp.id}

Memo : ${appUrl}/app/opportunities/${opp.id}/memo
NDA  : ${appUrl}/app/opportunities/${opp.id}/nda
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main().catch(e => {
  console.error("Erreur:", e)
  process.exit(1)
})
