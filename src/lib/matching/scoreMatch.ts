import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export type MatchScore = {
  p_score: number    // Partner match score (0–100) — Claude's assessment
  why: string[]      // Array of specific reasons (3 max)
}

export async function scoreMatch(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Promise<MatchScore> {

  const describe = (o: Record<string, unknown>) =>
    `Titre: ${o.title ?? "—"}
Type de deal: ${o.deal_type ?? "—"}
Secteur: ${o.sector ?? "—"}
Géographie: ${o.geo ?? "—"}
Stade: ${o.stage ?? "—"}
Description: ${o.description ?? "—"}`

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 512,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object" as const,
          properties: {
            p_score: { type: "integer" },
            why: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["p_score", "why"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "user",
        content: `Tu es le moteur de matching CROCHET, expert en M&A et mise en relation de deals.

Analyse la complémentarité entre ces deux dossiers et détermine si une mise en relation est pertinente.

## Dossier A
${describe(a)}

## Dossier B
${describe(b)}

Retourne un JSON avec :
- "p_score" : entier de 0 à 100 représentant la pertinence de la mise en relation
  · 0–40 : pas de complémentarité évidente
  · 41–59 : complémentarité faible
  · 60–79 : bonne complémentarité, mise en relation recommandée
  · 80–100 : excellente complémentarité, prioritaire
- "why" : tableau de 2 à 3 phrases courtes en français, chacune expliquant un aspect spécifique de la complémentarité entre ces deux dossiers

Critères :
- La complémentarité acheteur/vendeur, investisseur/cible ou partenaires complémentaires est le signal le plus fort
- La proximité sectorielle compte même si les termes exacts diffèrent (ex: "SaaS RH" ≈ "logiciel de paie")
- La géographie est un plus, pas un prérequis
- Chaque élément de "why" doit être spécifique et factuel, pas générique`,
      },
    ],
  })

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}"
  const parsed = JSON.parse(text)

  return {
    p_score: typeof parsed.p_score === "number" ? Math.round(parsed.p_score) : 0,
    why: Array.isArray(parsed.why) ? parsed.why.filter((s: unknown) => typeof s === "string") : [],
  }
}
