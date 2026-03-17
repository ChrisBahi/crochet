import Anthropic from "@anthropic-ai/sdk"
import { withRetry } from "@/lib/ai/withRetry"

const client = new Anthropic()

export type MatchScore = {
  p_score: number   // AI match score (0–100)
  why: string[]     // 2–3 specific reasons in French
}

// ── Sector compatibility groups ──────────────────────────────────
const SECTOR_GROUPS: Record<string, string[]> = {
  tech:      ["tech", "saas", "logiciel", "numérique", "digital", "ia", "software"],
  industrie: ["industrie", "manufacturing", "production", "mécanique", "chimie"],
  sante:     ["santé", "sante", "medtech", "pharma", "biotech", "medical"],
  energie:   ["energie", "énergie", "cleantech", "renouvelable", "oil", "gaz"],
  finance:   ["finance", "fintech", "assurance", "banque", "crédit"],
  immo:      ["immobilier", "immo", "real estate", "foncier", "promotion"],
  consumer:  ["consumer", "retail", "grande distribution", "food", "mode", "luxe"],
  education: ["education", "éducation", "edtech", "formation", "rh"],
}

export function sectorCompatibility(a?: string, b?: string): number {
  if (!a || !b) return 10
  const aL = a.toLowerCase()
  const bL = b.toLowerCase()
  if (aL === bL) return 30
  for (const group of Object.values(SECTOR_GROUPS)) {
    const aIn = group.some(k => aL.includes(k))
    const bIn = group.some(k => bL.includes(k))
    if (aIn && bIn) return 20
  }
  return 0
}

// ── Geo compatibility ─────────────────────────────────────────────
const GEO_COMPAT: Record<string, string[]> = {
  france:  ["france", "europe", "global"],
  europe:  ["france", "europe", "global"],
  usa:     ["usa", "global"],
  mena:    ["mena", "global"],
  asie:    ["asie", "global"],
  global:  ["france", "europe", "usa", "mena", "asie", "global"],
}

export function geoCompatibility(a?: string, b?: string): number {
  if (!a || !b) return 10
  const aL = a.toLowerCase()
  const bL = b.toLowerCase()
  if (aL === bL) return 20
  const aCompat = GEO_COMPAT[aL] ?? [aL]
  const bCompat = GEO_COMPAT[bL] ?? [bL]
  if (aCompat.includes(bL) || bCompat.includes(aL)) return 14
  return 0
}

// ── Deal type complementarity ─────────────────────────────────────
const COMPLEMENTARY_PAIRS: [string, string][] = [
  ["cession",       "equity"],
  ["cession",       "debt"],
  ["cession",       "cession"],
  ["equity",        "equity"],
  ["equity",        "debt"],
  ["succession",    "equity"],
  ["succession",    "cession"],
  ["immobilier",    "equity"],
  ["immobilier",    "debt"],
  ["revenue-share", "equity"],
]

export function areComplementary(a?: string, b?: string): boolean {
  if (!a || !b) return true
  const aL = a.toLowerCase()
  const bL = b.toLowerCase()
  return COMPLEMENTARY_PAIRS.some(
    ([x, y]) => (aL === x && bL === y) || (aL === y && bL === x)
  )
}

// ── Amount / ticket compatibility ─────────────────────────────────
export function amountCompatibility(a?: number | null, b?: number | null): number {
  if (!a || !b) return 10
  const ratio = a > b ? a / b : b / a
  if (ratio <= 2) return 25
  if (ratio <= 5) return 15
  if (ratio <= 10) return 5
  return 0
}

// ── Stage compatibility ───────────────────────────────────────────
const STAGE_GROUPS: Record<string, string[]> = {
  early:        ["pre-seed", "seed"],
  growth:       ["series-a", "series-b", "growth"],
  mature:       ["mature", "growth", "rentable"],
  transmission: ["mature", "transmission"],
}

export function stageCompatibility(a?: string, b?: string): number {
  if (!a || !b) return 8
  const aL = a.toLowerCase()
  const bL = b.toLowerCase()
  if (aL === bL) return 15
  for (const group of Object.values(STAGE_GROUPS)) {
    if (group.includes(aL) && group.includes(bL)) return 10
  }
  return 4
}

// ── Structured pre-score (no AI) — max: 30+20+25+15 = 90 ─────────
export function structuredScore(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): number {
  return (
    sectorCompatibility(a.sector as string, b.sector as string) +
    geoCompatibility(a.geo as string, b.geo as string) +
    amountCompatibility(a.amount as number, b.amount as number) +
    stageCompatibility(a.stage as string, b.stage as string)
  )
}

// ── Main AI scoring function ──────────────────────────────────────
export async function scoreMatch(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Promise<MatchScore> {

  const fmt = (v: unknown, unit = "") =>
    v ? `${Number(v).toLocaleString("fr-FR")}${unit}` : "—"

  const describe = (o: Record<string, unknown>) =>
    `Titre: ${o.title ?? "—"}
Type de deal: ${o.deal_type ?? "—"}
Secteur: ${o.sector ?? "—"}
Géographie: ${o.geo ?? "—"}
Stade: ${o.stage ?? "—"}
CA: ${fmt(o.revenue, " €")}
Valorisation: ${fmt(o.valuation, " €")}
Montant recherché: ${fmt(o.amount, " €")}
Description: ${o.description ?? "—"}`

  const response = await withRetry(
    () => client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object" as const,
          properties: {
            p_score: { type: "integer" },
            why: { type: "array", items: { type: "string" } },
          },
          required: ["p_score", "why"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content: `Tu es le moteur de matching CROCHET, expert M&A et transactions privées.

Évalue la pertinence d'une mise en relation entre ces deux dossiers.

## Dossier A
${describe(a)}

## Dossier B
${describe(b)}

### Critères d'évaluation (par ordre d'importance)
1. **Complémentarité deal** : acheteur/vendeur, investisseur/cible, prêteur/emprunteur = signal fort
2. **Cohérence sectorielle** : même secteur ou secteurs proches (ex. SaaS RH ≈ logiciel de paie)
3. **Compatibilité financière** : ticket, valorisation et CA dans des ordres de grandeur cohérents
4. **Géographie** : plus si compatible, pas éliminatoire si l'un est "global"
5. **Stade** : early-stage ↔ VC, mature ↔ PE/transmission

### Grille de score
- 0–39 : aucune complémentarité
- 40–59 : complémentarité faible
- 60–74 : bonne complémentarité, mise en relation recommandée
- 75–100 : excellente complémentarité, deal très concret

Retourne un JSON :
- "p_score" : entier 0–100
- "why" : 2–3 phrases courtes en français, factuelles et spécifiques à CES deux dossiers`,
      },
    ],
    }),
    "scoreMatch p_score"
  )

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}"
  const parsed = JSON.parse(text)

  return {
    p_score: typeof parsed.p_score === "number" ? Math.round(parsed.p_score) : 0,
    why: Array.isArray(parsed.why)
      ? parsed.why.filter((s: unknown) => typeof s === "string").slice(0, 3)
      : [],
  }
}
